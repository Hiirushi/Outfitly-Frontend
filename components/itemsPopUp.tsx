import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Image, Text, FlatList, ActivityIndicator, Alert, Animated, PanResponder } from 'react-native';
import PopupScreenButton from './buttons/PopupScreenButton';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

interface Item {
  id: string;
  type: string;
  image: string;
  name: string;
}

interface ItemType {
  id: string;
  name: string;
  itemCount?: number;
}

interface ItemsPopUpProps {
  onItemDrag?: (item: Item, gestureState: any) => void;
}

export default function ItemsPopUp({ onItemDrag }: ItemsPopUpProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchItemTypes = async (): Promise<void> => {
    try {
      const response = await axios.get<ItemType[]>(`${API_BASE_URL}/itemType`);
      const fetchedTypes: ItemType[] = response.data;

      // Fetch item count for each type and filter out empty types
      const typesWithItems = await Promise.all(
        fetchedTypes.map(async (type) => {
          try {
            const itemsResponse = await axios.get(`${API_BASE_URL}/itemType/${type.id}/items`);
            const items = itemsResponse.data.items || itemsResponse.data || [];
            return {
              ...type,
              itemCount: items.length,
            };
          } catch (err) {
            console.error(`Error fetching items for type ${type.name}:`, err);
            return {
              ...type,
              itemCount: 0,
            };
          }
        }),
      );

      // Filter out types with no items
      const typesWithAvailableItems = typesWithItems.filter((type) => type.itemCount && type.itemCount > 0);

      setItemTypes(typesWithAvailableItems);
    } catch (err) {
      console.error('Error fetching item types:', err);
      throw err;
    }
  };

  const fetchAllItems = async (): Promise<void> => {
    try {
      const response = await axios.get<Item[]>(`${API_BASE_URL}/items`);
      const fetchedItems: Item[] = response.data;
      setItems(fetchedItems);
      setFilteredItems(fetchedItems);
    } catch (err) {
      console.error('Error fetching all items:', err);
      throw err;
    }
  };

  const fetchItemsByType = async (typeId: string): Promise<void> => {
    try {
      const response = await axios.get<{ items: Item[] }>(`${API_BASE_URL}/itemType/${typeId}/items`);
      const fetchedItems: Item[] = response.data.items || response.data;
      setItems(fetchedItems);
      setFilteredItems(fetchedItems);
    } catch (err) {
      console.error('Error fetching items by type:', err);
      throw err;
    }
  };

  const loadInitialData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await fetchItemTypes();
      await fetchAllItems();
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please try again.');
      Alert.alert('Error', 'Failed to load data. Please check your connection and try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredItems(filtered);
  }, [items, searchQuery]);

  const DraggableItem = ({ item }: { item: Item }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          Animated.spring(scale, {
            toValue: 1.1,
            useNativeDriver: false,
          }).start();
        },
        onPanResponderMove: Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (evt, gestureState) => {
          if (onItemDrag) {
            onItemDrag(item, {
              translationX: gestureState.dx,
              translationY: gestureState.dy,
              absoluteX: evt.nativeEvent.pageX,
              absoluteY: evt.nativeEvent.pageY,
            });
          }

          // Reset position and scale
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: false,
            })
          ]).start();
        },
      })
    ).current;

    return (
      <Animated.View
        style={[
          styles.item,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale }
            ]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          onError={(error) => console.log('Image load error:', error)}
        />
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
      </Animated.View>
    );
  };

  const handleTypeSelect = async (typeId: string) => {
    try {
      setLoading(true);
      setSelectedTypeId(typeId);

      if (typeId === 'All') {
        await fetchAllItems();
      } else {
        await fetchItemsByType(typeId);
      }
    } catch (err) {
      console.error('Error selecting type:', err);
      setError('Failed to load items for selected type.');
    } finally {
      setLoading(false);
    }
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
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Section with improved positioning and simplified logic */}
      {itemTypes.length > 0 && (
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.scrollContentContainer}
            style={styles.horizontalScrollView}
          >
            {/* All button */}
            <PopupScreenButton
              type="All"
              isSelected={selectedTypeId === 'All'}
              onPress={() => handleTypeSelect('All')}
            />
            {/* Item type buttons */}
            {itemTypes.map((itemType) => (
              <PopupScreenButton
                key={itemType.id}
                type={itemType.name}
                isSelected={selectedTypeId === itemType.id}
                onPress={() => handleTypeSelect(itemType.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Items List */}
      <View style={styles.itemsSection}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || (selectedTypeId && selectedTypeId !== 'All')
                ? 'No items match your filters'
                : 'No items found'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.itemsContainer}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <DraggableItem item={item} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 10,
  },
  filterSection: {
    height: 80,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
    marginTop: 20,
  },
  horizontalScrollView: {
    flex: 1,
    width: 320,
  },
  scrollContentContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 15,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  buttonWrapper: {
    marginHorizontal: 5,
  },
  itemsSection: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  itemsContainer: {
    paddingBottom: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxWidth: '30%',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});