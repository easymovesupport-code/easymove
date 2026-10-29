import LocationPicker from "../../components/LocationPicker";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowRight, HandHeart, CheckCircle2 } from "lucide-react";

const HELP_TYPES = ["مساعدة في التنقل", "التسوق", "المواعيد الطبية"];

const RequestHelp = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [position, setPosition] = useState(null); // { lat, lng }
  const [locationText, setLocationText] = useState("");

  const [form, setForm] = useState({
    help_type: "",
    title: "",
    request_time: "",
    request_date: "",
    description: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=disabled");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("id")
        .eq("email", authData.user.email)
        .eq("user_type", "disabled")
        .single();

      if (!userRow) {
        navigate("/login?type=disabled");
        return;
      }

      setUserId(userRow.id);
      setLoadingUser(false);
    };

    loadUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (
      !form.help_type ||
      !form.title ||
      !form.request_time ||
      !form.request_date ||
      !position
    ) {
      setError("يرجى تعبئة جميع الحقول المطلوبة وتحديد الموقع");
      setSubmitting(false);
      return;
    }

    const payload = {
      user_id: userId,
      title: form.title,
      help_type: form.help_type,
      description: form.description || null,
      location: locationText || `${position.lat}, ${position.lng}`,
      latitude: position.lat,
      longitude: position.lng,
      request_date: form.request_date,
      request_time: form.request_time,
      status: "pending",
    };
    const { error: insertError } = await supabase
      .from("help_requests")
      .insert([payload]);

    setSubmitting(false);

    if (insertError) {
      console.error(insertError);
      setError("تعذر إرسال الطلب. حاولي مرة أخرى.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate("/disabled/dashboard");
    }, 1800);
  };

  if (loadingUser) {
    return (
      <div
        className='min-h-screen bg-stone-50 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري التحميل...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div
        className='min-h-screen bg-stone-50 flex items-center justify-center px-4'
        dir='rtl'
      >
        <div className='bg-white rounded-3xl border border-stone-200 shadow-lg p-10 text-center max-w-md w-full'>
          <div className='w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <CheckCircle2 size={32} />
          </div>
          <h2 className='text-2xl font-bold text-slate-900 mb-2'>
            تم إرسال طلبك
          </h2>
          <p className='text-slate-500 text-sm'>
            سيتم تحويلك إلى لوحة التحكم لمتابعة حالة الطلب.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-stone-50' dir='rtl'>
      {/* Top bar */}
      <header className='bg-white border-b border-stone-200 sticky top-0 z-40'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
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

      <main className='max-w-3xl mx-auto px-4 sm:px-6 py-8'>
        <div className='mb-8'>
          <div className='w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4'>
            <HandHeart size={28} />
          </div>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>طلب مساعدة</h1>
          <p className='text-slate-500'>
            املأ البيانات التالية وسيظهر طلبك للمتطوعين المتاحين.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='bg-white rounded-3xl border border-stone-200 shadow-sm p-6 md:p-8 space-y-5'
        >
          {/* 1) نوع المساعدة */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              نوع المساعدة <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {HELP_TYPES.map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      help_type: type,
                      title: p.title || type,
                    }))
                  }
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    form.help_type === type
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-stone-50 text-slate-600 border-stone-200 hover:border-teal-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 2) عنوان الطلب */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              عنوان الطلب <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='title'
              value={form.title}
              onChange={handleChange}
              required
              placeholder='مثال: مرافقة لموعد علاج طبيعي'
              className='w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all'
            />
          </div>

          {/* 3) الوقت */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              الوقت <span className='text-red-500'>*</span>
            </label>
            <input
              type='time'
              name='request_time'
              value={form.request_time}
              onChange={handleChange}
              required
              className='w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all'
            />
          </div>

          {/* 4) التاريخ */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              التاريخ <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              name='request_date'
              value={form.request_date}
              onChange={handleChange}
              required
              className='w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all'
            />
          </div>

          {/* 5) الموقع */}
          <LocationPicker
            position={position}
            setPosition={setPosition}
            locationText={locationText}
            setLocationText={setLocationText}
          />

          {/* 6) تفاصيل إضافية */}
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              تفاصيل إضافية
            </label>
            <textarea
              name='description'
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder='اكتبي أي تفاصيل تساعد المتطوع على فهم الطلب...'
              className='w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none'
            />
          </div>

          {error && (
            <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
              {error}
            </div>
          )}

          <button
            type='submit'
            disabled={submitting}
            className='w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-teal-700/20 hover:-translate-y-0.5'
          >
            {submitting ? "جاري إرسال الطلب..." : "إرسال طلب المساعدة"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default RequestHelp;
