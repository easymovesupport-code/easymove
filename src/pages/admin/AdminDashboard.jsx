import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Users,
  HeartHandshake,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  HandHeart,
  Star,
  ArrowLeft,
} from "lucide-react";
// الاحصائيات تعتبر جزء مهم من لوحة التحكم، حيث توفر نظرة عامة على أداء المنصة وعدد المستخدمين والطلبات والتقييمات. في هذا الكود، يتم استخدام React وSupabase لجلب البيانات وعرضها بطريقة منظمة وجذابة.
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className='bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-lg'>
    <div className='flex items-center justify-between mb-3'>
      <span className='text-sm text-slate-500'>{label}</span>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={18} />
      </div>
    </div>
    <p className='text-3xl font-bold text-slate-900'>{value}</p>
  </div>
);
// لوحة تحكم المدير
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    disabled: 0,
    volunteers: 0,
    totalRequests: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
    avgRating: null,
    ratingsCount: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [topVolunteers, setTopVolunteers] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      //
      const [
        { count: disabledCount },
        { count: volunteersCount },
        { data: requests },
      ] = await Promise.all([
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "disabled"),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("user_type", "volunteer"),
        supabase
          .from("help_requests")
          .select(
            "id, title, status, rating, created_at, volunteer_id, user_id",
          )
          .order("created_at", { ascending: false }),
      ]);

      const list = requests || [];
      const ratings = list
        .map((r) => r.rating)
        .filter((r) => typeof r === "number" && r >= 1 && r <= 5);
      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : null;

      setStats({
        disabled: disabledCount || 0,
        volunteers: volunteersCount || 0,
        totalRequests: list.length,
        pending: list.filter((r) => r.status === "pending").length,
        accepted: list.filter((r) => r.status === "accepted").length,
        completed: list.filter((r) => r.status === "completed").length,
        cancelled: list.filter((r) => r.status === "cancelled").length,
        avgRating,
        ratingsCount: ratings.length,
      });

      setRecentRequests(list.slice(0, 5));

      // أعلى المتطوعين تقييماً
      const byVolunteer = {};
      list
        .filter((r) => r.volunteer_id && r.rating)
        .forEach((r) => {
          if (!byVolunteer[r.volunteer_id]) {
            byVolunteer[r.volunteer_id] = { sum: 0, count: 0 };
          }
          byVolunteer[r.volunteer_id].sum += r.rating;
          byVolunteer[r.volunteer_id].count += 1;
        });

      const volIds = Object.keys(byVolunteer);
      if (volIds.length > 0) {
        const { data: volUsers } = await supabase
          .from("users")
          .select("id, name")
          .in("id", volIds);

        const ranked = (volUsers || [])
          .map((u) => ({
            id: u.id,
            name: u.name,
            avg: (byVolunteer[u.id].sum / byVolunteer[u.id].count).toFixed(1),
            count: byVolunteer[u.id].count,
          }))
          .sort((a, b) => Number(b.avg) - Number(a.avg))
          .slice(0, 5);

        setTopVolunteers(ranked);
      }

      setLoading(false);
    };

    load();
  }, []);

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

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <p className='text-white/60'>جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6' dir='rtl'>
      <div>
        <h1 className='text-2xl font-bold text-white mb-1'>لوحة التحكم</h1>
        <p className='text-white/50 text-sm'>نظرة عامة على منصة EasyMove</p>
      </div>

      {/* إحصائيات المستخدمين والطلبات */}
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        <StatCard
          label='ذوو الإعاقة'
          value={stats.disabled}
          icon={Users}
          color='bg-blue-50 text-blue-600'
        />
        <StatCard
          label='المتطوعون'
          value={stats.volunteers}
          icon={HeartHandshake}
          color='bg-teal-50 text-teal-600'
        />
        <StatCard
          label='إجمالي الطلبات'
          value={stats.totalRequests}
          icon={ClipboardList}
          color='bg-indigo-50 text-indigo-600'
        />
        <div className='bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-lg'>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-sm text-slate-500'>مقياس الرضا</span>
            <div className='w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center'>
              <Star size={18} />
            </div>
          </div>
          {stats.avgRating ? (
            <>
              <p className='text-3xl font-bold text-slate-900'>
                {stats.avgRating}
                <span className='text-base text-slate-400 font-medium'>/5</span>
              </p>
              <div className='mt-2 flex items-center gap-1'>
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
                <span className='text-xs text-slate-400 ms-1'>
                  ({stats.ratingsCount} تقييم)
                </span>
              </div>
            </>
          ) : (
            <p className='text-lg text-slate-400'>لا تقييمات بعد</p>
          )}
        </div>
      </div>

      {/* حالات الطلبات */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <StatCard
          label='قيد الانتظار'
          value={stats.pending}
          icon={Clock}
          color='bg-amber-50 text-amber-600'
        />
        <StatCard
          label='قيد التنفيذ'
          value={stats.accepted}
          icon={HandHeart}
          color='bg-teal-50 text-teal-600'
        />
        <StatCard
          label='مكتملة'
          value={stats.completed}
          icon={CheckCircle2}
          color='bg-emerald-50 text-emerald-600'
        />
        <StatCard
          label='ملغاة'
          value={stats.cancelled}
          icon={XCircle}
          color='bg-stone-100 text-slate-500'
        />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        {/* آخر الطلبات */}
        <div className='bg-white/95 backdrop-blur border border-white/20 rounded-2xl shadow-lg overflow-hidden'>
          <div className='px-5 py-4 border-b border-stone-100 flex items-center justify-between'>
            <h2 className='font-bold text-slate-900 text-sm'>آخر الطلبات</h2>
            <Link
              to='/admin/requests'
              className='text-xs text-teal-700 font-semibold inline-flex items-center gap-1 hover:underline'
            >
              عرض الكل
              <ArrowLeft size={12} />
            </Link>
          </div>
          <div className='divide-y divide-stone-100'>
            {recentRequests.length === 0 ? (
              <p className='px-5 py-8 text-center text-slate-400 text-sm'>
                لا توجد طلبات
              </p>
            ) : (
              recentRequests.map((r) => (
                <div
                  key={r.id}
                  className='px-5 py-3 flex items-center justify-between gap-3'
                >
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-slate-900 truncate'>
                      {r.title}
                    </p>
                    <p className='text-[11px] text-slate-400'>
                      {new Date(r.created_at).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      statusColor[r.status] || statusColor.pending
                    }`}
                  >
                    {statusLabel[r.status] || r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* أعلى المتطوعين */}
        <div className='bg-white/95 backdrop-blur border border-white/20 rounded-2xl shadow-lg overflow-hidden'>
          <div className='px-5 py-4 border-b border-stone-100 flex items-center justify-between'>
            <h2 className='font-bold text-slate-900 text-sm'>
              أعلى المتطوعين تقييماً
            </h2>
            <Link
              to='/admin/ratings'
              className='text-xs text-teal-700 font-semibold inline-flex items-center gap-1 hover:underline'
            >
              التقييمات
              <ArrowLeft size={12} />
            </Link>
          </div>
          <div className='divide-y divide-stone-100'>
            {topVolunteers.length === 0 ? (
              <p className='px-5 py-8 text-center text-slate-400 text-sm'>
                لا توجد تقييمات بعد
              </p>
            ) : (
              topVolunteers.map((v, i) => (
                <div
                  key={v.id}
                  className='px-5 py-3 flex items-center justify-between gap-3'
                >
                  <div className='flex items-center gap-3'>
                    <span className='w-7 h-7 rounded-full bg-teal-50 text-teal-700 text-xs font-bold flex items-center justify-center'>
                      {i + 1}
                    </span>
                    <div>
                      <p className='text-sm font-semibold text-slate-900'>
                        {v.name}
                      </p>
                      <p className='text-[11px] text-slate-400'>
                        {v.count} تقييم
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-1 text-amber-500'>
                    <Star size={14} className='fill-amber-400' />
                    <span className='text-sm font-bold text-slate-800'>
                      {v.avg}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
