import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Settings } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export const Weather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedApiKey = localStorage.getItem('openweather_api_key');
    const savedCity = localStorage.getItem('weather_city');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedCity) {
      setCity(savedCity);
    }

    // Auto-fetch weather if both are available
    if (savedApiKey && savedCity) {
      fetchWeather(savedApiKey, savedCity);
    }
  }, []);

  const fetchWeather = async (weatherApiKey: string, weatherCity: string) => {
    if (!weatherApiKey || !weatherCity) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity}&appid=${weatherApiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Weather data not found');
      }

      const data = await response.json();
      
      setWeather({
        location: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].main
      });
    } catch (err) {
      setError('Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('openweather_api_key', apiKey);
    localStorage.setItem('weather_city', city);
    setShowSettings(false);
    if (apiKey && city) {
      fetchWeather(apiKey, city);
    }
  };

  const getWeatherIcon = (iconType: string) => {
    switch (iconType.toLowerCase()) {
      case 'clear':
        return <Sun className="text-yellow-400" size={24} />;
      case 'clouds':
        return <Cloud className="text-gray-400" size={24} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="text-blue-400" size={24} />;
      case 'snow':
        return <CloudSnow className="text-blue-200" size={24} />;
      default:
        return <Cloud className="text-gray-400" size={24} />;
    }
  };

  if (showSettings) {
    return (
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border min-w-72">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Weather Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">OpenWeather API Key</label>
            <Input
              type="password"
              placeholder="Enter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">City</label>
            <Input
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex space-x-2">
            <Button size="sm" onClick={saveSettings} className="flex-1">
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get a free API key from{' '}
            <a 
              href="https://openweathermap.org/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenWeatherMap
            </a>
          </p>
        </div>
      </Card>
    );
  }

  if (!apiKey || !city) {
    return (
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Weather</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowSettings(true)}
            className="h-6 w-6 p-0"
          >
            <Settings size={14} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Setup required</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Weather</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowSettings(true)}
            className="h-6 w-6 p-0"
          >
            <Settings size={14} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Loading...</p>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Weather</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowSettings(true)}
            className="h-6 w-6 p-0"
          >
            <Settings size={14} />
          </Button>
        </div>
        <p className="text-xs text-destructive mt-2">Error loading weather</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border min-w-64">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">Weather</span>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setShowSettings(true)}
          className="h-6 w-6 p-0"
        >
          <Settings size={14} />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getWeatherIcon(weather.icon)}
            <span className="text-lg font-bold text-primary">
              {weather.temperature}°C
            </span>
          </div>
        </div>
        
        <div>
          <p className="text-xs font-medium text-foreground">{weather.location}</p>
          <p className="text-xs text-muted-foreground capitalize">{weather.description}</p>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <span>💧</span>
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wind size={12} />
            <span>{weather.windSpeed} m/s</span>
          </div>
        </div>
      </div>
    </Card>
  );
};