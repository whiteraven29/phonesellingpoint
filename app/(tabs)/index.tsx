import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Search, ShoppingCart, Filter, Star, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/auth/AuthContext';

interface Phone {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  description: string;
}

export default function BrowseTab() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const router = useRouter();
  const { signout } = useAuth();

  useEffect(() => {
    // Mock data - in real app this would come from Supabase
    const mockPhones: Phone[] = [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        price: 999,
        stock: 15,
        image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.8,
        description: 'Latest iPhone with A17 Pro chip and titanium design'
      },
      {
        id: '2',
        name: 'Galaxy S24 Ultra',
        brand: 'Samsung',
        price: 1199,
        stock: 8,
        image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.7,
        description: 'Premium Android phone with S Pen and 200MP camera'
      },
      {
        id: '3',
        name: 'Pixel 8 Pro',
        brand: 'Google',
        price: 899,
        stock: 12,
        image: 'https://images.pexels.com/photos/3693601/pexels-photo-3693601.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.6,
        description: 'Pure Android experience with advanced AI features'
      },
      {
        id: '4',
        name: 'OnePlus 12',
        brand: 'OnePlus',
        price: 799,
        stock: 20,
        image: 'https://images.pexels.com/photos/1440722/pexels-photo-1440722.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.5,
        description: 'Flagship killer with fast charging and premium design'
      }
    ];
    setPhones(mockPhones);
    setFilteredPhones(mockPhones);
  }, []);

  useEffect(() => {
    filterPhones();
  }, [searchQuery, selectedBrand, phones]);

  const filterPhones = () => {
    let filtered = phones;
    
    if (searchQuery) {
      filtered = filtered.filter(phone => 
        phone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedBrand !== 'All') {
      filtered = filtered.filter(phone => phone.brand === selectedBrand);
    }
    
    setFilteredPhones(filtered);
  };

  const addToCart = (phoneId: string) => {
    const phone = phones.find(p => p.id === phoneId);
    if (!phone) return;

    const currentCartQuantity = cart[phoneId] || 0;
    if (currentCartQuantity >= phone.stock) {
      Alert.alert('Out of Stock', 'Cannot add more items than available in stock');
      return;
    }

    setCart(prev => ({
      ...prev,
      [phoneId]: currentCartQuantity + 1
    }));
    Alert.alert('Added to Cart', `${phone.name} added to cart`);
  };

  const brands = ['All', ...Array.from(new Set(phones.map(phone => phone.brand)))];

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Phone Store</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
            <ShoppingCart size={24} color="#3B82F6" />
            {getTotalCartItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalCartItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={signout}
          >
            <LogOut size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search phones..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {brands.map(brand => (
          <TouchableOpacity
            key={brand}
            style={[
              styles.filterChip,
              selectedBrand === brand && styles.filterChipActive
            ]}
            onPress={() => setSelectedBrand(brand)}
          >
            <Text style={[
              styles.filterChipText,
              selectedBrand === brand && styles.filterChipTextActive
            ]}>
              {brand}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredPhones.map(phone => (
          <TouchableOpacity
            key={phone.id}
            style={styles.phoneCard}
            onPress={() => router.push(`/product/${phone.id}`)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: phone.image }} style={styles.phoneImage} />
            <View style={styles.phoneInfo}>
              <Text style={styles.phoneName}>{phone.name}</Text>
              <Text style={styles.phoneBrand}>{phone.brand}</Text>
              <Text style={styles.phoneDescription}>{phone.description}</Text>
              
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FCD34D" fill="#FCD34D" />
                <Text style={styles.rating}>{phone.rating}</Text>
              </View>

              <View style={styles.priceStockContainer}>
                <Text style={styles.phonePrice}>${phone.price}</Text>
                <Text style={[
                  styles.stockText,
                  phone.stock < 5 && styles.lowStock
                ]}>
                  {phone.stock} in stock
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  phone.stock === 0 && styles.disabledButton
                ]}
                onPress={() => addToCart(phone.id)}
                disabled={phone.stock === 0}
              >
                <Text style={styles.addToCartText}>
                  {phone.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginLeft: 16,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  phoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  phoneImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  phoneInfo: {
    padding: 16,
  },
  phoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  phoneBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  phoneDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  priceStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phonePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  stockText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  lowStock: {
    color: '#EF4444',
  },
  addToCartButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginLeft: 20,
  },
});