import { Tabs } from 'expo-router';
import { ShoppingBag, Store, Users, BarChart3, ShoppingCart } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#F9FAFB',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 90 : 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
      }}
    >
      {/* Browse tab (everyone) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ size, color, focused }) => (
            <ShoppingBag size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
      {/* Cart tab */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ size, color, focused }) => (
            <ShoppingCart size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
      {/* Seller tab */}
      <Tabs.Screen
        name="seller"
        options={{
          title: 'Seller',
          tabBarIcon: ({ size, color, focused }) => (
            <Store size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
      {/* Orders tab */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ size, color, focused }) => (
            <Users size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
      {/* Analytics tab */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ size, color, focused }) => (
            <BarChart3 size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
