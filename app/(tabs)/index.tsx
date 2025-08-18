import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Item as Item } from "../closet-single"; 
import OutfitTypeCard from "../../components/ItemTypesCard";
import AddItemModal from "../../components/AddItemModal";
import axios from 'axios'; 

const API_BASE_URL = 'http://localhost:3000';

interface ClosetCategory {
  id: string;
  type: string;
  items_available: number;
  imageUrl?: string;
}

export default function Home() {
  const [categories, setCategories] = useState<ClosetCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);

  const processItemsIntoCategories = (items: Item[]): ClosetCategory[] => {
    const groupedItems = items.reduce((acc, item) => {
      const type = item.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item);
      return acc;
    }, {} as Record<string, Item[]>);

    const categoriesArray: ClosetCategory[] = Object.entries(groupedItems).map(([type, typeItems]) => ({
      id: type.toLowerCase().replace(/\s+/g, '-'), // Generate ID from type
      type: type,
      items_available: typeItems.length,
      imageUrl: typeItems[0]?.image || undefined, // Use first item's image as category image
    }));

    return categoriesArray.sort((a, b) => b.items_available - a.items_available);
  };

  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get<Item[]>(`${API_BASE_URL}/items`);
      const fetchedItems: Item[] = response.data;

      const processedCategories = processItemsIntoCategories(fetchedItems);
      setCategories(processedCategories);
      
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load categories. Please try again.');
      Alert.alert(
        'Error', 
        'Failed to load categories. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRetry = (): void => {
    fetchItems();
  };

  const handleRefresh = (): void => {
    fetchItems();
  };

  const handleAddItem = () => {
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
  };

  const handleItemAdded = () => {
    setIsAddModalVisible(false);
    fetchItems(); // Refresh the list after adding an item
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
        {/* FAB for empty state */}
        <TouchableOpacity style={styles.fab} onPress={handleAddItem}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
        
        <AddItemModal
          visible={isAddModalVisible}
          onClose={handleCloseModal}
          onItemAdded={handleItemAdded}
        />
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
          />
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddItem}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      
      {/* Add Item Modal */}
      <AddItemModal
        visible={isAddModalVisible}
        onClose={handleCloseModal}
        onItemAdded={handleItemAdded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Add extra space at bottom for FAB
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
    bottom: 120, // Position above the tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});