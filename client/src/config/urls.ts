
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
}


export function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (!apiUrl || apiUrl.startsWith('/')) {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  return apiUrl.replace(/\/api\/?$/, '');
}
