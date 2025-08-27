import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, Image, FlatList } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// Use environment variable WEATHER_API_BASE when available; fallback to localhost for development
const API_BASE = (process.env && process.env.WEATHER_API_BASE) || 'http://localhost:3000';

const WeatherWidget: React.FC<{ city?: string }> = ({ city = 'Colombo' }) => {
  const [current, setCurrent] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/weather`, { params: { city }, timeout: 8000 });
      const curr = res?.data?.current;
      const days = res?.data?.forecast?.forecastday;
      setCurrent(curr ?? null);
      setForecast(days ?? null);
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
        <Ionicons name="cloud-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{city}</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#000" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : current ? (
              <>
                {renderCurrent()}
                <View style={styles.separator} />
                <Text style={{ fontWeight: '700', marginBottom: 8 }}>3-day Forecast</Text>
                {forecast ? (
                  <FlatList data={forecast} keyExtractor={(d) => d.date} renderItem={renderDay} />
                ) : (
                  <Text style={styles.errorText}>No forecast available</Text>
                )}
              </>
            ) : (
              <Text style={styles.errorText}>No weather available</Text>
            )}

            <TouchableOpacity style={styles.closeTextWrap} onPress={() => setVisible(false)}>
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
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
  closeTextWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#2b7cff',
    fontWeight: '600',
  },
  errorText: {
    color: '#a00',
    textAlign: 'center',
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
    marginVertical: 10,
  },
});

export default WeatherWidget;
