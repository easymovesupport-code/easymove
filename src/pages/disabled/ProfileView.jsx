import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { ArrowRight, Pencil } from "lucide-react";

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
    { label: "الاسم", value: user?.name },
    { label: "البريد الإلكتروني", value: user?.email },
    { label: "رقم الجوال", value: user?.phone },
    { label: "الجنس", value: labelGender[user?.gender] || user?.gender },
    { label: "تاريخ الميلاد", value: user?.date_of_birth },
    { label: "الجنسية", value: user?.nationality },
    { label: "المدينة", value: user?.city },
    { label: "العنوان", value: user?.location_text },
  ];

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50'
      dir='rtl'
    >
      <header className='bg-white/90 border-b border-teal-100 sticky top-0 z-40'>
        <div className='max-w-3xl mx-auto px-4 py-4 flex items-center justify-between'>
          <Link
            to='/disabled/dashboard'
            className='inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm'
          >
            <ArrowRight size={18} />
            العودة
          </Link>
          <span className='font-bold text-teal-800'>
            Easy<span className='text-teal-500'>Move</span>
          </span>
        </div>
      </header>

      <main className='max-w-3xl mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold text-slate-900 mb-2'>الملف الشخصي</h1>
        <p className='text-slate-500 text-sm mb-8'>عرض بياناتك الشخصية</p>

        <div className='bg-white border border-teal-100 rounded-3xl shadow-sm overflow-hidden'>
          <div className='divide-y divide-stone-100'>
            {rows.map((r) => (
              <div
                key={r.label}
                className='px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1'
              >
                <span className='text-sm text-slate-500'>{r.label}</span>
                <span className='font-medium text-slate-900'>
                  {r.value || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-6'>
          <Link
            to='/disabled/profile/edit'
            className='inline-flex items-center gap-2 bg-gradient-to-l from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md'
          >
            <Pencil size={18} />
            تعديل البيانات
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ProfileView;
