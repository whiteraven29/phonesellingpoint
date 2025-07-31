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
} from 'react-native';
import { Search, ShoppingCart, Filter, Star, LogOut, ChevronDown } from 'lucide-react-native';
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
  const [sortOption, setSortOption] = useState('default');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
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
        stock: 12,
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
      {
        id: '5',
        name: 'Xperia 1 V',
        brand: 'Sony',
        price: 1099,
        stock: 10,
        image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.4,
        description: 'Sony flagship with 4K OLED display and pro camera features',
      },
      {
        id: '6',
        name: 'Aquos R7',
        brand: 'Aquos',
        price: 950,
        stock: 7,
        image: 'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.3,
        description: 'Aquos R7 with IGZO OLED and Leica camera',
      },
    ];
    setPhones(mockPhones);
    setFilteredPhones(mockPhones);
  }, []);

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

  const addToCart = (phoneId: string) => {
    const phone = phones.find((p) => p.id === phoneId);
    if (!phone) return;

    const currentCartQuantity = cart[phoneId] || 0;
    if (currentCartQuantity >= phone.stock) {
      Alert.alert('Out of Stock', 'Cannot add more items than available in stock');
      return;
    }

    setCart((prev) => ({
      ...prev,
      [phoneId]: currentCartQuantity + 1,
    }));
    Alert.alert('Added to Cart', `${phone.name} added to cart`);
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