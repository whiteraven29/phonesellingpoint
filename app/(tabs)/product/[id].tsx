import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react-native';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  description: string;
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data fetch - in real app, fetch from Supabase using id
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        price: 999,
        stock: 15,
        image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.8,
        description: 'Latest iPhone with A17 Pro chip and titanium design',
      },
      {
        id: '2',
        name: 'Galaxy S24 Ultra',
        brand: 'Samsung',
        price: 1199,
        stock: 8,
        image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.7,
        description: 'Premium Android phone with S Pen and 200MP camera',
      },
      {
        id: '3',
        name: 'Pixel 8 Pro',
        brand: 'Google',
        price: 899,
        stock: 0,
        image: 'https://images.pexels.com/photos/3693601/pexels-photo-3693601.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.6,
        description: 'Pure Android experience with advanced AI features',
      },
      {
        id: '4',
        name: 'OnePlus 12',
        brand: 'OnePlus',
        price: 799,
        stock: 20,
        image: 'https://images.pexels.com/photos/1440722/pexels-photo-1440722.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.5,
        description: 'Flagship killer with fast charging and premium design',
      },
    ];

    const foundProduct = mockProducts.find((p) => p.id === id);
    setProduct(foundProduct || null);
    setLoading(false);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === 0) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }
    Alert.alert('Success', `${product.name} added to cart!`);
    // In a real app, update cart state or context here
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Product not found</Text>
          <Text style={styles.emptySubText}>The product with ID {id} does not exist.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={16}
                color="#FBBF24"
                fill={index < Math.floor(product.rating) ? '#FBBF24' : 'none'}
              />
            ))}
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text
            style={[
              styles.stockText,
              product.stock === 0
                ? styles.outOfStock
                : product.stock <= 3
                ? styles.lowStock
                : styles.inStock,
            ]}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <TouchableOpacity
            style={[styles.addToCartButton, product.stock === 0 && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={20} color="#FFFFFF" />
            <Text style={styles.addToCartText}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const imageWidth = width - 32;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E3A8A',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  productImage: {
    width: imageWidth,
    height: imageWidth * 0.6,
    borderRadius: 12,
    marginBottom: 16,
  },
  productInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 4,
    fontWeight: '500',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  inStock: {
    color: '#10B981',
  },
  lowStock: {
    color: '#F59E0B',
  },
  outOfStock: {
    color: '#EF4444',
  },
  productDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});