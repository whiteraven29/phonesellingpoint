import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, User, Phone } from 'lucide-react-native';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: {
    phoneId: string;
    phoneName: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'fulfilled';
  orderDate: Date;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'fulfilled' | 'rejected'>('all');

  useEffect(() => {
    // Mock data - in real app this would come from Supabase
    const mockOrders: Order[] = [
      {
        id: '1',
        customerName: 'John Doe',
        customerPhone: '+1 234 567 8900',
        customerEmail: 'john@example.com',
        items: [
          {
            phoneId: '1',
            phoneName: 'iPhone 15 Pro',
            quantity: 1,
            price: 999,
          }
        ],
        totalAmount: 999,
        status: 'pending',
        orderDate: new Date('2024-01-15'),
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        customerPhone: '+1 234 567 8901',
        customerEmail: 'jane@example.com',
        items: [
          {
            phoneId: '2',
            phoneName: 'Galaxy S24 Ultra',
            quantity: 2,
            price: 1199,
          }
        ],
        totalAmount: 2398,
        status: 'confirmed',
        orderDate: new Date('2024-01-14'),
      },
      {
        id: '3',
        customerName: 'Mike Johnson',
        customerPhone: '+1 234 567 8902',
        customerEmail: 'mike@example.com',
        items: [
          {
            phoneId: '3',
            phoneName: 'Pixel 8 Pro',
            quantity: 1,
            price: 899,
          }
        ],
        totalAmount: 899,
        status: 'fulfilled',
        orderDate: new Date('2024-01-13'),
      },
    ];
    setOrders(mockOrders);
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    Alert.alert('Success', `Order ${statusText} successfully`);
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'confirmed':
        return <CheckCircle size={20} color="#3B82F6" />;
      case 'fulfilled':
        return <CheckCircle size={20} color="#10B981" />;
      case 'rejected':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#3B82F6';
      case 'fulfilled':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const filteredOrders = getFilteredOrders();
  const filterOptions = ['all', 'pending', 'confirmed', 'fulfilled', 'rejected'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filterOptions.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterChip,
              filter === option && styles.filterChipActive
            ]}
            onPress={() => setFilter(option as any)}
          >
            <Text style={[
              styles.filterChipText,
              filter === option && styles.filterChipTextActive
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)} ({
                option === 'all' ? orders.length : orders.filter(o => o.status === option).length
              })
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No orders found</Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <Text style={styles.orderDate}>
                    {order.orderDate.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  {getStatusIcon(order.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.customerInfo}>
                <View style={styles.customerRow}>
                  <User size={16} color="#6B7280" />
                  <Text style={styles.customerText}>{order.customerName}</Text>
                </View>
                <View style={styles.customerRow}>
                  <Phone size={16} color="#6B7280" />
                  <Text style={styles.customerText}>{order.customerPhone}</Text>
                </View>
              </View>

              <View style={styles.itemsContainer}>
                <Text style={styles.itemsTitle}>Items:</Text>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.phoneName}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity}x ${item.price}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>${order.totalAmount}</Text>
              </View>

              {order.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={() => updateOrderStatus(order.id, 'confirmed')}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => updateOrderStatus(order.id, 'rejected')}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {order.status === 'confirmed' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.fulfillButton]}
                    onPress={() => updateOrderStatus(order.id, 'fulfilled')}
                  >
                    <Text style={styles.fulfillButtonText}>Mark as Fulfilled</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  itemDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  fulfillButton: {
    backgroundColor: '#10B981',
  },
  fulfillButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});