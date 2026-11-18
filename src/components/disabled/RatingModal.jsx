const RatingModal = ({
  ratingReq,
  rating,
  setRating,
  ratingComment,
  setRatingComment,
  actionLoading,
  onSubmit,
  onClose,
}) => {
  if (!ratingReq) return null;

  return (
    <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl p-6 w-full max-w-md text-right'>
        <h3 className='text-lg font-bold mb-2'>تقييم المتطوع</h3>
        <p className='text-sm text-slate-500 mb-4'>
          بعد إكمال المساعدة، قيّمي تجربة المتطوع
        </p>
        {/* نجوم التقييم */}
        <div className='flex gap-2 justify-center mb-4'>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type='button'
              onClick={() => setRating(n)}
              className={`w-10 h-10 rounded-full font-bold ${
                rating >= n
                  ? "bg-amber-400 text-white"
                  : "bg-stone-100 text-slate-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {/*كتابة تعليق عن المتطوع*/}
        <textarea
          value={ratingComment}
          onChange={(e) => setRatingComment(e.target.value)}
          rows={3}
          className='w-full border border-stone-200 rounded-xl px-3 py-2 text-sm mb-4 text-right'
          placeholder='تعليق اختياري...'
        />

        <div className='flex gap-2'>
          <button
            type='button'
            onClick={onSubmit}
            disabled={actionLoading === ratingReq.id}
            className='flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60'
          >
            تأكيد الإكمال
          </button>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 border border-stone-200 py-2.5 rounded-xl'
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
