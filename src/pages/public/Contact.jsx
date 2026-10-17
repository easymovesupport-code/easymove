import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // لاحقاً هنربطه بـ Backend
    setSent(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className='bg-stone-50 min-h-screen'>
      {/* Hero */}
      <section className='relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white'>
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-16 -right-16 w-[300px] h-[300px] bg-teal-400/20 rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-[260px] h-[260px] bg-cyan-400/15 rounded-full blur-3xl'></div>
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-20 md:py-28 text-center'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4 tracking-tight'>
            تواصل معنا
          </h1>
          <p className='text-lg text-teal-100/90 max-w-2xl mx-auto leading-relaxed'>
            يسعدنا تواصلك معنا. سواء كان لديك استفسار أو اقتراح، فريقنا جاهز
            لمساعدتك
          </p>
        </div>
      </section>

      {/* Content */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-10'>
            {/* Contact Info */}
            <div className='lg:col-span-2 space-y-6'>
              <h2 className='text-2xl font-bold text-slate-900 mb-2'>
                معلومات التواصل
              </h2>
              <p className='text-slate-600 leading-relaxed mb-8'>
                نحن هنا لمساعدتك في كل خطوة. تواصل معنا عبر أي من الوسائل
                التالية.
              </p>

              <div className='space-y-4'>
                <div className='flex items-start gap-4 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm'>
                  <div className='w-12 h-12 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center shrink-0'>
                    <Mail size={22} />
                  </div>
                  <div>
                    <h3 className='font-semibold text-slate-900 mb-1'>
                      البريد الإلكتروني
                    </h3>
                    <p className='text-slate-600 text-sm'>
                      easymove.support@gmail.com
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm'>
                  <div className='w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center shrink-0'>
                    <Phone size={22} />
                  </div>
                  <div>
                    <h3 className='font-semibold text-slate-900 mb-1'>
                      الهاتف
                    </h3>
                    <p className='text-slate-600 text-sm' dir='ltr'>
                      +966 123 456 7890
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4 bg-white rounded-2xl p-5 border border-stone-200 shadow-sm'>
                  <div className='w-12 h-12 bg-cyan-50 text-cyan-700 rounded-xl flex items-center justify-center shrink-0'>
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className='font-semibold text-slate-900 mb-1'>
                      الموقع
                    </h3>
                    <p className='text-slate-600 text-sm'>
                      المملكة العربية السعودية — خدمة رقمية عن بُعد
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className='lg:col-span-3'>
              <div className='bg-white rounded-3xl p-8 md:p-10 border border-stone-200 shadow-sm'>
                <h2 className='text-2xl font-bold text-slate-900 mb-6'>
                  أرسل رسالة
                </h2>

                {sent ? (
                  <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <div className='w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4'>
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className='text-xl font-bold text-slate-900 mb-2'>
                      تم إرسال رسالتك
                    </h3>
                    <p className='text-slate-600'>
                      شكرًا لتواصلك، سنرد عليك في أقرب وقت.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        الاسم الكامل
                      </label>
                      <input
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className='w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900'
                        placeholder='اكتب اسمك هنا'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        البريد الإلكتروني
                      </label>
                      <input
                        type='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className='w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900'
                        placeholder='example@email.com'
                        dir='ltr'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>
                        الرسالة
                      </label>
                      <textarea
                        name='message'
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className='w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 resize-none'
                        placeholder='اكتب رسالتك هنا...'
                      />
                    </div>

                    <button
                      type='submit'
                      className='w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg'
                    >
                      إرسال الرسالة
                      <Send size={18} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
