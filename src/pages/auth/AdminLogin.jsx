import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1) تسجيل الدخول
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }

    // 2) التحقق أنه أدمن
    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id, user_type")
      .eq("email", email)
      .eq("user_type", "admin")
      .single();

    if (userError || !userRow) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("هذا الحساب غير مصرح له بدخول لوحة التحكم");
      return;
    }

    // 3) التحقق من جدول admins
    const { data: adminRow, error: adminError } = await supabase
      .from("admins")
      .select("id, role")
      .eq("user_id", userRow.id)
      .single();

    setLoading(false);

    if (adminError || !adminRow) {
      await supabase.auth.signOut();
      setError("هذا الحساب غير مصرح له بدخول لوحة التحكم");
      return;
    }

    navigate("/admin/dashboard");
  };

  return (
    <div className='min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900'></div>
      <div className='absolute top-0 left-0 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2'></div>

      <div className='relative w-full max-w-md'>
        <div className='bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10'>
          <div className='text-center mb-8'>
            <div className='w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Shield size={28} />
            </div>
            <Link to='/' className='text-2xl font-bold text-teal-800'>
              Easy<span className='text-teal-500'>Move</span>
            </Link>
            <h1 className='text-2xl font-bold text-slate-900 mt-4 mb-1'>
              دخول المسؤول
            </h1>
            <p className='text-slate-500 text-sm'>لوحة تحكم الإدارة فقط</p>
          </div>

          <form onSubmit={handleLogin} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                البريد الإلكتروني
              </label>
              <div className='relative'>
                <Mail
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
                  size={18}
                />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder='admin@easymove.com'
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
              className='w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:-translate-y-0.5'
            >
              {loading ? "جاري التحقق..." : "دخول لوحة التحكم"}
            </button>
          </form>
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

export default AdminLogin;
