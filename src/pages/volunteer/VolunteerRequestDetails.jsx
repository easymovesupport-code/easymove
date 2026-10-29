import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { supabase } from "../../lib/supabase";
import "../../utils/leafletIcon";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Navigation,
  CheckCircle2,
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

const formatTime = (time) => {
  if (!time) return "—";
  const [hoursStr, minutesStr = "00"] = String(time).split(":");
  let hours = Number(hoursStr);
  const minutes = minutesStr.padStart(2, "0");
  if (Number.isNaN(hours)) return "—";
  const period = hours >= 12 ? "م" : "ص";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${period}`;
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const volunteerIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;border-radius:9999px;background:#0f766e;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;font-size:18px;">👤</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const requestIcon = L.divIcon({
  className: "",
  html: `<div style="width:40px;height:40px;border-radius:9999px;background:#ea580c;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;font-size:18px;">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const VolunteerRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(null);
  const [volunteerUser, setVolunteerUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=volunteer");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("id, name, latitude, longitude, location_text, user_type")
        .eq("email", authData.user.email)
        .eq("user_type", "volunteer")
        .maybeSingle();

      if (!userRow) {
        setError("تعذر تحميل حساب المتطوع");
        setLoading(false);
        return;
      }
      setVolunteerUser(userRow);

      const { data: reqRow, error: reqError } = await supabase
        .from("help_requests")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (reqError || !reqRow) {
        setError("الطلب غير موجود");
        setLoading(false);
        return;
      }

      setRequest(reqRow);
      setLoading(false);
    };

    load();
  }, [id, navigate]);

  const handleAccept = async () => {
    if (!volunteerUser || !request) return;
    setActionLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("help_requests")
      .update({
        status: "accepted",
        volunteer_id: volunteerUser.id,
      })
      .eq("id", request.id)
      .eq("status", "pending");

    setActionLoading(false);

    if (updateError) {
      setError("تعذر قبول الطلب. قد يكون قبله متطوع آخر.");
      return;
    }

    navigate("/volunteer/dashboard");
  };

  if (loading) {
    return (
      <div
        className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري تحميل التفاصيل...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div
        className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center'
        dir='rtl'
      >
        <div className='text-center'>
          <p className='text-slate-600 mb-4'>{error || "الطلب غير موجود"}</p>
          <Link
            to='/volunteer/dashboard'
            className='text-teal-700 font-semibold'
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  const reqLat = request.latitude != null ? Number(request.latitude) : null;
  const reqLng = request.longitude != null ? Number(request.longitude) : null;
  const volLat =
    volunteerUser?.latitude != null ? Number(volunteerUser.latitude) : null;
  const volLng =
    volunteerUser?.longitude != null ? Number(volunteerUser.longitude) : null;

  const hasBothLocations =
    reqLat != null &&
    reqLng != null &&
    volLat != null &&
    volLng != null &&
    !Number.isNaN(reqLat) &&
    !Number.isNaN(reqLng) &&
    !Number.isNaN(volLat) &&
    !Number.isNaN(volLng);

  const distanceKm = hasBothLocations
    ? getDistanceKm(volLat, volLng, reqLat, reqLng)
    : null;

  const mapCenter = hasBothLocations
    ? [(volLat + reqLat) / 2, (volLng + reqLng) / 2]
    : reqLat != null && reqLng != null
      ? [reqLat, reqLng]
      : [24.7136, 46.6753];

  const dayName = request.request_date
    ? DAY_NAMES[new Date(request.request_date).getDay()]
    : "—";

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50'
      dir='rtl'
    >
      <header className='bg-white/90 backdrop-blur border-b border-teal-100 sticky top-0 z-40'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <Link
            to='/volunteer/dashboard'
            className='inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium'
          >
            <ArrowRight size={18} />
            العودة
          </Link>
          <span className='text-lg font-bold text-teal-800'>
            Easy<span className='text-teal-500'>Move</span>
          </span>
        </div>
      </header>

      <main className='max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        <div>
          <div className='inline-flex items-center gap-2 bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-3'>
            تفاصيل الطلب
          </div>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            {request.title}
          </h1>
          <p className='text-slate-500 text-sm'>النوع: {request.help_type}</p>
        </div>

        {error && (
          <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
            {error}
          </div>
        )}

        {/* بطاقات التفاصيل */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white/90 border border-teal-100 rounded-2xl p-4'>
            <div className='flex items-center gap-2 text-teal-700 mb-2'>
              <CalendarDays size={18} />
              <span className='text-sm font-semibold'>اليوم والتاريخ</span>
            </div>
            <p className='font-bold text-slate-900'>{dayName}</p>
            <p className='text-sm text-slate-600'>
              {formatDate(request.request_date)}
            </p>
          </div>

          <div className='bg-white/90 border border-cyan-100 rounded-2xl p-4'>
            <div className='flex items-center gap-2 text-cyan-700 mb-2'>
              <Clock3 size={18} />
              <span className='text-sm font-semibold'>الوقت</span>
            </div>
            <p className='font-bold text-slate-900'>
              {formatTime(request.request_time)}
            </p>
          </div>

          <div className='bg-white/90 border border-orange-100 rounded-2xl p-4'>
            <div className='flex items-center gap-2 text-orange-700 mb-2'>
              <Navigation size={18} />
              <span className='text-sm font-semibold'>المسافة منك</span>
            </div>
            <p className='font-bold text-slate-900'>
              {distanceKm != null ? `${distanceKm.toFixed(1)} كم` : "غير متاحة"}
            </p>
          </div>
        </div>

        {/* التفاصيل النصية */}
        <div className='bg-white/90 border border-teal-100 rounded-3xl p-6 space-y-4'>
          <div>
            <p className='text-sm text-slate-500 mb-1'>وصف الطلب</p>
            <p className='text-slate-800 leading-relaxed'>
              {request.description || "لا يوجد وصف إضافي"}
            </p>
          </div>

          <div>
            <p className='text-sm text-slate-500 mb-1'>موقع الطلب</p>
            <p className='text-slate-800 flex items-start gap-2'>
              <MapPin size={16} className='text-orange-600 mt-0.5 shrink-0' />
              {request.location || "غير محدد"}
            </p>
          </div>

          {volunteerUser?.location_text && (
            <div>
              <p className='text-sm text-slate-500 mb-1'>
                موقعك الحالي (المسجل)
              </p>
              <p className='text-slate-800 flex items-start gap-2'>
                <MapPin size={16} className='text-teal-600 mt-0.5 shrink-0' />
                {volunteerUser.location_text}
              </p>
            </div>
          )}
        </div>

        {/* الخريطة */}
        <div className='bg-white/90 border border-teal-100 rounded-3xl overflow-hidden'>
          <div className='px-6 py-4 border-b border-teal-50 flex items-center justify-between'>
            <h2 className='font-bold text-slate-900'>الموقع على الخريطة</h2>
            {reqLat != null && reqLng != null && (
              <a
                href={
                  hasBothLocations
                    ? `https://www.google.com/maps/dir/?api=1&origin=${volLat},${volLng}&destination=${reqLat},${reqLng}`
                    : `https://www.google.com/maps?q=${reqLat},${reqLng}`
                }
                target='_blank'
                rel='noreferrer'
                className='text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors'
              >
                فتح في Google Maps
              </a>
            )}
          </div>

          <div className='h-[380px]'>
            {reqLat != null && reqLng != null ? (
              <MapContainer
                center={mapCenter}
                zoom={hasBothLocations ? 12 : 14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />

                {hasBothLocations && (
                  <>
                    <Marker position={[volLat, volLng]} icon={volunteerIcon}>
                      <Popup>موقعك</Popup>
                    </Marker>
                    <Polyline
                      positions={[
                        [volLat, volLng],
                        [reqLat, reqLng],
                      ]}
                      pathOptions={{
                        color: "#0f766e",
                        weight: 3,
                        opacity: 0.7,
                      }}
                    />
                  </>
                )}

                <Marker position={[reqLat, reqLng]} icon={requestIcon}>
                  <Popup>موقع الطلب</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className='h-full flex items-center justify-center text-slate-400 text-sm'>
                لا تتوفر إحداثيات لهذا الطلب
              </div>
            )}
          </div>

          <div className='px-6 py-3 bg-stone-50 text-xs text-slate-500 flex flex-wrap gap-4'>
            <span>👤 موقع المتطوع</span>
            <span>📍 موقع الطلب</span>
            {distanceKm != null && (
              <span className='text-teal-700 font-semibold'>
                المسافة التقريبية: {distanceKm.toFixed(1)} كم
              </span>
            )}
          </div>
        </div>

        {/* زر القبول */}
        {request.status === "pending" && (
          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              type='button'
              disabled={actionLoading}
              onClick={handleAccept}
              className='inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-teal-700/20 transition-all'
            >
              <CheckCircle2 size={18} />
              {actionLoading ? "جاري القبول..." : "قبول الطلب"}
            </button>

            <Link
              to='/volunteer/dashboard'
              className='inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold border border-stone-200 bg-white text-slate-700 hover:bg-stone-50 transition-colors'
            >
              رجوع
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default VolunteerRequestDetails;
