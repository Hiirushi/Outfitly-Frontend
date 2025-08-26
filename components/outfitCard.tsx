import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface OutfitCardProps {
  name: string;
  imageUrl: any;
  outfitId: string;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ name, imageUrl, outfitId }) => {
  const router = useRouter();

  const handlePress = () => {
    console.log('OutfitCard handlePress called with:', { name, outfitId, imageUrl });

    if (!outfitId) {
      console.error('Error: outfitId is undefined!');
      return;
    }

    console.log('Navigating to Outfit:', { id: outfitId });

    router.push({
      pathname: '/outfit-single',
      params: { id: String(outfitId) },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={imageUrl} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.category}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    flex: 1,
    maxWidth: '30%',
    aspectRatio: 0.75,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#666',
  },
});

export default OutfitCard;
