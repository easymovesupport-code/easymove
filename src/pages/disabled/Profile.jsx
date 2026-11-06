import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import LocationPicker from "../../components/LocationPicker";
import { ArrowRight, Save } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [position, setPosition] = useState(null);
  const [locationText, setLocationText] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=disabled");
        return;
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select(
          "id, name, phone, gender, latitude, longitude, location_text, user_type",
        )
        .eq("email", authData.user.email)
        .eq("user_type", "disabled")
        .maybeSingle();

      if (userError || !userRow) {
        setError("تعذر تحميل بيانات الحساب");
        setLoading(false);
        return;
      }

      setUserId(userRow.id);
      setName(userRow.name || "");
      setPhone(userRow.phone || "");
      setGender(userRow.gender || "");
      setLocationText(userRow.location_text || "");

      if (userRow.latitude != null && userRow.longitude != null) {
        setPosition({
          lat: Number(userRow.latitude),
          lng: Number(userRow.longitude),
        });
      }

      setLoading(false);
    };

    load();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("الاسم مطلوب");
      setSaving(false);
      return;
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      setError("رقم الجوال يجب أن يكون 10 أرقام");
      setSaving(false);
      return;
    }

    const payload = {
      name: name.trim(),
      phone: phone || null,
      gender: gender || null,
      location_text: locationText || null,
      latitude: position?.lat ?? null,
      longitude: position?.lng ?? null,
    };

    const { error: updateError } = await supabase
      .from("users")
      .update(payload)
      .eq("id", userId);

    setSaving(false);

    if (updateError) {
      console.error(updateError);
      setError("تعذر حفظ التعديلات");
      return;
    }

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
            to='/disabled/dashboard'
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
          <h1 className='text-3xl font-bold text-slate-900'>الملف الشخصي</h1>
          <p className='text-slate-500 text-sm mt-1'>
            حدّث بياناتك وموقعك لتحسين نتائج الأطباء والطلبات
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
              className='w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none'
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
              className='w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none'
              dir='ltr'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              الجنس
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => setGender("male")}
                className={`py-3 rounded-xl border-2 font-medium transition-all ${
                  gender === "male"
                    ? "border-teal-600 bg-teal-50 text-teal-800"
                    : "border-stone-200 bg-white text-slate-600"
                }`}
              >
                ذكر
              </button>
              <button
                type='button'
                onClick={() => setGender("female")}
                className={`py-3 rounded-xl border-2 font-medium transition-all ${
                  gender === "female"
                    ? "border-teal-600 bg-teal-50 text-teal-800"
                    : "border-stone-200 bg-white text-slate-600"
                }`}
              >
                أنثى
              </button>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              الموقع
            </label>
            <LocationPicker
              position={position}
              setPosition={setPosition}
              locationText={locationText}
              setLocationText={setLocationText}
            />
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
            className='inline-flex items-center gap-2 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-teal-700/20'
          >
            <Save size={18} />
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default Profile;
