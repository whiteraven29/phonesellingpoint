import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Modal,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Plus, CreditCard as Edit, AlertTriangle, Package, DollarSign } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthContext';

interface Phone {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  user_id: string;
  seller_id?: string;
}

export default function SellerTab() {
  const { user, isSeller } = useAuth();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    stock: '',
    image_url: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('phones')
        .select('*')
        .eq('user_id', user?.id || '');

      if (error) throw error;
      setPhones(data || []);
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch phones: ${error.message}`);
      console.error('Fetch phones error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      stock: '',
      image_url: '',
      description: '',
    });
    setEditingPhone(null);
  };

  const openAddModal = () => {
    if (!isSeller) {
      Alert.alert('Permission Denied', 'Only sellers can add products');
      return;
    }
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (phone: Phone) => {
    if (!isSeller) {
      Alert.alert('Permission Denied', 'Only sellers can edit products');
      return;
    }
    setFormData({
      name: phone.name,
      brand: phone.brand,
      price: phone.price.toString(),
      stock: phone.stock.toString(),
      image_url: phone.image,
      description: phone.description,
    });
    setEditingPhone(phone);
    setShowAddModal(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access media library is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData((prev) => ({ ...prev, image_url: result.assets[0].uri }));
    }
  };

  const uploadImage = async (uri: string) => {
    if (!isSeller || !user) {
      throw new Error('Only sellers can upload images');
    }

    setUploading(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error('File does not exist');
      if (fileInfo.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5MB');
      }

      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error } = await supabase.storage
        .from('phone-images')
        .upload(fileName, decodeURIComponent(base64), {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('phone-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!isSeller || !user) {
      Alert.alert('Permission Denied', 'Only sellers can save products');
      return;
    }

    if (!formData.name || !formData.brand || !formData.price || !formData.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    if (isNaN(price) || isNaN(stock)) {
      Alert.alert('Error', 'Price and stock must be valid numbers');
      return;
    }
    if (price < 0 || stock < 0) {
      Alert.alert('Error', 'Price and stock cannot be negative');
      return;
    }

    // Validate user.id is a valid UUID or at least not empty
    if (!user.id || user.id.trim() === '') {
      Alert.alert('Error', 'Invalid user session. Please log out and log back in.');
      return;
    }

    let imageUrl = formData.image_url;
    if (formData.image_url && formData.image_url.startsWith('file://')) {
      try {
        const uploadedUrl = await uploadImage(formData.image_url);
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
      } catch (error: any) {
        Alert.alert('Upload Error', error.message);
        return;
      }
    }

    const phoneData = {
      name: formData.name,
      brand: formData.brand,
      price,
      stock,
      image: imageUrl || 'https://via.placeholder.com/150',
      description: formData.description,
      user_id: user.id,
      // Only include seller_id if it's a valid non-empty string, otherwise let it be null
      ...(user.id && user.id.trim() !== '' ? { seller_id: user.id } : {})
    };

    try {
      if (editingPhone) {
        const { error } = await supabase
          .from('phones')
          .update(phoneData)
          .eq('id', editingPhone.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setPhones((prev) =>
          prev.map((phone) =>
            phone.id === editingPhone.id ? { ...phone, ...phoneData } : phone
          )
        );
        Alert.alert('Success', 'Phone updated successfully');
      } else {
        const { data, error } = await supabase
          .from('phones')
          .insert([phoneData])
          .select();

        if (error) throw error;
        
        setPhones((prev) => [...prev, { ...phoneData, id: data[0].id }]);
        Alert.alert('Success', 'Phone added successfully');
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Save phone error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        phoneData: phoneData, // Add this to help debug
        userId: user.id // Add this to help debug
      });
      
      let errorMessage = error.message;
      if (error.code === '42501') {
        errorMessage = "You don't have permission to modify this phone";
      } else if (error.code === '22P02') {
        errorMessage = "Invalid data format. Please check all fields and try again.";
      }
      
      Alert.alert('Error', `Failed to save phone: ${errorMessage}`);
    }
  };

  const getLowStockPhones = () => phones.filter((phone) => phone.stock <= 3 && phone.stock > 0);
  const getOutOfStockPhones = () => phones.filter((phone) => phone.stock === 0);
  const getTotalValue = () => phones.reduce((total, phone) => total + phone.price * phone.stock, 0);

  const lowStockPhones = getLowStockPhones();
  const outOfStockPhones = getOutOfStockPhones();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Products</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.emptyText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <TouchableOpacity 
          style={[
            styles.addButton, 
            !isSeller && styles.disabledButton
          ]} 
          onPress={openAddModal}
          disabled={!isSeller}
        >
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={24} color="#2563EB" />
            <Text style={styles.statNumber}>{phones.length}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#10B981" />
            <Text style={styles.statNumber}>${getTotalValue().toLocaleString()}</Text>
            <Text style={styles.statLabel}>Inventory Value</Text>
          </View>
        </View>

        {(lowStockPhones.length > 0 || outOfStockPhones.length > 0) && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Alerts</Text>
            {outOfStockPhones.length > 0 && (
              <View style={styles.alertCard}>
                <AlertTriangle size={24} color="#EF4444" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Out of Stock ({outOfStockPhones.length})</Text>
                  <Text style={styles.alertText}>
                    {outOfStockPhones.map((phone) => phone.name).join(', ')}
                  </Text>
                </View>
              </View>
            )}
            {lowStockPhones.length > 0 && (
              <View style={styles.alertCard}>
                <AlertTriangle size={24} color="#F59E0B" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Low Stock ({lowStockPhones.length})</Text>
                  <Text style={styles.alertText}>
                    {lowStockPhones.map((phone) => `${phone.name} (${phone.stock})`).join(', ')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.inventorySection}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          {phones.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products available</Text>
              <Text style={styles.emptySubText}>Add a product to get started!</Text>
              <TouchableOpacity 
                style={[styles.addButton, !isSeller && styles.disabledButton]} 
                onPress={openAddModal}
                disabled={!isSeller}
              >
                <Text style={styles.addButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.phoneGrid}>
              {phones.map((phone) => (
                <View key={phone.id} style={styles.phoneCard}>
                  <Image source={{ uri: phone.image }} style={styles.phoneImage} />
                  <View style={styles.phoneInfo}>
                    <Text style={styles.phoneName}>{phone.name}</Text>
                    <Text style={styles.phoneBrand}>{phone.brand}</Text>
                    <Text style={styles.phonePrice}>${phone.price.toFixed(2)}</Text>
                    <Text
                      style={[
                        styles.stockText,
                        phone.stock === 0
                          ? styles.outOfStock
                          : phone.stock <= 3
                          ? styles.lowStock
                          : styles.inStock,
                      ]}
                    >
                      Stock: {phone.stock}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => openEditModal(phone)}
                    disabled={!isSeller}
                  >
                    <Edit size={20} color={isSeller ? "#2563EB" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPhone ? 'Edit Product' : 'Add New Product'}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={uploading || loading || !isSeller}>
              <Text style={[styles.saveText, (uploading || loading || !isSeller) && styles.disabledText]}>
                {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="Enter phone name"
                autoCapitalize="words"
                editable={isSeller}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, brand: text }))}
                placeholder="Enter brand name"
                autoCapitalize="words"
                editable={isSeller}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, price: text }))}
                placeholder="Enter price (e.g., 999.99)"
                keyboardType="decimal-pad"
                editable={isSeller}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Stock Quantity *</Text>
              <TextInput
                style={styles.input}
                value={formData.stock}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, stock: text }))}
                placeholder="Enter stock quantity"
                keyboardType="number-pad"
                editable={isSeller}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Image</Text>
              <View style={styles.imageUploadContainer}>
                {formData.image_url ? (
                  <Image
                    source={{ uri: formData.image_url }}
                    style={styles.imagePreview}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>No Image</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.uploadButton, (uploading || !isSeller) && styles.disabledButton]}
                  onPress={handlePickImage}
                  disabled={uploading || !isSeller}
                >
                  <Text style={styles.uploadButtonText}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                placeholder="Enter product description"
                multiline
                numberOfLines={4}
                editable={isSeller}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width > 600 ? width / 2 - 24 : width - 32;

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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#6B7280',
  },
  inventorySection: {
    marginBottom: 24,
  },
  phoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  phoneCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: cardWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  phoneImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  phoneInfo: {
    flex: 1,
    marginLeft: 12,
  },
  phoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  phoneBrand: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  phonePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
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
  editButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePlaceholderText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 16,
  },
});