import { Link } from "react-router-dom";
import {
  UserPlus,
  HandHeart,
  MessageCircle,
  Clock,
  ShieldCheck,
  MapPin,
  Users,
} from "lucide-react";

const Home = () => {
  return (
    <div className='bg-slate-50 min-h-screen'>
      {/* Hero Section */}
      <section className='relative bg-gradient-to-b from-blue-50 to-white overflow-hidden'>
        <div className='max-w-7xl mx-auto px-6 py-24 md:py-32 text-center'>
          <h1 className='text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight'>
            مساعدة أسهل
            <span className='block text-blue-600'>لذوي الإعاقة الحركية</span>
          </h1>

          <p className='text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed'>
            منصة Easy Move تربط الأشخاص ذوي الإعاقة الحركية بمتطوعين موثوقين،
            وتوفر معلومات عن الأماكن والأطباء المناسبين لتسهيل حياتهم اليومية.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              to='/register'
              className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
            >
              طلب مساعدة الآن
            </Link>
            <Link
              to='/register'
              className='bg-white hover:bg-slate-50 text-blue-600 border-2 border-blue-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-md'
            >
              انضم كمتطوع
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className='py-24'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
              كيف تعمل المنصة؟
            </h2>
            <p className='text-slate-600 text-lg max-w-2xl mx-auto'>
              ثلاث خطوات بسيطة تفصلك عن الحصول على المساعدة أو تقديمها
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Step 1 */}
            <div className='group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300'>
                <UserPlus size={28} />
              </div>
              <h3 className='text-xl font-bold text-slate-900 mb-3'>
                سجّل حسابك
              </h3>
              <p className='text-slate-600 leading-relaxed'>
                قم بإنشاء حساب بسهولة سواء كنت من ذوي الإعاقة أو متطوعًا.
              </p>
            </div>

            {/* Step 2 */}
            <div className='group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300'>
                <HandHeart size={28} />
              </div>
              <h3 className='text-xl font-bold text-slate-900 mb-3'>
                اطلب المساعدة أو قدمها
              </h3>
              <p className='text-slate-600 leading-relaxed'>
                يمكن لذوي الإعاقة طلب مساعدة فورية أو مجدولة، ويمكن للمتطوعين
                قبول الطلبات.
              </p>
            </div>

            {/* Step 3 */}
            <div className='group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'>
              <div className='w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300'>
                <MessageCircle size={28} />
              </div>
              <h3 className='text-xl font-bold text-slate-900 mb-3'>
                تواصل بسهولة
              </h3>
              <p className='text-slate-600 leading-relaxed'>
                بعد قبول الطلب، يتم التواصل بين الطرفين لإتمام المساعدة بأمان.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>
              لماذا Easy Move؟
            </h2>
            <p className='text-slate-600 text-lg max-w-2xl mx-auto'>
              صممنا المنصة لتكون بسيطة وموثوقة وسهلة للجميع
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='group p-8 rounded-3xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 transition-all duration-300'>
              <div className='w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:shadow-md transition-shadow'>
                <Clock size={26} />
              </div>
              <h3 className='font-bold text-slate-900 mb-2 text-lg'>
                طلب فوري أو مجدول
              </h3>
              <p className='text-slate-600 text-sm leading-relaxed'>
                اطلب المساعدة في أي وقت يناسبك
              </p>
            </div>

            <div className='group p-8 rounded-3xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 transition-all duration-300'>
              <div className='w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:shadow-md transition-shadow'>
                <ShieldCheck size={26} />
              </div>
              <h3 className='font-bold text-slate-900 mb-2 text-lg'>
                متطوعون موثوقون
              </h3>
              <p className='text-slate-600 text-sm leading-relaxed'>
                يتم التحقق من جميع المتطوعين
              </p>
            </div>

            <div className='group p-8 rounded-3xl bg-slate-50 hover:bg-violet-50 border border-slate-100 hover:border-violet-100 transition-all duration-300'>
              <div className='w-14 h-14 bg-white text-violet-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:shadow-md transition-shadow'>
                <MapPin size={26} />
              </div>
              <h3 className='font-bold text-slate-900 mb-2 text-lg'>
                أماكن وأطباء مناسبة
              </h3>
              <p className='text-slate-600 text-sm leading-relaxed'>
                ابحث عن الأماكن المهيأة لذوي الإعاقة
              </p>
            </div>

            <div className='group p-8 rounded-3xl bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-100 transition-all duration-300'>
              <div className='w-14 h-14 bg-white text-orange-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:shadow-md transition-shadow'>
                <Users size={26} />
              </div>
              <h3 className='font-bold text-slate-900 mb-2 text-lg'>
                واجهة سهلة للجميع
              </h3>
              <p className='text-slate-600 text-sm leading-relaxed'>
                تصميم بسيط وواضح للجميع
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-24'>
        <div className='max-w-5xl mx-auto px-6'>
          <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 md:p-16 text-center shadow-xl'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              ابدأ الآن
            </h2>
            <p className='text-blue-100 text-lg mb-8 max-w-2xl mx-auto'>
              انضم إلى مجتمع Easy Move وكن جزءًا من حلول حقيقية تساعد الآخرين.
            </p>
            <Link
              to='/register'
              className='inline-block bg-white hover:bg-blue-50 text-blue-700 px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
