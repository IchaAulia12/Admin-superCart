import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { adminStyle } from "../../styles/adminStyle";
import ProductsRepository from './productsRepository';
import SalesReport from './salesReport';
import PriceUpdate from './priceUpdate';
import ManageAccount from './manageAccount';

const dummyUser = {
  username: 'admin',
  employeeId: 'EMP001',
};

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('products');

  const menuItems = [
    { key: 'products', label: 'Repository of Products' },
    { key: 'sales', label: 'Report of Sales' },
    { key: 'price', label: 'Update Price and Discount' },
    { key: 'accounts', label: 'Manage Account' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'products':
        return <ProductsRepository />;
      case 'sales':
        return <SalesReport />;
      case 'price':
        return <PriceUpdate />;
      case 'accounts':
        return <ManageAccount />;
      default:
        return null;
    }
  };

  return (
    <ThemedView style={adminStyle.container}>
      <ThemedView style={adminStyle.sidebar}>
        <ThemedView style={adminStyle.userInfo}>
          <ThemedText style={adminStyle.usernameText}>Username: {dummyUser.username}</ThemedText>
          <ThemedText style={adminStyle.employeeIdText}>Employee ID: {dummyUser.employeeId}</ThemedText>
        </ThemedView>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[adminStyle.menuItem, activeMenu === item.key && adminStyle.activeMenuItem]}
            onPress={() => setActiveMenu(item.key)}
          >
            <ThemedText style={[adminStyle.menuText, activeMenu === item.key && adminStyle.activeMenuText]}>{item.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
      <ThemedView style={adminStyle.mainContent}>
        {renderContent()}
      </ThemedView>
    </ThemedView>
  );
}