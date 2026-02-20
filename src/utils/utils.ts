export function truncateString(
  text: string,
  maxLength: number = 15,
  ellipsis: string = '...',
): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + ellipsis : text;
}

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

export const formatFullDate = (date: Date) => {
  return new Date(date).toLocaleString();
};
