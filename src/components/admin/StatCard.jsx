const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "bg-teal-50 text-teal-600",
}) => (
  <div className='bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-lg'>
    <div className='flex items-center justify-between mb-3'>
      <span className='text-sm text-slate-500'>{label}</span>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        {Icon ? <Icon size={18} /> : null}
      </div>
    </div>
    <p className='text-3xl font-bold text-slate-900'>{value}</p>
  </div>
);

export default StatCard;
