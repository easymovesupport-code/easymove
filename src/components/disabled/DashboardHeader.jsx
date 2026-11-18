import { Link } from "react-router-dom";
import { Bell, LogOut, UserRound } from "lucide-react";
// وظيفة لتنسيق وقت الإشعار
const formatNotifTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
// مكون رأس لوحة التحكم
const DashboardHeader = ({
  userName,
  notifications,
  notifOpen,
  setNotifOpen,
  onLogout,
  onProfile,
}) => {
  return (
    <header className='bg-white/90 backdrop-blur border-b border-stone-200 sticky top-0 z-40'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-11 h-11 rounded-full bg-gradient-to-l from-teal-600 to-cyan-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-700/20'>
            {(userName || "م").charAt(0)}
          </div>
          <p className='font-bold text-slate-900 text-sm'>{userName}</p>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative'>
            <button
              type='button'
              onClick={() => setNotifOpen((v) => !v)}
              className='relative p-2 rounded-xl hover:bg-teal-50 text-slate-600 hover:text-teal-700'
              title='التنبيهات'
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className='absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full' />
              )}
            </button>

            {notifOpen && (
              <div className='absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-stone-200 rounded-2xl shadow-xl z-50'>
                <div className='px-4 py-3 border-b border-stone-100 flex justify-between'>
                  <p className='font-bold text-slate-900 text-sm'>التنبيهات</p>
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
                        className='block px-4 py-3 hover:bg-teal-50/50'
                      >
                        <p className='text-sm font-semibold text-slate-900'>
                          {n.title}
                        </p>
                        <p className='text-xs text-slate-500 line-clamp-2'>
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
            onClick={onProfile}
            className='p-2 rounded-xl hover:bg-teal-50 text-slate-600 hover:text-teal-700'
            title='الملف الشخصي'
          >
            <UserRound size={20} />
          </button>

          <button
            type='button'
            onClick={onLogout}
            className='p-2 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600'
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
  );
};

export default DashboardHeader;
