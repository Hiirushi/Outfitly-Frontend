import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, Image, FlatList, Alert } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Use environment variable WEATHER_API_BASE when available; fallback to localhost for development
const API_BASE = (process.env && process.env.WEATHER_API_BASE) || 'http://localhost:3000';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const WeatherWidget: React.FC = () => {
  const [current, setCurrent] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationName, setLocationName] = useState<string>('Your Location');

  // Request location permissions and get current location
  const getLocation = async (): Promise<LocationCoords | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show weather for your current location.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Could not get your current location. Please check your location settings.',
        [{ text: 'OK' }]
      );
      return null;
    }
  };

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current location
      const coords = await getLocation();
      
      if (!coords) {
        setError('Location access required');
        setLoading(false);
        return;
      }

      setLocation(coords);

      const res = await axios.get(`${API_BASE}/api/weather`, { 
        params: { 
          lat: coords.latitude, 
          lon: coords.longitude 
        }, 
        timeout: 8000 
      });
      
      const curr = res?.data?.current;
      const days = res?.data?.forecast?.forecastday;
      const locationData = res?.data?.location;
      
      setCurrent(curr ?? null);
      setForecast(days ?? null);
      
      // Set location name from weather API response
      if (locationData) {
        setLocationName(`${locationData.name}, ${locationData.region}`);
      }
      
    } catch (err: any) {
      console.error('Weather fetch error (frontend):', err?.response?.data || err.message || err);
      setError('Failed to load weather');
      setCurrent(null);
      setForecast(null);
    }
    setLoading(false);
  };

  const openModal = () => {
    setVisible(true);
    fetchWeather();
  };

  // Auto-fetch location on component mount (optional)
  useEffect(() => {
    // Uncomment the next line if you want to automatically get location when component mounts
    // getLocation().then(coords => coords && setLocation(coords));
  }, []);

  // Render current weather info
  const renderCurrent = () => {
    if (!current) return null;
    const iconRaw = current?.condition?.icon;
    const iconUrl = iconRaw ? (iconRaw.startsWith('//') ? `https:${iconRaw}` : iconRaw) : null;

    return (
      <View style={styles.currentRow}>
        {iconUrl ? (
          <Image source={{ uri: iconUrl }} style={styles.currentIcon} />
        ) : (
          <Ionicons name="cloud-outline" size={34} color="#333" />
        )}
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.currentTemp}>{current.temp_c}°C</Text>
          <Text style={styles.currentText}>{current.condition?.text}</Text>
          <Text style={styles.currentSmall}>
            Feels like {current.feelslike_c}°C • Humidity {current.humidity}%
          </Text>
        </View>
      </View>
    );
  };

  const renderDay = ({ item }: { item: any }) => {
    const iconRaw = item?.day?.condition?.icon || item?.day?.condition?.icon;
    const iconUrl = iconRaw ? (iconRaw.startsWith('//') ? `https:${iconRaw}` : iconRaw) : null;

    return (
      <View style={styles.dayRow}>
        {iconUrl ? (
          <Image source={{ uri: iconUrl }} style={styles.dayIcon} />
        ) : (
          <Ionicons name="cloud-outline" size={26} color="#333" />
        )}
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.dayTitle}>
            {item.date} — {item.day?.avgtemp_c}°C
          </Text>
          <Text style={styles.daySubtitle}>{item.day?.condition?.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      <TouchableOpacity style={styles.iconButton} onPress={openModal}>
        <Ionicons name="location-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.titleRow}>
              <Ionicons name="location-outline" size={20} color="#333" />
              <Text style={styles.modalTitle}>{locationName}</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Getting your location...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={24} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchWeather}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : current ? (
              <>
                {renderCurrent()}
                <View style={styles.separator} />
                <Text style={styles.forecastTitle}>3-day Forecast</Text>
                {forecast ? (
                  <FlatList data={forecast} keyExtractor={(d) => d.date} renderItem={renderDay} />
                ) : (
                  <Text style={styles.errorText}>No forecast available</Text>
                )}
              </>
            ) : (
              <Text style={styles.errorText}>No weather available</Text>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  dayIcon: {
    width: 48,
    height: 48,
  },
  dayTitle: {
    fontWeight: '700',
  },
  daySubtitle: {
    color: '#666',
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  currentIcon: {
    width: 64,
    height: 64,
  },
  currentTemp: {
    fontSize: 28,
    fontWeight: '800',
  },
  currentText: {
    color: '#444',
    fontWeight: '600',
  },
  currentSmall: {
    color: '#666',
    marginTop: 4,
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  forecastTitle: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 16,
  },
});

export default WeatherWidget;