import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';

// Define the Item interface
export interface Item {
  _id: string;
  name: string;
  image: string | any; 
  type: string;
  color?: string;
  material?: string;
  brand?: string;
  dressCode?: string;
  occasion?: string;
  usageCount?: number;
}

const API_BASE_URL = 'http://localhost:3000';

const ClosetSingle = () => {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get<Item>(`${API_BASE_URL}/items/${id}`);
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item:', error);
        setError(error.response?.data?.message || 'Failed to fetch item');
        
        Alert.alert(
          'Error',
          'Failed to load item details. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {error || 'Item not found!'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Handle both local images and URLs */}
      <Image 
        source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
        style={styles.image} 
        onError={() => console.log('Image failed to load')}
      />
      <Text style={styles.name}>{item.name}</Text>

      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Color</Text>
          <Text style={styles.value}>{item.color || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Material</Text>
          <Text style={styles.value}>{item.material || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Brand</Text>
          <Text style={styles.value}>{item.brand || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Occasion</Text>
          <Text style={styles.value}>{item.dressCode || item.occasion || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Usage Count</Text>
          <Text style={styles.value}>{item.usageCount || 0}</Text> 
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
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
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
  errorText: {
    fontSize: 18,
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default ClosetSingle;