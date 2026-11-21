import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Hourglass, CheckCircle2, Star } from "lucide-react";
import VolunteerHeader from "../../components/volunteer/VolunteerHeader";
import StatsCards from "../../components/volunteer/StatsCards";
import RequestsSection from "../../components/volunteer/RequestsSection";
import { getDayName } from "../../utils/volunteerHelpers";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [suitableRequests, setSuitableRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadMap, setUnreadMap] = useState({}); // { requestId: true }

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
        .select("id, name, email, city, phone, profile_image")
        .eq("email", authData.user.email)
        .eq("user_type", "volunteer")
        .maybeSingle();

      if (userError || !userRow) {
        setError("تعذر تحميل حساب المتطوع");
        setLoading(false);
        return;
      }
      setUser(userRow);

      const volunteerCity = userRow.city || "";

      const { data: volRow } = await supabase
        .from("volunteers")
        .select("*")
        .eq("user_id", userRow.id)
        .maybeSingle();

      const skills = volRow?.skills || [];
      const days = volRow?.availability_schedule || [];

      const { data: allPending } = await supabase
        .from("help_requests")
        .select(`*, owner:users!help_requests_user_id_fkey ( id, name, city )`)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      const { data: mine } = await supabase
        .from("help_requests")
        .select("*, rating, rating_comment")
        .eq("volunteer_id", userRow.id)
        .in("status", ["accepted", "completed"])
        .order("created_at", { ascending: false });

      const myList = mine || [];
      setMyRequests(myList);

      // فلترة الطلبات المناسبة
      const matched = (allPending || []).filter((req) => {
        const rejected = req.rejected_volunteer_ids || [];
        if (rejected.includes(userRow.id)) return false;
        const skillOk =
          skills.length === 0 ? true : skills.includes(req.help_type);
        const dayName = getDayName(req.request_date);
        const dayOk = days.length === 0 ? true : days.includes(dayName);
        const ownerCity = req.owner?.city || "";
        const cityOk =
          !volunteerCity || !ownerCity || volunteerCity === ownerCity;
        return skillOk && dayOk && cityOk;
      });
      setSuitableRequests(matched);

      // ---- الرسائل الجديدة + الإشعارات ----
      const activeIds = myList
        .filter((r) => r.status === "accepted")
        .map((r) => r.id);

      const notifs = [];
      const unread = {};

      // إشعار: طلب مقبول (موجود أصلاً في myList)
      myList
        .filter((r) => r.status === "accepted")
        .forEach((r) => {
          notifs.push({
            id: `accepted-${r.id}`,
            title: "طلب قيد التنفيذ",
            body: r.title,
            time: r.created_at,
            link: `/volunteer/request/${r.id}`,
          });
        });

      // إشعار: تقييم جديد على طلب مكتمل
      myList
        .filter((r) => r.status === "completed" && r.rating)
        .forEach((r) => {
          notifs.push({
            id: `rating-${r.id}`,
            title: "تقييم جديد",
            body: `حصلت على ${r.rating}/5 على طلب: ${r.title}`,
            time: r.created_at,
            link: `/volunteer/dashboard`,
          });
        });

      if (activeIds.length > 0) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, request_id, sender_id, body, created_at")
          .in("request_id", activeIds)
          .neq("sender_id", userRow.id)
          .order("created_at", { ascending: false })
          .limit(20);

        (msgs || []).forEach((m) => {
          // هل الرسالة أحدث من آخر مشاهدة؟
          const seenKey = `chat_seen_${m.request_id}`;
          const lastSeen = localStorage.getItem(seenKey);
          const isNew =
            !lastSeen || new Date(m.created_at) > new Date(lastSeen);

          if (isNew) {
            unread[m.request_id] = true;
            notifs.push({
              id: `msg-${m.id}`,
              title: "رسالة جديدة",
              body: m.body?.slice(0, 60) || "رسالة جديدة من صاحب الطلب",
              time: m.created_at,
              link: `/volunteer/chat/${m.request_id}`,
            });
          }
        });
      }

      // ترتيب الإشعارات من الأحدث
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs.slice(0, 15));
      setUnreadMap(unread);

      setLoading(false);
    };

    load();
  }, [navigate]);

  const activeRequests = useMemo(
    () => myRequests.filter((r) => r.status === "accepted"),
    [myRequests],
  );

  const completedRequests = useMemo(
    () => myRequests.filter((r) => r.status === "completed"),
    [myRequests],
  );

  const stats = useMemo(() => {
    const ratings = completedRequests
      .map((r) => r.rating)
      .filter((r) => typeof r === "number" && r >= 1 && r <= 5);
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : null;

    return {
      suitable: suitableRequests.length,
      active: activeRequests.length,
      completed: completedRequests.length,
      avgRating,
      ratingsCount: ratings.length,
    };
  }, [suitableRequests, activeRequests, completedRequests]);

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
      <VolunteerHeader
        user={user}
        onLogout={handleLogout}
        notifications={notifications}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
      />

      <main className='max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8'>
        <section className='relative overflow-hidden bg-gradient-to-l from-teal-600 via-teal-700 to-cyan-700 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-teal-700/20'>
          <div className='absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl' />
          <div className='relative'>
            <p className='text-teal-100 text-sm mb-1'>مرحباً بك</p>
            <h1 className='text-2xl md:text-3xl font-bold mb-2'>
              أهلاً، {user?.name}
            </h1>
            <p className='text-teal-50/90 text-sm max-w-2xl'>
              هنا تظهر لك الطلبات المناسبة حسب مهاراتك وأيام تفرّغك ومدينتك.
            </p>
          </div>
        </section>

        {error && (
          <div className='bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100'>
            {error}
          </div>
        )}
        {/* الاحصائيات */}
        <StatsCards stats={stats} />
        {/* طلبات مناسبة لك */}
        <RequestsSection
          title='طلبات مناسبة لك'
          subtitle='حسب المهارات وأيام التوفر والمدينة'
          icon={Hourglass}
          type='suitable'
          requests={suitableRequests}
          emptyText='لا توجد طلبات مطابقة لمهاراتك وأيامك ومدينتك حالياً.'
        />
        {/* طلباتي الحالية */}
        <RequestsSection
          title='طلباتي الحالية'
          subtitle='مقبولة وجاهزة للمتابعة'
          icon={CheckCircle2}
          type='active'
          requests={activeRequests}
          emptyText='لا توجد طلبات قيد التنفيذ حالياً.'
          actionLoading={actionLoading}
          onComplete={handleComplete}
          unreadMap={unreadMap}
        />
        {/* الطلبات المكتملة */}
        <RequestsSection
          title='الطلبات المكتملة'
          subtitle='مع التقييمات'
          icon={Star}
          type='completed'
          requests={completedRequests}
          emptyText='لا توجد طلبات مكتملة بعد.'
        />
      </main>
    </div>
  );
};

export default VolunteerDashboard;
