import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import LocationPicker from "../../components/LocationPicker";
import { ArrowRight, CheckCircle2, Pencil } from "lucide-react";

const HELP_TYPES = [
  "مساعدة في التنقل",
  "التسوق",
  "موعد طبي",
  "الدعم المنزلي",
  "أخرى",
];

const EditRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const [form, setForm] = useState({
    help_type: "",
    title: "",
    request_time: "",
    request_date: "",
    description: "",
  });

  const [position, setPosition] = useState(null);
  const [locationText, setLocationText] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

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

      const { data: request, error: reqError } = await supabase
        .from("help_requests")
        .select("*")
        .eq("id", id)
        .eq("user_id", userRow.id)
        .single();

      if (reqError || !request) {
        setError("لم يتم العثور على الطلب أو لا تملكين صلاحية تعديله");
        setLoading(false);
        return;
      }

      if (request.status !== "pending") {
        setError("يمكن تعديل الطلب فقط وهو في حالة قيد الانتظار");
        setLoading(false);
        return;
      }

      setForm({
        help_type: request.help_type || "",
        title: request.title || "",
        request_time: request.request_time
          ? String(request.request_time).slice(0, 5)
          : "",
        request_date: request.request_date || "",
        description: request.description || "",
      });

      setLocationText(request.location || "");

      if (request.latitude && request.longitude) {
        setPosition({
          lat: Number(request.latitude),
          lng: Number(request.longitude),
        });
      }

      setLoading(false);
    };

    loadData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    const { error: updateError } = await supabase
      .from("help_requests")
      .update({
        title: form.title,
        help_type: form.help_type,
        description: form.description || null,
        location: locationText || `${position.lat}, ${position.lng}`,
        latitude: position.lat,
        longitude: position.lng,
        request_date: form.request_date,
        request_time: form.request_time,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .eq("status", "pending");

    setSubmitting(false);

    if (updateError) {
      console.error(updateError);
      setError("تعذر حفظ التعديلات. حاولي مرة أخرى.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      navigate("/disabled/dashboard");
    }, 1500);
  };

  if (loading) {
    return (
      <div
        className='min-h-screen bg-stone-50 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري تحميل الطلب...</p>
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
            تم حفظ التعديلات
          </h2>
          <p className='text-slate-500 text-sm'>سيتم تحويلك إلى لوحة التحكم.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-stone-50' dir='rtl'>
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
          <div className='w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4'>
            <Pencil size={26} />
          </div>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            تعديل طلب المساعدة
          </h1>
          <p className='text-slate-500'>عدّل بيانات الطلب ثم احفظ التغييرات.</p>
        </div>

        {error && !form.title ? (
          <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 mb-4'>
            {error}
          </div>
        ) : (
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
                    onClick={() => setForm((p) => ({ ...p, help_type: type }))}
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
                className='w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none'
              />
            </div>

            {error && (
              <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
                {error}
              </div>
            )}

            <div className='flex flex-col sm:flex-row gap-3'>
              <button
                type='submit'
                disabled={submitting}
                className='flex-1 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-teal-700/20'
              >
                {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>

              <Link
                to='/disabled/dashboard'
                className='flex-1 text-center border border-stone-200 text-slate-700 py-3.5 rounded-xl font-semibold hover:bg-stone-50 transition-all'
              >
                إلغاء
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default EditRequest;
