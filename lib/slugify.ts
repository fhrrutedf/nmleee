/**
 * تحويل النص العربي أو الإنجليزي إلى slug نظيف وصديق لمحركات البحث
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')           // المسافات → شرطة
    .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '') // إزالة كل ما عدا العربية والإنجليزية والأرقام والشرطة
    .replace(/-{2,}/g, '-')         // شرطات متكررة → شرطة واحدة
    .replace(/^-+|-+$/g, '');       // إزالة الشرطات من البداية والنهاية
}

/**
 * إنشاء slug فريد بإضافة رقم عند التكرار
 */
export function slugifyUnique(text: string, existingSlugs: string[]): string {
  const base = slugify(text);
  if (!existingSlugs.includes(base)) return base;

  let counter = 1;
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}
