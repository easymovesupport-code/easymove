import { Link } from "react-router-dom";
import { CalendarDays, MessageCircle, Star, Eye } from "lucide-react";
import {
  formatDate,
  formatTime,
  getDayName,
} from "../../utils/volunteerHelpers";

const themes = {
  suitable: {
    num: "bg-amber-50 text-amber-700 border-amber-100",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    badgeText: "قيد الانتظار",
  },
  active: {
    num: "bg-emerald-50 text-emerald-700 border-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeText: "مقبول",
  },
  completed: {
    num: "bg-slate-100 text-slate-600 border-slate-200",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    badgeText: "مكتمل",
  },
};
// مكوّن لعرض بطاقة الطلب للمتطوع، مع اختلاف العرض حسب نوع الطلب (مناسب، قيد التنفيذ، مكتمل)
const RequestCard = ({
  req,
  index,
  type = "suitable",
  actionLoading,
  onComplete,
  hasNewMessage = false,
}) => {
  const theme = themes[type] || themes.suitable;

  return (
    <div className='bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3 min-w-0'>
          <span
            className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold ${theme.num}`}
          >
            {index + 1}
          </span>
          <div>
            <h3 className='font-bold text-slate-900 text-base leading-snug'>
              {req.title}
            </h3>
            <p className='text-sm text-slate-500 mt-1'>
              {req.help_type}
              {req.owner?.name ? ` • ${req.owner.name}` : ""}
              {req.owner?.city ? ` • ${req.owner.city}` : ""}
              {type !== "suitable" && (
                <>
                  {" • "}
                  {formatDate(req.request_date)} •{" "}
                  {formatTime(req.request_time)}
                </>
              )}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${theme.badge}`}
        >
          {theme.badgeText}
        </span>
      </div>

      {type === "suitable" && (
        <div className='flex flex-wrap gap-2 mt-3'>
          <span className='inline-flex items-center gap-1.5 text-xs bg-stone-50 text-slate-700 border border-stone-200 px-2.5 py-1 rounded-lg'>
            <CalendarDays size={13} className='text-teal-600' />
            {getDayName(req.request_date)}
          </span>
          <span className='text-xs bg-stone-50 text-slate-700 border border-stone-200 px-2.5 py-1 rounded-lg'>
            {formatDate(req.request_date)}
          </span>
          <span className='text-xs bg-stone-50 text-slate-700 border border-stone-200 px-2.5 py-1 rounded-lg'>
            الوقت: {formatTime(req.request_time)}
          </span>
        </div>
      )}

      {type === "completed" && (
        <div className='mt-3'>
          {req.rating ? (
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-1 text-amber-500'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < req.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }
                  />
                ))}
                <span className='text-slate-600 text-xs ms-1'>
                  ({req.rating}/5)
                </span>
              </div>
              {req.rating_comment && (
                <p className='text-xs text-slate-500 bg-stone-50 border border-stone-100 rounded-lg px-2 py-1.5 max-w-md'>
                  {req.rating_comment}
                </p>
              )}
            </div>
          ) : (
            <p className='text-xs text-slate-400'>لا يوجد تقييم بعد</p>
          )}
        </div>
      )}

      {type === "suitable" && (
        <div className='mt-5 pt-4 border-t border-stone-100'>
          <Link
            to={`/volunteer/request/${req.id}`}
            className='inline-flex items-center justify-center bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-xl'
          >
            عرض التفاصيل
          </Link>
        </div>
      )}

      {/* 3 أزرار: تفاصيل + محادثة + إكمال */}
      {type === "active" && (
        <div className='mt-5 pt-4 border-t border-stone-100 flex flex-wrap gap-2'>
          <Link
            to={`/volunteer/request/${req.id}`}
            className='inline-flex items-center gap-1.5 bg-white border border-stone-200 hover:border-teal-300 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl'
          >
            <Eye size={15} />
            تفاصيل الطلب
          </Link>

          <Link
            to={`/volunteer/chat/${req.id}`}
            className='relative inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3 py-2 rounded-xl'
          >
            <MessageCircle size={15} />
            محادثة
            {hasNewMessage && (
              <span className='absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white'>
                جديد
              </span>
            )}
          </Link>

          <button
            type='button'
            disabled={actionLoading === req.id}
            onClick={() => onComplete?.(req.id)}
            className='inline-flex items-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-xl'
          >
            إكمال الطلب
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
