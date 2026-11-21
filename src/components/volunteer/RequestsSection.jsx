import RequestCard from "./RequestCard";

const headerThemes = {
  suitable: {
    bg: "bg-amber-50/50",
    iconBg: "bg-amber-100 text-amber-700",
  },
  active: {
    bg: "bg-emerald-50/50",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  completed: {
    bg: "bg-slate-100/70",
    iconBg: "bg-slate-200 text-slate-600",
  },
};
// مكوّن لعرض قسم الطلبات للمتطوع، مع اختلاف العرض حسب نوع الطلب (مناسب، قيد التنفيذ، مكتمل)
const RequestsSection = ({
  title,
  subtitle,
  icon: Icon,
  type,
  requests,
  emptyText,
  actionLoading,
  onComplete,
  unreadMap = {},
}) => {
  const theme = headerThemes[type] || headerThemes.suitable;

  return (
    <section className='bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden'>
      <div
        className={`px-5 py-4 border-b border-stone-100 flex items-center gap-2 ${theme.bg}`}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme.iconBg}`}
        >
          <Icon size={18} />
        </div>
        <div>
          <h3 className='font-bold text-slate-900 text-sm'>{title}</h3>
          <p className='text-xs text-slate-500'>
            {subtitle} ({requests.length})
          </p>
        </div>
      </div>

      <div className='p-4 space-y-3'>
        {requests.length === 0 ? (
          <div className='bg-stone-50 border border-dashed border-stone-200 rounded-2xl px-4 py-10 text-center text-sm text-slate-400'>
            {emptyText}
          </div>
        ) : (
          requests.map((req, index) => (
            <RequestCard
              key={req.id}
              req={req}
              index={index}
              type={type}
              actionLoading={actionLoading}
              onComplete={onComplete}
              hasNewMessage={!!unreadMap[req.id]}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default RequestsSection;
