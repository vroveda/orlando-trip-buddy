export interface WeatherNow {
  temperature: number;
  apparent: number;
  weatherCode: number;
  isDay: boolean;
  maxToday: number;
  minToday: number;
  precipProb: number;
}

const ORLANDO = { lat: 28.5383, lng: -81.3792 };

export async function fetchOrlandoWeather(): Promise<WeatherNow> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${ORLANDO.lat}&longitude=${ORLANDO.lng}&current=temperature_2m,apparent_temperature,weather_code,is_day,precipitation_probability&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FNew_York&forecast_days=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao buscar clima");
  const data = await res.json();
  return {
    temperature: data.current.temperature_2m,
    apparent: data.current.apparent_temperature,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    maxToday: data.daily.temperature_2m_max[0],
    minToday: data.daily.temperature_2m_min[0],
    precipProb: data.current.precipitation_probability ?? 0,
  };
}

export function weatherEmoji(code: number, isDay = true): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if ([1, 2].includes(code)) return isDay ? "🌤️" : "🌙";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Céu limpo";
  if ([1, 2].includes(code)) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if ([45, 48].includes(code)) return "Neblina";
  if ([51, 53, 55].includes(code)) return "Garoa";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Chuva";
  if ([95, 96, 99].includes(code)) return "Trovoada";
  return "Tempo variado";
}