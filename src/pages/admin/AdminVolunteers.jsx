import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Search,
  Trash2,
  Eye,
  Pencil,
  X,
  HeartHandshake,
  Save,
  Printer,
} from "lucide-react";
import { SKILLS, DAYS } from "../../constants/registerConstants";
import { SAUDI_CITIES } from "../../constants/cities";

const AdminVolunteers = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const { data: users, error: fetchError } = await supabase
          .from("users")
          .select(
            "id, name, national_id, email, phone, city, created_at, location_text",
          )
          .eq("user_type", "volunteer")
          .order("created_at", { ascending: false });

        if (cancelled) return;

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
                .select("id, user_id, skills, availability_schedule")
                .in("user_id", ids)
            : Promise.resolve({ data: [] }),
          ids.length
            ? supabase
                .from("help_requests")
                .select("volunteer_id, status, rating")
                .in("volunteer_id", ids)
            : Promise.resolve({ data: [] }),
        ]);

        if (cancelled) return;

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
            const vol = volMap[u.id];
            return {
              ...u,
              volunteerRowId: vol?.id || null,
              skills: vol?.skills || [],
              days: vol?.availability_schedule || [],
              completed: st.completed,
              avgRating: st.count ? (st.sum / st.count).toFixed(1) : null,
              ratingsCount: st.count,
            };
          }),
        );
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("تعذر تحميل المتطوعين");
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
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
        u.national_id?.includes(q) ||
        u.skills?.some((s) => s.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      national_id: user.national_id || "",
      phone: user.phone || "",
      city: user.city || "",
      email: user.email || "",
      location_text: user.location_text || "",
      skills: [...(user.skills || [])],
      days: [...(user.days || [])],
    });
    setSaveMsg("");
    setError("");
  };

  const toggleSkill = (skill) => {
    setEditForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const toggleDay = (day) => {
    setEditForm((f) => ({
      ...f,
      days: f.days.includes(day)
        ? f.days.filter((d) => d !== day)
        : [...f.days, day],
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    if (!editForm.name.trim()) {
      setError("الاسم مطلوب");
      return;
    }
    if (editForm.phone && !/^\d{10}$/.test(editForm.phone)) {
      setError("رقم الجوال يجب أن يكون 10 أرقام");
      return;
    }

    setActionLoading(editUser.id);
    setError("");

    const { error: userError } = await supabase
      .from("users")
      .update({
        name: editForm.name.trim(),
        // national_id: لا يُعدَّل
        phone: editForm.phone || null,
        city: editForm.city || null,
        location_text: editForm.location_text || null,
      })
      .eq("id", editUser.id)
      .eq("user_type", "volunteer");

    if (userError) {
      setActionLoading(null);
      setError("تعذر حفظ البيانات الشخصية: " + userError.message);
      return;
    }

    if (editUser.volunteerRowId) {
      const { error: volError } = await supabase
        .from("volunteers")
        .update({
          skills: editForm.skills,
          availability_schedule: editForm.days,
        })
        .eq("id", editUser.volunteerRowId);

      if (volError) {
        setActionLoading(null);
        setError("تعذر حفظ المهارات/أيام التوفر: " + volError.message);
        return;
      }
    } else {
      // إن لم يكن له صف في volunteers أنشئ واحداً
      await supabase.from("volunteers").insert({
        user_id: editUser.id,
        skills: editForm.skills,
        availability_schedule: editForm.days,
      });
    }

    setActionLoading(null);
    setSaveMsg("تم الحفظ بنجاح");

    setRows((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? {
              ...u,
              name: editForm.name.trim(),
              national_id: editForm.national_id,
              phone: editForm.phone,
              city: editForm.city,
              location_text: editForm.location_text,
              skills: editForm.skills,
              days: editForm.days,
            }
          : u,
      ),
    );

    setTimeout(() => {
      setEditUser(null);
      setSaveMsg("");
    }, 700);
  };

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
    setRows((prev) => prev.filter((u) => u.id !== user.id));
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
        <div className='p-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 print:hidden'>
          <div className='relative max-w-md flex-1'>
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
          <button
            type='button'
            onClick={() => window.print()}
            className='inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl'
          >
            <Printer size={16} />
            طباعة التقرير
          </button>
        </div>

        {loading ? (
          <p className='p-8 text-center text-slate-400 text-sm'>
            جاري التحميل...
          </p>
        ) : error && !editUser ? (
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
                  <th className='text-right px-4 py-3.5 font-bold w-14'>#</th>
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
                {filtered.map((u, index) => (
                  <tr key={u.id} className='hover:bg-stone-50/80'>
                    <td className='px-4 py-3 text-right text-slate-500 font-semibold'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <p className='font-semibold text-slate-900'>{u.name}</p>
                    </td>
                    <td
                      className='px-4 py-3 text-right text-slate-600'
                      dir='ltr'
                    >
                      {u.national_id || "—"}
                    </td>
                    <td className='px-4 py-3 text-right text-slate-600'>
                      {u.city || "—"}
                    </td>
                    <td className='px-4 py-3 text-slate-600 max-w-[180px]'>
                      <span className='line-clamp-2'>
                        {u.skills?.join("، ") || "—"}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right text-slate-600'>
                      {u.completed}
                    </td>
                    <td className='px-4 py-3 text-right text-slate-600'>
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
                        <button
                          type='button'
                          onClick={() => openEdit(u)}
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

      {/* عرض */}
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
                ["الهوية", selected.national_id],
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

      {/* تعديل */}
      {editUser && (
        <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto'>
            <button
              type='button'
              onClick={() => setEditUser(null)}
              className='absolute left-4 top-4 text-slate-400 hover:text-slate-600'
            >
              <X size={18} />
            </button>
            <h3 className='font-bold text-slate-900 text-lg mb-4'>
              تعديل بيانات المتطوع
            </h3>

            <form onSubmit={handleSaveEdit} className='space-y-3'>
              <div>
                <label className='block text-xs text-slate-500 mb-1'>
                  الاسم
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className='w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500'
                  required
                />
              </div>

              <div>
                <label className='block text-xs text-slate-500 mb-1'>
                  رقم الهوية
                </label>
                <input
                  value={editForm.national_id}
                  disabled
                  className='w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-slate-500 text-sm'
                  dir='ltr'
                />
              </div>

              <div>
                <label className='block text-xs text-slate-500 mb-1'>
                  الجوال
                </label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  className='w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500'
                  dir='ltr'
                />
              </div>

              <div>
                <label className='block text-xs text-slate-500 mb-1'>
                  المدينة
                </label>
                <select
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className='w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500 bg-white'
                >
                  <option value=''>اختاري المدينة</option>
                  {(SAUDI_CITIES || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs text-slate-500 mb-1'>
                  البريد
                </label>
                <input
                  value={editForm.email}
                  disabled
                  className='w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-slate-500 text-sm'
                  dir='ltr'
                />
              </div>

              <div>
                <label className='block text-xs text-slate-500 mb-2'>
                  المهارات
                </label>
                <div className='flex flex-wrap gap-2'>
                  {SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type='button'
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        editForm.skills?.includes(skill)
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white text-slate-600 border-stone-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block text-xs text-slate-500 mb-2'>
                  أيام التوفر
                </label>
                <div className='flex flex-wrap gap-2'>
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type='button'
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        editForm.days?.includes(day)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-600 border-stone-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className='text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg'>
                  {error}
                </p>
              )}
              {saveMsg && (
                <p className='text-emerald-700 text-sm bg-emerald-50 px-3 py-2 rounded-lg'>
                  {saveMsg}
                </p>
              )}

              <button
                type='submit'
                disabled={actionLoading === editUser.id}
                className='w-full inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm'
              >
                <Save size={16} />
                {actionLoading === editUser.id
                  ? "جاري الحفظ..."
                  : "حفظ التعديلات"}
              </button>
            </form>
          </div>
        </div>
      )}
      <div id='print-report' className='hidden print:block'>
        <div className='text-center mb-6'>
          <h1 className='text-xl font-bold text-slate-900'>تقرير المتطوعين</h1>
          <p className='text-sm text-slate-500 mt-1'>
            EasyMove — {new Date().toLocaleDateString("ar-SA")}
          </p>
          <p className='text-sm text-slate-500'>
            عدد السجلات: {filtered.length}
          </p>
        </div>

        <div className='space-y-4'>
          {filtered.map((u, index) => (
            <div
              key={u.id}
              className='border border-stone-300 rounded-xl p-4 break-inside-avoid mb-4'
            >
              {/* العنوان */}
              <div className='flex items-center gap-2 mb-3 border-b border-stone-200 pb-2'>
                <span className='w-7 h-7 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center'>
                  {index + 1}
                </span>
                <h2 className='font-bold text-slate-900 text-base'>{u.name}</h2>
              </div>

              {/* صفوف قصيرة: حقلين في كل سطر */}
              <div className='grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-3'>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    رقم الهوية
                  </span>
                  <span className='font-semibold text-slate-900' dir='ltr'>
                    {u.national_id || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    البريد
                  </span>
                  <span className='font-semibold text-slate-900' dir='ltr'>
                    {u.email || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    الجوال
                  </span>
                  <span className='font-semibold text-slate-900' dir='ltr'>
                    {u.phone || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    المدينة
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {u.city || "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    طلبات مكتملة
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {u.completed ?? 0}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    متوسط التقييم
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {u.avgRating ? `${u.avgRating}/5 (${u.ratingsCount})` : "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    تاريخ التسجيل
                  </span>
                  <span className='font-semibold text-slate-900'>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString("ar-SA")
                      : "—"}
                  </span>
                </div>
              </div>

              {/* المهارات وأيام التوفر: كل واحد في سطر كامل */}
              <div className='space-y-2 text-sm border-t border-stone-100 pt-3'>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    المهارات
                  </span>
                  <span className='font-semibold text-slate-900 leading-relaxed'>
                    {u.skills?.length ? u.skills.join("، ") : "—"}
                  </span>
                </div>
                <div>
                  <span className='text-slate-500 block text-xs mb-0.5'>
                    أيام التوفر
                  </span>
                  <span className='font-semibold text-slate-900 leading-relaxed'>
                    {u.days?.length ? u.days.join("، ") : "—"}
                  </span>
                </div>
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

export default AdminVolunteers;
