import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Filter, Star, Printer } from "lucide-react";

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
    id, title, description, help_type, status,
    request_date, request_time, time_from, time_to,
    location, latitude, longitude,
    rating, rating_comment, created_at,
    owner:users!help_requests_user_id_fkey ( id, name, city, phone ),
    volunteer:users!help_requests_volunteer_id_fkey ( id, name, phone )
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
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden'>
            <div>
              <p className='text-white/50 text-sm'>
                جميع طلبات المساعدة ({filtered.length} / {rows.length})
              </p>
            </div>
            <button
              type='button'
              onClick={() => window.print()}
              className='inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl'
            >
              <Printer size={16} />
              طباعة التقرير
            </button>
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
                <tr className='bg-slate-800 text-white text-xs'>
                  <th className='text-right px-4 py-3.5 font-bold w-14'>#</th>
                  <th className='text-right px-4 py-3.5 font-bold'>الطلب</th>
                  <th className='text-right px-4 py-3.5 font-bold'>المستفيد</th>
                  <th className='text-right px-4 py-3.5 font-bold'>المتطوع</th>
                  <th className='text-right px-4 py-3.5 font-bold'>النوع</th>
                  <th className='text-right px-4 py-3.5 font-bold'>المدينة</th>
                  <th className='text-right px-4 py-3.5 font-bold'>الحالة</th>
                  <th className='text-right px-4 py-3.5 font-bold'>التقييم</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-100'>
                {filtered.map((r, index) => (
                  <tr key={r.id} className='hover:bg-stone-50/80'>
                    <td className='px-4 py-3 text-right text-slate-500 font-semibold'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <p className='font-semibold text-slate-900'>{r.title}</p>
                      <p className='text-[11px] text-slate-400'>
                        {r.request_date ||
                          new Date(r.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </td>
                    <td className='px-4 py-3 text-right text-slate-700'>
                      {r.owner?.name || "—"}
                    </td>
                    <td className='px-4 py-3 text-right text-slate-700'>
                      {r.volunteer?.name || "—"}
                    </td>
                    <td className='px-4 py-3 text-right text-slate-600'>
                      {r.help_type}
                    </td>
                    <td className='px-4 py-3 text-right text-slate-600'>
                      {r.owner?.city || "—"}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          statusColor[r.status] || statusColor.pending
                        }`}
                      >
                        {statusLabel[r.status] || r.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right'>
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
      {/* تقرير الطباعة */}
      <div id='print-report' className='hidden print:block'>
        <div className='text-center mb-6'>
          <h1 className='text-xl font-bold text-slate-900'>
            تقرير طلبات المساعدة
          </h1>
          <p className='text-sm text-slate-500 mt-1'>
            EasyMove — {new Date().toLocaleDateString("ar-SA")}
          </p>
          <p className='text-sm text-slate-500'>
            عدد الطلبات: {filtered.length}
            {status !== "all"
              ? ` — الحالة: ${statusLabel[status] || status}`
              : ""}
            {city ? ` — المدينة: ${city}` : ""}
          </p>
        </div>

        <div className='space-y-4'>
          {filtered.map((r, index) => (
            <div
              key={r.id}
              className='border border-stone-300 rounded-xl p-4 break-inside-avoid mb-4'
            >
              <div className='flex items-center justify-between gap-2 mb-3 border-b border-stone-200 pb-2'>
                <div className='flex items-center gap-2'>
                  <span className='w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center'>
                    {index + 1}
                  </span>
                  <h2 className='font-bold text-slate-900 text-base'>
                    {r.title}
                  </h2>
                </div>
                <span className='text-xs font-semibold px-2.5 py-1 rounded-full border border-stone-300'>
                  {statusLabel[r.status] || r.status}
                </span>
              </div>

              <div className='grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-3'>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    نوع المساعدة
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {r.help_type || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    المدينة
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {r.owner?.city || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    المستفيد
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {r.owner?.name || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    جوال المستفيد
                  </span>
                  <span className='font-semibold text-slate-900' dir='ltr'>
                    {r.owner?.phone || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    المتطوع
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {r.volunteer?.name || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    جوال المتطوع
                  </span>
                  <span className='font-semibold text-slate-900' dir='ltr'>
                    {r.volunteer?.phone || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    تاريخ الطلب
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {r.request_date ||
                      (r.created_at
                        ? new Date(r.created_at).toLocaleDateString("ar-SA")
                        : "—")}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    الوقت
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {r.request_time ||
                      (r.time_from && r.time_to
                        ? `${r.time_from} - ${r.time_to}`
                        : r.time_from || "—")}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    التقييم
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {r.rating ? `${r.rating}/5` : "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    تاريخ الإنشاء
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {r.created_at
                      ? new Date(r.created_at).toLocaleDateString("ar-SA")
                      : "—"}
                  </span>
                </div>
              </div>

              <div className='space-y-2 text-sm border-t border-stone-100 pt-3'>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    الموقع / العنوان
                  </span>
                  <span className='font-semibold text-slate-900 leading-relaxed'>
                    {r.location || "—"}
                  </span>
                </div>
                {r.description && (
                  <div>
                    <span className='text-slate-500 block text-xs mb-0.5'>
                      الوصف
                    </span>
                    <span className='font-semibold text-slate-900 leading-relaxed'>
                      {r.description}
                    </span>
                  </div>
                )}
                {r.rating_comment && (
                  <div>
                    <span className='text-slate-500 block text-xs mb-0.5'>
                      تعليق التقييم
                    </span>
                    <span className='font-semibold text-slate-900 leading-relaxed'>
                      {r.rating_comment}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
  @media print {
    body * { visibility: hidden; }
    #print-report, #print-report * { visibility: visible; }
    #print-report {
      position: absolute;
      inset: 0;
      padding: 16px;
      background: white;
    }
  }
`}</style>
    </div>
  );
};

export default AdminRequests;
