import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://172.20.10.2:3000';

export interface IOutfit {
  _id: string;
  name: string;
  image_url?: any;
  plannedDate?: string; // expects an ISO date or date string
}

const Planner: React.FC = () => {
  const [outfits, setOutfits] = useState<IOutfit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const router = useRouter();

  const fetchOutfits = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<IOutfit[]>(`${API_BASE_URL}/outfits`);
      setOutfits(response.data || []);
    } catch (err) {
      console.error('Error fetching outfits for planner:', err);
      setError('Failed to load planned outfits.');
      Alert.alert('Error', 'Failed to load planned outfits. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  // Get outfits for a specific date
  const getOutfitsForDate = (dateString: string): IOutfit[] => {
    return outfits.filter(outfit => {
      if (!outfit.plannedDate) return false;
      const outfitDate = new Date(outfit.plannedDate).toISOString().split('T')[0];
      return outfitDate === dateString;
    });
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    
    // If there's an outfit for this date, navigate to it
    const outfitsForDate = getOutfitsForDate(day.dateString);
    if (outfitsForDate.length > 0) {
      // Navigate to the first outfit if there are multiple
      handleOutfitPress(outfitsForDate[0]._id);
    }
  };

  const handleOutfitPress = (id?: string) => {
    if (!id) return;
    router.push({ pathname: '/outfit-single', params: { id: String(id) } });
  };

  const DayComponent = ({ date, state }: any) => {
    const dateString: string = date.dateString;
    const outfitsHere = getOutfitsForDate(dateString);

    return (
      <TouchableOpacity onPress={() => handleDayPress({ dateString })} style={styles.dayContainer} activeOpacity={0.8}>
        <Text style={[styles.dayText, state === 'disabled' && styles.dayTextDisabled]}>{date.day}</Text>

        {/* Dot indicator shows that at least one outfit is planned for this date */}
        {outfitsHere.length > 0 && <View style={styles.dot} />}

        {outfitsHere.length > 0 && (
          <View style={styles.thumbsContainer}>
            {outfitsHere.slice(0, 4).map((o) => (
              <TouchableOpacity key={o._id} onPress={() => handleOutfitPress(o._id)}>
                <Image
                  source={typeof o.image_url === 'string' ? { uri: o.image_url } : o.image_url}
                  style={styles.dayThumb}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}

      <Calendar
        current={new Date().toISOString().split('T')[0]}
        enableSwipeMonths={true}
        onDayPress={handleDayPress}
        dayComponent={DayComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  outfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fafafa',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  outfitName: {
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    padding: 12,
  },
  errorContainer: {
    padding: 12,
  },
  errorText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  dayContainer: {
    alignItems: 'center',
    padding: 2,
    minHeight: 70,
    width: '100%',
  },
  dayText: {
    fontSize: 12,
    color: '#333',
  },
  dayTextDisabled: {
    color: '#ccc',
  },
  thumbsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  dayThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1b6604ff',
    alignSelf: 'center',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 10,
  },
});

export default Planner;