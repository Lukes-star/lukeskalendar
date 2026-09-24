export function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function capitalizeWords(text: string): string {
  if (!text) return text;
  return text.split(' ').map(word => {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

export function useAutoCapitalize() {
  return {
    capitalizeFirst,
    capitalizeWords,
  };
}
