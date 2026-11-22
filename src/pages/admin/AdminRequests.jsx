import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Filter, Star } from "lucide-react";

const STATUS_OPTIONS = [
  { id: "all", label: "الكل" },
  { id: "pending", label: "قيد الانتظار" },
  { id: "accepted", label: "مقبول" },
  { id: "completed", label: "مكتمل" },
  { id: "cancelled", label: "ملغي" },
];

const statusLabel = {
  pending: "قيد الانتظار",
  accepted: "مقبول",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusColor = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-teal-50 text-teal-700 border-teal-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-stone-100 text-slate-500 border-stone-200",
};

const AdminRequests = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [helpType, setHelpType] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("help_requests")
        .select(
          `
          id, title, help_type, status, request_date, created_at, rating, location,
          owner:users!help_requests_user_id_fkey ( id, name, city ),
          volunteer:users!help_requests_volunteer_id_fkey ( id, name )
        `,
        )
        .order("created_at", { ascending: false });

      setRows(data || []);
      setLoading(false);
    };

    load();
  }, []);

  const cities = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (r.owner?.city) set.add(r.owner.city);
    });
    return Array.from(set);
  }, [rows]);

  const helpTypes = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (r.help_type) set.add(r.help_type);
    });
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (city && r.owner?.city !== city) return false;
      if (helpType && r.help_type !== helpType) return false;
      if (dateFrom && r.request_date && r.request_date < dateFrom) return false;
      if (dateTo && r.request_date && r.request_date > dateTo) return false;

      const q = search.trim().toLowerCase();
      if (q) {
        const hay =
          `${r.title || ""} ${r.owner?.name || ""} ${r.volunteer?.name || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, status, city, helpType, search, dateFrom, dateTo]);

  return (
    <div className='space-y-6' dir='rtl'>
      <div>
        <h1 className='text-2xl font-bold text-white mb-1'>الطلبات</h1>
        <p className='text-white/50 text-sm'>
          جميع طلبات المساعدة ({filtered.length} / {rows.length})
        </p>
      </div>

      <div className='bg-white/95 rounded-2xl border border-white/20 shadow-lg overflow-hidden'>
        <div className='p-4 border-b border-stone-100 space-y-3'>
          <div className='flex flex-wrap gap-2 items-center'>
            <Filter size={16} className='text-slate-400' />
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.id}
                type='button'
                onClick={() => setStatus(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  status === s.id
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-slate-600 border-stone-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2'>
            <div className='relative lg:col-span-2'>
              <Search
                size={16}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='بحث بالعنوان أو الاسم...'
                className='w-full pr-10 pl-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500'
              />
            </div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className='px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white'
            >
              <option value=''>كل المدن</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={helpType}
              onChange={(e) => setHelpType(e.target.value)}
              className='px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white'
            >
              <option value=''>كل الأنواع</option>
              {helpTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div className='flex gap-2'>
              <input
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className='w-full px-2 py-2 rounded-xl border border-stone-200 text-xs'
              />
              <input
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className='w-full px-2 py-2 rounded-xl border border-stone-200 text-xs'
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className='p-8 text-center text-slate-400 text-sm'>
            جاري التحميل...
          </p>
        ) : filtered.length === 0 ? (
          <p className='p-10 text-center text-slate-400 text-sm'>
            لا توجد طلبات مطابقة
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-stone-50 text-slate-500 text-xs'>
                  <th className='text-right px-4 py-3 font-semibold'>الطلب</th>
                  <th className='text-right px-4 py-3 font-semibold'>
                    المستفيد
                  </th>
                  <th className='text-right px-4 py-3 font-semibold'>
                    المتطوع
                  </th>
                  <th className='text-right px-4 py-3 font-semibold'>النوع</th>
                  <th className='text-right px-4 py-3 font-semibold'>
                    المدينة
                  </th>
                  <th className='text-right px-4 py-3 font-semibold'>الحالة</th>
                  <th className='text-right px-4 py-3 font-semibold'>
                    التقييم
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-100'>
                {filtered.map((r) => (
                  <tr key={r.id} className='hover:bg-stone-50/80'>
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-slate-900'>{r.title}</p>
                      <p className='text-[11px] text-slate-400'>
                        {r.request_date ||
                          new Date(r.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </td>
                    <td className='px-4 py-3 text-slate-700'>
                      {r.owner?.name || "—"}
                    </td>
                    <td className='px-4 py-3 text-slate-700'>
                      {r.volunteer?.name || "—"}
                    </td>
                    <td className='px-4 py-3 text-slate-600'>{r.help_type}</td>
                    <td className='px-4 py-3 text-slate-600'>
                      {r.owner?.city || "—"}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          statusColor[r.status] || statusColor.pending
                        }`}
                      >
                        {statusLabel[r.status] || r.status}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      {r.rating ? (
                        <span className='inline-flex items-center gap-1 text-amber-600 font-semibold'>
                          <Star
                            size={13}
                            className='fill-amber-400 text-amber-400'
                          />
                          {r.rating}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
