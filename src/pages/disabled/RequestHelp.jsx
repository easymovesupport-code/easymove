import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import LocationPicker from "../../components/LocationPicker";
import { ArrowRight, Search, HandHeart } from "lucide-react";

const HELP_TYPES = ["مساعدة في التنقل", "التسوق", "المواعيد الطبية"];

const RequestHelp = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [helpType, setHelpType] = useState("");
  const [title, setTitle] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [description, setDescription] = useState("");

  const [position, setPosition] = useState(null);
  const [locationText, setLocationText] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=disabled");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("id, latitude, longitude, location_text, city")
        .eq("email", authData.user.email)
        .eq("user_type", "disabled")
        .maybeSingle();

      if (!userRow) {
        navigate("/login?type=disabled");
        return;
      }

      setUserId(userRow.id);

      if (userRow.latitude != null && userRow.longitude != null) {
        setPosition({
          lat: Number(userRow.latitude),
          lng: Number(userRow.longitude),
        });
        setLocationText(userRow.location_text || userRow.city || "");
      }

      setLoading(false);
    };

    load();
  }, [navigate]);

  const searchPlace = async () => {
    if (!placeQuery.trim()) {
      setError("اكتبي اسم المكان للبحث");
      return;
    }

    setSearching(true);
    setError("");

    try {
      const q = encodeURIComponent(`${placeQuery} السعودية`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&accept-language=ar`,
        { headers: { Accept: "application/json" } },
      );
      const data = await res.json();

      if (!data?.length) {
        setError("لم يتم العثور على المكان. جرّبي اسم أوضح.");
        setSearching(false);
        return;
      }

      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      setPosition({ lat, lng });
      setLocationText(data[0].display_name || placeQuery);
    } catch {
      setError("تعذر البحث عن المكان حالياً");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!helpType) {
      setError("اختاري نوع المساعدة");
      return;
    }
    if (!title.trim()) {
      setError("عنوان الطلب مطلوب");
      return;
    }
    if (!timeFrom || !timeTo) {
      setError("حددي وقت بداية ونهاية الخدمة");
      return;
    }
    if (timeFrom >= timeTo) {
      setError("وقت النهاية يجب أن يكون بعد وقت البداية");
      return;
    }
    if (!requestDate) {
      setError("التاريخ مطلوب");
      return;
    }
    if (!description.trim()) {
      setError("التفاصيل الإضافية مطلوبة");
      return;
    }
    if (!position?.lat || !position?.lng) {
      setError("حددي الموقع على الخريطة");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase.from("help_requests").insert([
      {
        user_id: userId,
        title: title.trim(),
        help_type: helpType,
        description: description.trim(),
        location: locationText || null,
        latitude: position.lat,
        longitude: position.lng,
        request_date: requestDate,
        request_time: timeFrom, // للتوافق مع الكود القديم
        time_from: timeFrom,
        time_to: timeTo,
        status: "pending",
      },
    ]);

    setSaving(false);

    if (insertError) {
      console.error(insertError);
      setError("تعذر إرسال الطلب. تحققي من الأعمدة في قاعدة البيانات.");
      return;
    }

    setSuccess("تم إرسال الطلب بنجاح");
    setTimeout(() => navigate("/disabled/dashboard"), 1200);
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

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-right";

  return (
    <div className='min-h-screen bg-stone-50' dir='rtl'>
      <header className='bg-white border-b border-stone-200 sticky top-0 z-40'>
        <div className='max-w-4xl mx-auto px-4 py-4 flex items-center justify-between'>
          <Link
            to='/disabled/dashboard'
            className='inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium'
          >
            <ArrowRight size={18} />
            العودة للوحة التحكم
          </Link>
          <span className='font-bold text-teal-800'>
            Easy<span className='text-teal-500'>Move</span>
          </span>
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 py-8'>
        <div className='flex items-start justify-between gap-4 mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900 mb-2'>
              طلب مساعدة
            </h1>
            <p className='text-slate-500 text-sm'>
              املأي البيانات التالية وسيظهر طلبك للمتطوعين المتاحين.
            </p>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center'>
            <HandHeart size={22} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className='bg-white rounded-3xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-6'
        >
          {/* نوع المساعدة */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
              نوع المساعدة <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-2 justify-end'>
              {HELP_TYPES.map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => setHelpType(type)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    helpType === type
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-stone-200 hover:border-teal-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* شبكة عمودين */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
                عنوان الطلب <span className='text-red-500'>*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder='مثال: مرافقة لموعد علاج طبيعي'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
                من الساعة <span className='text-red-500'>*</span>
              </label>
              <input
                type='time'
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
                إلى الساعة <span className='text-red-500'>*</span>
              </label>
              <input
                type='time'
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
                التاريخ <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
                بحث عن المكان
              </label>
              <div className='flex gap-2'>
                <input
                  value={placeQuery}
                  onChange={(e) => setPlaceQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchPlace();
                    }
                  }}
                  className={inputClass}
                  placeholder='مثال: مستشفى الملك فيصل الرياض'
                />
                <button
                  type='button'
                  onClick={searchPlace}
                  disabled={searching}
                  className='shrink-0 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium'
                  title='بحث'
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            <div className='md:col-span-2'>
              <LocationPicker
                position={position}
                setPosition={setPosition}
                locationText={locationText}
                setLocationText={setLocationText}
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
                تفاصيل إضافية <span className='text-red-500'>*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className={`${inputClass} resize-none`}
                placeholder='اكتب تفاصيل تساعد المتطوع على فهم الطلب...'
              />
            </div>
          </div>

          {error && (
            <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
              {error}
            </div>
          )}
          {success && (
            <div className='bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-100'>
              {success}
            </div>
          )}

          <button
            type='submit'
            disabled={saving}
            className='w-full md:w-auto bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-semibold shadow-md'
          >
            {saving ? "جاري الإرسال..." : "إرسال الطلب"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default RequestHelp;
