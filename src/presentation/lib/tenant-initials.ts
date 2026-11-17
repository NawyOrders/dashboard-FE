/** First letter of the first two English words, or the first two Arabic letters. */
export function tenantInitials(name: string, nameAr?: string | null): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const english = words.map((word) => Array.from(word)[0] ?? '').join('').toUpperCase();
  if (english) return english;
  return Array.from((nameAr ?? '').trim().replace(/\s+/g, '')).slice(0, 2).join('');
}
