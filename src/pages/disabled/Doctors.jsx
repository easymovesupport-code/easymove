import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../../lib/supabase";
import "../../utils/leafletIcon";
import {
  ArrowRight,
  MapPin,
  Phone,
  Navigation,
  Stethoscope,
} from "lucide-react";

const SPECIALTY_LABEL = {
  orthopedics: "عظام",
  physical_medicine: "طب طبيعي",
  rehab: "تأهيل",
  general: "عام",
};

const TYPE_LABEL = {
  hospital: "مستشفى",
  clinic: "عيادة",
  physiotherapy: "علاج طبيعي",
  rehab: "مركز تأهيل",
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

const detectRegion = (locationText = "") => {
  const t = locationText.toLowerCase();

  if (t.includes("riyadh") || t.includes("الرياض")) return "الرياض";
  if (
    t.includes("jeddah") ||
    t.includes("جدة") ||
    t.includes("makkah") ||
    t.includes("مكة")
  )
    return "مكة المكرمة";
  if (
    t.includes("dammam") ||
    t.includes("الدمام") ||
    t.includes("khobar") ||
    t.includes("الخبر") ||
    t.includes("dhahran") ||
    t.includes("الظهران") ||
    t.includes("الشرقية")
  )
    return "الشرقية";
  if (t.includes("madinah") || t.includes("المدينة")) return "المدينة المنورة";

  return null;
};

// أيقونة موقع المستخدم
const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="
      width:42px;height:42px;border-radius:9999px;
      background:#0f766e;border:3px solid white;
      box-shadow:0 2px 10px rgba(0,0,0,.25);
      display:flex;align-items:center;justify-content:center;
      font-size:20px;line-height:1;
    ">👤</div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

// تجهيز النتائج: نفس المنطقة + الأقرب + أقصى 3
const buildResults = (list, lat, lng, locationText) => {
  const region = detectRegion(locationText || "");

  let prepared = (list || []).map((f) => ({
    ...f,
    distance_km: getDistanceKm(
      lat,
      lng,
      Number(f.latitude),
      Number(f.longitude),
    ),
  }));

  // فقط مرافق نفس منطقة المستخدم
  if (region) {
    prepared = prepared.filter((f) => f.region === region);
  }

  prepared.sort((a, b) => a.distance_km - b.distance_km);

  // أقرب 3 فقط
  return prepared.slice(0, 3);
};

const Doctors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [allFacilities, setAllFacilities] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        navigate("/login?type=disabled");
        return;
      }

      const authEmail = authData.user.email;

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("id, email, user_type, latitude, longitude, location_text")
        .eq("email", authEmail)
        .maybeSingle();

      if (userError) {
        console.error("user error:", userError);
        setError("تعذر قراءة بيانات الحساب");
      }

      const { data: rows, error: facError } = await supabase
        .from("medical_facilities")
        .select("*")
        .eq("is_mobility_related", true);

      if (facError) {
        console.error("facilities error:", facError);
        setError("تعذر تحميل المرافق الطبية");
        setAllFacilities([]);
        setFacilities([]);
      } else {
        setAllFacilities(rows || []);
      }

      const lat = userRow?.latitude != null ? Number(userRow.latitude) : null;
      const lng = userRow?.longitude != null ? Number(userRow.longitude) : null;

      if (
        lat != null &&
        lng != null &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng)
      ) {
        const text = userRow.location_text || "موقع الحساب المحفوظ";
        setUserLocation({ lat, lng, text });
        setFacilities(buildResults(rows || [], lat, lng, text));
        setError("");
      } else {
        setUserLocation(null);
        setFacilities([]);
        setError(
          "لا يوجد موقع محفوظ لهذا الحساب. يمكنك استخدام الموقع الحالي أو موقع تجريبي في الرياض.",
        );
      }

      setLoading(false);
    };

    load();
  }, [navigate]);

  const filtered = useMemo(() => {
    if (filter === "all") return facilities;
    return facilities.filter(
      (f) => f.specialty === filter || f.facility_type === filter,
    );
  }, [facilities, filter]);

  const setLocationAndSort = (lat, lng, text) => {
    setUserLocation({ lat, lng, text });
    setError("");
    setFacilities(buildResults(allFacilities, lat, lng, text));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationAndSort(
          pos.coords.latitude,
          pos.coords.longitude,
          "موقعك الحالي",
        );
      },
      () => {
        setError("تعذر الحصول على موقعك الحالي. جرّبي الموقع التجريبي.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const useRiyadhTestLocation = () => {
    setLocationAndSort(24.7136, 46.6753, "موقع تجريبي - الرياض");
  };

  if (loading) {
    return (
      <div
        className='min-h-screen bg-stone-50 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري تحميل أقرب الأطباء...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-stone-50' dir='rtl'>
      <header className='bg-white border-b border-stone-200 sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <Link
            to='/disabled/dashboard'
            className='inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium'
          >
            <ArrowRight size={18} />
            العودة للوحة التحكم
          </Link>
          <Link
            to='/disabled/dashboard'
            className='text-xl font-bold text-teal-800'
          >
            Easy<span className='text-teal-500'>Move</span>
          </Link>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6'>
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4'>
          <div>
            <div className='w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3'>
              <Stethoscope size={22} />
            </div>
            <h1 className='text-3xl font-bold text-slate-900 mb-2'>
              أقرب الأطباء والمرافق
            </h1>
            <p className='text-slate-500 text-sm'>
              يتم عرض أقرب 3 مرافق داخل منطقتك فقط
            </p>
          </div>

          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={useCurrentLocation}
              className='inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors'
            >
              <Navigation size={16} />
              استخدام موقعي الحالي
            </button>

            <button
              type='button'
              onClick={useRiyadhTestLocation}
              className='inline-flex items-center gap-2 bg-white border border-stone-200 text-slate-700 hover:bg-stone-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors'
            >
              موقع تجريبي (الرياض)
            </button>
          </div>
        </div>

        {userLocation && (
          <div className='bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm text-slate-600 flex items-start gap-2'>
            <MapPin size={16} className='text-teal-600 mt-0.5 shrink-0' />
            <span>
              الموقع المعتمد:{" "}
              <strong className='text-slate-800'>{userLocation.text}</strong>
            </span>
          </div>
        )}

        {error && (
          <div className='bg-amber-50 text-amber-800 text-sm px-4 py-3 rounded-xl border border-amber-100'>
            {error}
          </div>
        )}

        <div className='flex flex-wrap gap-2'>
          {[
            { id: "all", label: "الكل" },
            { id: "orthopedics", label: "عظام" },
            { id: "physical_medicine", label: "طب طبيعي" },
            { id: "rehab", label: "تأهيل" },
            { id: "physiotherapy", label: "علاج طبيعي" },
          ].map((item) => (
            <button
              key={item.id}
              type='button'
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                filter === item.id
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-slate-600 border-stone-200 hover:border-teal-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* الخريطة */}
          <div className='h-[420px] rounded-3xl overflow-hidden border border-stone-200 shadow-sm bg-white'>
            {userLocation ? (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />

                {/* موقع المستخدم برمز مميز */}
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userIcon}
                >
                  <Popup>موقعك</Popup>
                </Marker>

                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={5000}
                  pathOptions={{ color: "#0f766e", fillOpacity: 0.05 }}
                />

                {filtered.map((f) => (
                  <Marker
                    key={f.id}
                    position={[Number(f.latitude), Number(f.longitude)]}
                  >
                    <Popup>
                      <strong>{f.name_ar || f.name}</strong>
                      <br />
                      {typeof f.distance_km === "number"
                        ? `${f.distance_km.toFixed(1)} كم`
                        : ""}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className='h-full flex items-center justify-center text-slate-400 text-sm p-6 text-center'>
                حدّدي موقعاً لعرض الخريطة والنتائج
              </div>
            )}
          </div>

          {/* القائمة */}
          <div className='space-y-3 max-h-[420px] overflow-y-auto pe-1'>
            {!userLocation ? (
              <div className='bg-white border border-stone-200 rounded-2xl p-6 text-center text-slate-500 text-sm'>
                لا يمكن حساب الأقرب قبل تحديد الموقع.
              </div>
            ) : filtered.length === 0 ? (
              <div className='bg-white border border-stone-200 rounded-2xl p-6 text-center text-slate-500 text-sm'>
                لا توجد نتائج ضمن منطقتك أو هذا الفلتر حالياً.
              </div>
            ) : (
              filtered.map((f, index) => (
                <div
                  key={f.id}
                  className='bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full'>
                          #{index + 1}
                        </span>
                        <h3 className='font-bold text-slate-900'>
                          {f.name_ar || f.name}
                        </h3>
                      </div>
                      <p className='text-sm text-slate-500'>
                        {TYPE_LABEL[f.facility_type] || f.facility_type}
                        {" • "}
                        {SPECIALTY_LABEL[f.specialty] || f.specialty || "—"}
                      </p>
                    </div>
                    <span className='shrink-0 text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-100 px-2.5 py-1 rounded-lg'>
                      {typeof f.distance_km === "number"
                        ? `${f.distance_km.toFixed(1)} كم`
                        : "—"}
                    </span>
                  </div>

                  <p className='text-sm text-slate-600 mt-3 flex items-start gap-1.5'>
                    <MapPin
                      size={14}
                      className='mt-0.5 text-teal-600 shrink-0'
                    />
                    {f.address || `${f.city || ""} ${f.region || ""}`}
                  </p>

                  <div className='mt-3 flex flex-wrap gap-2'>
                    {f.phone && (
                      <a
                        href={`tel:${f.phone}`}
                        className='inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors'
                      >
                        <Phone size={14} />
                        اتصال
                      </a>
                    )}
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${f.latitude}&mlon=${f.longitude}#map=16/${f.latitude}/${f.longitude}`}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors'
                    >
                      عرض على الخريطة
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Doctors;
