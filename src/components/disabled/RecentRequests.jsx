import { Link } from "react-router-dom";
import {
  Clock,
  MessageCircle,
  UserRound,
  Hourglass,
  CheckCircle2,
  Pencil,
  X,
} from "lucide-react";
// تنسيق الوقت من صيغة 24 ساعة إلى صيغة 12 ساعة مع تحديد الفترة (ص/م)
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
// تنسيق نطاق الوقت للطلب، سواء كان من وقت محدد إلى وقت محدد أو وقت محدد فقط
const formatTimeRange = (req) => {
  if (req.time_from && req.time_to) {
    return `${formatTime(req.time_from)} – ${formatTime(req.time_to)}`;
  }
  return formatTime(req.request_time);
};
// تنسيق التاريخ لعرض اليوم والشهر والسنة باللغة العربية
const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
// تنسيق اليوم لعرض اسم اليوم باللغة العربية
const formatDay = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-SA", { weekday: "long" });
};

const primaryBtn =
  "inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all";

const dangerBtn =
  "inline-flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60";

const successBtn =
  "inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all";

const RequestCard = ({
  req,
  type,
  actionLoading,
  onRejectVolunteer,
  onComplete,
  onCancelRequest,
}) => {
  return (
    <div className='bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow'>
      {/* العنوان + الرقم + الحالة */}
      <div className='flex items-start justify-between gap-3 mb-3'>
        <div className='flex items-start gap-3 min-w-0'>
          {/* رقم الطلب */}
          <span className='shrink-0 w-8 h-8 rounded-full bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center text-sm font-bold'>
            {req.displayNumber}
          </span>

          {/* عنوان الطلب */}
          <h3 className='font-bold text-slate-900 text-base leading-snug'>
            {req.title}
          </h3>
        </div>

        {/* حالة الطلب */}
        <span
          className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            type === "pending"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {type === "pending" ? "قيد الانتظار" : "مقبول"}
        </span>
      </div>

      {/* الوقت والتاريخ */}
      <div className='flex flex-wrap gap-2 mt-3'>
        <span className='inline-flex items-center gap-1.5 text-xs bg-stone-50 text-slate-700 border border-stone-200 px-2.5 py-1 rounded-lg'>
          <Clock size={13} className='text-teal-600' />
          {formatTimeRange(req)}
        </span>
        <span className='text-xs bg-stone-50 text-slate-700 border border-stone-200 px-2.5 py-1 rounded-lg'>
          {formatDay(req.request_date)}
        </span>
        <span className='text-xs bg-stone-50 text-slate-700 border border-stone-200 px-2.5 py-1 rounded-lg'>
          {formatDate(req.request_date)}
        </span>
      </div>

      {/* الأزرار */}
      <div className='mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2'>
        {type === "pending" && (
          <>
            <Link
              to={`/disabled/edit-request/${req.id}`}
              className={primaryBtn}
            >
              <Pencil size={15} />
              تعديل الطلب
            </Link>
            <button
              type='button'
              disabled={actionLoading === req.id}
              onClick={() => onCancelRequest(req.id)}
              className={dangerBtn}
            >
              <X size={15} />
              إلغاء الطلب
            </button>
          </>
        )}

        {type === "accepted" && (
          <>
            <Link to={`/disabled/chat/${req.id}`} className={primaryBtn}>
              <MessageCircle size={15} />
              المحادثة
            </Link>
            <Link
              to={`/disabled/volunteer-info/${req.id}`}
              className={primaryBtn}
            >
              <UserRound size={15} />
              نبذة عن المتطوع
            </Link>
            <button
              type='button'
              disabled={actionLoading === req.id}
              onClick={() => onRejectVolunteer(req.id, req.volunteer_id)}
              className={dangerBtn}
            >
              تغيير المتطوع
            </button>
            <button
              type='button'
              onClick={() => onComplete(req)}
              className={successBtn}
            >
              تمّت المساعدة
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className='bg-stone-50 border border-dashed border-stone-200 rounded-2xl px-4 py-10 text-center text-sm text-slate-400'>
    {text}
  </div>
);

const RecentRequests = ({
  recentRequests,
  actionLoading,
  onRejectVolunteer,
  onComplete,
  onCancelRequest,
}) => {
  // تصفية الطلبات حسب حالتها (قيد الانتظار أو مقبولة) وإضافة رقم عرض لكل طلب
  // هنا الطلبات التي في حالة "pending" يتم ترقيمها من 1 إلى N، والطلبات التي في حالة "accepted" يتم ترقيمها بشكل منفصل من 1 إلى M
  const pending = recentRequests
    .filter((r) => r.status === "pending")
    .map((r, index) => ({ ...r, displayNumber: index + 1 }));
  // هنا الطلبات التي في حالة "accepted" يتم ترقيمها من 1 إلى M، حيث M هو عدد الطلبات المقبولة
  const accepted = recentRequests
    .filter((r) => r.status === "accepted")
    .map((r, index) => ({ ...r, displayNumber: index + 1 }));

  return (
    <section className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-slate-900'>الطلبات</h2>
        <span className='text-xs text-slate-400'>
          {pending.length + accepted.length} نشطة
        </span>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {/* قيد الانتظار */}
        <div className='bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-stone-100 bg-amber-50/50 flex items-center gap-2'>
            <div className='w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center'>
              <Hourglass size={18} />
            </div>
            <div>
              <h3 className='font-bold text-slate-900 text-sm'>قيد الانتظار</h3>
              <p className='text-xs text-slate-500'>
                بانتظار قبول متطوع ({pending.length})
              </p>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            {pending.length === 0 ? (
              <EmptyState text='لا توجد طلبات قيد الانتظار' />
            ) : (
              pending.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  type='pending'
                  actionLoading={actionLoading}
                  onRejectVolunteer={onRejectVolunteer}
                  onComplete={onComplete}
                  onCancelRequest={onCancelRequest}
                />
              ))
            )}
          </div>
        </div>

        {/* مقبولة */}
        <div className='bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-stone-100 bg-emerald-50/50 flex items-center gap-2'>
            <div className='w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center'>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className='font-bold text-slate-900 text-sm'>
                مقبولة من المتطوع
              </h3>
              <p className='text-xs text-slate-500'>
                جاهزة للمتابعة ({accepted.length})
              </p>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            {accepted.length === 0 ? (
              <EmptyState text='لا توجد طلبات مقبولة حالياً' />
            ) : (
              accepted.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  type='accepted'
                  actionLoading={actionLoading}
                  onRejectVolunteer={onRejectVolunteer}
                  onComplete={onComplete}
                  onCancelRequest={onCancelRequest}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentRequests;
