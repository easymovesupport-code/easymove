import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRegisterForm } from "../../hooks/useRegisterForm";
import RegisterProgress from "../../components/register/RegisterProgress";
import StepBasicInfo from "../../components/register/StepBasicInfo";
import StepPersonalInfo from "../../components/register/StepPersonalInfo";
import StepVolunteerDetails from "../../components/register/StepVolunteerDetails";

const Register = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "disabled";

  const {
    isVolunteer,
    step,
    totalSteps,
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
  } = useRegisterForm(type);

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4 py-10'
      dir='rtl'
    >
      <div className='w-full max-w-2xl bg-white/95 border border-teal-100 rounded-3xl shadow-xl shadow-teal-700/10 p-6 md:p-8'>
        {/* العنوان في المنتصف */}
        <div className='mb-6 text-center relative'>
          <Link
            to='/'
            className='absolute left-0 top-0 inline-flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors'
          >
            العودة
          </Link>

          <h1 className='text-xl md:text-2xl font-bold text-slate-900'>
            {isVolunteer ? "إنشاء حساب متطوع" : "إنشاء حساب"}
          </h1>
        </div>

        {/* شريط التقدم للجميع */}
        <RegisterProgress
          step={step}
          totalSteps={totalSteps}
          labels={
            isVolunteer
              ? ["البيانات الأساسية", "البيانات الشخصية", "التواصل والتطوع"]
              : ["البيانات الأساسية", "التواصل والموقع"]
          }
        />

        <form onSubmit={handleRegister} className='space-y-5'>
          {/* الخطوة 1 للجميع */}
          {step === 1 && (
            <StepBasicInfo
              form={form}
              handleChange={handleChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirm={showConfirm}
              setShowConfirm={setShowConfirm}
            />
          )}

          {/* الخطوة 2 للمتطوع فقط */}
          {isVolunteer && step === 2 && (
            <StepPersonalInfo
              form={form}
              handleChange={handleChange}
              profilePreview={profilePreview}
              onProfileChange={onProfileChange}
            />
          )}

          {/* آخر خطوة: متطوع = 3 | ذو إعاقة = 2 */}
          {((isVolunteer && step === 3) || (!isVolunteer && step === 2)) && (
            <StepVolunteerDetails
              form={form}
              handleChange={handleChange}
              position={position}
              setPosition={setPosition}
              locationText={locationText}
              setLocationText={setLocationText}
              skills={skills}
              toggleSkill={toggleSkill}
              availability={availability}
              toggleDay={toggleDay}
              selectAllDays={selectAllDays}
              showSkillsAndDays={isVolunteer}
            />
          )}

          {error && (
            <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
              {error}
            </div>
          )}

          <div className='flex gap-3 pt-2'>
            {step > 1 && (
              <button
                type='button'
                onClick={prevStep}
                className='flex-1 inline-flex items-center justify-center gap-2 border border-stone-200 bg-white text-slate-700 py-3 rounded-xl font-semibold'
              >
                <ArrowRight size={18} />
                السابق
              </button>
            )}

            {step < totalSteps ? (
              <button
                type='button'
                onClick={nextStep}
                className='flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-600 to-cyan-600 text-white py-3 rounded-xl font-semibold'
              >
                التالي
                <ArrowLeft size={18} />
              </button>
            ) : (
              <button
                type='submit'
                disabled={loading}
                className='flex-1 bg-gradient-to-l from-teal-600 to-cyan-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold'
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </button>
            )}
          </div>
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
    </div>
  );
};

export default Register;
