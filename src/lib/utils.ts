export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

export function formatTime(timeString?: string): string {
  if (!timeString) return '--:--';
  return timeString;
}
