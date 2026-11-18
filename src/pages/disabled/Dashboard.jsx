import DashboardHeader from "../../components/disabled/DashboardHeader";
import StatsCards from "../../components/disabled/StatsCards";
import ServicesGrid from "../../components/disabled/ServicesGrid";
import RecentRequests from "../../components/disabled/RecentRequests";
import RatingModal from "../../components/disabled/RatingModal";
import { useDisabledDashboard } from "../../hooks/useDisabledDashboard";

const DisabledDashboard = () => {
  // استخدام الـ hook المخصص لإدارة حالة لوحة التحكم للمستخدم ذوي الإعاقة
  const {
    userName,
    notifOpen,
    setNotifOpen,
    loading,
    stats,
    recentRequests,
    notifications,
    ratingReq,
    setRatingReq,
    rating,
    setRating,
    ratingComment,
    setRatingComment,
    actionLoading,
    handleLogout,
    rejectVolunteer,
    openCompleteModal,
    submitComplete,
    navigate,
  } = useDisabledDashboard();

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
      <DashboardHeader
        userName={userName}
        notifications={notifications}
        notifOpen={notifOpen}
        setNotifOpen={setNotifOpen}
        onLogout={handleLogout}
        onProfile={() => navigate("/disabled/profile")}
      />

      <main className='max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8'>
        <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white p-8 md:p-10 shadow-xl'>
          <div className='absolute -top-16 -left-16 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl' />
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

        <StatsCards stats={stats} />
        <ServicesGrid />
        <RecentRequests
          recentRequests={recentRequests}
          actionLoading={actionLoading}
          onRejectVolunteer={rejectVolunteer}
          onComplete={openCompleteModal}
        />
      </main>

      <RatingModal
        ratingReq={ratingReq}
        rating={rating}
        setRating={setRating}
        ratingComment={ratingComment}
        setRatingComment={setRatingComment}
        actionLoading={actionLoading}
        onSubmit={submitComplete}
        onClose={() => setRatingReq(null)}
      />
    </div>
  );
};

export default DisabledDashboard;
