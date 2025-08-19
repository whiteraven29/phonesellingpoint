import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';

interface OrderItem {
  id: string;
  phone_id: string;
  phone_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_items: OrderItem[];
}

export default function ReceiptComponent() {
  // Mock order data for template preview
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and set mock data
    setTimeout(() => {
      setOrder({
        id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: new Date().toISOString(),
        total_amount: 1999.99,
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        order_items: [
          {
            id: '1',
            phone_id: 'p1',
            phone_name: 'iPhone 15 Pro',
            quantity: 1,
            price: 999.99,
          },
          {
            id: '2',
            phone_id: 'p2',
            phone_name: 'Galaxy S24 Ultra',
            quantity: 1,
            price: 999.99,
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  const generateReceiptHtml = () => {
    if (!order) return '';

    const itemsHtml = order.order_items.map(item => `
      <tr>
        <td>${item.phone_name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }
            h1 { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
            .received { margin-top: 40px; text-align: right; }
          </style>
        </head>
        <body>
          <h1>Customer Payment Receipt</h1>
          <div class="info">Date: ${new Date().toLocaleDateString()}</div>
          <div class="info">Received From: ${order.customer_name}</div>
          <div class="info">Email: ${order.customer_email}</div>
          <div class="info">Phone: ${order.customer_phone}</div>
          <div class="info">Order ID: ${order.id}</div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">Total Amount: $${order.total_amount.toFixed(2)}</div>
          
          <div class="received">Received by: Phone Store</div>
        </body>
      </html>
    `;
  };

  const downloadReceipt = async () => {
    try {
      const html = generateReceiptHtml();
      const { uri } = await printToFileAsync({ html });
      await shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Receipt', UTI: '.pdf' });
      Alert.alert('Success', 'Receipt downloaded successfully');
    } catch (error: any) {
      Alert.alert('Error', `Failed to download receipt: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Order not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Customer Payment Receipt</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Received From:</Text>
          <Text style={styles.value}>{order.customer_name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{order.customer_email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{order.customer_phone}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>{order.id}</Text>
        </View>

        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.order_items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.phone_name}</Text>
            <Text style={styles.itemDetails}>{item.quantity} x ${item.price.toFixed(2)}</Text>
            <Text style={styles.itemSubtotal}>${(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={styles.value}>${order.total_amount.toFixed(2)}</Text>
        </View>

        <View style={styles.receivedBy}>
          <Text>Received by: Phone Store</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.downloadButton} onPress={downloadReceipt}>
        <Text style={styles.downloadButtonText}>Download Receipt</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  itemRow: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  itemSubtotal: {
    fontSize: 14,
    color: '#2563EB',
    marginTop: 4,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  receivedBy: {
    marginTop: 30,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  downloadButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});