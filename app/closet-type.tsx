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
  
  // Extract initial filter values from URL params
  const initialColor = Array.isArray(params.color) ? params.color[0] : params.color;
  const initialMaterial = Array.isArray(params.material) ? params.material[0] : params.material;

  // State management
  const [items, setItems] = useState<Item[]>([]);
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(initialColor ?? null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(initialMaterial ?? null);
  const [selectedSort, setSelectedSort] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const COLOR_OPTIONS = [
    'Red','Blue','Green','Yellow','Black','White','Gray','Brown','Pink','Purple','Orange','Beige'
  ];

  const MATERIAL_OPTIONS = [
    'Cotton','Linen','Silk','Wool','Polyester','Nylon','Denim','Leather','Velvet','Satin','Chiffon','Other'
  ];

  const SORT_OPTIONS: { key: string; label: string }[] = [
    { key: 'most-used', label: 'Most used' },
    { key: 'least-used', label: 'Least used' },
    { key: 'newest', label: 'New → Old' },
    { key: 'oldest', label: 'Old → New' },
  ];

  // Helper function to map color names to hex codes for display
  const mapColorNameToHex = (color: string): string => {
    const colorMap: { [key: string]: string } = {
      red: '#FF3B30',
      blue: '#007AFF',
      green: '#34C759',
      yellow: '#FFCC00',
      black: '#000000',
      white: '#FFFFFF',
      gray: '#8E8E93',
      brown: '#8B5A2B',
      pink: '#FF2D55',
      purple: '#5856D6',
      orange: '#FF9500',
      beige: '#F5F5DC',
    };
    return colorMap[color?.toLowerCase()] || '#CCCCCC';
  };

  // Navigation handler
  const handlePress = (itemId: string): void => {
    router.push(`/closet-single?id=${itemId}`);
  };

  // Fetch items from API
  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const apiTypeId = Array.isArray(typeId) ? typeId[0] : typeId;
      
      if (!apiTypeId) {
        setError('No category ID provided');
        return;
      }

      const response = await axios.get<{ items: Item[] }>(`${API_BASE_URL}/itemType/${apiTypeId}/items`);
      const fetchedItems: Item[] = response.data.items || response.data;
      
      setItems(fetchedItems);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items. Please try again.');
      Alert.alert('Error', 'Failed to load items. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // SIMPLIFIED FILTERING LOGIC
  const getFilteredAndSortedItems = (): Item[] => {
    let filteredItems = [...items];

    // Apply color filter
    if (selectedColor) {
      filteredItems = filteredItems.filter(item => {
        const itemColor = (item as any).color || (item as any).colour || '';
        return itemColor.toLowerCase() === selectedColor.toLowerCase();
      });
    }

    // Apply material filter
    if (selectedMaterial) {
      filteredItems = filteredItems.filter(item => {
        const itemMaterial = (item as any).material || '';
        return itemMaterial.toLowerCase() === selectedMaterial.toLowerCase();
      });
    }

    // Apply sorting
    if (selectedSort) {
      filteredItems.sort((a, b) => {
        const aItem = a as any;
        const bItem = b as any;

        switch (selectedSort) {
          case 'most-used':
            return (bItem.usageCount || 0) - (aItem.usageCount || 0);
          case 'least-used':
            return (aItem.usageCount || 0) - (bItem.usageCount || 0);
          case 'newest':
            const dateA = new Date(aItem.dateAdded || aItem.createdAt || aItem.updatedAt || 0);
            const dateB = new Date(bItem.dateAdded || bItem.createdAt || bItem.updatedAt || 0);
            return dateB.getTime() - dateA.getTime();
          case 'oldest':
            const oldDateA = new Date(aItem.dateAdded || aItem.createdAt || aItem.updatedAt || 0);
            const oldDateB = new Date(bItem.dateAdded || bItem.createdAt || bItem.updatedAt || 0);
            return oldDateA.getTime() - oldDateB.getTime();
          default:
            return 0;
        }
      });
    }

    return filteredItems;
  };

  // Load items when component mounts or typeId changes
  useEffect(() => {
    if (typeId) {
      fetchItems();
    }
  }, [typeId]);

  // Get the items to display
  const displayedItems = getFilteredAndSortedItems();

  // Clear all filters
  const clearFilters = (): void => {
    setSelectedColor(null);
    setSelectedMaterial(null);
    setSelectedSort(null);
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchItems}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      {/* Filter button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(!filterVisible)}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {filterVisible && (
        <View style={styles.filterPanel}>
          {/* Color filter */}
          <Text style={styles.filterSectionTitle}>Color</Text>
          <View style={styles.colorList}>
            {COLOR_OPTIONS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: mapColorNameToHex(color) },
                  selectedColor === color && styles.colorSwatchSelected
                ]}
                onPress={() => setSelectedColor(selectedColor === color ? null : color)}
              />
            ))}
          </View>

          {/* Material filter */}
          <Text style={[styles.filterSectionTitle, { marginTop: 12 }]}>Material</Text>
          <View style={styles.materialList}>
            {MATERIAL_OPTIONS.map(material => (
              <TouchableOpacity
                key={material}
                style={[
                  styles.materialItem,
                  selectedMaterial === material && styles.materialItemSelected
                ]}
                onPress={() => setSelectedMaterial(selectedMaterial === material ? null : material)}
              >
                <Text style={[
                  styles.materialText,
                  selectedMaterial === material && styles.materialTextSelected
                ]}>
                  {material}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort options */}
          <Text style={[styles.filterSectionTitle, { marginTop: 12 }]}>Sort</Text>
          <View style={styles.sortList}>
            {SORT_OPTIONS.map(sortOption => (
              <TouchableOpacity
                key={sortOption.key}
                style={[
                  styles.sortItem,
                  selectedSort === sortOption.key && styles.sortItemSelected
                ]}
                onPress={() => setSelectedSort(selectedSort === sortOption.key ? null : sortOption.key)}
              >
                <Text style={[
                  styles.sortText,
                  selectedSort === sortOption.key && styles.sortTextSelected
                ]}>
                  {sortOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Filter actions */}
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setFilterVisible(false)}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Items list */}
      <ScrollView contentContainerStyle={styles.content}>
        {displayedItems.length > 0 ? (
          <View style={styles.itemsContainer}>
            {displayedItems.map((item: Item) => (
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  filterButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonText: {
    fontWeight: '600',
  },
  filterPanel: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  colorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  colorSwatchSelected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  materialList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  materialItem: {
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  materialItemSelected: {
    backgroundColor: '#007AFF',
  },
  materialText: {
    fontSize: 13,
  },
  materialTextSelected: {
    color: '#fff',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  clearButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  sortList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  sortItem: {
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  sortItemSelected: {
    backgroundColor: '#007AFF',
  },
  sortText: {
    fontSize: 13,
  },
  sortTextSelected: {
    color: '#fff',
  },
});

export default ClosetType;