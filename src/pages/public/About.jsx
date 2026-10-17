import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Shield,
  Users,
  Accessibility,
  ArrowLeft,
} from "lucide-react";

const About = () => {
  return (
    <div className='bg-stone-50 min-h-screen'>
      {/* Hero with Image + Teal Overlay */}
      <section className='relative overflow-hidden min-h-[420px] md:min-h-[480px] flex items-center'>
        {/* Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>

        {/* Teal Overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-teal-900/85 via-teal-800/80 to-slate-900/85'></div>

        <div className='relative max-w-7xl mx-auto px-6 py-20 md:py-28 text-center text-white'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4 tracking-tight'>
            من نحن
          </h1>
          <p className='text-lg text-teal-100/90 max-w-2xl mx-auto leading-relaxed'>
            نؤمن بأن التكنولوجيا يمكن أن تكون جسرًا حقيقيًا للتواصل والدعم
            المجتمعي
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-14 items-center'>
            <div>
              <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight'>
                Easy Move
                <span className='block text-teal-700 mt-1'>
                  منصة للدعم الحقيقي
                </span>
              </h2>
              <p className='text-slate-600 text-lg leading-relaxed mb-5'>
                Easy Move هي منصة رقمية تهدف إلى تسهيل حياة الأشخاص ذوي الإعاقة
                الحركية من خلال ربطهم بمتطوعين موثوقين، وتوفير معلومات موثوقة عن
                الأماكن والخدمات المناسبة لهم.
              </p>
              <p className='text-slate-600 text-lg leading-relaxed'>
                صممنا المنصة لتكون بسيطة وسهلة الاستخدام ومتاحة للجميع، مع الحرص
                على الأمان والموثوقية والكرامة في كل تجربة.
              </p>
            </div>

            {/* 4 Points - ألوان جديدة ومتباينة */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-teal-600 text-white rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-md'>
                <Users size={28} />
                <span className='font-semibold text-sm'>مجتمع داعم</span>
              </div>
              <div className='bg-emerald-500 text-white rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-md'>
                <Shield size={28} />
                <span className='font-semibold text-sm'>موثوقية وأمان</span>
              </div>
              <div className='bg-cyan-600 text-white rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-md'>
                <Accessibility size={28} />
                <span className='font-semibold text-sm'>سهولة الوصول</span>
              </div>
              <div className='bg-amber-500 text-white rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-md'>
                <Heart size={28} />
                <span className='font-semibold text-sm'>دعم إنساني</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='bg-stone-50 rounded-3xl p-8 border border-stone-100 hover:shadow-lg transition-shadow duration-300'>
              <div className='w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mb-5'>
                <Eye size={26} />
              </div>
              <h3 className='text-2xl font-bold text-slate-900 mb-3'>رؤيتنا</h3>
              <p className='text-slate-600 leading-relaxed'>
                أن نصبح المنصة الرائدة في المنطقة التي تمكّن ذوي الإعاقة الحركية
                من الحصول على المساعدة بسهولة وكرامة واستقلالية.
              </p>
            </div>

            <div className='bg-stone-50 rounded-3xl p-8 border border-stone-100 hover:shadow-lg transition-shadow duration-300'>
              <div className='w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-5'>
                <Target size={26} />
              </div>
              <h3 className='text-2xl font-bold text-slate-900 mb-3'>
                رسالتنا
              </h3>
              <p className='text-slate-600 leading-relaxed'>
                توفير حلول رقمية عملية تربط بين المحتاجين للمساعدة والمتطوعين،
                مع الحرص على الأمان والموثوقية وسهولة الاستخدام للجميع.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values - تعداد متدرج بالألوان */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-14'>
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-3'>
              قيمنا
            </h2>
            <p className='text-slate-600 text-lg'>
              المبادئ التي نبني عليها كل قرار في المنصة
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              {
                title: "سهولة الوصول",
                desc: "تصميم واضح وبسيط يناسب الجميع",
                color: "bg-teal-600",
                num: "01",
              },
              {
                title: "الثقة والأمان",
                desc: "حماية البيانات والتحقق من المتطوعين",
                color: "bg-emerald-600",
                num: "02",
              },
              {
                title: "الدعم المجتمعي",
                desc: "بناء مجتمع متعاون ومتكافل",
                color: "bg-cyan-600",
                num: "03",
              },
              {
                title: "الاحترام والكرامة",
                desc: "تجربة إنسانية تحفظ كرامة الجميع",
                color: "bg-amber-600",
                num: "04",
              },
            ].map((value, i) => (
              <div
                key={i}
                className='group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
              >
                <div
                  className={`${value.color} px-6 py-4 flex items-center justify-between`}
                >
                  <span className='text-white/90 text-sm font-medium'>
                    القيمة
                  </span>
                  <span className='text-white text-2xl font-bold'>
                    {value.num}
                  </span>
                </div>
                <div className='p-6'>
                  <h3 className='font-bold text-slate-900 text-lg mb-2'>
                    {value.title}
                  </h3>
                  <p className='text-slate-600 text-sm leading-relaxed'>
                    {value.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20'>
        <div className='max-w-4xl mx-auto px-6'>
          <div className='bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-12 text-center shadow-xl'>
            <h2 className='text-3xl font-bold text-white mb-4'>
              انضم إلى مجتمعنا
            </h2>
            <p className='text-teal-100 mb-8 text-lg'>
              كن جزءًا من حلول حقيقية تساعد الآخرين وتُحدث فرقًا
            </p>
            <Link
              to='/register'
              className='inline-flex items-center gap-2 bg-white text-teal-800 hover:bg-teal-50 px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:-translate-y-0.5'
            >
              إنشاء حساب
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
