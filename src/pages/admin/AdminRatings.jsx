import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Star } from "lucide-react";

const AdminRatings = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("help_requests")
        .select(
          `
          id, title, rating, rating_comment, request_date, created_at,
          owner:users!help_requests_user_id_fkey ( name ),
          volunteer:users!help_requests_volunteer_id_fkey ( id, name )
        `,
        )
        .not("rating", "is", null)
        .order("created_at", { ascending: false });

      setRows(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => (r.rating || 0) >= minRating);
  }, [rows, minRating]);

  const avg =
    filtered.length > 0
      ? (
          filtered.reduce((s, r) => s + (r.rating || 0), 0) / filtered.length
        ).toFixed(1)
      : null;

  const distribution = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: filtered.filter((r) => r.rating === n).length,
  }));

  return (
    <div className='space-y-6' dir='rtl'>
      <div>
        <h1 className='text-2xl font-bold text-white mb-1'>التقييمات</h1>
        <p className='text-white/50 text-sm'>تقييمات المستفيدين للمتطوعين</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <div className='bg-white/95 rounded-2xl p-5 border border-white/20 shadow-lg'>
          <p className='text-sm text-slate-500 mb-1'>المتوسط العام</p>
          <p className='text-3xl font-bold text-slate-900'>
            {avg || "—"}
            {avg && <span className='text-base text-slate-400'>/5</span>}
          </p>
        </div>
        <div className='bg-white/95 rounded-2xl p-5 border border-white/20 shadow-lg'>
          <p className='text-sm text-slate-500 mb-1'>عدد التقييمات</p>
          <p className='text-3xl font-bold text-slate-900'>{filtered.length}</p>
        </div>
        <div className='bg-white/95 rounded-2xl p-5 border border-white/20 shadow-lg'>
          <p className='text-sm text-slate-500 mb-2'>توزيع النجوم</p>
          <div className='space-y-1'>
            {distribution.map((d) => (
              <div key={d.star} className='flex items-center gap-2 text-xs'>
                <span className='w-8 text-slate-500'>{d.star}★</span>
                <div className='flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-amber-400 rounded-full'
                    style={{
                      width: filtered.length
                        ? `${(d.count / filtered.length) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className='w-6 text-slate-500'>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='bg-white/95 rounded-2xl border border-white/20 shadow-lg overflow-hidden'>
        <div className='p-4 border-b border-stone-100 flex flex-wrap gap-2 items-center'>
          <span className='text-sm text-slate-500'>الحد الأدنى:</span>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type='button'
              onClick={() => setMinRating(n)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                minRating === n
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-600 border-stone-200"
              }`}
            >
              {n === 0 ? "الكل" : `${n}+`}
            </button>
          ))}
        </div>

        {loading ? (
          <p className='p-8 text-center text-slate-400 text-sm'>
            جاري التحميل...
          </p>
        ) : filtered.length === 0 ? (
          <p className='p-10 text-center text-slate-400 text-sm'>
            لا توجد تقييمات
          </p>
        ) : (
          <div className='divide-y divide-stone-100'>
            {filtered.map((r) => (
              <div key={r.id} className='px-5 py-4'>
                <div className='flex flex-wrap items-start justify-between gap-3 mb-2'>
                  <div>
                    <p className='font-semibold text-slate-900 text-sm'>
                      {r.volunteer?.name || "متطوع"}
                    </p>
                    <p className='text-xs text-slate-400'>
                      من: {r.owner?.name || "—"} • {r.title}
                    </p>
                  </div>
                  <div className='flex items-center gap-0.5 text-amber-400'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < (r.rating || 0)
                            ? "fill-amber-400"
                            : "text-stone-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                {r.rating_comment && (
                  <p className='text-sm text-slate-600 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2'>
                    {r.rating_comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRatings;
