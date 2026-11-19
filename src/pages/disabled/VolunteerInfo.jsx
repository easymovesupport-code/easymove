import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { EDUCATION_OPTIONS } from "../../constants/registerConstants";
import {
  ArrowRight,
  User,
  Phone,
  Flag,
  Building2,
  GraduationCap,
  MessageCircle,
  Calendar,
} from "lucide-react";

const VolunteerInfo = () => {
  // استخدام useParams للحصول على معرف الطلب من الرابط
  const { requestId } = useParams();
  //   استخدام useState لتخزين حالة التحميل، بيانات المتطوع، واسم الطلب
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [volunteer, setVolunteer] = useState(null);
  const [requestTitle, setRequestTitle] = useState("");
  // استخدام useEffect لتحميل بيانات المتطوع عند تحميل المكون
  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=disabled");
        return;
      }
      //     جلب بيانات الطلب من جدول "help_requests" مع معلومات المتطوع المرتبط بالطلب
      const { data: req } = await supabase
        .from("help_requests")
        .select(
          `
          id, title, status, volunteer_id,
         volunteer:users!help_requests_volunteer_id_fkey (
  id, name, phone, city, nationality, education, profile_image, date_of_birth)
        `,
        )
        .eq("id", requestId)
        .maybeSingle();
      // التحقق من وجود الطلب وحالته، وإذا لم يكن الطلب موجودًا أو لم يتم قبوله أو لم يكن هناك متطوع مرتبط به، يتم إعادة التوجيه إلى لوحة التحكم
      if (!req || req.status !== "accepted" || !req.volunteer) {
        navigate("/disabled/dashboard");
        return;
      }

      setRequestTitle(req.title || "");
      setVolunteer(req.volunteer);
      setLoading(false);
    };

    load();
  }, [requestId, navigate]);

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
  // دالة حساب العمر
  const getAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
  // تحديد التسمية للمؤهل العلمي للمتطوع بناءً على القيمة المخزنة في قاعدة البيانات
  const educationLabel =
    EDUCATION_OPTIONS.find((e) => e.id === volunteer.education)?.label ||
    volunteer.education ||
    "—";

  const age = getAge(volunteer.date_of_birth);

  const rows = [
    {
      label: "الاسم",
      value: volunteer.name,
      icon: User,
      color: "bg-teal-100 text-teal-700",
    },
    {
      label: "العمر",
      value: age != null ? `${age} سنة` : "—",
      icon: Calendar, // استوردي Calendar من lucide-react
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "المؤهل العلمي",
      value: educationLabel,
      icon: GraduationCap,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "الجنسية",
      value: volunteer.nationality || "—",
      icon: Flag,
      color: "bg-rose-100 text-rose-700",
    },
    {
      label: "رقم الجوال",
      value: volunteer.phone || "—",
      icon: Phone,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "المدينة",
      value: volunteer.city || "—",
      icon: Building2,
      color: "bg-cyan-100 text-cyan-700",
    },
  ];

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-teal-50 via-stone-50 to-cyan-50'
      dir='rtl'
    >
      <header className='bg-white/90 border-b border-stone-200 sticky top-0 z-40'>
        <div className='max-w-3xl mx-auto px-4 py-4 flex items-center justify-between'>
          <Link
            to='/disabled/dashboard'
            className='inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium'
          >
            <ArrowRight size={18} />
            العودة
          </Link>
          <span className='font-bold text-teal-800'>
            Easy<span className='text-teal-500'>Move</span>
          </span>
        </div>
      </header>

      <main className='max-w-3xl mx-auto px-4 py-10'>
        <div className='bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden'>
          <div className='relative h-36 bg-gradient-to-l from-teal-700 via-emerald-600 to-cyan-600'>
            <div className='absolute inset-0 opacity-30'>
              <div className='absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-2xl' />
            </div>
          </div>

          <div className='relative px-6 pb-8'>
            <div className='flex flex-col items-center -mt-14'>
              <div className='w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center'>
                {volunteer.profile_image ? (
                  <img
                    src={volunteer.profile_image}
                    alt={volunteer.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User size={48} className='text-teal-700' />
                )}
              </div>
              <h1 className='mt-4 text-2xl font-bold text-slate-900 text-center'>
                {volunteer.name}
              </h1>
              <p className='text-sm text-teal-700 font-medium mt-1'>
                متطوع طلب: {requestTitle}
              </p>
            </div>

            <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {rows.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.label}
                    className='flex items-start gap-3 bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3.5'
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.color}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className='min-w-0 flex-1 text-right'>
                      <p className='text-xs text-slate-500 mb-0.5'>{r.label}</p>
                      <p className='text-sm font-semibold text-slate-900 break-words'>
                        {r.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className='mt-8 flex flex-wrap justify-center gap-3'>
              <Link
                to={`/disabled/chat/${requestId}`}
                className='inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-xl font-semibold'
              >
                <MessageCircle size={18} />
                المحادثة
              </Link>
              <Link
                to='/disabled/dashboard'
                className='inline-flex items-center gap-2 border border-stone-200 bg-white text-slate-700 px-6 py-3 rounded-xl font-semibold'
              >
                رجوع للوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VolunteerInfo;
