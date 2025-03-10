import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface ItemTypeCardProps {
  category: string;
  itemCount: number;
  imageUrl: any;
}

const ItemTypeCard: React.FC<ItemTypeCardProps> = ({ category, itemCount, imageUrl }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/closet-type?category=${category}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={imageUrl} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.itemCount}>{itemCount} items</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    height: 80, 
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 16,
    color: '#666',
  },
});

export default ItemTypeCard;
