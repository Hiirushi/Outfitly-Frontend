import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { itemsDataset } from '@/constants/datasets/itemsDataset';
import ItemCard from '@/components/itemCard';

const ClosetType = () => {
  const { category } = useLocalSearchParams();
  const router = useRouter();

  const handlePress = (itemId: string) => {
    router.push(`/closet-single?id=${itemId}`);
  };

  const filteredItems = itemsDataset.items.filter(item => item.type.toLowerCase() === (Array.isArray(category) ? category[0] : category)?.toLowerCase());

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {filteredItems.length > 0 ? (
          <View style={styles.itemsContainer}>
            {filteredItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.itemWrapper} onPress={() => handlePress(item.id)}>
                <ItemCard
                  name={item.name}
                  imageUrl={item.image}
                  itemId={item.id}
                />
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
});

export default ClosetType;
