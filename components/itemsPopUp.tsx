import React from 'react';
import { View, StyleSheet, ScrollView, TextInput, Image, Text, FlatList } from 'react-native';
import { itemsDataset } from '@/constants/datasets/itemsDataset';
import PopupScreenButton from './buttons/PopupScreenButton';

export default function ItemsPopUp() {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#888"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.buttonsContainer}>
          <PopupScreenButton type="Top" />
          <PopupScreenButton type="Bottom" />
          <PopupScreenButton type="Dress" />
          <PopupScreenButton type="Jacket" />
          <PopupScreenButton type="Skirt" />
        </View>
      </ScrollView>
      <FlatList
        data={itemsDataset.items}
        keyExtractor={(item) => item.id}
        numColumns={3} 
        contentContainerStyle={styles.itemsContainer}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={item.image} style={styles.itemImage} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#e6e6e6',
    marginBottom: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsContainer: {

  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '40%',
    padding: 10,
    backgroundColor: '#fff',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    fontSize: 14,
    color: '#888',
  },
});