import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { itemsDataset } from '@/constants/datasets/itemsDataset';

const ClosetSingle = () => {
  const { id } = useLocalSearchParams();

  const item = itemsDataset.items.find(item => item.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>

      <View style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text style={styles.label}>Color</Text>
          <Text style={styles.value}>{item.color}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Material</Text>
          <Text style={styles.value}>{item.material}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Brand</Text>
          <Text style={styles.value}>{item.brand}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Occasion</Text>
          <Text style={styles.value}>{item.dressCode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Usage Count</Text>
          <Text style={styles.value}>{item.usageCount}</Text> 
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
  },
});

export default ClosetSingle;
