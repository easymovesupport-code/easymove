import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ArrowRight,
  Pencil,
  User,
  Mail,
  Phone,
  Calendar,
  Flag,
  MapPin,
  Building2,
  VenusAndMars,
} from "lucide-react";

const labelGender = { male: "ذكر", female: "أنثى" };

const ProfileView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=disabled");
        return;
      }

      const { data } = await supabase
        .from("users")
        .select(
          "name, phone, gender, date_of_birth, nationality, city, location_text, email",
        )
        .eq("email", authData.user.email)
        .eq("user_type", "disabled")
        .maybeSingle();

      setUser(data);
      setLoading(false);
    };
    load();
  }, [navigate]);

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

  const rows = [
    {
      label: "الاسم",
      value: user?.name,
      icon: User,
      color: "bg-teal-100 text-teal-700",
    },
    {
      label: "البريد الإلكتروني",
      value: user?.email,
      icon: Mail,
      color: "bg-sky-100 text-sky-700",
    },
    {
      label: "رقم الجوال",
      value: user?.phone,
      icon: Phone,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "الجنس",
      value: labelGender[user?.gender] || user?.gender,
      icon: VenusAndMars,
      color: "bg-violet-100 text-violet-700",
    },
    {
      label: "تاريخ الميلاد",
      value: user?.date_of_birth,
      icon: Calendar,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "الجنسية",
      value: user?.nationality,
      icon: Flag,
      color: "bg-rose-100 text-rose-700",
    },
    {
      label: "المدينة",
      value: user?.city,
      icon: Building2,
      color: "bg-cyan-100 text-cyan-700",
    },
    {
      label: "العنوان",
      value: user?.location_text,
      icon: MapPin,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-teal-50 via-stone-50 to-cyan-50'
      dir='rtl'
    >
      <header className='bg-white/90 backdrop-blur border-b border-stone-200 sticky top-0 z-40'>
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
        {/* البطاقة الرئيسية */}
        <div className='bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-stone-100 overflow-hidden'>
          {/* البانر الملوّن */}
          <div className='relative h-36 bg-gradient-to-l from-teal-700 via-emerald-600 to-cyan-600'>
            <div className='absolute inset-0 opacity-30'>
              <div className='absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-2xl'></div>
              <div className='absolute bottom-0 left-10 w-40 h-40 bg-cyan-300/30 rounded-full blur-2xl'></div>
              <div className='absolute top-6 left-1/3 w-24 h-24 bg-emerald-200/20 rounded-full blur-xl'></div>
            </div>
          </div>

          {/* الصورة الثابتة + الاسم */}
          <div className='relative px-6 pb-6'>
            <div className='flex flex-col items-center -mt-14'>
              <div className='w-28 h-28 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center'>
                <User size={48} className='text-teal-700' />
              </div>

              <h1 className='mt-4 text-2xl font-bold text-slate-900 text-center'>
                {user?.name || "مستخدم"}
              </h1>
            </div>
            {/* البيانات على عمودين */}
            <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {rows.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.label}
                    className='flex items-start gap-3 bg-stone-50 hover:bg-stone-100 border border-stone-100 rounded-2xl px-4 py-3.5 transition-colors'
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.color}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className='min-w-0 flex-1 text-right'>
                      <p className='text-xs text-slate-500 mb-0.5'>{r.label}</p>
                      <p className='text-sm font-semibold text-slate-900 break-words'>
                        {r.value || "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* زر التعديل */}
            <div className='mt-8 flex justify-center'>
              <Link
                to='/disabled/profile/edit'
                className='inline-flex items-center gap-2 bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md shadow-teal-700/20 transition-all'
              >
                <Pencil size={18} />
                تعديل البيانات
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileView;
