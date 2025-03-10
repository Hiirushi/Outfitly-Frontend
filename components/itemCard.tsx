import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface ItemCardProps {
  name: string;
  imageUrl: any;
  itemId: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ name, imageUrl, itemId }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/closet-single?id=${itemId}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={imageUrl} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 5,
    width: 150, 
    height: 200, 
    justifyContent: 'center',
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    right: 15,
  },
});

export default ItemCard;
