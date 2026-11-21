export const DAY_NAMES = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
// عشان نعرض الوقت بشكل مناسب، نحتاج نعمل دالة تنسيق الوقت. الدالة هذي تاخذ وقت بصيغة "HH:mm" وتعيده بصيغة 12 ساعة مع AM/PM بالعربي.
export const formatTime = (time) => {
  if (!time) return "—";
  const [hoursStr, minutesStr = "00"] = String(time).split(":");
  let hours = Number(hoursStr);
  const minutes = minutesStr.padStart(2, "0");
  if (Number.isNaN(hours)) return "—";
  const period = hours >= 12 ? "م" : "ص";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${period}`;
};
// عشان نعرض التاريخ بشكل مناسب، نحتاج نعمل دالة تنسيق التاريخ. الدالة هذي تاخذ تاريخ بصيغة ISO أو أي صيغة قابلة للتحويل إلى كائن Date وتعيده بصيغة "اليوم الشهر السنة" بالعربي.
export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
// عشان نعرض اسم اليوم بشكل مناسب، نحتاج نعمل دالة لجلب اسم اليوم من التاريخ.
export const getDayName = (date) => {
  if (!date) return null;
  return DAY_NAMES[new Date(date).getDay()];
};
