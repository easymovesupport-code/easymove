import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { supabase } from "../../lib/supabase";
import "../../utils/leafletIcon";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Navigation,
  User,
} from "lucide-react";

const DAY_NAMES = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const getDayName = (date) => {
  if (!date) return "—";
  return DAY_NAMES[new Date(date).getDay()];
};

const formatTime = (time) => {
  if (!time) return "—";
  const [hStr, mStr = "00"] = String(time).split(":");
  let h = Number(hStr);
  const m = mStr.padStart(2, "0");
  if (Number.isNaN(h)) return "—";
  const period = h >= 12 ? "م" : "ص";
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
};

const calcHours = (from, to) => {
  if (!from || !to) return "—";
  const [fh, fm] = String(from).split(":").map(Number);
  const [th, tm] = String(to).split(":").map(Number);
  const mins = th * 60 + tm - (fh * 60 + fm);
  if (mins <= 0) return "—";
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours === 0) return `${rem} دقيقة`;
  if (rem === 0) return `${hours} ساعة`;
  return `${hours} ساعة و ${rem} دقيقة`;
};

const getAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points?.length) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [points, map]);

  return null;
};
const requestIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const meIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const VolunteerRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [req, setReq] = useState(null);
  const [owner, setOwner] = useState(null);
  const [volunteerPos, setVolunteerPos] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=volunteer");
        return;
      }

      const { data: volUser } = await supabase
        .from("users")
        .select("id, latitude, longitude, city")
        .eq("email", authData.user.email)
        .eq("user_type", "volunteer")
        .maybeSingle();

      if (!volUser) {
        navigate("/login?type=volunteer");
        return;
      }

      if (volUser.latitude != null && volUser.longitude != null) {
        setVolunteerPos({
          lat: Number(volUser.latitude),
          lng: Number(volUser.longitude),
        });
      }

      const { data: request, error: reqError } = await supabase
        .from("help_requests")
        .select(
          `
          *,
          owner:users!help_requests_user_id_fkey (
            id, name, city, date_of_birth, phone
          )
        `,
        )
        .eq("id", id)
        .maybeSingle();

      if (reqError || !request) {
        setError("تعذر تحميل الطلب");
        setLoading(false);
        return;
      }

      setReq(request);
      setOwner(request.owner || null);
      setLoading(false);
    };

    load();
  }, [id, navigate]);

  const handleAccept = async () => {
    setSaving(true);
    setError("");

    const { data: authData } = await supabase.auth.getUser();
    const { data: volUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", authData.user.email)
      .eq("user_type", "volunteer")
      .maybeSingle();

    const { error: updateError } = await supabase
      .from("help_requests")
      .update({
        status: "accepted",
        volunteer_id: volUser.id,
      })
      .eq("id", id)
      .eq("status", "pending");

    setSaving(false);

    if (updateError) {
      setError("تعذر قبول الطلب");
      return;
    }

    navigate("/volunteer/dashboard");
  };

  if (loading) {
    return (
      <div
        className='min-h-screen flex items-center justify-center bg-stone-50'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري التحميل...</p>
      </div>
    );
  }

  if (!req) {
    return (
      <div
        className='min-h-screen flex items-center justify-center bg-stone-50'
        dir='rtl'
      >
        <p className='text-red-600'>{error || "الطلب غير موجود"}</p>
      </div>
    );
  }

  const age = getAge(owner?.date_of_birth);
  const distance =
    volunteerPos && req.latitude != null && req.longitude != null
      ? getDistanceKm(
          volunteerPos.lat,
          volunteerPos.lng,
          Number(req.latitude),
          Number(req.longitude),
        )
      : null;

  const timeFrom = req.time_from || req.request_time;
  const timeTo = req.time_to;

  return (
    <div className='min-h-screen bg-stone-50' dir='rtl'>
      <header className='bg-white border-b border-stone-200 sticky top-0 z-40'>
        <div className='max-w-3xl mx-auto px-4 py-4 flex items-center justify-between'>
          <Link
            to='/volunteer/dashboard'
            className='inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium'
          >
            <ArrowRight size={18} />
            رجوع
          </Link>
          <span className='font-bold text-teal-800'>
            Easy<span className='text-teal-500'>Move</span>
          </span>
        </div>
      </header>

      <main className='max-w-3xl mx-auto px-4 py-8 space-y-5'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 mb-1'>
            تفاصيل الطلب
          </h1>
          <p className='text-lg font-semibold text-teal-800'>{req.title}</p>
          <p className='text-sm text-slate-500 mt-1'>
            نوع الخدمة: {req.help_type}
          </p>
        </div>

        {/* بيانات المستفيد */}
        <section className='bg-white rounded-2xl border border-stone-200 p-5 shadow-sm'>
          <h2 className='font-bold text-slate-900 mb-4 flex items-center gap-2'>
            <User size={18} className='text-teal-700' />
            بيانات مقدم الطلب
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm'>
            <div className='bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100'>
              <p className='text-xs text-slate-500 mb-0.5'>الاسم</p>
              <p className='font-semibold text-slate-900'>
                {owner?.name || "—"}
              </p>
            </div>
            <div className='bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100'>
              <p className='text-xs text-slate-500 mb-0.5'>العمر</p>
              <p className='font-semibold text-slate-900'>
                {age != null ? `${age} سنة` : "—"}
              </p>
            </div>
            <div className='bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100'>
              <p className='text-xs text-slate-500 mb-0.5'>المدينة</p>
              <p className='font-semibold text-slate-900'>
                {owner?.city || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* تفاصيل الطلب */}
        <section className='bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4'>
          <h2 className='font-bold text-slate-900 flex items-center gap-2'>
            <CalendarDays size={18} className='text-teal-700' />
            تفاصيل الطلب
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
            <div className='bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100'>
              <p className='text-xs text-slate-500 mb-0.5'>اليوم</p>
              <p className='font-semibold'>{getDayName(req.request_date)}</p>
            </div>
            <div className='bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100'>
              <p className='text-xs text-slate-500 mb-0.5'>التاريخ</p>
              <p className='font-semibold'>
                {req.request_date
                  ? new Date(req.request_date).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div className='bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100'>
              <p className='text-xs text-slate-500 mb-0.5'>الوقت</p>
              <p className='font-semibold'>
                {formatTime(timeFrom)} – {formatTime(timeTo)}
              </p>
            </div>
            <div className='bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100'>
              <p className='text-xs text-slate-500 mb-0.5'>مدة الخدمة</p>
              <p className='font-semibold'>{calcHours(timeFrom, timeTo)}</p>
            </div>
            <div className='bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100 sm:col-span-2'>
              <p className='text-xs text-slate-500 mb-0.5'>المسافة منك</p>
              <p className='font-semibold'>
                {distance != null ? `${distance.toFixed(1)} كم` : "غير متاحة"}
              </p>
            </div>
          </div>

          <div>
            <p className='text-xs text-slate-500 mb-1'>وصف الطلب</p>
            <p className='text-sm text-slate-800 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2.5'>
              {req.description || "لا يوجد وصف"}
            </p>
          </div>

          {/* المسافة بارزة */}
          <div className='bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2 text-teal-800'>
              <Navigation size={18} />
              <span className='text-sm font-semibold'>
                المسافة بينك وبين موقع الطلب
              </span>
            </div>
            <span className='text-base font-bold text-teal-900'>
              {distance != null ? `${distance.toFixed(1)} كم` : "غير متاحة"}
            </span>
          </div>

          <div>
            <p className='text-xs text-slate-500 mb-1 flex items-center gap-1'>
              <MapPin size={14} /> موقع الطلب
            </p>
            <p className='text-sm font-medium text-slate-800 mb-2'>
              {req.location || "—"}
            </p>

            {req.latitude != null && req.longitude != null && (
              <div className='h-64 rounded-2xl overflow-hidden border border-stone-200 shadow-sm'>
                <MapContainer
                  center={[Number(req.latitude), Number(req.longitude)]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  />

                  {/* علامة موقع الطلب (أحمر) */}
                  <Marker
                    position={[Number(req.latitude), Number(req.longitude)]}
                    icon={requestIcon}
                  >
                    <Popup>
                      <strong>موقع الطلب</strong>
                      <br />
                      {req.location || "موقع الخدمة"}
                    </Popup>
                  </Marker>

                  {/* علامة موقعك (أزرق) */}
                  {volunteerPos && (
                    <Marker
                      position={[volunteerPos.lat, volunteerPos.lng]}
                      icon={meIcon}
                    >
                      <Popup>
                        <strong>موقعك الحالي</strong>
                      </Popup>
                    </Marker>
                  )}

                  {/* خط بين الموقعين */}
                  {volunteerPos && (
                    <Polyline
                      positions={[
                        [volunteerPos.lat, volunteerPos.lng],
                        [Number(req.latitude), Number(req.longitude)],
                      ]}
                      pathOptions={{
                        color: "#0f766e",
                        weight: 3,
                        dashArray: "8 8",
                        opacity: 0.85,
                      }}
                    />
                  )}

                  {/* ضبط الزوم ليشمل النقطتين */}
                  <FitBounds
                    points={[
                      [Number(req.latitude), Number(req.longitude)],
                      ...(volunteerPos
                        ? [[volunteerPos.lat, volunteerPos.lng]]
                        : []),
                    ]}
                  />
                </MapContainer>
              </div>
            )}

            {/* مفتاح الألوان */}
            <div className='mt-2 flex flex-wrap gap-4 text-xs text-slate-600'>
              <span className='inline-flex items-center gap-1.5'>
                <span className='w-3 h-3 rounded-full bg-red-500'></span>
                موقع الطلب
              </span>
              <span className='inline-flex items-center gap-1.5'>
                <span className='w-3 h-3 rounded-full bg-blue-500'></span>
                موقعك الحالي
              </span>
            </div>

            {req.latitude != null && req.longitude != null && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${req.latitude},${req.longitude}`}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-2 mt-3 text-sm text-teal-700 font-semibold hover:underline'
              >
                <Navigation size={16} />
                فتح المسار في خرائط Google
              </a>
            )}
          </div>
        </section>

        {error && (
          <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
            {error}
          </div>
        )}

        <div className='flex flex-wrap gap-3'>
          {req.status === "pending" && (
            <button
              type='button'
              disabled={saving}
              onClick={handleAccept}
              className='bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold'
            >
              {saving ? "جاري القبول..." : "قبول الطلب"}
            </button>
          )}
          <Link
            to='/volunteer/dashboard'
            className='border border-stone-200 bg-white text-slate-700 px-6 py-3 rounded-xl font-semibold'
          >
            رجوع
          </Link>
        </div>
      </main>
    </div>
  );
};

export default VolunteerRequestDetails;
