import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  UserPlus,
  HandHeart,
  MessageCircle,
  Clock,
  ShieldCheck,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
const StatCard = ({ end, label, icon, barColor, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.4 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const timeout = setTimeout(() => {
      let current = 0;
      const duration = 1500;
      const stepTime = 16;
      const steps = duration / stepTime;
      const increment = end / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, stepTime);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [started, end, delay]);

  return (
    <div
      ref={ref}
      className='group flex overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-default'
    >
      {/* Colored Side */}
      <div
        className={`w-24 md:w-28 ${barColor} flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-500`}
      >
        {icon}
      </div>

      {/* Number Side */}
      <div className='flex-1 px-8 py-6 flex flex-col justify-center'>
        <div className='text-4xl md:text-5xl font-bold tracking-tight text-slate-900'>
          +{count}
        </div>
        <div className='text-slate-500 mt-1 text-base group-hover:text-slate-700 transition-colors'>
          {label}
        </div>
      </div>
    </div>
  );
};
const Home = () => {
  return (
    <div className='bg-white min-h-screen'>
      {/* Hero Section */}
      <section className='relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white'>
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-20 -left-20 w-[420px] h-[420px] bg-teal-400/25 rounded-full blur-3xl animate-float-slow'></div>
          <div className='absolute top-1/4 -right-16 w-[350px] h-[350px] bg-emerald-400/20 rounded-full blur-3xl animate-float-reverse'></div>
          <div className='absolute bottom-10 left-1/3 w-[280px] h-[280px] bg-cyan-300/15 rounded-full blur-3xl animate-float'></div>
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-24 md:py-32 text-center'>
          <div className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 text-sm'>
            <span className='w-2 h-2 bg-emerald-300 rounded-full animate-pulse'></span>
            منصة موثوقة لذوي الإعاقة الحركية
          </div>

          <h1 className='text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight'>
            مساعدة أسهل
            <span className='block text-teal-200 mt-2'>
              لذوي الإعاقة الحركية
            </span>
          </h1>

          <p className='text-lg md:text-xl text-teal-100/90 max-w-3xl mx-auto mb-12 leading-relaxed'>
            منصة Easy Move تربط الأشخاص ذوي الإعاقة الحركية بمتطوعين موثوقين،
            وتوفر معلومات عن الأماكن والأطباء المناسبين لتسهيل حياتهم اليومية.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              to='/register'
              className='inline-flex items-center justify-center gap-2 bg-white text-teal-800 hover:bg-teal-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1'
            >
              طلب مساعدة الآن
              <ArrowLeft size={20} />
            </Link>
            <Link
              to='/register'
              className='inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/25 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300'
            >
              انضم كمتطوع
            </Link>
          </div>
        </div>
      </section>

      {/* Big Stats Section */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center'>
            {/* Left - Text */}
            <div>
              <h2 className='text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6'>
                أرقام تعكس
                <span className='block text-teal-700'>أثر حقيقي</span>
              </h2>
              <p className='text-lg text-slate-600 leading-relaxed mb-8'>
                كل رقم يمثل شخصاً وجد مساعدة، أو متطوعاً صنع فرقاً. نبني مجتمعاً
                يعتمد على الثقة والدعم المتبادل.
              </p>
              <Link
                to='/about'
                className='inline-flex items-center gap-2 text-teal-700 font-semibold hover:gap-3 transition-all duration-300'
              >
                تعرف أكثر علينا
                <ArrowLeft size={18} />
              </Link>
            </div>

            {/* Right - Animated Stats */}
            <div className='space-y-5'>
              <StatCard
                end={500}
                label='مستخدم نشط'
                icon={<Users size={28} />}
                barColor='bg-teal-600'
                delay={0}
              />
              <StatCard
                end={200}
                label='متطوع موثوق'
                icon={<HandHeart size={28} />}
                barColor='bg-emerald-600'
                delay={200}
              />
              <StatCard
                end={1000}
                label='طلب مساعدة'
                icon={<CheckCircle2 size={28} />}
                barColor='bg-cyan-600'
                delay={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className='py-24 bg-stone-50'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-5xl font-bold text-slate-900 mb-4'>
              كيف تعمل المنصة؟
            </h2>
            <p className='text-slate-600 text-lg max-w-2xl mx-auto'>
              ثلاث خطوات بسيطة تفصلك عن الحصول على المساعدة أو تقديمها
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[
              {
                icon: <UserPlus size={28} />,
                title: "سجّل حسابك",
                desc: "قم بإنشاء حساب بسهولة سواء كنت من ذوي الإعاقة أو متطوعًا.",
                color: "from-teal-500 to-teal-700",
              },
              {
                icon: <HandHeart size={28} />,
                title: "اطلب المساعدة أو قدمها",
                desc: "يمكن لذوي الإعاقة طلب مساعدة فورية أو مجدولة، ويمكن للمتطوعين قبول الطلبات.",
                color: "from-emerald-500 to-emerald-700",
              },
              {
                icon: <MessageCircle size={28} />,
                title: "تواصل بسهولة",
                desc: "بعد قبول الطلب، يتم التواصل بين الطرفين لإتمام المساعدة بأمان.",
                color: "from-cyan-500 to-cyan-700",
              },
            ].map((step, i) => (
              <div
                key={i}
                className='group relative bg-white p-8 rounded-3xl shadow-sm border border-stone-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500'
              >
                <div className='absolute top-5 left-5 text-7xl font-bold text-stone-100 group-hover:text-teal-50 transition-colors select-none'>
                  {i + 1}
                </div>
                <div
                  className={`relative w-16 h-16 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {step.icon}
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3'>
                  {step.title}
                </h3>
                <p className='text-slate-600 leading-relaxed'>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-5xl font-bold text-slate-900 mb-4'>
              لماذا Easy Move؟
            </h2>
            <p className='text-slate-600 text-lg max-w-2xl mx-auto'>
              صممنا المنصة لتكون بسيطة وموثوقة وسهلة للجميع
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[
              {
                icon: <Clock size={26} />,
                title: "طلب فوري أو مجدول",
                desc: "اطلب المساعدة في أي وقت يناسبك",
                color: "text-teal-600",
                hover: "hover:bg-teal-50 hover:border-teal-100",
              },
              {
                icon: <ShieldCheck size={26} />,
                title: "متطوعون موثوقون",
                desc: "يتم التحقق من جميع المتطوعين",
                color: "text-emerald-600",
                hover: "hover:bg-emerald-50 hover:border-emerald-100",
              },
              {
                icon: <MapPin size={26} />,
                title: "أماكن وأطباء مناسبة",
                desc: "ابحث عن الأماكن المهيأة لذوي الإعاقة",
                color: "text-cyan-600",
                hover: "hover:bg-cyan-50 hover:border-cyan-100",
              },
              {
                icon: <Users size={26} />,
                title: "واجهة سهلة للجميع",
                desc: "تصميم بسيط وواضح للجميع",
                color: "text-amber-600",
                hover: "hover:bg-amber-50 hover:border-amber-100",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`group p-8 rounded-3xl bg-stone-50 border border-stone-100 transition-all duration-300 ${feature.hover}`}
              >
                <div
                  className={`w-14 h-14 bg-white ${feature.color} rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:shadow-md transition-shadow`}
                >
                  {feature.icon}
                </div>
                <h3 className='font-bold text-slate-900 mb-2 text-lg'>
                  {feature.title}
                </h3>
                <p className='text-slate-600 text-sm leading-relaxed'>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className='py-16 bg-slate-900 text-white'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            {[
              "واجهة سهلة الاستخدام لذوي الإعاقة",
              "حماية كاملة لبيانات المستخدمين",
              "دعم فني متواصل على مدار الساعة",
            ].map((item, i) => (
              <div key={i} className='flex items-center justify-center gap-3'>
                <CheckCircle2 className='text-teal-400 shrink-0' size={24} />
                <span className='text-lg text-slate-200'>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className='py-24 bg-stone-50'>
        <div className='max-w-5xl mx-auto px-6'>
          <div className='relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-12 md:p-16 text-center shadow-2xl'>
            <div className='absolute top-0 left-0 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2'></div>
            <div className='absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3'></div>

            <div className='relative'>
              <h2 className='text-3xl md:text-5xl font-bold text-white mb-4'>
                ابدأ رحلتك معنا الآن
              </h2>
              <p className='text-teal-100 text-lg mb-8 max-w-2xl mx-auto'>
                انضم إلى مجتمع Easy Move وكن جزءًا من حلول حقيقية تساعد الآخرين
                وتُحدث فرقًا.
              </p>
              <Link
                to='/register'
                className='inline-flex items-center gap-2 bg-white hover:bg-teal-50 text-teal-800 px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1'
              >
                إنشاء حساب
                <ArrowLeft size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
