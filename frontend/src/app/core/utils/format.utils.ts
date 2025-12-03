export function formatEventTypeWithAcronyms(eventType: string): string {
  return eventType
    .split('_')
    .map(word => {
      if (word === 'SLA' || word === 'API' || word === 'HTTP' || word === 'HTTPS') {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function formatMessage(message: string): string {
  const cleaned = message
    .replaceAll('_', ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ')
    .trim();

  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

