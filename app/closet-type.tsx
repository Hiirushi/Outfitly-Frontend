import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ItemCard from '@/components/itemCard';
import axios from 'axios';
import { Item as Item } from '../app/closet-single'; 

const API_BASE_URL = 'http://localhost:3000'; 

const ClosetType = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { typeId } = params;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handlePress = (itemId: string): void => {
    router.push(`/closet-single?id=${itemId}`);
  };

  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Use the type id to fetch items directly from the API
      const apiTypeId = Array.isArray(typeId) ? typeId[0] : typeId;
      console.log('Using typeId for API call:', apiTypeId);

      if (!apiTypeId) {
        setError('No category ID provided');
        return;
      }

      const response = await axios.get<{ items: Item[] }>(`${API_BASE_URL}/itemType/${apiTypeId}/items`);
      console.log('API Response:', response.data);
      const fetchedItems: Item[] = response.data.items || response.data;

      setItems(fetchedItems);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
      Alert.alert('Error', 'Failed to load items. Please check your connection and try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeId) {
      fetchItems();
    }
  }, [typeId]);

  const handleRetry = (): void => {
    fetchItems();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading items...</Text>
        </View>
      </View>
    );
  }

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {items.length > 0 ? (
          <View style={styles.itemsContainer}>
            {items.map((item: Item) => (
              <TouchableOpacity key={item._id} style={styles.itemWrapper} onPress={() => handlePress(item._id)}>
                <ItemCard name={item.name} imageUrl={{ uri: item.image }} itemId={item._id} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noItemsText}>No items found for this category.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemWrapper: {
    width: '30%',
    marginBottom: 20,
  },
  noItemsText: {
    fontSize: 18,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
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
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
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

export default ClosetType;
