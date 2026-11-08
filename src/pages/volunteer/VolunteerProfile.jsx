import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import LocationPicker from "../../components/LocationPicker";
import {
  SKILLS,
  DAYS,
  MARITAL_OPTIONS,
  EDUCATION_OPTIONS,
} from "../../constants/registerConstants";
import { ArrowRight, Save, Camera } from "lucide-react";

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
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [education, setEducation] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const [position, setPosition] = useState(null);
  const [locationText, setLocationText] = useState("");
  const [skills, setSkills] = useState([]);
  const [days, setDays] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=volunteer");
        return;
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select(
          "id, name, phone, gender, date_of_birth, nationality, marital_status, education, profile_image, latitude, longitude, location_text, user_type",
        )
        .eq("email", authData.user.email)
        .eq("user_type", "volunteer")
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
      setDateOfBirth(userRow.date_of_birth || "");
      setNationality(userRow.nationality || "");
      setMaritalStatus(userRow.marital_status || "");
      setEducation(userRow.education || "");
      setProfileImage(userRow.profile_image || "");
      setProfilePreview(userRow.profile_image || "");
      setLocationText(userRow.location_text || "");

      if (userRow.latitude != null && userRow.longitude != null) {
        setPosition({
          lat: Number(userRow.latitude),
          lng: Number(userRow.longitude),
        });
      }

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

  const onProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

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

  const selectAllDays = () => {
    setDays((prev) => (prev.length === DAYS.length ? [] : [...DAYS]));
  };

  const uploadAvatar = async () => {
    if (!profileFile || !userId) return profileImage || null;
    const ext = profileFile.name.split(".").pop();
    const path = `${userId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, profileFile);
    if (upErr) {
      console.error(upErr);
      return profileImage || null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data?.publicUrl || profileImage || null;
  };

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

    let imageUrl = profileImage;
    if (profileFile) {
      imageUrl = await uploadAvatar();
    }

    const { error: userError } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        phone: phone || null,
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        nationality: nationality || null,
        marital_status: maritalStatus || null,
        education: education || null,
        profile_image: imageUrl,
        location_text: locationText || null,
        latitude: position?.lat ?? null,
        longitude: position?.lng ?? null,
      })
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

    setProfileImage(imageUrl || "");
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
        <div className='max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
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

      <main className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
        <div className='mb-8'>
          <div className='inline-flex items-center gap-2 bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-3'>
            حساب المتطوع
          </div>
          <h1 className='text-3xl font-bold text-slate-900'>الملف الشخصي</h1>
          <p className='text-slate-500 text-sm mt-1'>
            حدّث بياناتك ومهاراتك وأيام تفرّغك
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className='bg-white/90 backdrop-blur border border-teal-100 shadow-xl shadow-teal-700/5 rounded-3xl p-6 md:p-8 space-y-6'
        >
          {/* الصورة */}
          <div className='flex items-center gap-4'>
            <div className='w-20 h-20 rounded-full bg-stone-100 border overflow-hidden flex items-center justify-center'>
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt='profile'
                  className='w-full h-full object-cover'
                />
              ) : (
                <Camera className='text-slate-400' size={28} />
              )}
            </div>
            <label className='cursor-pointer bg-teal-50 text-teal-800 border border-teal-100 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-100'>
              تغيير الصورة
              <input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={onProfileChange}
              />
            </label>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                الاسم
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
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
                className='w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                dir='ltr'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                تاريخ الميلاد
              </label>
              <input
                type='date'
                value={dateOfBirth || ""}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                الجنسية
              </label>
              <input
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                الجنس
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  { id: "male", label: "ذكر" },
                  { id: "female", label: "أنثى" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type='button'
                    onClick={() => setGender(g.id)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium ${
                      gender === g.id
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-stone-200 text-slate-600"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                الحالة الاجتماعية
              </label>
              <div className='grid grid-cols-2 gap-2'>
                {MARITAL_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type='button'
                    onClick={() => setMaritalStatus(m.id)}
                    className={`py-2.5 rounded-xl border text-sm font-medium ${
                      maritalStatus === m.id
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-stone-200 text-slate-600"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-slate-700 mb-2'>
                المؤهل العلمي
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {EDUCATION_OPTIONS.map((ed) => (
                  <button
                    key={ed.id}
                    type='button'
                    onClick={() => setEducation(ed.id)}
                    className={`py-2.5 rounded-xl border text-sm font-medium ${
                      education === ed.id
                        ? "border-teal-600 bg-teal-50 text-teal-800"
                        : "border-stone-200 text-slate-600"
                    }`}
                  >
                    {ed.label}
                  </button>
                ))}
              </div>
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
                  className={`px-3.5 py-2 rounded-full text-sm border ${
                    skills.includes(skill)
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-stone-200"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <label className='text-sm font-medium text-slate-700'>
                أيام التوفر
              </label>
              <button
                type='button'
                onClick={selectAllDays}
                className='text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg'
              >
                {days.length === DAYS.length
                  ? "إلغاء تحديد الكل"
                  : "اختيار كل الأيام"}
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {DAYS.map((day) => (
                <button
                  key={day}
                  type='button'
                  onClick={() => toggleDay(day)}
                  className={`px-3.5 py-2 rounded-full text-sm border ${
                    days.includes(day)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-stone-200"
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

export default VolunteerProfile;
