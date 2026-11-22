import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, Trash2, Eye, Pencil, X, Users, Save } from "lucide-react";

const AdminDisabledUsers = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // عرض
  const [editUser, setEditUser] = useState(null); // تعديل
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setError("");

      const { data, error: fetchError } = await supabase
        .from("users")
        .select(
          "id, name, national_id, email, phone, city, gender, created_at, location_text",
        )
        .eq("user_type", "disabled")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchError) {
        setError("تعذر تحميل بيانات ذوي الإعاقة");
        setLoading(false);
        return;
      }

      const ids = (data || []).map((u) => u.id);
      let counts = {};

      if (ids.length > 0) {
        const { data: reqs } = await supabase
          .from("help_requests")
          .select("user_id")
          .in("user_id", ids);

        if (!active) return;

        (reqs || []).forEach((r) => {
          counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        });
      }

      if (!active) return;

      setRows(
        (data || []).map((u) => ({
          ...u,
          requestsCount: counts[u.id] || 0,
        })),
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
        u.national_id?.includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.email?.toLowerCase().includes(q),
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
    });
    setSaveMsg("");
    setError("");
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

    const { error: updateError } = await supabase
      .from("users")
      .update({
        name: editForm.name.trim(),
        national_id: editForm.national_id || null,
        phone: editForm.phone || null,
        city: editForm.city || null,
        location_text: editForm.location_text || null,
      })
      .eq("id", editUser.id)
      .eq("user_type", "disabled");

    setActionLoading(null);

    if (updateError) {
      setError("تعذر حفظ التعديلات: " + updateError.message);
      return;
    }

    // تحديث القائمة محلياً
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
            }
          : u,
      ),
    );

    setSaveMsg("تم الحفظ بنجاح");
    setTimeout(() => {
      setEditUser(null);
      setSaveMsg("");
    }, 700);
  };

  const handleDelete = async (user) => {
    const ok = window.confirm(
      `هل تريد حذف حساب "${user.name}"؟\nلن يُحذف إن وُجدت طلبات نشطة.`,
    );
    if (!ok) return;

    setActionLoading(user.id);

    const { data: activeReqs } = await supabase
      .from("help_requests")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["pending", "accepted"])
      .limit(1);

    if (activeReqs?.length) {
      setActionLoading(null);
      alert("لا يمكن الحذف لوجود طلبات نشطة. ألغِ الطلبات أولاً.");
      return;
    }

    const { error: delError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id)
      .eq("user_type", "disabled");

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
        <h1 className='text-2xl font-bold text-white mb-1'>ذوو الإعاقة</h1>
        <p className='text-white/50 text-sm'>
          إدارة حسابات المستفيدين ({rows.length})
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
              placeholder='بحث بالاسم أو الهوية أو المدينة...'
              className='w-full pr-10 pl-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500'
            />
          </div>
        </div>

        {loading ? (
          <p className='p-8 text-center text-slate-400 text-sm'>
            جاري التحميل...
          </p>
        ) : error && !editUser ? (
          <p className='p-8 text-center text-red-500 text-sm'>{error}</p>
        ) : filtered.length === 0 ? (
          <div className='p-10 text-center text-slate-400 text-sm'>
            <Users className='mx-auto mb-2 opacity-40' size={28} />
            لا توجد نتائج
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              {/* رأس أوضح */}
              <thead>
                <tr className='bg-slate-800 text-white text-xs'>
                  <th className='text-right px-4 py-3.5 font-bold w-14'>#</th>
                  <th className='text-right px-4 py-3.5 font-bold'>الاسم</th>
                  <th className='text-right px-4 py-3.5 font-bold'>الهوية</th>
                  <th className='text-right px-4 py-3.5 font-bold'>الجوال</th>
                  <th className='text-right px-4 py-3.5 font-bold'>المدينة</th>
                  <th className='text-right px-4 py-3.5 font-bold'>الطلبات</th>
                  <th className='text-right px-4 py-3.5 font-bold'>التسجيل</th>
                  <th className='text-right px-4 py-3.5 font-bold'>إجراءات</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-100'>
                {filtered.map((u, index) => (
                  <tr key={u.id} className='hover:bg-stone-50/80'>
                    <td className='px-4 py-3 text-right text-slate-500 font-semibold'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3 font-semibold text-slate-900'>
                      {u.name}
                    </td>
                    <td className='px-4 py-3 text-slate-600' dir='ltr'>
                      {u.national_id || "—"}
                    </td>
                    <td className='px-4 py-3 text-slate-600' dir='ltr'>
                      {u.phone || "—"}
                    </td>
                    <td className='px-4 py-3 text-slate-600'>
                      {u.city || "—"}
                    </td>
                    <td className='px-4 py-3 text-slate-600'>
                      {u.requestsCount}
                    </td>
                    <td className='px-4 py-3 text-slate-500 text-xs'>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString("ar-SA")
                        : "—"}
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
                        {/* زر التعديل */}
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

      {/* نافذة العرض */}
      {selected && (
        <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl w-full max-w-md p-6 relative'>
            <button
              type='button'
              onClick={() => setSelected(null)}
              className='absolute left-4 top-4 text-slate-400 hover:text-slate-600'
            >
              <X size={18} />
            </button>
            <h3 className='font-bold text-slate-900 text-lg mb-4'>
              بيانات المستفيد
            </h3>
            <div className='space-y-2 text-sm'>
              {[
                ["الاسم", selected.name],
                ["الهوية", selected.national_id],
                ["البريد", selected.email],
                ["الجوال", selected.phone],
                ["المدينة", selected.city],
                ["العنوان", selected.location_text],
                ["عدد الطلبات", selected.requestsCount],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className='flex justify-between gap-3 border-b border-stone-100 py-2'
                >
                  <span className='text-slate-500'>{k}</span>
                  <span className='font-semibold text-slate-900 text-left'>
                    {v || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* نافذة التعديل */}
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
              تعديل بيانات المستفيد
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
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      national_id: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    }))
                  }
                  className='w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500'
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
                <input
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className='w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500'
                />
              </div>
              <div>
                <label className='block text-xs text-slate-500 mb-1'>
                  العنوان
                </label>
                <input
                  value={editForm.location_text}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      location_text: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-teal-500'
                />
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
    </div>
  );
};

export default AdminDisabledUsers;
