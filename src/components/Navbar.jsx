import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className='bg-white/90 backdrop-blur-md shadow-sm border-b border-stone-200/80 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
        {/* Logo */}
        <Link
          to='/'
          className='text-2xl font-bold text-teal-800 tracking-tight'
        >
          Easy<span className='text-teal-500'>Move</span>
        </Link>

        {/* Links */}
        <div className='hidden md:flex items-center gap-8'>
          <Link
            to='/'
            className='text-slate-600 hover:text-teal-700 font-medium transition-colors duration-200'
          >
            الرئيسية
          </Link>
          <Link
            to='/about'
            className='text-slate-600 hover:text-teal-700 font-medium transition-colors duration-200'
          >
            من نحن
          </Link>
          <Link
            to='/contact'
            className='text-slate-600 hover:text-teal-700 font-medium transition-colors duration-200'
          >
            تواصل معنا
          </Link>

          <Link
            to='/login'
            className='bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md'
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
