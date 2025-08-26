import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Item as Item } from "../closet-single"; 
import OutfitTypeCard from "../../components/ItemTypesCard";
import AddItemModal from "../../components/AddItemModal";
import axios from 'axios'; 
import { useRouter } from 'expo-router';

const API_BASE_URL = 'http://localhost:3000';

interface ClosetCategory {
  id: string;
  type: string;
  items_available: number;
  imageUrl?: string;
}

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<ClosetCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);

  const fetchCategoriesWithItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const typeResponse = await axios.get(`${API_BASE_URL}/itemType`);
      const types = typeResponse.data;

      const typeWithItems = types.map(async (type: any) => {
        const typeId = type.id;
        const typeName = type.name;

        if (!typeId) {
          console.warn('No ID found for type:', type);
          return null;
        }

        const res = await axios.get(`${API_BASE_URL}/itemType/${typeId}/items`);

        const items: Item[] = res.data.items || res.data || [];

        return {
          id: typeId,
          type: typeName,
          items_available: items.length,
          imageUrl: items[0]?.image || undefined,
        };
      });

      const categoriesArray = await Promise.all(typeWithItems);

      // Filter out null entries and categories with zero items
      const filteredCategories = categoriesArray
        .filter((category) => category !== null && category.items_available > 0)
        .sort((a, b) => b.items_available - a.items_available);

      setCategories(filteredCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
      Alert.alert('Error', 'Failed to load categories. Please check your connection and try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithItems();
  }, []);

  const handleRetry = (): void => {
    fetchCategoriesWithItems();
  };

  const handleRefresh = (): void => {
    fetchCategoriesWithItems();
  };

  const handleAddItem = () => {
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
  };

  const handleItemAdded = () => {
    setIsAddModalVisible(false);
    fetchCategoriesWithItems();
  };

  const handleCategoryPress = (categoryId: string) => {
    if (!categoryId) {
      Alert.alert('Error', 'Unable to navigate to this category.');
      return;
    }
    // Use query string navigation with explicit query parameter
    router.push(`/closet-type?typeId=${categoryId}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading categories...</Text>
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

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in your closet yet</Text>
          <Text style={styles.emptySubtext}>Add some items to get started!</Text>
        </View>
        <TouchableOpacity style={styles.fab} onPress={handleAddItem}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        <AddItemModal visible={isAddModalVisible} onClose={handleCloseModal} onItemAdded={handleItemAdded} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OutfitTypeCard
            category={item.type}
            itemCount={item.items_available}
            imageUrl={item.imageUrl}
            onPress={() => {
              handleCategoryPress(item.id);
            }}
          />
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddItem}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <AddItemModal visible={isAddModalVisible} onClose={handleCloseModal} onItemAdded={handleItemAdded} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#545454',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
