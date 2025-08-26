import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { IOutfit } from './(tabs)/outfits';

const API_BASE_URL = 'http://172.20.10.2:3000';

const OutfitSingle = () => {
  const { id } = useLocalSearchParams();

  const [outfit, setOutfit] = useState<IOutfit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log('OutfitSingle id:', id);

  const fetchOutfit = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<IOutfit>(`${API_BASE_URL}/outfits/${id}`);
      const fetchedOutfit: IOutfit = response.data;

      setOutfit(fetchedOutfit);
    } catch (err) {
      console.error('Error fetching outfit:', err);
      setError('Failed to load outfit. Please try again.');
      Alert.alert('Error', 'Failed to load outfit. Please check your connection and try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOutfit();
    }
  }, [id]);

  const handleRetry = (): void => {
    fetchOutfit();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading outfit...</Text>
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

  if (!outfit) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Outfit not found!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: outfit.image_url }} style={styles.image} />
      <Text style={styles.name}>{outfit.name}</Text>

      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{outfit.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Occassion</Text>
          <Text style={styles.value}>{outfit.occassion}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created Date</Text>
          <Text style={styles.value}>{outfit.createdDate ? formatDate(outfit.createdDate) : 'N/A'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  itemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  item: {
    width: '30%',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemType: {
    fontSize: 14,
    color: '#888',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
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

export default OutfitSingle;
