import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Stethoscope,
  HandHeart,
  MessageCircle,
  ClipboardList,
  Clock,
  ChevronLeft,
  Bell,
  LogOut,
} from "lucide-react";

const DisabledDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [, setUserId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeRequests: 0,
    completedRequests: 0,
    messages: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);

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
      setUserId(userRow.id);

      const { data: requests } = await supabase
        .from("help_requests")
        .select("id, title, status, request_date, request_time, created_at")
        .eq("user_id", userRow.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const list = requests || [];
      setRecentRequests(list);

      setStats({
        activeRequests: list.filter((r) =>
          ["pending", "accepted"].includes(r.status),
        ).length,
        completedRequests: list.filter((r) => r.status === "completed").length,
        messages: list.filter((r) => r.status === "accepted").length,
      });

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

  const services = [
    {
      title: "أقرب الأطباء",
      desc: "ابحث عن أطباء متخصصين في الإعاقة الحركية قرب موقعك",
      icon: <Stethoscope size={26} />,
      to: "/disabled/doctors",
      iconBg: "bg-teal-50 text-teal-700",
    },
    {
      title: "طلب متطوع",
      desc: "اطلب مساعدة فورية أو مجدولة من متطوع موثوق",
      icon: <HandHeart size={26} />,
      to: "/disabled/request-help",
      iconBg: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "المحادثات",
      desc: "تواصل مع المتطوع بعد قبول طلب المساعدة",
      icon: <MessageCircle size={26} />,
      to: "/disabled/messages",
      iconBg: "bg-cyan-50 text-cyan-700",
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
      <header className='bg-white border-b border-stone-200 sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <Link
            to='/disabled/dashboard'
            className='text-xl font-bold text-teal-800'
          >
            Easy<span className='text-teal-500'>Move</span>
          </Link>

          <div className='flex items-center gap-3'>
            <button
              type='button'
              title='الإشعارات قريباً'
              className='relative p-2 rounded-xl hover:bg-stone-100 text-slate-600 transition-colors'
            >
              <Bell size={20} />
            </button>

            <div className='relative'>
              <button
                type='button'
                onClick={() => setMenuOpen((v) => !v)}
                className='w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm hover:bg-teal-200 transition-colors'
              >
                {userName?.charAt(0) || "م"}
              </button>

              {menuOpen && (
                <div className='absolute left-0 mt-2 w-44 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50'>
                  <div className='px-4 py-3 border-b border-stone-100'>
                    <p className='text-sm font-semibold text-slate-900 truncate'>
                      {userName}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={handleLogout}
                    className='w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors'
                  >
                    <LogOut size={16} />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            {services.map((service) => (
              <Link
                key={service.title}
                to={service.to}
                className='group bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${service.iconBg}`}
                >
                  {service.icon}
                </div>
                <h3 className='text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors'>
                  {service.title}
                </h3>
                <p className='text-slate-500 text-sm leading-relaxed mb-5'>
                  {service.desc}
                </p>
                <div className='inline-flex items-center gap-1 text-teal-700 font-semibold text-sm'>
                  ابدأ الآن
                  <ChevronLeft
                    size={16}
                    className='group-hover:-translate-x-1 transition-transform'
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden'>
          <div className='px-6 py-5 border-b border-stone-100 flex items-center justify-between'>
            <h2 className='text-lg font-bold text-slate-900'>آخر الطلبات</h2>
            <Link
              to='/disabled/my-requests'
              className='text-sm text-teal-700 font-semibold hover:underline'
            >
              عرض الكل
            </Link>
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

                    {/* تعديل فقط إذا الطلب ما زال pending */}
                    {req.status === "pending" && (
                      <Link
                        to={`/disabled/edit-request/${req.id}`}
                        className='inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all'
                      >
                        تعديل الطلب
                      </Link>
                    )}

                    {/* محادثة بعد قبول المتطوع */}
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
