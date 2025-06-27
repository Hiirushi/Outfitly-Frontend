import React from 'react';
import { Text } from '@react-navigation/elements';
import { StyleSheet, View, FlatList } from 'react-native';
import OutfitCard from '../../components/outfitCard';
import { outfitDataset } from '../../constants/datasets/outfitDataset';

interface Outfit {
  id: string;
  name: string;
  image_url: any;
}

export default function Outfit() {
  return (
    <View style={styles.container}>
      <FlatList
        data={outfitDataset.outfits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OutfitCard
            name={item.name}
            imageUrl={item.image_url}
            outfitId={item.id}
          />
        )}
        numColumns={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    margin: 10,
  },
  itemContainer: {
    flex: 1,
    margin: 10,
  },
});