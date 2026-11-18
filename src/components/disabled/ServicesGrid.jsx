import { Link } from "react-router-dom";
import { Stethoscope, HandHeart, ChevronLeft } from "lucide-react";
import doctorsImg from "../../assets/doctors.jpg";
import volunteerImg from "../../assets/volunteer.jpg";

// قائمة الخدمات المتاحة
const services = [
  {
    title: "أقرب الأطباء",
    desc: "ابحث عن أطباء ومراكز متخصصة في الإعاقة الحركية قرب موقعك",
    icon: <Stethoscope size={26} />,
    to: "/disabled/doctors",
    image: doctorsImg,
  },
  {
    title: "طلب متطوع",
    desc: "اطلب مساعدة من متطوع موثوق في التنقل أو التسوق أو المواعيد",
    icon: <HandHeart size={26} />,
    to: "/disabled/request-help",
    image: volunteerImg,
  },
];

const ServicesGrid = () => (
  <section>
    <h2 className='text-xl font-bold text-slate-900 mb-4'>الخدمات</h2>
    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
      {/* عرض الخدمات باستخدام map */}
      {services.map((service) => (
        <Link
          key={service.title}
          to={service.to}
          className='group relative overflow-hidden rounded-3xl min-h-[220px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
        >
          <img
            src={service.image}
            alt={service.title}
            className='absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/65 to-slate-900/25' />
          <div className='relative h-full p-6 flex flex-col justify-end text-white'>
            <div className='w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-4'>
              {service.icon}
            </div>
            <h3 className='text-xl font-bold mb-2'>{service.title}</h3>
            <p className='text-white/90 text-sm leading-relaxed mb-4'>
              {service.desc}
            </p>
            <div className='inline-flex items-center gap-1 text-teal-200 font-semibold text-sm'>
              ابدأ الآن
              <ChevronLeft
                size={16}
                className='group-hover:-translate-x-1 transition-transform'
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default ServicesGrid;
