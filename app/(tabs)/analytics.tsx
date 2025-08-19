import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { TrendingUp, DollarSign, Package, Users, Calendar, Filter, AlertTriangle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  units: number;
}

interface PhoneSales {
  id: string;
  name: string;
  brand: string;
  unitsSold: number;
  revenue: number;
  stock: number;
  cost_price: number; // Add this field
  cogs: number; // Cost of goods sold
}

export default function AnalyticsTab() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topSellingPhones, setTopSellingPhones] = useState<PhoneSales[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PhoneSales | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);

    let fromDate = new Date();
    if (timeframe === 'weekly') fromDate.setDate(fromDate.getDate() - 7);
    else if (timeframe === 'monthly') fromDate.setMonth(fromDate.getMonth() - 1);

    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, created_at, total_amount')
      .gte('created_at', fromDate.toISOString());

    if (ordersError) {
      setLoading(false);
      return;
    }

    // Fetch order_items and join with phones (including cost_price)
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, phone_id, quantity, price, phones (id, name, brand, stock, cost_price)')
      .in('order_id', orders.map((o: any) => o.id));

    if (itemsError) {
      setLoading(false);
      return;
    }

    // Aggregate sales data by date
    const salesByDate: { [date: string]: SalesData } = {};
    orders.forEach((order: any) => {
      const date = order.created_at.slice(0, 10);
      if (!salesByDate[date]) {
        salesByDate[date] = { date, revenue: 0, orders: 0, units: 0 };
      }
      salesByDate[date].revenue += order.total_amount;
      salesByDate[date].orders += 1;
    });
    orderItems.forEach((item: any) => {
      const order = orders.find((o: any) => o.id === item.order_id);
      if (order) {
        const date = order.created_at.slice(0, 10);
        salesByDate[date].units += item.quantity;
      }
    });
    setSalesData(Object.values(salesByDate).sort((a, b) => b.date.localeCompare(a.date)));

    // Aggregate top selling phones and calculate COGS
    const phoneMap: { [id: string]: PhoneSales } = {};
    orderItems.forEach((item: any) => {
      if (!item.phones) return;
      const phoneId = item.phone_id;
      if (!phoneMap[phoneId]) {
        phoneMap[phoneId] = {
          id: phoneId,
          name: item.phones.name,
          brand: item.phones.brand,
          unitsSold: 0,
          revenue: 0,
          stock: item.phones.stock,
          cost_price: item.phones.cost_price || 0,
          cogs: 0,
        };
      }
      phoneMap[phoneId].unitsSold += item.quantity;
      phoneMap[phoneId].revenue += item.price * item.quantity;
      phoneMap[phoneId].cogs += (item.phones.cost_price || 0) * item.quantity;
    });
    setTopSellingPhones(Object.values(phoneMap).sort((a, b) => b.unitsSold - a.unitsSold));

    setLoading(false);
  };

  // --- Metrics calculations ---
  const getTotalRevenue = () => salesData.reduce((total, data) => total + data.revenue, 0);
  const getTotalOrders = () => salesData.reduce((total, data) => total + data.orders, 0);
  const getTotalUnits = () => salesData.reduce((total, data) => total + data.units, 0);
  const getAverageOrderValue = () => {
    const totalRevenue = getTotalRevenue();
    const totalOrders = getTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };
  const getLowStockItems = () => topSellingPhones.filter((phone) => phone.stock <= 3).length;
  const getInventoryValue = () => topSellingPhones.reduce((total, phone) => total + phone.revenue, 0);
  const getStockTurnoverRate = () => {
    const totalUnitsSold = topSellingPhones.reduce((total, phone) => total + phone.unitsSold, 0);
    const totalStock = topSellingPhones.reduce((total, phone) => total + phone.stock, 0);
    return totalStock > 0 ? (totalUnitsSold / (totalUnitsSold + totalStock)) * 100 : 0;
  };
  // Profit and Loss
  const getTotalCOGS = () => topSellingPhones.reduce((total, phone) => total + phone.cogs, 0);
  const getTotalProfit = () => getTotalRevenue() - getTotalCOGS();
  const getTotalLoss = () => getTotalProfit() < 0 ? Math.abs(getTotalProfit()) : 0;

  // --- UI ---
  const timeframes = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  // Currency formatter for TSH
  const formatTSH = (amount: number) =>
    `TSH ${amount.toLocaleString('en-TZ', { maximumFractionDigits: 0 })}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Analytics</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {timeframes.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.timeframeButton, timeframe === key && styles.timeframeButtonActive]}
            onPress={() => setTimeframe(key as any)}
          >
            <Text style={[styles.timeframeText, timeframe === key && styles.timeframeTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Horizontally scrollable metrics */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={styles.metricCard}>
                <DollarSign size={24} color="#10B981" />
                <Text style={styles.metricValue}>{formatTSH(getTotalRevenue())}</Text>
                <Text style={styles.metricLabel}>Total Revenue</Text>
              </View>
              <View style={styles.metricCard}>
                <DollarSign size={24} color="#2563EB" />
                <Text style={styles.metricValue}>{formatTSH(getTotalCOGS())}</Text>
                <Text style={styles.metricLabel}>Cost of Goods Sold</Text>
              </View>
              <View style={styles.metricCard}>
                <TrendingUp size={24} color="#10B981" />
                <Text style={styles.metricValue}>{formatTSH(getTotalProfit())}</Text>
                <Text style={styles.metricLabel}>Profit</Text>
              </View>
              <View style={styles.metricCard}>
                <AlertTriangle size={24} color="#EF4444" />
                <Text style={styles.metricValue}>{formatTSH(getTotalLoss())}</Text>
                <Text style={styles.metricLabel}>Loss</Text>
              </View>
              <View style={styles.metricCard}>
                <Users size={24} color="#2563EB" />
                <Text style={styles.metricValue}>{getTotalOrders()}</Text>
                <Text style={styles.metricLabel}>Total Orders</Text>
              </View>
              <View style={styles.metricCard}>
                <Package size={24} color="#F59E0B" />
                <Text style={styles.metricValue}>{getTotalUnits()}</Text>
                <Text style={styles.metricLabel}>Units Sold</Text>
              </View>
              <View style={styles.metricCard}>
                <Calendar size={24} color="#8B5CF6" />
                <Text style={styles.metricValue}>{formatTSH(getAverageOrderValue())}</Text>
                <Text style={styles.metricLabel}>Avg Order Value</Text>
              </View>
              <View style={styles.metricCard}>
                <AlertTriangle size={24} color="#EF4444" />
                <Text style={styles.metricValue}>{getLowStockItems()}</Text>
                <Text style={styles.metricLabel}>Low Stock Items</Text>
              </View>
              <View style={styles.metricCard}>
                <Package size={24} color="#3B82F6" />
                <Text style={styles.metricValue}>{getStockTurnoverRate().toFixed(1)}%</Text>
                <Text style={styles.metricLabel}>Stock Turnover</Text>
              </View>
            </View>
          </ScrollView>

          {/* Sales Chart Placeholder */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartPlaceholderText}>Chart would be displayed here</Text>
            </View>
          </View>

          {/* Inventory Alerts */}
          {getLowStockItems() > 0 && (
            <View style={styles.alertSection}>
              <Text style={styles.sectionTitle}>Inventory Alerts</Text>
              <View style={styles.alertCard}>
                <AlertTriangle size={24} color="#EF4444" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Low Stock Alert</Text>
                  <Text style={styles.alertText}>
                    {topSellingPhones
                      .filter((phone) => phone.stock <= 3)
                      .map((phone) => `${phone.name} (${phone.stock} left)`)
                      .join(', ')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Inventory Value */}
          <View style={styles.inventoryValueSection}>
            <Text style={styles.sectionTitle}>Inventory Value</Text>
            <View style={styles.metricCard}>
              <DollarSign size={24} color="#10B981" />
              <Text style={styles.metricValue}>{formatTSH(getInventoryValue())}</Text>
              <Text style={styles.metricLabel}>Total Inventory Value</Text>
            </View>
          </View>

          {/* Top Selling Products */}
          <View style={styles.topProductsSection}>
            <Text style={styles.sectionTitle}>Top Selling Products</Text>
            <View style={styles.productGrid}>
              {topSellingPhones.map((phone, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.productCard}
                  onPress={() => setSelectedProduct(phone)}
                  activeOpacity={0.7}
                >
                  <View style={styles.productRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {phone.name}
                    </Text>
                    <Text style={styles.productBrand}>{phone.brand}</Text>
                    <Text style={styles.productStock}>
                      Stock: {phone.stock} {phone.stock <= 3 ? '(Low)' : ''}
                    </Text>
                  </View>
                  <View style={styles.productStats}>
                    <Text style={styles.productUnits}>{phone.unitsSold} units</Text>
                    <Text style={styles.productRevenue}>${phone.revenue.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Sales */}
          <View style={styles.recentSalesSection}>
            <Text style={styles.sectionTitle}>Recent Sales</Text>
            {salesData.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No sales data available</Text>
                <Text style={styles.emptyStateSubText}>Check back later or adjust the timeframe</Text>
                <TouchableOpacity style={styles.emptyStateButton}>
                  <Text style={styles.emptyStateButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              salesData.slice(0, 5).map((data, index) => (
                <View key={index} style={styles.salesCard}>
                  <View style={styles.salesDate}>
                    <Text style={styles.salesDateText}>
                      {new Date(data.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.salesStats}>
                    <Text style={styles.salesRevenue}>${data.revenue.toLocaleString()}</Text>
                    <Text style={styles.salesOrders}>{data.orders} orders</Text>
                    <Text style={styles.salesUnits}>{data.units} units</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Product Details Modal */}
      <Modal
        visible={!!selectedProduct}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedProduct(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedProduct(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Product Analytics</Text>
            <View style={{ width: 50 }} />
          </View>
          {selectedProduct && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Product Details</Text>
                <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                <Text style={styles.modalProductBrand}>{selectedProduct.brand}</Text>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Sales Performance</Text>
                <View style={styles.modalMetricRow}>
                  <Text style={styles.modalMetricLabel}>Units Sold:</Text>
                  <Text style={styles.modalMetricValue}>{selectedProduct.unitsSold}</Text>
                </View>
                <View style={styles.modalMetricRow}>
                  <Text style={styles.modalMetricLabel}>Revenue:</Text>
                  <Text style={styles.modalMetricValue}>
                    ${selectedProduct.revenue.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.modalMetricRow}>
                  <Text style={styles.modalMetricLabel}>Stock Remaining:</Text>
                  <Text
                    style={[
                      styles.modalMetricValue,
                      selectedProduct.stock <= 3 && styles.modalLowStock,
                    ]}
                  >
                    {selectedProduct.stock} {selectedProduct.stock <= 3 ? '(Low)' : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Recommendations</Text>
                <Text style={styles.modalRecommendation}>
                  {selectedProduct.stock <= 3
                    ? 'Restock this product to avoid shortages.'
                    : 'Maintain current stock levels.'}
                </Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

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
  filterButton: {
    padding: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  timeframeButtonActive: {
    backgroundColor: '#2563EB',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: cardWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricChangeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartPlaceholder: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  chartPlaceholderText: {
    color: '#6B7280',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  alertSection: {
    marginBottom: 24,
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
  inventoryValueSection: {
    marginBottom: 24,
  },
  topProductsSection: {
    marginBottom: 24,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    width: cardWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    color: '#EF4444',
  },
  productStats: {
    alignItems: 'flex-end',
  },
  productUnits: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 2,
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  recentSalesSection: {
    marginBottom: 24,
  },
  salesCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  salesDate: {
    width: 60,
    marginRight: 12,
  },
  salesDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  salesStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salesRevenue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  salesOrders: {
    fontSize: 14,
    color: '#4B5563',
  },
  salesUnits: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  modalCloseText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalProductBrand: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalMetricLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  modalMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  modalLowStock: {
    color: '#EF4444',
  },
  modalRecommendation: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});