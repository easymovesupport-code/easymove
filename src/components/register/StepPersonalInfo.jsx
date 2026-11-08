import { Camera } from "lucide-react";
import {
  MARITAL_OPTIONS,
  EDUCATION_OPTIONS,
} from "../../constants/registerConstants";
// مكون الخطوة الثانية من التسجيل (البيانات الشخصية)
const StepPersonalInfo = ({
  form,
  handleChange,
  profilePreview,
  onProfileChange,
}) => {
  return (
    <>
      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
          صورة شخصية
        </label>
        <div className='flex items-center gap-4'>
          <div className='w-20 h-20 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center'>
            {profilePreview ? (
              <img
                src={profilePreview}
                alt='preview'
                className='w-full h-full object-cover'
              />
            ) : (
              <Camera className='text-slate-400' size={28} />
            )}
          </div>
          <label className='cursor-pointer bg-teal-50 text-teal-800 border border-teal-100 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-100'>
            اختيار صورة
            <input
              type='file'
              accept='image/*'
              className='hidden'
              onChange={onProfileChange}
            />
          </label>
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
              onClick={() =>
                handleChange({
                  target: { name: "marital_status", value: m.id },
                })
              }
              className={`py-2.5 rounded-xl border text-sm font-medium ${
                form.marital_status === m.id
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-stone-200 text-slate-600"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
          المؤهل العلمي
        </label>
        <div className='grid grid-cols-3 gap-2'>
          {EDUCATION_OPTIONS.map((ed) => (
            <button
              key={ed.id}
              type='button'
              onClick={() =>
                handleChange({ target: { name: "education", value: ed.id } })
              }
              className={`py-2.5 rounded-xl border text-sm font-medium ${
                form.education === ed.id
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-stone-200 text-slate-600"
              }`}
            >
              {ed.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default StepPersonalInfo;
