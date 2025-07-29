import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();

  // You can fetch product details using the id here

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Product Details for ID: {id}</Text>
      {/* Render product details here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, color: '#111827' },
});