import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { TrendingUp, DollarSign, Package, Users, Calendar, Filter } from 'lucide-react-native';

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
}

export default function AnalyticsTab() {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topSellingPhones, setTopSellingPhones] = useState<PhoneSales[]>([]);

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
      { name: 'iPhone 15 Pro', brand: 'Apple', unitsSold: 15, revenue: 14985 },
      { name: 'Galaxy S24 Ultra', brand: 'Samsung', unitsSold: 12, revenue: 14388 },
      { name: 'Pixel 8 Pro', brand: 'Google', unitsSold: 8, revenue: 7192 },
      { name: 'OnePlus 12', brand: 'OnePlus', unitsSold: 6, revenue: 4794 },
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

  const timeframes = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {timeframes.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.timeframeButton,
              timeframe === key && styles.timeframeButtonActive
            ]}
            onPress={() => setTimeframe(key as any)}
          >
            <Text style={[
              styles.timeframeText,
              timeframe === key && styles.timeframeTextActive
            ]}>
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
            <Users size={24} color="#3B82F6" />
            <Text style={styles.metricValue}>{getTotalOrders()}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+8.3%</Text>
            </View>
          </View>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Package size={24} color="#F59E0B" />
            <Text style={styles.metricValue}>{getTotalUnits()}</Text>
            <Text style={styles.metricLabel}>Units Sold</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+15.2%</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Calendar size={24} color="#8B5CF6" />
            <Text style={styles.metricValue}>${getAverageOrderValue().toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Avg Order Value</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+5.1%</Text>
            </View>
          </View>
        </View>

        {/* Sales Chart Placeholder */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.chartPlaceholder}>
              📈 Sales chart would be displayed here
            </Text>
            <Text style={styles.chartSubtext}>
              Integration with charting library like Victory Native
            </Text>
          </View>
        </View>

        {/* Top Selling Products */}
        <View style={styles.topProductsSection}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          
          {topSellingPhones.map((phone, index) => (
            <View key={index} style={styles.productCard}>
              <View style={styles.productRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{phone.name}</Text>
                <Text style={styles.productBrand}>{phone.brand}</Text>
              </View>
              
              <View style={styles.productStats}>
                <Text style={styles.productUnits}>{phone.unitsSold} units</Text>
                <Text style={styles.productRevenue}>${phone.revenue.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Sales */}
        <View style={styles.recentSalesSection}>
          <Text style={styles.sectionTitle}>Recent Sales</Text>
          
          {salesData.slice(0, 5).map((data, index) => (
            <View key={index} style={styles.salesCard}>
              <View style={styles.salesDate}>
                <Text style={styles.salesDateText}>
                  {new Date(data.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              
              <View style={styles.salesStats}>
                <Text style={styles.salesRevenue}>${data.revenue}</Text>
                <Text style={styles.salesOrders}>{data.orders} orders</Text>
                <Text style={styles.salesUnits}>{data.units} units</Text>
              </View>
            </View>
          ))}
        </View>
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
  filterButton: {
    padding: 8,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
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
  },
  timeframeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartPlaceholder: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  topProductsSection: {
    marginBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
  },
  productStats: {
    alignItems: 'flex-end',
  },
  productUnits: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  productRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  recentSalesSection: {
    marginBottom: 24,
  },
  salesCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
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
    marginRight: 16,
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
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  salesOrders: {
    fontSize: 14,
    color: '#4B5563',
  },
  salesUnits: {
    fontSize: 14,
    color: '#6B7280',
  },
});