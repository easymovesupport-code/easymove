import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import doctorsImg from "../../assets/doctors.jpg";
import volunteerImg from "../../assets/volunteer.jpg";
import {
  Stethoscope,
  HandHeart,
  MessageCircle,
  ClipboardList,
  Clock,
  ChevronLeft,
  Bell,
  LogOut,
  UserRound,
} from "lucide-react";

const DisabledDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeRequests: 0,
    completedRequests: 0,
    messages: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const statusStyle = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };

  const statusLabel = {
    pending: "قيد الانتظار",
    accepted: "مقبول",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        navigate("/login?type=disabled");
        return;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("id, name")
        .eq("email", authData.user.email)
        .eq("user_type", "disabled")
        .single();

      if (!userRow) {
        navigate("/login?type=disabled");
        return;
      }

      setUserName(userRow.name || "مستخدم");

      const { data: requests } = await supabase
        .from("help_requests")
        .select("id, title, status, request_date, request_time, created_at")
        .eq("user_id", userRow.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const list = requests || [];
      setRecentRequests(list.slice(0, 5));

      setStats({
        activeRequests: list.filter((r) =>
          ["pending", "accepted"].includes(r.status),
        ).length,
        completedRequests: list.filter((r) => r.status === "completed").length,
        messages: list.filter((r) => r.status === "accepted").length,
      });

      const notifs = [];

      list
        .filter((r) => r.status === "accepted")
        .forEach((r) => {
          notifs.push({
            id: `accepted-${r.id}`,
            type: "accepted",
            title: "تم قبول طلبك",
            body: `المتطوع قبل طلب: ${r.title}`,
            time: r.created_at,
            link: `/disabled/chat/${r.id}`,
          });
        });

      const requestIds = list.map((r) => r.id);
      if (requestIds.length > 0) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, request_id, sender_id, body, created_at")
          .in("request_id", requestIds)
          .neq("sender_id", userRow.id)
          .order("created_at", { ascending: false })
          .limit(8);

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

      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs.slice(0, 10));

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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

  const formatDay = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-SA", { weekday: "long" });
  };

  const formatNotifTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const services = [
    {
      title: "أقرب الأطباء",
      desc: "ابحث عن أطباء ومراكز متخصصة في الإعاقة الحركية قرب موقعك",
      icon: <Stethoscope size={26} />,
      to: "/disabled/doctors",
      image: doctorsImg,
    },
    {
      title: "طلب متطوع",
      desc: "اطلب مساعدة من متطوع موثوق في التنقل أو التسوق أو المواعيد",
      icon: <HandHeart size={26} />,
      to: "/disabled/request-help",
      image: volunteerImg,
    },
  ];

  if (loading) {
    return (
      <div
        className='min-h-screen bg-stone-50 flex items-center justify-center'
        dir='rtl'
      >
        <p className='text-slate-500'>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-stone-50' dir='rtl'>
      <header className='bg-white/90 backdrop-blur border-b border-stone-200 sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-11 h-11 rounded-full bg-gradient-to-l from-teal-600 to-cyan-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-700/20'>
              {(userName || "م").charAt(0)}
            </div>
            <div>
              <p className='font-bold text-slate-900 text-sm'>{userName}</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setNotifOpen((v) => !v)}
                className='relative p-2 rounded-xl hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors'
                title='التنبيهات'
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className='absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full'></span>
                )}
              </button>

              {notifOpen && (
                <div className='absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-stone-200 rounded-2xl shadow-xl z-50'>
                  <div className='px-4 py-3 border-b border-stone-100 flex items-center justify-between'>
                    <p className='font-bold text-slate-900 text-sm'>
                      التنبيهات
                    </p>
                    <span className='text-xs text-slate-400'>
                      {notifications.length}
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <div className='px-4 py-8 text-center text-slate-400 text-sm'>
                      لا توجد تنبيهات حالياً
                    </div>
                  ) : (
                    <div className='divide-y divide-stone-100'>
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          to={n.link}
                          onClick={() => setNotifOpen(false)}
                          className='block px-4 py-3 hover:bg-teal-50/50 transition-colors'
                        >
                          <p className='text-sm font-semibold text-slate-900 mb-0.5'>
                            {n.title}
                          </p>
                          <p className='text-xs text-slate-500 line-clamp-2 mb-1'>
                            {n.body}
                          </p>
                          <p className='text-[11px] text-slate-400'>
                            {formatNotifTime(n.time)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type='button'
              onClick={() => navigate("/disabled/profile")}
              className='p-2 rounded-xl hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors'
              title='الملف الشخصي'
            >
              <UserRound size={20} />
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
        <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-8 md:p-10 shadow-xl'>
          <div className='absolute -top-16 -left-16 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl'></div>
          <div className='relative'>
            <p className='text-teal-100 text-sm mb-2'>مرحباً بك مجدداً 👋</p>
            <h1 className='text-3xl md:text-4xl font-bold mb-3'>
              أهلاً، {userName}
            </h1>
            <p className='text-teal-100/90 max-w-3xl leading-relaxed'>
              من هنا يمكنك طلب المساعدة ومتابعة طلباتك والوصول لأقرب الأطباء
              المتخصصين بسهولة.
            </p>
          </div>
        </section>

        <section className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {[
            {
              label: "طلبات نشطة",
              value: stats.activeRequests,
              icon: <Clock size={18} />,
              tone: "text-amber-700 bg-amber-50",
            },
            {
              label: "طلبات مكتملة",
              value: stats.completedRequests,
              icon: <ClipboardList size={18} />,
              tone: "text-teal-700 bg-teal-50",
            },
            {
              label: "محادثات نشطة",
              value: stats.messages,
              icon: <MessageCircle size={18} />,
              tone: "text-cyan-700 bg-cyan-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className='bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center justify-between'
            >
              <div>
                <p className='text-slate-500 text-sm mb-1'>{item.label}</p>
                <p className='text-2xl font-bold text-slate-900'>
                  {item.value}
                </p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.tone}`}
              >
                {item.icon}
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 className='text-xl font-bold text-slate-900 mb-4'>الخدمات</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            {services.map((service) => (
              <Link
                key={service.title}
                to={service.to}
                className='group relative overflow-hidden rounded-3xl min-h-[220px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                />
                {/* <div className='absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-black/10'></div> */}
                <div className='absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/65 to-slate-900/25'></div>

                <div className='relative h-full p-6 flex flex-col justify-end text-white'>
                  <div className='w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-4'>
                    {service.icon}
                  </div>
                  <h3 className='text-xl font-bold mb-2'>{service.title}</h3>
                  <p className='text-white/90 text-sm leading-relaxed mb-4'>
                    {service.desc}
                  </p>
                  <div className='inline-flex items-center gap-1 text-teal-200 font-semibold text-sm'>
                    ابدأ الآن
                    <ChevronLeft
                      size={16}
                      className='group-hover:-translate-x-1 transition-transform'
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden'>
          <div className='px-6 py-5 border-b border-stone-100'>
            <h2 className='text-lg font-bold text-slate-900'>آخر الطلبات</h2>
          </div>

          {recentRequests.length === 0 ? (
            <div className='px-6 py-10 text-center text-slate-500 text-sm'>
              لا توجد طلبات بعد. ابدأ بإنشاء طلب مساعدة جديد.
            </div>
          ) : (
            <div className='divide-y divide-stone-100'>
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className='px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-stone-50 transition-colors'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='font-bold text-slate-900 text-base mb-3'>
                      {req.title}
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      <span className='inline-flex items-center gap-1.5 text-sm bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg'>
                        <Clock size={14} className='text-teal-600' />
                        <strong>{formatTime(req.request_time)}</strong>
                      </span>
                      <span className='inline-flex items-center gap-1.5 text-sm bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg'>
                        <span className='text-teal-600 text-xs font-bold'>
                          يوم:
                        </span>
                        <strong>{formatDay(req.request_date)}</strong>
                      </span>
                      <span className='inline-flex items-center gap-1.5 text-sm bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg'>
                        <span className='text-teal-600 text-xs font-bold'>
                          تاريخ:
                        </span>
                        <strong>{formatDate(req.request_date)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center gap-3 shrink-0'>
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                        statusStyle[req.status] || statusStyle.pending
                      }`}
                    >
                      {statusLabel[req.status] || req.status}
                    </span>

                    {req.status === "pending" && (
                      <Link
                        to={`/disabled/edit-request/${req.id}`}
                        className='inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all'
                      >
                        تعديل الطلب
                      </Link>
                    )}

                    {req.status === "accepted" && (
                      <Link
                        to={`/disabled/chat/${req.id}`}
                        className='inline-flex items-center justify-center gap-2 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-teal-700/20 transition-all'
                      >
                        <MessageCircle size={16} />
                        محادثة مع المتطوع
                      </Link>
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

export default DisabledDashboard;
