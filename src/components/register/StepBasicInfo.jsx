import { IdCard, User, Mail, Lock, Calendar, Eye, EyeOff } from "lucide-react";
import { INPUT_CLASS } from "../../constants/registerConstants";
// مكون الخطوة الأولى من التسجيل (البيانات الأساسية)
const StepBasicInfo = ({
  form,
  handleChange,
  showPassword,
  setShowPassword,
  showConfirm,
  setShowConfirm,
}) => {
  return (
    <>
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
            name='national_id'
            value={form.national_id}
            onChange={handleChange}
            className={`${INPUT_CLASS} pr-10 text-left placeholder:text-right`}
            placeholder='1xxxxxxxxx'
            dir='ltr'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
          الاسم الثلاثي
        </label>
        <div className='relative'>
          <User
            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
            size={18}
          />
          <input
            name='name'
            value={form.name}
            onChange={handleChange}
            className={`${INPUT_CLASS} pr-10 text-left placeholder:text-right`}
            placeholder='الاسم الأول الأوسط الأخير'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
          تاريخ الميلاد
        </label>
        <div className='relative'>
          <Calendar
            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
            size={18}
          />
          <input
            type='date'
            name='date_of_birth'
            value={form.date_of_birth}
            onChange={handleChange}
            className={`${INPUT_CLASS} pr-10 `}
          />
        </div>
      </div>
      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
          الجنسية
        </label>
        <input
          name='nationality'
          value={form.nationality}
          onChange={handleChange}
          className={INPUT_CLASS}
        />
      </div>
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
            name='email'
            value={form.email}
            onChange={handleChange}
            className={`${INPUT_CLASS} pr-10 text-left placeholder:text-right`}
            placeholder='example@email.com'
            dir='ltr'
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
            name='password'
            value={form.password}
            onChange={handleChange}
            className={`${INPUT_CLASS} pr-10 text-left placeholder:text-right`}
            dir='ltr'
          />
          <button
            type='button'
            onClick={() => setShowPassword((v) => !v)}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
          تأكيد كلمة المرور
        </label>
        <div className='relative'>
          <Lock
            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
            size={18}
          />
          <input
            type={showConfirm ? "text" : "password"}
            name='confirmPassword'
            value={form.confirmPassword}
            onChange={handleChange}
            className={`${INPUT_CLASS} pr-10 text-left placeholder:text-right`}
            dir='ltr'
          />
          <button
            type='button'
            onClick={() => setShowConfirm((v) => !v)}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
          الجنس
        </label>
        <div className='grid grid-cols-2 gap-3'>
          {[
            { id: "male", label: "ذكر" },
            { id: "female", label: "أنثى" },
          ].map((g) => (
            <button
              key={g.id}
              type='button'
              onClick={() =>
                handleChange({ target: { name: "gender", value: g.id } })
              }
              className={`py-3 rounded-xl border-2 font-medium ${
                form.gender === g.id
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-stone-200 text-slate-600"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default StepBasicInfo;
