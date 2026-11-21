import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export const useDisabledDashboard = () => {
  // تعريف المتغيرات والحالات اللازمة للـ hook
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  //   التعريف حالات لإدارة حالة الإشعارات وحالة التحميل
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  //   استخدام useState لتخزين الإحصائيات والطلبات الأخيرة والإشعارات وحالة التقييم
  const [stats, setStats] = useState({
    activeRequests: 0,
    completedRequests: 0,
    messages: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [ratingReq, setRatingReq] = useState(null);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  // تعريف دالة loadData لتحميل البيانات من قاعدة البيانات
  const loadData = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      navigate("/login?type=disabled");
      return;
    }
    // جلب بيانات المستخدم من جدول "users" والتحقق من وجوده
    const { data: userRow } = await supabase
      .from("users")
      .select("id, name")
      .eq("email", authData.user.email)
      .eq("user_type", "disabled")
      .maybeSingle();

    if (!userRow) {
      navigate("/login?type=disabled");
      return;
    }
    // تعيين معرف المستخدم واسم المستخدم في الحالات المناسبة
    setUserId(userRow.id);
    setUserName(userRow.name || "مستخدم");
    // جلب الطلبات الأخيرة من جدول "help_requests" مع معلومات المتطوع المرتبط بكل طلب
    const { data: requests } = await supabase
      .from("help_requests")
      .select(
        `
        id, title, status, request_date, request_time, time_from, time_to,
        created_at, volunteer_id, rating,
        volunteer:users!help_requests_volunteer_id_fkey (
          id, name, phone, city, nationality, education, profile_image
        )
      `,
      )
      .eq("user_id", userRow.id)
      .order("created_at", { ascending: false })
      .limit(10);
    // تعيين الطلبات الأخيرة والإحصائيات والإشعارات في الحالات المناسبة
    const list = requests || [];
    setRecentRequests(list.slice(0, 5));
    // تحديث الإحصائيات بناءً على حالة الطلبات
    setStats({
      activeRequests: list.filter((r) =>
        ["pending", "accepted"].includes(r.status),
      ).length,
      completedRequests: list.filter((r) => r.status === "completed").length,
      messages: list.filter((r) => r.status === "accepted").length,
    });
    // إنشاء قائمة بالإشعارات بناءً على حالة الطلبات والرسائل الجديدة
    const notifs = [];
    // إضافة إشعارات للطلبات المقبولة
    list
      .filter((r) => r.status === "accepted")
      .forEach((r) => {
        notifs.push({
          id: `accepted-${r.id}`,
          type: "accepted",
          title: "تم قبول طلبك",
          body: r.volunteer?.name
            ? `قبل الطلب: ${r.volunteer.name}`
            : `المتطوع قبل طلب: ${r.title}`,
          time: r.created_at,
          link: `/disabled/chat/${r.id}`,
        });
      });
    // إضافة إشعارات للرسائل الجديدة من المتطوعين
    const requestIds = list.map((r) => r.id);
    if (requestIds.length > 0) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, request_id, sender_id, body, created_at")
        .in("request_id", requestIds)
        .neq("sender_id", userRow.id)
        .order("created_at", { ascending: false })
        .limit(8);
      // إضافة إشعارات للرسائل الجديدة إلى قائمة الإشعارات
      (msgs || []).forEach((m) => {
        notifs.push({
          id: `msg-${m.id}`,
          type: "message",
          title: "رسالة جديدة من المتطوع",
          body: m.body?.slice(0, 60) || "رسالة جديدة",
          time: m.created_at,
          link: `/disabled/chat/${m.request_id}`,
        });
      });
    }
    // ترتيب الإشعارات حسب الوقت وعرض أحدث 10 إشعارات فقط
    notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
    setNotifications(notifs.slice(0, 10));
    setLoading(false);
  }, [navigate]);
  // استخدام useEffect لتحميل البيانات عند تحميل الـ hook
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      await loadData();
      if (!active) return;
    })();

    return () => {
      active = false;
    };
  }, [loadData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  // تعريف دالة rejectVolunteer لإلغاء المتطوع المرتبط بطلب معين
  const rejectVolunteer = async (requestId, volunteerId) => {
    const ok = window.confirm(
      "هل تريدين إلغاء هذا المتطوع وإعادة فتح الطلب لمتطوعين آخرين؟",
    );
    if (!ok) return;
    // بد ذلك، يتم تعيين حالة التحميل للعملية الحالية، ثم يتم جلب الطلب من قاعدة البيانات للتحقق من قائمة المتطوعين المرفوضين. بعد ذلك، يتم تحديث الطلب لإلغاء المتطوع الحالي وإضافة معرف المتطوع المرفوض إلى القائمة. إذا حدث خطأ أثناء العملية، يتم عرض رسالة تنبيه للمستخدم. أخيرًا، يتم إعادة تحميل البيانات لتحديث واجهة المستخدم.
    setActionLoading(requestId);
    // يجلب الطلب من قاعدة البيانات للتحقق من قائمة المتطوعين المرفوضين
    const { data: req } = await supabase
      .from("help_requests")
      .select("rejected_volunteer_ids")
      .eq("id", requestId)
      .single();
    // يحدد المتطوعين المرفوضين
    const rejected = req?.rejected_volunteer_ids || [];
    const updatedRejected = rejected.includes(volunteerId)
      ? rejected
      : [...rejected, volunteerId];
    // تحديث الطلب لإلغاء المتطوع الحالي وإضافة معرف المتطوع المرفوض إلى القائمة
    const { error } = await supabase
      .from("help_requests")
      .update({
        status: "pending",
        volunteer_id: null,
        rejected_volunteer_ids: updatedRejected,
      })
      .eq("id", requestId)
      .eq("user_id", userId);

    setActionLoading(null);
    if (error) {
      alert("تعذر تغيير المتطوع");
      return;
    }
    await loadData();
  };
  // تعريف دالة openCompleteModal لفتح نافذة تقييم الطلب
  const openCompleteModal = (req) => {
    setRatingReq(req);
    setRating(5);
    setRatingComment("");
  };
  // تعريف دالة submitComplete لإكمال الطلب وتحديث حالته في قاعدة البيانات
  const submitComplete = async () => {
    if (!ratingReq) return;
    setActionLoading(ratingReq.id);

    // إكمال + مسح قائمة المرفوضين لهذا الطلب
    const { error } = await supabase
      .from("help_requests")
      .update({
        status: "completed",
        rating,
        rating_comment: ratingComment.trim() || null,
        rejected_volunteer_ids: [],
      })
      .eq("id", ratingReq.id)
      .eq("user_id", userId);

    setActionLoading(null);
    if (error) {
      alert("تعذر إكمال الطلب");
      return;
    }

    setRatingReq(null);
    await loadData();
  };
  //   تعريف دالة cancelRequest لإلغاء الطلب نهائيًا
  const cancelRequest = async (requestId) => {
    const ok = window.confirm("هل تريدين إلغاء هذا الطلب نهائياً؟");
    if (!ok) return;

    setActionLoading(requestId);

    // جلب المستخدم مباشرة من Auth (لا نعتمد على state)
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setActionLoading(null);
      alert("انتهت الجلسة. سجّلي الدخول مجدداً.");
      navigate("/login?type=disabled");
      return;
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("email", authData.user.email)
      .eq("user_type", "disabled")
      .maybeSingle();

    if (!userRow) {
      setActionLoading(null);
      alert("تعذر التحقق من المستخدم");
      return;
    }

    const { data, error } = await supabase
      .from("help_requests")
      .delete()
      .eq("id", requestId)
      .eq("user_id", userRow.id)
      .eq("status", "pending")
      .select(); // مهم: لمعرفة هل تم حذف صف فعلاً

    setActionLoading(null);

    if (error) {
      console.error(error);
      alert("تعذر إلغاء الطلب: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert(
        "لم يتم العثور على الطلب أو لا يمكن حذفه (قد لا يكون قيد الانتظار).",
      );
      return;
    }

    await loadData();
  };
  return {
    userName,
    notifOpen,
    setNotifOpen,
    loading,
    stats,
    recentRequests,
    notifications,
    ratingReq,
    setRatingReq,
    rating,
    setRating,
    ratingComment,
    setRatingComment,
    actionLoading,
    handleLogout,
    rejectVolunteer,
    openCompleteModal,
    submitComplete,
    navigate,
    cancelRequest,
  };
};
