import React, { useEffect, useState } from 'react';
import { Text } from 'react-native-gesture-handler';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import OutfitCard from '../../components/outfitCard';
import axios from 'axios';

const API_BASE_URL = 'http://172.20.10.2:3000';

export interface IOutfitItem {
  item: {
    _id: string;
    name: string;
    color: string;
    dressCode: string;
    image: string;
    brand: string;
    material: string;
    itemType: string;
    dateAdded: string;
    createdAt: string;
    updatedAt: string;
    usageCount: number;
  };
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  _id: string;
}

export interface IOutfit {
  _id: string;
  name: string;
  occasion?: string;
  // keep misspelled property for backwards compatibility
  occassion?: string;
  plannedDate?: string | null;
  user: string;
  items: IOutfitItem[];
  createdDate: string;
  createdAt: string;
  updatedAt: string;
  image_url?: any; // Keep for backward compatibility
}

export default function Outfit() {
  // State management
  const [outfits, setOutfits] = useState<IOutfit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch outfits from API
  const fetchOutfits = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<IOutfit[]>(`${API_BASE_URL}/outfits`);
      const fetchedOutfits: IOutfit[] = response.data;

      setOutfits(fetchedOutfits);
    } catch (err) {
      console.error('Error fetching outfits:', err);
      setError('Failed to load outfits. Please try again.');
      Alert.alert('Error', 'Failed to load outfits. Please check your connection and try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when component mounts
  useEffect(() => {
    fetchOutfits();
  }, []);

  // Retry function for error state
  const handleRetry = (): void => {
    fetchOutfits();
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading outfits...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty state
  if (outfits.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No outfits found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={outfits}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OutfitCard 
            name={item.name} 
            imageUrl={item.image_url} 
            outfitId={item._id}
            items={item.items} // Pass the items array
          />
        )}
        numColumns={3}
        columnWrapperStyle={styles.row}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchOutfits}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },
  separator: {
    height: 15,
  },
  itemContainer: {
    flex: 1,
    margin: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});