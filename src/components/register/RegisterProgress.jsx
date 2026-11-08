const steps = ["البيانات الأساسية", "البيانات الشخصية", "التواصل والتطوع"];
// مكون عرض تقدم التسجيل
const RegisterProgress = ({ step }) => {
  return (
    <div className='mb-8'>
      <p className='text-sm text-slate-500 mb-3 text-center'>
        ستمر بـ <strong className='text-teal-700'>3 خطوات</strong> لإنشاء الحساب
        بسهولة
      </p>

      <div className='flex items-center justify-between gap-2'>
        {steps.map((label, index) => {
          const n = index + 1;
          return (
            <div
              key={label}
              className='flex-1 flex flex-col items-center gap-2'
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= n
                    ? "bg-teal-600 text-white"
                    : "bg-stone-100 text-slate-400"
                }`}
              >
                {n}
              </div>
              <span className='text-[11px] text-slate-500 text-center'>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Progress Bar */}
      <div className='mt-3 h-1.5 bg-stone-100 rounded-full overflow-hidden'>
        <div
          className='h-full bg-gradient-to-l from-teal-600 to-cyan-500 transition-all'
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default RegisterProgress;
