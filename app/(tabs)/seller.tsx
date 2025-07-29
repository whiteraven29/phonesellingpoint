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
} from 'react-native';
import { Plus, CreditCard as Edit, TriangleAlert as AlertTriangle, Package, DollarSign } from 'lucide-react-native';

interface Phone {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

export default function SellerTab() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    stock: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    // Mock data - in real app this would come from Supabase
    const mockPhones: Phone[] = [
      {
        id: '1',
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        price: 999,
        stock: 2, // Low stock
        image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Latest iPhone with A17 Pro chip and titanium design'
      },
      {
        id: '2',
        name: 'Galaxy S24 Ultra',
        brand: 'Samsung',
        price: 1199,
        stock: 8,
        image: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Premium Android phone with S Pen and 200MP camera'
      },
      {
        id: '3',
        name: 'Pixel 8 Pro',
        brand: 'Google',
        price: 899,
        stock: 0, // Out of stock
        image: 'https://images.pexels.com/photos/3693601/pexels-photo-3693601.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Pure Android experience with advanced AI features'
      },
    ];
    setPhones(mockPhones);
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      stock: '',
      image: '',
      description: '',
    });
    setEditingPhone(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (phone: Phone) => {
    setFormData({
      name: phone.name,
      brand: phone.brand,
      price: phone.price.toString(),
      stock: phone.stock.toString(),
      image: phone.image,
      description: phone.description,
    });
    setEditingPhone(phone);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.brand || !formData.price || !formData.stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const phoneData = {
      name: formData.name,
      brand: formData.brand,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image || 'https://images.pexels.com/photos/1440727/pexels-photo-1440727.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: formData.description,
    };

    if (editingPhone) {
      // Update existing phone
      setPhones(prev => prev.map(phone => 
        phone.id === editingPhone.id 
          ? { ...phone, ...phoneData }
          : phone
      ));
      Alert.alert('Success', 'Phone updated successfully');
    } else {
      // Add new phone
      const newPhone: Phone = {
        id: Date.now().toString(),
        ...phoneData,
      };
      setPhones(prev => [...prev, newPhone]);
      Alert.alert('Success', 'Phone added successfully');
    }

    setShowAddModal(false);
    resetForm();
  };

  const getLowStockPhones = () => {
    return phones.filter(phone => phone.stock <= 3);
  };

  const getOutOfStockPhones = () => {
    return phones.filter(phone => phone.stock === 0);
  };

  const getTotalValue = () => {
    return phones.reduce((total, phone) => total + (phone.price * phone.stock), 0);
  };

  const lowStockPhones = getLowStockPhones();
  const outOfStockPhones = getOutOfStockPhones();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{phones.length}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#10B981" />
            <Text style={styles.statNumber}>${getTotalValue().toLocaleString()}</Text>
            <Text style={styles.statLabel}>Inventory Value</Text>
          </View>
        </View>

        {/* Alerts */}
        {(lowStockPhones.length > 0 || outOfStockPhones.length > 0) && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Alerts</Text>
            
            {outOfStockPhones.length > 0 && (
              <View style={styles.alertCard}>
                <AlertTriangle size={24} color="#EF4444" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Out of Stock ({outOfStockPhones.length})</Text>
                  <Text style={styles.alertText}>
                    {outOfStockPhones.map(phone => phone.name).join(', ')}
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
                    {lowStockPhones.map(phone => `${phone.name} (${phone.stock})`).join(', ')}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Inventory List */}
        <View style={styles.inventorySection}>
          <Text style={styles.sectionTitle}>Inventory</Text>
          
          {phones.map(phone => (
            <View key={phone.id} style={styles.phoneCard}>
              <Image source={{ uri: phone.image }} style={styles.phoneImage} />
              <View style={styles.phoneInfo}>
                <Text style={styles.phoneName}>{phone.name}</Text>
                <Text style={styles.phoneBrand}>{phone.brand}</Text>
                <Text style={styles.phonePrice}>${phone.price}</Text>
                <Text style={[
                  styles.stockText,
                  phone.stock === 0 ? styles.outOfStock : 
                  phone.stock <= 3 ? styles.lowStock : styles.inStock
                ]}>
                  Stock: {phone.stock}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(phone)}
              >
                <Edit size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPhone ? 'Edit Phone' : 'Add New Phone'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter phone name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Brand *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
                placeholder="Enter brand name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="Enter price"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Stock Quantity *</Text>
              <TextInput
                style={styles.input}
                value={formData.stock}
                onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                placeholder="Enter stock quantity"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) => setFormData(prev => ({ ...prev, image: text }))}
                placeholder="Enter image URL (optional)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter product description"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
  phoneCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    fontWeight: 'bold',
    color: '#3B82F6',
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
    fontSize: 18,
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
    color: '#3B82F6',
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});