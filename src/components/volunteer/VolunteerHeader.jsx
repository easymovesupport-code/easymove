import { Link } from "react-router-dom";
import { Bell, LogOut, UserRound } from "lucide-react";

const formatNotifTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const VolunteerHeader = ({
  user,
  onLogout,
  notifications = [],
  notifOpen,
  setNotifOpen,
}) => {
  return (
    <header className='bg-white/90 backdrop-blur border-b border-teal-100 sticky top-0 z-40'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.name}
              className='w-11 h-11 rounded-full object-cover border-2 border-teal-200 shadow-md'
            />
          ) : (
            <div className='w-11 h-11 rounded-full bg-gradient-to-l from-teal-600 to-cyan-600 text-white flex items-center justify-center font-bold shadow-md'>
              {(user?.name || "م").charAt(0)}
            </div>
          )}
          <div>
            <p className='font-bold text-slate-900 text-sm'>{user?.name}</p>
            <p className='text-xs text-teal-700'>متطوع</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* الإشعارات */}
          <div className='relative'>
            <button
              type='button'
              onClick={() => setNotifOpen((v) => !v)}
              className='relative p-2 rounded-xl hover:bg-teal-50 text-slate-600 hover:text-teal-700'
              title='الإشعارات'
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className='absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white' />
              )}
            </button>

            {notifOpen && (
              <div className='absolute left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-stone-200 rounded-2xl shadow-xl z-50'>
                <div className='px-4 py-3 border-b border-stone-100 flex justify-between items-center'>
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
                        <p className='text-xs text-slate-500 line-clamp-2 mt-0.5'>
                          {n.body}
                        </p>
                        <p className='text-[11px] text-slate-400 mt-1'>
                          {formatNotifTime(n.time)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            to='/volunteer/profile'
            className='p-2 rounded-xl hover:bg-teal-50 text-slate-600 hover:text-teal-700'
            title='الملف الشخصي'
          >
            <UserRound size={20} />
          </Link>
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

export default VolunteerHeader;
