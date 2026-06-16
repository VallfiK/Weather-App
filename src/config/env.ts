const API_KEY = (import.meta.env.VITE_OPENWEATHER_API_KEY ?? '').trim();

export const env = {
  apiKey: API_KEY,
  baseUrl: 'https://api.openweathermap.org',
  get configured(): boolean {
    return API_KEY.length > 0;
  },
};
