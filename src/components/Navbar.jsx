import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className='bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
        {/* Logo */}
        <Link
          to='/'
          className='text-2xl font-bold text-blue-700 tracking-tight'
        >
          Easy<span className='text-blue-500'>Move</span>
        </Link>

        {/* Links */}
        <div className='hidden md:flex items-center gap-8'>
          <Link
            to='/'
            className='text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200'
          >
            الرئيسية
          </Link>
          <Link
            to='/about'
            className='text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200'
          >
            من نحن
          </Link>
          <Link
            to='/contact'
            className='text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200'
          >
            تواصل معنا
          </Link>

          {/* Login Button */}
          <Link
            to='/login'
            className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md'
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
