import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowRight, Save } from "lucide-react";

const SKILLS = ["مساعدة في التنقل", "التسوق", "المواعيد الطبية"];

const DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const VolunteerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [userId, setUserId] = useState(null);
  const [volunteerId, setVolunteerId] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState([]);
  const [days, setDays] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=volunteer");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("id, name, phone, user_type")
        .eq("email", authData.user.email)
        .eq("user_type", "volunteer")
        .maybeSingle();

      if (!userRow) {
        setError("لم يتم العثور على حساب المتطوع");
        setLoading(false);
        return;
      }

      setUserId(userRow.id);
      setName(userRow.name || "");
      setPhone(userRow.phone || "");

      const { data: volRow } = await supabase
        .from("volunteers")
        .select("*")
        .eq("user_id", userRow.id)
        .maybeSingle();

      if (volRow) {
        setVolunteerId(volRow.id);
        setSkills(volRow.skills || []);
        setDays(volRow.availability_schedule || []);
      }

      setLoading(false);
    };

    load();
  }, [navigate]);

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const { error: userError } = await supabase
      .from("users")
      .update({ name, phone })
      .eq("id", userId);

    if (userError) {
      setSaving(false);
      setError("تعذر تحديث البيانات الشخصية");
      return;
    }

    if (volunteerId) {
      const { error: volError } = await supabase
        .from("volunteers")
        .update({
          skills,
          availability_schedule: days,
        })
        .eq("id", volunteerId);

      if (volError) {
        setSaving(false);
        setError("تعذر تحديث المهارات وأيام التوفر");
        return;
      }
    }

    setSaving(false);
    setMessage("تم حفظ التعديلات بنجاح");
  };

  if (loading) {
    return (
      <div
        className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50'
      dir='rtl'
    >
      <header className='bg-white/90 backdrop-blur border-b border-teal-100 sticky top-0 z-40'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <Link
            to='/volunteer/dashboard'
            className='inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium'
          >
            <ArrowRight size={18} />
            العودة للوحة التحكم
          </Link>
          <span className='text-lg font-bold text-teal-800'>
            Easy<span className='text-teal-500'>Move</span>
          </span>
        </div>
      </header>

      <main className='max-w-3xl mx-auto px-4 sm:px-6 py-8'>
        <div className='mb-8'>
          <div className='inline-flex items-center gap-2 bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-3'>
            حساب المتطوع
          </div>
          <h1 className='text-3xl font-bold text-slate-900'>الملف الشخصي</h1>
          <p className='text-slate-500 text-sm mt-1'>
            حدّث بياناتك ومهاراتك وأيام تفرّغك ليصلك الأنسب من الطلبات
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className='bg-white/90 backdrop-blur border border-teal-100 shadow-xl shadow-teal-700/5 rounded-3xl p-6 md:p-8 space-y-6'
        >
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              الاسم
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              رقم الجوال
            </label>
            <input
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className='w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all'
              dir='ltr'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              نوع الخدمات التي تقدمها
            </label>
            <div className='flex flex-wrap gap-2'>
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  type='button'
                  onClick={() => toggleSkill(skill)}
                  className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                    skills.includes(skill)
                      ? "bg-gradient-to-l from-teal-600 to-cyan-600 text-white border-teal-600 shadow-sm"
                      : "bg-white text-slate-600 border-stone-200 hover:border-teal-300"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              أيام التوفر
            </label>
            <div className='flex flex-wrap gap-2'>
              {DAYS.map((day) => (
                <button
                  key={day}
                  type='button'
                  onClick={() => toggleDay(day)}
                  className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                    days.includes(day)
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-600 border-stone-200 hover:border-emerald-300"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
              {error}
            </div>
          )}
          {message && (
            <div className='bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-100'>
              {message}
            </div>
          )}

          <button
            type='submit'
            disabled={saving}
            className='inline-flex items-center gap-2 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-teal-700/20 transition-all'
          >
            <Save size={18} />
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default VolunteerProfile;
