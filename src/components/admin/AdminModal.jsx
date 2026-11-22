import { X } from "lucide-react";

const AdminModal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}) => {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} p-6 relative max-h-[90vh] overflow-y-auto`}
      >
        <button
          type='button'
          onClick={onClose}
          className='absolute left-4 top-4 text-slate-400 hover:text-slate-600'
        >
          <X size={18} />
        </button>
        {title && (
          <h3 className='font-bold text-slate-900 text-lg mb-4'>{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
};

export default AdminModal;
