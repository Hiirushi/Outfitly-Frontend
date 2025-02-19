import React from 'react';
import { Text } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';

export default function Outfit() {
  return (
    <View style={styles.container}>
      <Text>Outfits</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});