import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { DAYS } from "../constants/registerConstants";

const initialForm = {
  national_id: "",
  name: "",
  date_of_birth: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  nationality: "سعودي",
  marital_status: "",
  education: "",
  phone: "",
};

export const useRegisterForm = (type) => {
  const isVolunteer = type === "volunteer";
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [position, setPosition] = useState(null);
  const [locationText, setLocationText] = useState("");
  const [skills, setSkills] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "national_id" || name === "phone") {
      setForm((p) => ({ ...p, [name]: value.replace(/\D/g, "").slice(0, 10) }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const toggleSkill = (s) => {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const toggleDay = (d) => {
    setAvailability((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const selectAllDays = () => {
    setAvailability((prev) => (prev.length === DAYS.length ? [] : [...DAYS]));
  };
  // تحقيق من صحة البيانات في الخطوة الأولى
  const validateStep1 = () => {
    if (!/^[12]\d{9}$/.test(form.national_id)) {
      setError("رقم الهوية يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2");
      return false;
    }
    if (!form.name.trim() || form.name.trim().split(/\s+/).length < 3) {
      setError("اكتب الاسم الثلاثي كاملاً");
      return false;
    }
    if (!form.date_of_birth) {
      setError("تاريخ الميلاد مطلوب");
      return false;
    }
    if (!form.email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      return false;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور 6 أحرف على الأقل");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return false;
    }
    if (!form.gender) {
      setError("اختر الجنس");
      return false;
    }
    return true;
  };
  // تحقق من صحة البيانات في الخطوة الثانية
  const validateStep2 = () => {
    if (!form.nationality.trim()) {
      setError("الجنسية مطلوبة");
      return false;
    }
    if (!form.marital_status) {
      setError("اختر الحالة الاجتماعية");
      return false;
    }
    if (!form.education) {
      setError("اختر المؤهل العلمي");
      return false;
    }
    return true;
  };
  // تحقق من صحة البيانات في الخطوة الثالثة
  const validateStep3 = () => {
    if (!/^\d{10}$/.test(form.phone)) {
      setError("رقم الجوال يجب أن يكون 10 أرقام");
      return false;
    }
    if (!position?.lat || !position?.lng) {
      setError("حدّد العنوان من الخريطة");
      return false;
    }
    if (isVolunteer && skills.length === 0) {
      setError("اختر مهارة واحدة على الأقل");
      return false;
    }
    if (isVolunteer && availability.length === 0) {
      setError("اختر يوم تفرّغ واحد على الأقل");
      return false;
    }
    return true;
  };
  // انتقال للخطوة التالية
  const nextStep = () => {
    setError("");
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(3, s + 1));
  };
  // رجع للخطوة السابقة
  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };
  // رفع صورة الملف الشخصي إلى التخزين
  const uploadAvatar = async (userId) => {
    if (!profileFile) return null;
    const ext = profileFile.name.split(".").pop();
    const path = `${userId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, profileFile);
    if (upErr) {
      console.error(upErr);
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data?.publicUrl || null;
  };
  // معالجة تسجيل المستخدم
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    // تحقق من صحة البيانات
    if (isVolunteer) {
      if (!validateStep3()) return;
    } else {
      if (!validateStep1()) return;
      if (!validateStep3()) return;
    }

    setLoading(true);
    const email = form.email.trim().toLowerCase();

    try {
      const { data: authData, error: signErr } = await supabase.auth.signUp({
        email,
        password: form.password,
      });
      if (signErr) throw signErr;

      let profileImage = null;
      if (isVolunteer && profileFile) {
        profileImage = await uploadAvatar(authData.user.id);
      }
      // إنشاء سجل المستخدم في قاعدة البيانات
      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .insert([
          {
            national_id: form.national_id,
            name: form.name.trim(),
            email,
            phone: form.phone,
            gender: form.gender,
            user_type: isVolunteer ? "volunteer" : "disabled",
            date_of_birth: form.date_of_birth || null,
            nationality: form.nationality || null,
            marital_status: isVolunteer ? form.marital_status : null,
            education: isVolunteer ? form.education : null,
            profile_image: profileImage,
            latitude: position.lat,
            longitude: position.lng,
            location_text: locationText || null,
          },
        ])
        .select("id")
        .single();

      if (userErr) throw userErr;

      if (isVolunteer) {
        const { error: volErr } = await supabase.from("volunteers").insert([
          {
            user_id: userRow.id,
            skills,
            availability_schedule: availability,
          },
        ]);
        if (volErr) throw volErr;
      }

      navigate(isVolunteer ? "/volunteer/dashboard" : "/disabled/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return {
    isVolunteer,
    step,
    form,
    profilePreview,
    position,
    setPosition,
    locationText,
    setLocationText,
    skills,
    availability,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    loading,
    error,
    handleChange,
    onProfileChange,
    toggleSkill,
    toggleDay,
    selectAllDays,
    nextStep,
    prevStep,
    handleRegister,
  };
};
