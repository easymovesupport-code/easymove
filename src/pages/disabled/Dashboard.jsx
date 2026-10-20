import { Link } from "react-router-dom";
import {
  Stethoscope,
  HandHeart,
  MessageCircle,
  ClipboardList,
  MapPin,
  Clock,
  ChevronLeft,
  Bell,
} from "lucide-react";

const DisabledDashboard = () => {
  // بيانات تجريبية مؤقتة (لاحقاً من Supabase)
  const userName = "أحمد";
  const stats = {
    activeRequests: 1,
    completedRequests: 4,
    messages: 2,
  };

  const recentRequests = [
    {
      id: 1,
      title: "مساعدة في موعد طبي",
      status: "accepted",
      date: "اليوم • 3:00 م",
    },
    {
      id: 2,
      title: "مرافقة للتسوق",
      status: "pending",
      date: "أمس • 11:30 ص",
    },
    {
      id: 3,
      title: "مساعدة في التنقل",
      status: "completed",
      date: "قبل 3 أيام",
    },
  ];

  const statusStyle = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const statusLabel = {
    pending: "قيد الانتظار",
    accepted: "مقبول",
    completed: "مكتمل",
  };

  const services = [
    {
      title: "أقرب الأطباء",
      desc: "ابحث عن أطباء متخصصين في الإعاقة الحركية قرب موقعك",
      icon: <Stethoscope size={26} />,
      to: "/disabled/doctors",
      color: "from-teal-600 to-teal-700",
      iconBg: "bg-teal-50 text-teal-700",
    },
    {
      title: "طلب متطوع",
      desc: "اطلب مساعدة فورية أو مجدولة من متطوع موثوق",
      icon: <HandHeart size={26} />,
      to: "/disabled/request-help",
      color: "from-emerald-600 to-emerald-700",
      iconBg: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "المحادثات",
      desc: "تواصل مع المتطوع بعد قبول طلب المساعدة",
      icon: <MessageCircle size={26} />,
      to: "/disabled/messages",
      color: "from-cyan-600 to-cyan-700",
      iconBg: "bg-cyan-50 text-cyan-700",
    },
  ];

  return (
    <div className='min-h-screen bg-stone-50' dir='rtl'>
      {/* Top Bar */}
      <header className='bg-white border-b border-stone-200 sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
          <div>
            <Link to='/' className='text-xl font-bold text-teal-800'>
              Easy<span className='text-teal-500'>Move</span>
            </Link>
          </div>
          <div className='flex items-center gap-3'>
            <button className='relative p-2 rounded-xl hover:bg-stone-100 text-slate-600 transition-colors'>
              <Bell size={20} />
              <span className='absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full'></span>
            </button>
            <div className='w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm'>
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8'>
        {/* Welcome */}
        <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-8 md:p-10 shadow-xl'>
          <div className='absolute -top-16 -left-16 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 right-0 w-40 h-40 bg-emerald-400/15 rounded-full blur-2xl'></div>

          <div className='relative'>
            <p className='text-teal-100 text-sm mb-2'>مرحباً بك مجدداً 👋</p>
            <h1 className='text-3xl md:text-4xl font-bold mb-3'>
              أهلاً، {userName}
            </h1>
            <p className='text-teal-100/90 max-w-xl leading-relaxed'>
              من هنا يمكنك طلب المساعدة، متابعة طلباتك، والوصول لأقرب الأطباء
              المتخصصين بسهولة.
            </p>
          </div>
        </section>

        {/* Stats */}
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
              label: "رسائل جديدة",
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

        {/* Services */}
        <section>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold text-slate-900'>الخدمات</h2>
          </div>

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

        {/* Recent Requests */}
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

          <div className='divide-y divide-stone-100'>
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className='px-6 py-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors'
              >
                <div className='min-w-0'>
                  <p className='font-semibold text-slate-900 truncate'>
                    {req.title}
                  </p>
                  <p className='text-sm text-slate-500 mt-0.5 flex items-center gap-1'>
                    <MapPin size={14} />
                    {req.date}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${statusStyle[req.status]}`}
                >
                  {statusLabel[req.status]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Tip */}
        <section className='rounded-2xl bg-teal-50 border border-teal-100 p-5 flex items-start gap-3'>
          <div className='w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0'>
            <HandHeart size={20} />
          </div>
          <div>
            <h3 className='font-bold text-teal-900 mb-1'>نصيحة سريعة</h3>
            <p className='text-sm text-teal-800/90 leading-relaxed'>
              عند قبول المتطوع لطلبك، سيظهر زر التواصل مباشرة من صفحة الطلبات
              لتسهيل التنسيق بينكما.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DisabledDashboard;
