import ru from './ru';
import type { Dictionary } from './ru';

const en: Dictionary = {
  app: { title: 'Weather' },
  search: { placeholder: 'Search city…', noResults: 'City not found' },
  geolocation: { button: 'Weather nearby', denied: 'Geolocation denied', unavailable: 'Geolocation unavailable' },
  favorites: { add: 'Add to favorites', remove: 'Remove from favorites', empty: 'No favorite cities' },
  weather: {
    ...ru.weather,
    feelsLike: 'Feels like {temp}°',
    updated: 'Updated {time}',
  },
  errors: {
    network: 'No internet. Check your connection.',
    notFound: 'City not found',
    rateLimit: 'Rate limit exceeded. Try later.',
    unauthorized: 'API key missing or invalid',
    server: 'Server error ({status}). Try later.',
    apiKeyMissing: 'Add VITE_OPENWEATHER_API_KEY to .env',
  },
  units: { mmHg: 'mmHg', ms: 'm/s' },
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  theme: { label: 'Theme', light: 'Light', dark: 'Dark', auto: 'Auto' },
  language: { label: 'Language', ru: 'Russian', en: 'English' },
  conditions: {
    clear: 'clear',
    partlyCloudy: 'partly cloudy',
    cloudy: 'cloudy',
    overcast: 'overcast',
    fog: 'fog',
    drizzle: 'drizzle',
    rain: 'rain',
    heavyRain: 'heavy rain',
    snow: 'snow',
    heavySnow: 'heavy snow',
    sleet: 'sleet',
    thunderstorm: 'thunderstorm',
  },
};
export default en;
