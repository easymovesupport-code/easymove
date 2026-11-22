import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Printer, Download } from "lucide-react";

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [byCity, setByCity] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [volActivity, setVolActivity] = useState([]);
  const [satisfaction, setSatisfaction] = useState({ avg: null, count: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [{ data: users }, { data: requests }] = await Promise.all([
        supabase
          .from("users")
          .select("id, user_type, city")
          .in("user_type", ["disabled", "volunteer"]),
        supabase
          .from("help_requests")
          .select("status, rating, volunteer_id, request_date, created_at"),
      ]);

      // حسب المدينة
      const cityMap = {};
      (users || []).forEach((u) => {
        const c = u.city || "غير محدد";
        if (!cityMap[c]) cityMap[c] = { city: c, disabled: 0, volunteers: 0 };
        if (u.user_type === "disabled") cityMap[c].disabled += 1;
        if (u.user_type === "volunteer") cityMap[c].volunteers += 1;
      });
      setByCity(
        Object.values(cityMap).sort(
          (a, b) => b.disabled + b.volunteers - (a.disabled + a.volunteers),
        ),
      );

      // حسب الحالة
      const st = { pending: 0, accepted: 0, completed: 0, cancelled: 0 };
      (requests || []).forEach((r) => {
        if (st[r.status] !== undefined) st[r.status] += 1;
      });
      setByStatus([
        { label: "قيد الانتظار", value: st.pending },
        { label: "مقبول", value: st.accepted },
        { label: "مكتمل", value: st.completed },
        { label: "ملغي", value: st.cancelled },
      ]);

      // الرضا
      const ratings = (requests || [])
        .map((r) => r.rating)
        .filter((r) => typeof r === "number");
      setSatisfaction({
        avg:
          ratings.length > 0
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : null,
        count: ratings.length,
      });

      // نشاط المتطوعين
      const act = {};
      (requests || []).forEach((r) => {
        if (!r.volunteer_id) return;
        if (!act[r.volunteer_id])
          act[r.volunteer_id] = { completed: 0, ratings: [] };
        if (r.status === "completed") act[r.volunteer_id].completed += 1;
        if (typeof r.rating === "number")
          act[r.volunteer_id].ratings.push(r.rating);
      });

      const volIds = Object.keys(act);
      if (volIds.length) {
        const { data: volUsers } = await supabase
          .from("users")
          .select("id, name, city")
          .in("id", volIds);

        setVolActivity(
          (volUsers || [])
            .map((u) => ({
              name: u.name,
              city: u.city,
              completed: act[u.id].completed,
              avg:
                act[u.id].ratings.length > 0
                  ? (
                      act[u.id].ratings.reduce((a, b) => a + b, 0) /
                      act[u.id].ratings.length
                    ).toFixed(1)
                  : null,
            }))
            .sort((a, b) => b.completed - a.completed),
        );
      }

      setLoading(false);
    };

    load();
  }, []);

  const handlePrint = () => window.print();

  const exportCSV = () => {
    const lines = [
      ["المدينة", "ذوو إعاقة", "متطوعون"].join(","),
      ...byCity.map((r) => [r.city, r.disabled, r.volunteers].join(",")),
      "",
      ["المتطوع", "المدينة", "مكتملة", "متوسط التقييم"].join(","),
      ...volActivity.map((v) =>
        [v.name, v.city || "", v.completed, v.avg || ""].join(","),
      ),
    ];
    const blob = new Blob(["\ufeff" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `easymove-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <p className='text-white/60 text-center py-20' dir='rtl'>
        جاري إعداد التقارير...
      </p>
    );
  }

  return (
    <div className='space-y-6' dir='rtl'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden'>
        <div>
          <h1 className='text-2xl font-bold text-white mb-1'>التقارير</h1>
          <p className='text-white/50 text-sm'>
            تقارير المنصة للطباعة والتصدير
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={handlePrint}
            className='inline-flex items-center gap-2 bg-white text-slate-800 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-100'
          >
            <Printer size={16} />
            طباعة
          </button>
          <button
            type='button'
            onClick={exportCSV}
            className='inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700'
          >
            <Download size={16} />
            تصدير CSV
          </button>
        </div>
      </div>

      <div id='print-area' className='space-y-6'>
        <div className='hidden print:block text-center mb-6'>
          <h1 className='text-xl font-bold'>تقرير EasyMove</h1>
          <p className='text-sm text-slate-500'>
            {new Date().toLocaleDateString("ar-SA")}
          </p>
        </div>

        {/* الرضا */}
        <div className='bg-white/95 print:bg-white rounded-2xl border border-white/20 print:border-stone-200 p-5 shadow-lg print:shadow-none'>
          <h2 className='font-bold text-slate-900 mb-3'>تقرير الرضا</h2>
          <p className='text-sm text-slate-600'>
            متوسط التقييم: <strong>{satisfaction.avg || "—"}/5</strong> من أصل{" "}
            {satisfaction.count} تقييم
          </p>
        </div>

        {/* الطلبات حسب الحالة */}
        <div className='bg-white/95 print:bg-white rounded-2xl border border-white/20 print:border-stone-200 p-5 shadow-lg print:shadow-none'>
          <h2 className='font-bold text-slate-900 mb-3'>الطلبات حسب الحالة</h2>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {byStatus.map((s) => (
              <div
                key={s.label}
                className='bg-stone-50 rounded-xl px-3 py-3 border border-stone-100 text-center'
              >
                <p className='text-2xl font-bold text-slate-900'>{s.value}</p>
                <p className='text-xs text-slate-500 mt-1'>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* حسب المدينة */}
        <div className='bg-white/95 print:bg-white rounded-2xl border border-white/20 print:border-stone-200 p-5 shadow-lg print:shadow-none overflow-x-auto'>
          <h2 className='font-bold text-slate-900 mb-3'>
            المستخدمون حسب المدينة
          </h2>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-slate-500 text-xs border-b'>
                <th className='text-right py-2'>المدينة</th>
                <th className='text-right py-2'>ذوو إعاقة</th>
                <th className='text-right py-2'>متطوعون</th>
              </tr>
            </thead>
            <tbody>
              {byCity.map((r) => (
                <tr key={r.city} className='border-b border-stone-100'>
                  <td className='py-2 font-medium'>{r.city}</td>
                  <td className='py-2'>{r.disabled}</td>
                  <td className='py-2'>{r.volunteers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* نشاط المتطوعين */}
        <div className='bg-white/95 print:bg-white rounded-2xl border border-white/20 print:border-stone-200 p-5 shadow-lg print:shadow-none overflow-x-auto'>
          <h2 className='font-bold text-slate-900 mb-3'>نشاط المتطوعين</h2>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-slate-500 text-xs border-b'>
                <th className='text-right py-2'>المتطوع</th>
                <th className='text-right py-2'>المدينة</th>
                <th className='text-right py-2'>مكتملة</th>
                <th className='text-right py-2'>متوسط التقييم</th>
              </tr>
            </thead>
            <tbody>
              {volActivity.map((v) => (
                <tr key={v.name + v.city} className='border-b border-stone-100'>
                  <td className='py-2 font-medium'>{v.name}</td>
                  <td className='py-2'>{v.city || "—"}</td>
                  <td className='py-2'>{v.completed}</td>
                  <td className='py-2'>{v.avg || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; inset: 0; padding: 16px; }
        }
      `}</style>
    </div>
  );
};

export default AdminReports;
