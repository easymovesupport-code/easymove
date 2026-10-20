import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { IdCard, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "disabled";
  const navigate = useNavigate();

  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1) جلب المستخدم من رقم الهوية
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("email, user_type")
      .eq("national_id", nationalId)
      .eq("user_type", type)
      .single();

    if (userError || !userRow) {
      setLoading(false);
      setError("رقم الهوية أو نوع الحساب غير صحيح");
      return;
    }

    // 2) تسجيل الدخول عبر Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: userRow.email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError("كلمة المرور غير صحيحة");
      return;
    }

    // 3) التوجيه
    if (type === "volunteer") {
      navigate("/volunteer/dashboard");
    } else {
      navigate("/disabled/dashboard");
    }
  };

  return (
    <div className='min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900'></div>
      <div className='absolute top-0 left-0 w-[420px] h-[420px] bg-teal-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2'></div>
      <div className='absolute bottom-0 right-0 w-[380px] h-[380px] bg-emerald-400/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3'></div>

      <div className='relative w-full max-w-md'>
        <div className='bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10'>
          <div className='text-center mb-8'>
            <Link to='/' className='text-2xl font-bold text-teal-800'>
              Easy<span className='text-teal-500'>Move</span>
            </Link>
            <h1 className='text-2xl font-bold text-slate-900 mt-4 mb-1'>
              تسجيل الدخول
            </h1>
            <p className='text-slate-500 text-sm'>
              {type === "volunteer" ? "بوابة المتطوعين" : "بوابة ذوي الإعاقة"}
            </p>
          </div>

          <form onSubmit={handleLogin} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                رقم الهوية الوطنية
              </label>
              <div className='relative'>
                <IdCard
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
                  size={18}
                />
                <input
                  type='text'
                  value={nationalId}
                  onChange={(e) =>
                    setNationalId(
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  required
                  placeholder='مثال: 1234567890'
                  className='w-full pr-10 pl-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all'
                  dir='rtl'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                كلمة المرور
              </label>
              <div className='relative'>
                <Lock
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder='••••••••'
                  className='w-full pr-10 pl-10 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all'
                  dir='rtl'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-teal-700/25 hover:shadow-xl hover:-translate-y-0.5'
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-stone-200'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-3 bg-white text-slate-400'>أو</span>
            </div>
          </div>

          <button
            type='button'
            onClick={() => alert("تسجيل الدخول عبر نفاذ سيتم ربطه لاحقاً")}
            className='w-full border-2 border-stone-200 hover:border-teal-500 hover:bg-teal-50 text-slate-700 py-3.5 rounded-xl font-semibold transition-all'
          >
            تسجيل الدخول عبر نفاذ
          </button>

          <p className='text-center text-sm text-slate-500 mt-6'>
            ليس لديك حساب؟{" "}
            <Link
              to={`/register?type=${type}`}
              className='text-teal-700 font-semibold hover:underline'
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        <div className='text-center mt-6'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors'
          >
            <ArrowLeft size={16} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
