import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import LocationPicker from "../../components/LocationPicker";
import {
  ArrowLeft,
  IdCard,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";

const SKILLS = [
  "مساعدة في التنقل",
  "التسوق",
  "المواعيد الطبية",
  "الدعم التقني",
  "الترجمة",
  "أخرى",
];

const DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "disabled";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    national_id: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
  });

  const [position, setPosition] = useState(null); // { lat, lng }
  const [locationText, setLocationText] = useState("");

  const [skills, setSkills] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "national_id" || name === "phone") {
      // أرقام فقط
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, [name]: digits });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const { national_id, phone, password, gender } = form;

    if (!/^[12]\d{9}$/.test(national_id)) {
      return "رقم الهوية يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2";
    }

    if (!/^\d{10}$/.test(phone)) {
      return "رقم الجوال يجب أن يكون 10 أرقام بالضبط";
    }

    if (password.length < 6) {
      return "كلمة المرور يجب ألا تقل عن 6 أحرف";
    }

    if (!gender) {
      return "يرجى تحديد الجنس";
    }

    if (!position || !position.lat || !position.lng) {
      return "يرجى تحديد الموقع من الخريطة";
    }

    return null;
  };
  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleDay = (day) => {
    setAvailability((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          national_id: form.national_id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          gender: form.gender,
          user_type: type,
          location_text: locationText || null,
          latitude: position.lat,
          longitude: position.lng,
        },
      ])
      .select()
      .single();

    if (userError) {
      setLoading(false);
      setError("تعذر إنشاء الحساب. تحقق من رقم الهوية أو الإيميل.");
      return;
    }

    if (type === "volunteer") {
      await supabase.from("volunteers").insert([
        {
          user_id: userData.id,
          skills,
          availability_schedule: availability,
        },
      ]);
    }

    setLoading(false);
    navigate(`/login?type=${type}`);
  };

  const fields = [
    {
      name: "national_id",
      label: "رقم الهوية الوطنية",
      type: "text",
      placeholder: "مثال: 1234567890",
      icon: IdCard,
      ltr: false,
    },
    {
      name: "name",
      label: "الاسم بالكامل",
      type: "text",
      placeholder: "مثال: محمد أحمد العتيبي",
      icon: User,
      ltr: false,
    },
    {
      name: "email",
      label: "البريد الإلكتروني",
      type: "email",
      placeholder: "name@email.com",
      icon: Mail,
      ltr: false,
    },
    {
      name: "password",
      label: "كلمة المرور",
      type: showPassword ? "text" : "password",
      placeholder: "مثال: MyPass123",
      icon: Lock,
      ltr: false,
    },
    {
      name: "phone",
      label: "رقم الجوال",
      type: "tel",
      placeholder: "مثال: 05XXXXXXXX",
      icon: Phone,
      ltr: false,
    },
  ];

  return (
    <div className='min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900'></div>
      <div className='absolute top-0 right-0 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3'></div>
      <div className='absolute bottom-0 left-0 w-[350px] h-[350px] bg-cyan-400/15 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3'></div>

      <div className='relative w-full max-w-lg'>
        <div className='bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10'>
          <div className='text-center mb-8'>
            <Link to='/' className='text-2xl font-bold text-teal-800'>
              Easy<span className='text-teal-500'>Move</span>
            </Link>
            <h1 className='text-2xl font-bold text-slate-900 mt-4 mb-1'>
              إنشاء حساب جديد
            </h1>
            <p className='text-slate-500 text-sm'>
              {type === "volunteer" ? "تسجيل كمتطوع" : "تسجيل لذوي الإعاقة"}
            </p>
          </div>

          <form onSubmit={handleRegister} className='space-y-4'>
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name}>
                  <label className='block text-sm font-medium text-slate-700 mb-1.5'>
                    {field.label}
                  </label>
                  <div className='relative'>
                    <Icon
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
                      size={18}
                    />
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      required
                      placeholder={field.placeholder}
                      className={`w-full pr-10 py-3.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all ${
                        field.name === "password" ? "pl-10" : "pl-4"
                      }`}
                      dir={field.ltr ? "ltr" : "rtl"}
                    />
                    {field.name === "password" && (
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {/* العنوان من الخريطة */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                العنوان / الموقع <span className='text-red-500'>*</span>
              </label>
              <LocationPicker
                position={position}
                setPosition={setPosition}
                locationText={locationText}
                setLocationText={setLocationText}
              />
            </div>
            {/* اختيار الجنس */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                الجنس
              </label>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => setForm({ ...form, gender: "male" })}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all ${
                    form.gender === "male"
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "border-stone-200 bg-stone-50 text-slate-600 hover:border-teal-300"
                  }`}
                >
                  <span className='text-lg'>👨</span>
                  <span className='font-medium'>ذكر</span>
                </button>

                <button
                  type='button'
                  onClick={() => setForm({ ...form, gender: "female" })}
                  className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all ${
                    form.gender === "female"
                      ? "border-teal-600 bg-teal-50 text-teal-800"
                      : "border-stone-200 bg-stone-50 text-slate-600 hover:border-teal-300"
                  }`}
                >
                  <span className='text-lg'>👩</span>
                  <span className='font-medium'>أنثى</span>
                </button>
              </div>
            </div>
            {type === "volunteer" && (
              <>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>
                    المهارات
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type='button'
                        onClick={() => toggleSkill(skill)}
                        className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                          skills.includes(skill)
                            ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                            : "bg-stone-50 text-slate-600 border-stone-200 hover:border-teal-300"
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
                          availability.includes(day)
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-stone-50 text-slate-600 border-stone-200 hover:border-emerald-300"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-teal-700/25 hover:shadow-xl hover:-translate-y-0.5 mt-2'
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className='text-center text-sm text-slate-500 mt-6'>
            لديك حساب؟{" "}
            <Link
              to={`/login?type=${type}`}
              className='text-teal-700 font-semibold hover:underline'
            >
              تسجيل الدخول
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

export default Register;
