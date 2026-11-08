import { Phone } from "lucide-react";
import LocationPicker from "../LocationPicker";
import { INPUT_CLASS, SKILLS, DAYS } from "../../constants/registerConstants";
import { SAUDI_CITIES } from "../../constants/cities";

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
  const handleCityChange = (e) => {
    const cityName = e.target.value;
    handleChange({ target: { name: "city", value: cityName } });

    const found = SAUDI_CITIES.find((c) => c.id === cityName);
    if (found) {
      setPosition({ lat: found.lat, lng: found.lng });
      setLocationText(cityName);
    }
  };

  const selectedCity = SAUDI_CITIES.find((c) => c.id === form.city) || null;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {/* رقم الجوال */}
      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
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
            className={`${INPUT_CLASS} pr-10`}
            placeholder='05xxxxxxxx'
            dir='ltr'
          />
        </div>
      </div>

      {/* المدينة */}
      <div>
        <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
          المدينة
        </label>
        <select
          name='city'
          value={form.city || ""}
          onChange={handleCityChange}
          className={INPUT_CLASS}
          required
        >
          <option value=''>اختر المدينة</option>
          {SAUDI_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}
            </option>
          ))}
        </select>
      </div>

      {/* الخريطة */}
      <div className='md:col-span-2'>
        <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
          تحديد الموقع على الخريطة
        </label>
        <LocationPicker
          position={position}
          setPosition={setPosition}
          locationText={locationText}
          setLocationText={setLocationText}
          mapCenter={selectedCity}
        />
      </div>

      {/* المهارات + الأيام للمتطوع فقط */}
      {showSkillsAndDays && (
        <>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-slate-700 mb-2 text-right'>
              المهارات
            </label>
            <div className='flex flex-wrap gap-2'>
              {SKILLS.map((s) => (
                <button
                  key={s}
                  type='button'
                  onClick={() => toggleSkill(s)}
                  className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                    skills.includes(s)
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-stone-200 hover:border-teal-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className='md:col-span-2'>
            <div className='flex items-center justify-between mb-2'>
              <label className='text-sm font-medium text-slate-700'>
                أيام التطوع
              </label>
              <button
                type='button'
                onClick={selectAllDays}
                className='text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors'
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
                  className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                    availability.includes(d)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-stone-200 hover:border-emerald-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StepVolunteerDetails;
