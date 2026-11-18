import { Clock, ClipboardList, MessageCircle } from "lucide-react";
// مكون بطاقات الإحصائيات
const StatsCards = ({ stats }) => {
  const items = [
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
  ];

  return (
    // استخدام map لعرض بطاقات الإحصائيات
    <section className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {items.map((item) => (
        <div
          key={item.label}
          className='bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-center justify-between'
        >
          <div>
            <p className='text-slate-500 text-sm mb-1'>{item.label}</p>
            <p className='text-2xl font-bold text-slate-900'>{item.value}</p>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.tone}`}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </section>
  );
};

export default StatsCards;
