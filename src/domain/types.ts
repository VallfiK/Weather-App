export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export type WeatherCode =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavyRain'
  | 'snow'
  | 'heavySnow'
  | 'sleet'
  | 'thunderstorm';

export interface Weather {
  temp: number;
  feelsLike: number;
  condition: WeatherCode;
  description: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDeg: number;
  uvIndex: number;
  observedAt: Date;
  sunrise: Date;
  sunset: Date;
}

export interface ForecastDay {
  date: Date;
  min: number;
  max: number;
  condition: WeatherCode;
  description: string;
}

export interface HourlyPoint {
  time: Date;
  temp: number;
  condition: WeatherCode;
}

export interface Forecast {
  daily: ForecastDay[];
  hourly: HourlyPoint[];
}

export type ApiError =
  | { kind: 'network' }
  | { kind: 'notFound' }
  | { kind: 'rateLimit' }
  | { kind: 'unauthorized' }
  | { kind: 'server'; status: number };
