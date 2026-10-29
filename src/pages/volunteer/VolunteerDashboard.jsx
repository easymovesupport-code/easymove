import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HandHeart,
  LogOut,
  MessageCircle,
  UserRound,
} from "lucide-react";

const DAY_NAMES = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const statusLabel = {
  pending: "قيد الانتظار",
  accepted: "مقبول",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusStyle = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-teal-50 text-teal-700 border-teal-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-stone-100 text-slate-500 border-stone-200",
};

const formatTime = (time) => {
  if (!time) return "—";
  const [hoursStr, minutesStr = "00"] = String(time).split(":");
  let hours = Number(hoursStr);
  const minutes = minutesStr.padStart(2, "0");
  if (Number.isNaN(hours)) return "—";
  const period = hours >= 12 ? "م" : "ص";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${period}`;
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getDayName = (date) => {
  if (!date) return null;
  return DAY_NAMES[new Date(date).getDay()];
};

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [suitableRequests, setSuitableRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=volunteer");
        return;
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("id, name, email, phone, user_type")
        .eq("email", authData.user.email)
        .eq("user_type", "volunteer")
        .maybeSingle();

      if (userError || !userRow) {
        setError("تعذر تحميل حساب المتطوع");
        setLoading(false);
        return;
      }
      setUser(userRow);

      const { data: volRow } = await supabase
        .from("volunteers")
        .select("*")
        .eq("user_id", userRow.id)
        .maybeSingle();

      const skills = volRow?.skills || [];
      const days = volRow?.availability_schedule || [];

      const { data: allPending } = await supabase
        .from("help_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const { data: mine } = await supabase
        .from("help_requests")
        .select("*")
        .eq("volunteer_id", userRow.id)
        .in("status", ["accepted", "completed"])
        .order("created_at", { ascending: false });

      setMyRequests(mine || []);

      const matched = (allPending || []).filter((req) => {
        const skillOk =
          skills.length === 0 ? true : skills.includes(req.help_type);
        const dayName = getDayName(req.request_date);
        const dayOk = days.length === 0 ? true : days.includes(dayName);
        return skillOk && dayOk;
      });

      setSuitableRequests(matched);
      setLoading(false);
    };

    load();
  }, [navigate]);

  const stats = useMemo(() => {
    return {
      suitable: suitableRequests.length,
      active: myRequests.filter((r) => r.status === "accepted").length,
      completed: myRequests.filter((r) => r.status === "completed").length,
    };
  }, [suitableRequests, myRequests]);

  const handleAccept = async (requestId) => {
    if (!user) return;
    setActionLoading(requestId);

    const { error: updateError } = await supabase
      .from("help_requests")
      .update({
        status: "accepted",
        volunteer_id: user.id,
      })
      .eq("id", requestId)
      .eq("status", "pending");

    setActionLoading(null);

    if (updateError) {
      console.error(updateError);
      setError("تعذر قبول الطلب. قد يكون قبله متطوع آخر.");
      return;
    }

    const accepted = suitableRequests.find((r) => r.id === requestId);
    setSuitableRequests((prev) => prev.filter((r) => r.id !== requestId));
    if (accepted) {
      setMyRequests((prev) => [
        { ...accepted, status: "accepted", volunteer_id: user.id },
        ...prev,
      ]);
    }
  };

  const handleComplete = async (requestId) => {
    setActionLoading(requestId);
    const { error: updateError } = await supabase
      .from("help_requests")
      .update({ status: "completed" })
      .eq("id", requestId)
      .eq("volunteer_id", user.id);

    setActionLoading(null);

    if (updateError) {
      setError("تعذر تحديث حالة الطلب");
      return;
    }

    setMyRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "completed" } : r)),
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login?type=volunteer");
  };

  if (loading) {
    return (
      <div
        className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري تحميل لوحة المتطوع...</p>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50'
      dir='rtl'
    >
      <header className='bg-white/90 backdrop-blur border-b border-teal-100 sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-11 h-11 rounded-full bg-gradient-to-l from-teal-600 to-cyan-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-700/20'>
              {(user?.name || "م").charAt(0)}
            </div>
            <div>
              <p className='font-bold text-slate-900 text-sm'>{user?.name}</p>
              <p className='text-xs text-teal-700'>متطوع</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Link
              to='/volunteer/profile'
              className='p-2 rounded-xl hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors'
              title='الملف الشخصي'
            >
              <UserRound size={20} />
            </Link>
            <button
              type='button'
              className='relative p-2 rounded-xl hover:bg-teal-50 text-slate-600'
              title='الإشعارات'
            >
              <Bell size={20} />
            </button>
            <button
              type='button'
              onClick={handleLogout}
              className='p-2 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors'
              title='تسجيل الخروج'
            >
              <LogOut size={20} />
            </button>
            <Link to='/' className='text-lg font-bold text-teal-800 ms-2'>
              Easy<span className='text-teal-500'>Move</span>
            </Link>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8'>
        <section className='relative overflow-hidden bg-gradient-to-l from-teal-600 via-teal-700 to-cyan-700 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-teal-700/20'>
          <div className='absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl'></div>
          <div className='absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-300/20 rounded-full blur-2xl'></div>
          <div className='relative'>
            <p className='text-teal-100 text-sm mb-1'>مرحباً بك</p>
            <h1 className='text-2xl md:text-3xl font-bold mb-2'>
              أهلاً، {user?.name}
            </h1>
            <p className='text-teal-50/90 text-sm max-w-2xl'>
              هنا تظهر لك الطلبات المناسبة حسب مهاراتك وأيام تفرّغك.
            </p>
          </div>
        </section>

        {error && (
          <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
            {error}
          </div>
        )}

        <section className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='bg-white/90 border border-teal-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-sm text-slate-500'>طلبات مناسبة</span>
              <div className='w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center'>
                <ClipboardList size={18} />
              </div>
            </div>
            <p className='text-3xl font-bold text-slate-900'>
              {stats.suitable}
            </p>
          </div>

          <div className='bg-white/90 border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-sm text-slate-500'>قيد التنفيذ</span>
              <div className='w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center'>
                <HandHeart size={18} />
              </div>
            </div>
            <p className='text-3xl font-bold text-slate-900'>{stats.active}</p>
          </div>

          <div className='bg-white/90 border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between mb-3'>
              <span className='text-sm text-slate-500'>مكتملة</span>
              <div className='w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center'>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className='text-3xl font-bold text-slate-900'>
              {stats.completed}
            </p>
          </div>
        </section>

        <section className='bg-white/90 border border-teal-100 rounded-3xl overflow-hidden shadow-sm'>
          <div className='px-6 py-4 border-b border-teal-50 flex items-center justify-between bg-gradient-to-l from-teal-50/50 to-transparent'>
            <h2 className='font-bold text-slate-900'>طلبات مناسبة لك</h2>
            <span className='text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full'>
              حسب المهارات وأيام التوفر
            </span>
          </div>

          {suitableRequests.length === 0 ? (
            <div className='p-8 text-center text-slate-500 text-sm'>
              لا توجد طلبات مطابقة لمهاراتك وأيامك حالياً.
            </div>
          ) : (
            <div className='divide-y divide-stone-100'>
              {suitableRequests.map((req) => (
                <div
                  key={req.id}
                  className='px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-teal-50/30 transition-colors'
                >
                  <div>
                    <p className='font-bold text-slate-900 mb-1'>{req.title}</p>
                    <p className='text-sm text-slate-500 mb-2'>
                      النوع: {req.help_type}
                    </p>
                    <div className='flex flex-wrap gap-2 text-xs'>
                      <span className='inline-flex items-center gap-1 bg-white border border-stone-200 px-2.5 py-1 rounded-lg'>
                        <CalendarDays size={12} />
                        {getDayName(req.request_date)} •{" "}
                        {formatDate(req.request_date)}
                      </span>
                      <span className='bg-white border border-stone-200 px-2.5 py-1 rounded-lg'>
                        الوقت: {formatTime(req.request_time)}
                      </span>
                      {req.location && (
                        <span className='bg-white border border-stone-200 px-2.5 py-1 rounded-lg'>
                          {req.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type='button'
                    disabled={actionLoading === req.id}
                    onClick={() => handleAccept(req.id)}
                    className='shrink-0 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/20 transition-all'
                  >
                    {actionLoading === req.id ? "جاري القبول..." : "قبول الطلب"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className='bg-white/90 border border-teal-100 rounded-3xl overflow-hidden shadow-sm'>
          <div className='px-6 py-4 border-b border-teal-50 bg-gradient-to-l from-cyan-50/50 to-transparent'>
            <h2 className='font-bold text-slate-900'>طلباتي الحالية</h2>
          </div>

          {myRequests.length === 0 ? (
            <div className='p-8 text-center text-slate-500 text-sm'>
              لم تقبل أي طلب بعد.
            </div>
          ) : (
            <div className='divide-y divide-stone-100'>
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className='px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4'
                >
                  <div>
                    <p className='font-bold text-slate-900 mb-1'>{req.title}</p>
                    <p className='text-sm text-slate-500'>
                      {req.help_type} • {formatDate(req.request_date)} •{" "}
                      {formatTime(req.request_time)}
                    </p>
                  </div>

                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                        statusStyle[req.status] || statusStyle.pending
                      }`}
                    >
                      {statusLabel[req.status] || req.status}
                    </span>

                    {req.status === "accepted" && (
                      <>
                        <Link
                          to={`/volunteer/chat/${req.id}`}
                          className='inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-colors'
                        >
                          <MessageCircle size={16} />
                          محادثة
                        </Link>
                        <button
                          type='button'
                          disabled={actionLoading === req.id}
                          onClick={() => handleComplete(req.id)}
                          className='text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors'
                        >
                          إكمال الطلب
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default VolunteerDashboard;
