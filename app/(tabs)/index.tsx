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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Search, ShoppingCart, Star, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/lib/supabase';

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
  const [sortOption, setSortOption] = useState('default');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { signout } = useAuth();

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('phones')
        .select('*')
        .gte('stock', 1); // Only fetch phones with stock > 0

      if (error) throw error;
      
      setPhones(data || []);
      setFilteredPhones(data || []);
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch phones: ${error.message}`);
      console.error('Fetch phones error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortPhones();
  }, [searchQuery, selectedBrand, sortOption, phones]);

  const filterAndSortPhones = () => {
    let filtered = [...phones];

    if (searchQuery) {
      filtered = filtered.filter(
        (phone) =>
          phone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          phone.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedBrand !== 'All') {
      filtered = filtered.filter((phone) => phone.brand === selectedBrand);
    }

    if (sortOption === 'priceLow') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'priceHigh') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredPhones(filtered);
  };

  const addToCart = async (phoneId: string) => {
    const phone = phones.find((p) => p.id === phoneId);
    if (!phone) return;

    const currentCartQuantity = cart[phoneId] || 0;
    if (currentCartQuantity >= phone.stock) {
      Alert.alert('Out of Stock', 'Cannot add more items than available in stock');
      return;
    }

    try {
      // Check stock again in database to prevent race conditions
      const { data: currentStock } = await supabase
        .from('phones')
        .select('stock')
        .eq('id', phoneId)
        .single();

      if (!currentStock || currentCartQuantity >= currentStock.stock) {
        Alert.alert('Stock Updated', 'This item is no longer available in the requested quantity');
        await fetchPhones(); // Refresh stock data
        return;
      }

      setCart((prev) => ({
        ...prev,
        [phoneId]: currentCartQuantity + 1,
      }));
      Alert.alert('Added to Cart', `${phone.name} added to cart`);
    } catch (error: any) {
      Alert.alert('Error', `Failed to add to cart: ${error.message}`);
    }
  };

  const brands = ['All', ...Array.from(new Set(phones.map((phone) => phone.brand)))];

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const sortOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Price: Low to High', value: 'priceLow' },
    { label: 'Price: High to Low', value: 'priceHigh' },
    { label: 'Rating', value: 'rating' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Phone Store</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading phones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Phone Store</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
            <ShoppingCart size={24} color="#2563EB" />
            {getTotalCartItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalCartItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={signout}>
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
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.filterSortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[styles.filterChip, selectedBrand === brand && styles.filterChipActive]}
              onPress={() => setSelectedBrand(brand)}
            >
              <Text
                style={[styles.filterChipText, selectedBrand === brand && styles.filterChipTextActive]}
              >
                {brand}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortPicker}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortOption, sortOption === option.value && styles.sortOptionActive]}
                onPress={() => setSortOption(option.value)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortOption === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredPhones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Phones Found</Text>
            <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          <View style={styles.phoneGrid}>
            {filteredPhones.map((phone) => (
              <TouchableOpacity
                key={phone.id}
                style={styles.phoneCard}
                onPress={() => router.push(`/product/${phone.id}`)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: phone.image }} style={styles.phoneImage} />
                <View style={styles.phoneInfo}>
                  <Text style={styles.phoneName} numberOfLines={1}>
                    {phone.name}
                  </Text>
                  <Text style={styles.phoneBrand}>{phone.brand}</Text>
                  <Text style={styles.phoneDescription} numberOfLines={2}>
                    {phone.description}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FBBF24" fill="#FBBF24" />
                    <Text style={styles.rating}>{phone.rating}</Text>
                  </View>
                  <View style={styles.priceStockContainer}>
                    <Text style={styles.phonePrice}>${phone.price.toFixed(2)}</Text>
                    <Text
                      style={[styles.stockText, phone.stock < 5 && styles.lowStock]}
                    >
                      {phone.stock > 0 ? `${phone.stock} in stock` : 'Out of stock'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addToCartButton,
                      phone.stock === 0 && styles.disabledButton,
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
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width > 600 ? width / 3 - 24 : width / 2 - 24;

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
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
    marginLeft: 8,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterSortContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterChipText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginRight: 8,
  },
  sortPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  sortOptionActive: {
    backgroundColor: '#2563EB',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  },
  phoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  phoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    width: cardWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  phoneImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  phoneInfo: {
    padding: 12,
  },
  phoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  phoneBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  phoneDescription: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  priceStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phonePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  stockText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  lowStock: {
    color: '#EF4444',
  },
  addToCartButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});