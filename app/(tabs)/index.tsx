import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { closetDataset } from "@/constants/datasets/closetDataset";
import OutfitTypeCard from "../../components/ItemTypesCard"

interface ClosetItem {
  id: string;
  type: string;
  items_available: number;
  imageUrl?: string; 
}

export default function Home() {
  return (
    <View style={styles.container}>
      <FlatList
        data={closetDataset.categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OutfitTypeCard
            category={item.type}
            itemCount={item.items_available}
            imageUrl={item.imageUrl}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
});
