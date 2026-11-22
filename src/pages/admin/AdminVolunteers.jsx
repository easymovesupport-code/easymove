import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Trash2, Eye, Pencil, X, HeartHandshake } from "lucide-react";

const AdminVolunteers = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select(
        "id, name, national_id, email, phone, city, created_at, location_text",
      )
      .eq("user_type", "volunteer")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError("تعذر تحميل المتطوعين");
      setLoading(false);
      return;
    }

    const ids = (users || []).map((u) => u.id);

    const [{ data: vols }, { data: reqs }] = await Promise.all([
      ids.length
        ? supabase
            .from("volunteers")
            .select("user_id, skills, availability_schedule")
            .in("user_id", ids)
        : Promise.resolve({ data: [] }),
      ids.length
        ? supabase
            .from("help_requests")
            .select("volunteer_id, status, rating")
            .in("volunteer_id", ids)
        : Promise.resolve({ data: [] }),
    ]);

    const volMap = {};
    (vols || []).forEach((v) => {
      volMap[v.user_id] = v;
    });

    const statsMap = {};
    (reqs || []).forEach((r) => {
      if (!statsMap[r.volunteer_id]) {
        statsMap[r.volunteer_id] = { completed: 0, sum: 0, count: 0 };
      }
      if (r.status === "completed") statsMap[r.volunteer_id].completed += 1;
      if (typeof r.rating === "number") {
        statsMap[r.volunteer_id].sum += r.rating;
        statsMap[r.volunteer_id].count += 1;
      }
    });

    setRows(
      (users || []).map((u) => {
        const st = statsMap[u.id] || { completed: 0, sum: 0, count: 0 };
        return {
          ...u,
          skills: volMap[u.id]?.skills || [],
          days: volMap[u.id]?.availability_schedule || [],
          completed: st.completed,
          avgRating: st.count ? (st.sum / st.count).toFixed(1) : null,
          ratingsCount: st.count,
        };
      }),
    );
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      setError("");

      const { data: users, error: fetchError } = await supabase
        .from("users")
        .select(
          "id, name, national_id, email, phone, city, created_at, location_text",
        )
        .eq("user_type", "volunteer")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError("تعذر تحميل المتطوعين");
        setLoading(false);
        return;
      }

      const ids = (users || []).map((u) => u.id);

      const [{ data: vols }, { data: reqs }] = await Promise.all([
        ids.length
          ? supabase
              .from("volunteers")
              .select("user_id, skills, availability_schedule")
              .in("user_id", ids)
          : Promise.resolve({ data: [] }),
        ids.length
          ? supabase
              .from("help_requests")
              .select("volunteer_id, status, rating")
              .in("volunteer_id", ids)
          : Promise.resolve({ data: [] }),
      ]);

      if (!active) return;

      const volMap = {};
      (vols || []).forEach((v) => {
        volMap[v.user_id] = v;
      });

      const statsMap = {};
      (reqs || []).forEach((r) => {
        if (!statsMap[r.volunteer_id]) {
          statsMap[r.volunteer_id] = { completed: 0, sum: 0, count: 0 };
        }
        if (r.status === "completed") statsMap[r.volunteer_id].completed += 1;
        if (typeof r.rating === "number") {
          statsMap[r.volunteer_id].sum += r.rating;
          statsMap[r.volunteer_id].count += 1;
        }
      });

      setRows(
        (users || []).map((u) => {
          const st = statsMap[u.id] || { completed: 0, sum: 0, count: 0 };
          return {
            ...u,
            skills: volMap[u.id]?.skills || [],
            days: volMap[u.id]?.availability_schedule || [],
            completed: st.completed,
            avgRating: st.count ? (st.sum / st.count).toFixed(1) : null,
            ratingsCount: st.count,
          };
        }),
      );
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.skills?.some((s) => s.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const handleDelete = async (user) => {
    const ok = window.confirm(`هل تريد حذف المتطوع "${user.name}"؟`);
    if (!ok) return;

    setActionLoading(user.id);

    const { data: active } = await supabase
      .from("help_requests")
      .select("id")
      .eq("volunteer_id", user.id)
      .eq("status", "accepted")
      .limit(1);

    if (active?.length) {
      setActionLoading(null);
      alert("لا يمكن الحذف لوجود طلبات مقبولة نشطة.");
      return;
    }

    await supabase.from("volunteers").delete().eq("user_id", user.id);

    const { error: delError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id)
      .eq("user_type", "volunteer");

    setActionLoading(null);

    if (delError) {
      alert("تعذر الحذف: " + delError.message);
      return;
    }

    setSelected(null);
    await load();
  };

  return (
    <div className='space-y-6' dir='rtl'>
      <div>
        <h1 className='text-2xl font-bold text-white mb-1'>المتطوعون</h1>
        <p className='text-white/50 text-sm'>
          إدارة حسابات المتطوعين ({rows.length})
        </p>
      </div>

      <div className='bg-white/95 rounded-2xl border border-white/20 shadow-lg overflow-hidden'>
        <div className='p-4 border-b border-stone-100'>
          <div className='relative max-w-md'>
            <Search
              size={16}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='بحث بالاسم أو المدينة أو المهارة...'
              className='w-full pr-10 pl-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500'
            />
          </div>
        </div>

        {loading ? (
          <p className='p-8 text-center text-slate-400 text-sm'>
            جاري التحميل...
          </p>
        ) : error ? (
          <p className='p-8 text-center text-red-500 text-sm'>{error}</p>
        ) : filtered.length === 0 ? (
          <div className='p-10 text-center text-slate-400 text-sm'>
            <HeartHandshake className='mx-auto mb-2 opacity-40' size={28} />
            لا توجد نتائج
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-slate-800 text-white text-xs'>
                  <th className='text-right px-4 py-3.5 font-bold'>الاسم</th>
                  <th className='text-right px-4 py-3.5 font-bold'>
                    رقم الهوية
                  </th>
                  <th className='text-right px-4 py-3.5 font-bold'>المدينة</th>
                  <th className='text-right px-4 py-3.5 font-bold'>المهارات</th>
                  <th className='text-right px-4 py-3.5 font-bold'>مكتملة</th>
                  <th className='text-right px-4 py-3.5 font-bold'>التقييم</th>
                  <th className='text-right px-4 py-3.5 font-bold'>إجراءات</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-100'>
                {filtered.map((u) => (
                  <tr key={u.id} className='hover:bg-stone-50/80'>
                    <td className='px-4 py-3'>
                      <p className='font-semibold text-slate-900'>{u.name}</p>
                    </td>
                    {/* بدل الجوال: رقم الهوية */}
                    <td className='px-4 py-3 text-slate-600' dir='ltr'>
                      {u.national_id || "—"}
                    </td>
                    <td className='px-4 py-3 text-slate-600'>
                      {u.city || "—"}
                    </td>
                    <td className='px-4 py-3 text-slate-600 max-w-[180px]'>
                      <span className='line-clamp-2'>
                        {u.skills?.join("، ") || "—"}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-slate-600'>{u.completed}</td>
                    <td className='px-4 py-3'>
                      {u.avgRating ? (
                        <span className='inline-flex items-center gap-1 text-amber-600 font-semibold'>
                          ★ {u.avgRating}
                        </span>
                      ) : (
                        <span className='text-slate-400'>—</span>
                      )}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-1.5'>
                        <button
                          type='button'
                          onClick={() => setSelected(u)}
                          className='p-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100'
                          title='عرض'
                        >
                          <Eye size={15} />
                        </button>
                        {/* يمكن ربطه لاحقاً بنفس مودال التعديل */}
                        <button
                          type='button'
                          onClick={() => {
                            /* openEdit(u) إن نسختِ نفس منطق التعديل */
                          }}
                          className='p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100'
                          title='تعديل'
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type='button'
                          disabled={actionLoading === u.id}
                          onClick={() => handleDelete(u)}
                          className='p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50'
                          title='حذف'
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6 relative'>
            <button
              type='button'
              onClick={() => setSelected(null)}
              className='absolute left-4 top-4 text-slate-400'
            >
              <X size={18} />
            </button>
            <h3 className='font-bold text-slate-900 text-lg mb-4'>
              بيانات المتطوع
            </h3>
            <div className='space-y-2 text-sm'>
              {[
                ["الاسم", selected.name],
                ["البريد", selected.email],
                ["الجوال", selected.phone],
                ["المدينة", selected.city],
                ["المهارات", selected.skills?.join("، ")],
                ["أيام التوفر", selected.days?.join("، ")],
                ["طلبات مكتملة", selected.completed],
                [
                  "متوسط التقييم",
                  selected.avgRating
                    ? `${selected.avgRating}/5 (${selected.ratingsCount})`
                    : "—",
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className='flex justify-between gap-3 border-b border-stone-100 py-2'
                >
                  <span className='text-slate-500 shrink-0'>{k}</span>
                  <span className='font-semibold text-slate-900 text-left'>
                    {v || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolunteers;
