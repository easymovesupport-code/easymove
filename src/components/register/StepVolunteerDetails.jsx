import { Phone } from "lucide-react";
import LocationPicker from "../LocationPicker";
import { INPUT_CLASS, SKILLS, DAYS } from "../../constants/registerConstants";
// مكون الخطوة الثالثة من التسجيل (بيانات التطوع)
const StepVolunteerDetails = ({
  form,
  handleChange,
  position,
  setPosition,
  locationText,
  setLocationText,
  skills,
  toggleSkill,
  availability,
  toggleDay,
  selectAllDays,
  showSkillsAndDays = true,
}) => {
  return (
    <>
      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
          رقم الجوال
        </label>
        <div className='relative'>
          <Phone
            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
            size={18}
          />
          <input
            name='phone'
            value={form.phone}
            onChange={handleChange}
            className={`${INPUT_CLASS} pr-10 text-left placeholder:text-right`}
            placeholder='05xxxxxxxx'
            dir='ltr'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2'>
          العنوان (من الخريطة)
        </label>
        <LocationPicker
          position={position}
          setPosition={setPosition}
          locationText={locationText}
          setLocationText={setLocationText}
        />
      </div>

      {showSkillsAndDays && (
        <>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>
              المهارات
            </label>
            <div className='flex flex-wrap gap-2'>
              {SKILLS.map((s) => (
                <button
                  key={s}
                  type='button'
                  onClick={() => toggleSkill(s)}
                  className={`px-3.5 py-2 rounded-full text-sm border ${
                    skills.includes(s)
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-stone-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <label className='text-sm font-medium text-slate-700'>
                أيام التطوع
              </label>
              <button
                type='button'
                onClick={selectAllDays}
                className='text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors'
              >
                {availability.length === DAYS.length
                  ? "إلغاء تحديد الكل"
                  : "اختيار كل الأيام"}
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {DAYS.map((d) => (
                <button
                  key={d}
                  type='button'
                  onClick={() => toggleDay(d)}
                  className={`px-3.5 py-2 rounded-full text-sm border ${
                    availability.includes(d)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-stone-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StepVolunteerDetails;
