import { pluralRu } from '../../domain/plural';

const ru = {
  app: { title: 'Погода' },
  search: { placeholder: 'Введите город…', noResults: 'Город не найден' },
  geolocation: { button: 'Погода рядом', denied: 'Доступ к геолокации запрещён', unavailable: 'Геолокация недоступна' },
  favorites: { add: 'В избранное', remove: 'Убрать из избранного', empty: 'Нет избранных городов' },
  weather: {
    feelsLike: 'Ощущается {temp}°',
    humidity: 'Влажность',
    pressure: 'Давление',
    wind: 'Ветер',
    uv: 'UV-индекс',
    forecastDays: (n: number) => `Прогноз на ${n} ${pluralRu(n, ['день', 'дня', 'дней'])}`,
    hourly: 'Почасовой прогноз',
    updated: 'Обновлено {time}',
  },
  errors: {
    network: 'Нет интернета. Проверьте подключение.',
    notFound: 'Город не найден',
    rateLimit: 'Превышен лимит запросов. Попробуйте позже.',
    unauthorized: 'API-ключ не настроен или неверный',
    server: 'Ошибка сервера ({status}). Попробуйте позже.',
    apiKeyMissing: 'Добавьте VITE_OPENWEATHER_API_KEY в .env',
  },
  units: { mmHg: 'мм рт.ст.', ms: 'м/с' },
  weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  weekdaysFull: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  theme: { label: 'Тема', light: 'Светлая', dark: 'Тёмная', auto: 'Авто' },
  language: { label: 'Язык', ru: 'Русский', en: 'English' },
  conditions: {
    clear: 'ясно',
    partlyCloudy: 'переменная облачность',
    cloudy: 'облачно',
    overcast: 'пасмурно',
    fog: 'туман',
    drizzle: 'морось',
    rain: 'дождь',
    heavyRain: 'сильный дождь',
    snow: 'снег',
    heavySnow: 'сильный снег',
    sleet: 'дождь со снегом',
    thunderstorm: 'гроза',
  },
};
export default ru;
export type Dictionary = typeof ru;
