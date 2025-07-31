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
} from 'react-native';
import { TrendingUp, DollarSign, Package, Users, Calendar, Filter, AlertTriangle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  units: number;
}

interface PhoneSales {
  name: string;
  brand: string;
  unitsSold: number;
  revenue: number;
  stock: number;
}

export default function AnalyticsTab() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topSellingPhones, setTopSellingPhones] = useState<PhoneSales[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PhoneSales | null>(null);

  useEffect(() => {
    // Mock data - in real app this would come from Supabase
    const mockSalesData: SalesData[] = [
      { date: '2024-01-15', revenue: 2398, orders: 2, units: 3 },
      { date: '2024-01-14', revenue: 1898, orders: 3, units: 2 },
      { date: '2024-01-13', revenue: 999, orders: 1, units: 1 },
      { date: '2024-01-12', revenue: 3597, orders: 4, units: 4 },
      { date: '2024-01-11', revenue: 1799, orders: 2, units: 2 },
    ];

    const mockTopSelling: PhoneSales[] = [
      { name: 'iPhone 15 Pro', brand: 'Apple', unitsSold: 15, revenue: 14985, stock: 2 },
      { name: 'Galaxy S24 Ultra', brand: 'Samsung', unitsSold: 12, revenue: 14388, stock: 8 },
      { name: 'Pixel 8 Pro', brand: 'Google', unitsSold: 8, revenue: 7192, stock: 0 },
      { name: 'OnePlus 12', brand: 'OnePlus', unitsSold: 6, revenue: 4794, stock: 20 },
    ];

    setSalesData(mockSalesData);
    setTopSellingPhones(mockTopSelling);
  }, [timeframe]);

  const getTotalRevenue = () => {
    return salesData.reduce((total, data) => total + data.revenue, 0);
  };

  const getTotalOrders = () => {
    return salesData.reduce((total, data) => total + data.orders, 0);
  };

  const getTotalUnits = () => {
    return salesData.reduce((total, data) => total + data.units, 0);
  };

  const getAverageOrderValue = () => {
    const totalRevenue = getTotalRevenue();
    const totalOrders = getTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  const getLowStockItems = () => {
    return topSellingPhones.filter((phone) => phone.stock <= 3).length;
  };

  const getInventoryValue = () => {
    return topSellingPhones.reduce((total, phone) => total + phone.revenue, 0);
  };

  const getStockTurnoverRate = () => {
    const totalUnitsSold = topSellingPhones.reduce((total, phone) => total + phone.unitsSold, 0);
    const totalStock = topSellingPhones.reduce((total, phone) => total + phone.stock, 0);
    return totalStock > 0 ? (totalUnitsSold / (totalUnitsSold + totalStock)) * 100 : 0;
  };

  const timeframes = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <DollarSign size={24} color="#10B981" />
            <Text style={styles.metricValue}>${getTotalRevenue().toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+12.5%</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <Users size={24} color="#2563EB" />
            <Text style={styles.metricValue}>{getTotalOrders()}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+8.3%</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <Package size={24} color="#F59E0B" />
            <Text style={styles.metricValue}>{getTotalUnits()}</Text>
            <Text style={styles.metricLabel}>Units Sold</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+15.2%</Text>
            </View>
          </View>
        </View>
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Calendar size={24} color="#8B5CF6" />
            <Text style={styles.metricValue}>${getAverageOrderValue().toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Avg Order Value</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+5.1%</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.metricValue}>{getLowStockItems()}</Text>
            <Text style={styles.metricLabel}>Low Stock Items</Text>
            <View style={styles.metricChange}>
              <Text style={styles.metricChangeText}>Monitor</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <Package size={24} color="#3B82F6" />
            <Text style={styles.metricValue}>{getStockTurnoverRate().toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>Stock Turnover</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+2.3%</Text>
            </View>
          </View>
        </View>

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
            <Text style={styles.metricValue}>${getInventoryValue().toLocaleString()}</Text>
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