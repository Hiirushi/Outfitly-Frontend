import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { outfitDataset } from '@/constants/datasets/outfitDataset';
import OutfitCard from '@/components/outfitCard';

const Outfits = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {outfitDataset.outfits.map((outfit, index) => (
          <OutfitCard
            key={index}
            name={outfit.name}
            imageUrl={outfit.image_url}
            outfitId={outfit.id}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default Outfits;
