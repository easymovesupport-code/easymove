import { ClipboardList, HandHeart, CheckCircle2, Star } from "lucide-react";
// مكوّن لعرض إحصائيات المتطوع في بطاقات
const StatsCards = ({ stats }) => {
  return (
    <section className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      <div className='bg-white border border-teal-100 rounded-2xl p-5 shadow-sm'>
        <div className='flex items-center justify-between mb-3'>
          <span className='text-sm text-slate-500'>طلبات مناسبة</span>
          <div className='w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center'>
            <ClipboardList size={18} />
          </div>
        </div>
        <p className='text-3xl font-bold text-slate-900'>{stats.suitable}</p>
      </div>

      <div className='bg-white border border-amber-100 rounded-2xl p-5 shadow-sm'>
        <div className='flex items-center justify-between mb-3'>
          <span className='text-sm text-slate-500'>قيد التنفيذ</span>
          <div className='w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center'>
            <HandHeart size={18} />
          </div>
        </div>
        <p className='text-3xl font-bold text-slate-900'>{stats.active}</p>
      </div>

      <div className='bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm'>
        <div className='flex items-center justify-between mb-3'>
          <span className='text-sm text-slate-500'>مكتملة</span>
          <div className='w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center'>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <p className='text-3xl font-bold text-slate-900'>{stats.completed}</p>

        {stats.avgRating ? (
          <div className='mt-2 flex items-center gap-1.5'>
            <div className='flex items-center gap-0.5 text-amber-500'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(Number(stats.avgRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300"
                  }
                />
              ))}
            </div>
            <span className='text-xs font-semibold text-slate-600'>
              {stats.avgRating}
            </span>
            <span className='text-[11px] text-slate-400'>
              ({stats.ratingsCount})
            </span>
          </div>
        ) : (
          <p className='mt-2 text-xs text-slate-400'>لا تقييمات بعد</p>
        )}
      </div>
    </section>
  );
};

export default StatsCards;
