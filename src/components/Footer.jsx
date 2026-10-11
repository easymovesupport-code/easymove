import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className='bg-slate-900 text-slate-300'>
      <div className='max-w-7xl mx-auto px-6 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
          {/* Logo + Description */}
          <div className='md:col-span-1'>
            <h3 className='text-2xl font-bold text-white mb-4'>
              Easy<span className='text-blue-400'>Move</span>
            </h3>
            <p className='text-slate-400 leading-relaxed text-sm'>
              منصة تربط ذوي الإعاقة الحركية بمتطوعين موثوقين، وتسهل الوصول إلى
              الخدمات والأماكن المناسبة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='text-white font-semibold mb-4'>روابط سريعة</h4>
            <ul className='space-y-3 text-sm'>
              <li>
                <Link to='/' className='hover:text-blue-400 transition-colors'>
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  to='/about'
                  className='hover:text-blue-400 transition-colors'
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className='hover:text-blue-400 transition-colors'
                >
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className='text-white font-semibold mb-4'>خدماتنا</h4>
            <ul className='space-y-3 text-sm text-slate-400'>
              <li>طلب مساعدة</li>
              <li>التطوع</li>
              <li>البحث عن أماكن</li>
              <li>البحث عن أطباء</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className='text-white font-semibold mb-4'>تواصل معنا</h4>
            <ul className='space-y-3 text-sm text-slate-400'>
              <li>support@easymove.com</li>
              <li>+20 123 456 7890</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500'>
          <p>© 2026 Easy Move. جميع الحقوق محفوظة.</p>
          <div className='flex gap-6'>
            <Link to='/about' className='hover:text-blue-400 transition-colors'>
              سياسة الخصوصية
            </Link>
            <Link to='/about' className='hover:text-blue-400 transition-colors'>
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
