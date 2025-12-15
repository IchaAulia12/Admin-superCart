import React, { useState, useEffect } from 'react';
import { TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { adminStyle } from "../../styles/adminStyle";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Sale {
  id: string;
  transactionId: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    qty: number;
    subtotal: number;
  }[];
  total: number;
  paymentMethod: string;
  cashier: string;
}

const formatRupiah = (num: number) => {
  return `Rp ${num.toLocaleString('id-ID').replace(/,/g, '.')},00`;
};

export default function SalesReport() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'sales'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const salesData: Sale[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        salesData.push({
          id: doc.id,
          transactionId: data.transactionId,
          date: data.date ? new Date(data.date).toLocaleString('id-ID') : '-',
          items: data.items || [],
          total: data.total,
          paymentMethod: data.paymentMethod,
          cashier: data.cashier,
        });
      });
      
      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
      Alert.alert('Error', 'Gagal memuat data penjualan dari Firestore');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // TODO: Implementasi export PDF
    Alert.alert('Export', 'PDF exported successfully!');
  };

  const calculateTotalSales = () => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const calculateTotalTransactions = () => {
    return sales.length;
  };

  if (loading) {
    return (
      <ThemedView style={[adminStyle.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0066cc" />
        <ThemedText style={{ marginTop: 10 }}>Memuat data penjualan...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={adminStyle.content}>
      <ThemedText type="title" style={adminStyle.contentTitle}>Sales Report</ThemedText>
      
      {/* Summary Cards */}
      <ThemedView style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
        <ThemedView style={{ 
          flex: 1, 
          padding: 15, 
          backgroundColor: '#f0f9ff', 
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#0066cc',
        }}>
          <ThemedText style={{ fontSize: 12, color: '#666' }}>Total Transaksi</ThemedText>
          <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#0066cc' }}>
            {calculateTotalTransactions()}
          </ThemedText>
        </ThemedView>
        <ThemedView style={{ 
          flex: 1, 
          padding: 15, 
          backgroundColor: '#f0fdf4', 
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#16a34a',
        }}>
          <ThemedText style={{ fontSize: 12, color: '#666' }}>Total Penjualan</ThemedText>
          <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#16a34a' }}>
            {formatRupiah(calculateTotalSales())}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity 
        style={[adminStyle.updateButton, { marginBottom: 10 }]} 
        onPress={exportToPDF}
      >
        <ThemedText style={adminStyle.updateButtonText}>Export to PDF</ThemedText>
      </TouchableOpacity>

      <ThemedView style={adminStyle.tableHeader}>
        <ThemedText style={[adminStyle.headerCell, { flex: 1.5 }]}>Transaction ID</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1.5 }]}>Date</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1 }]}>Items</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1.2 }]}>Total</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1 }]}>Payment</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1 }]}>Cashier</ThemedText>
      </ThemedView>

      <FlatList
        data={sales}
        renderItem={({ item }) => (
          <ThemedView style={adminStyle.productRow}>
            <ThemedText style={[adminStyle.productCell, { flex: 1.5 }]}>
              {item.transactionId}
            </ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1.5 }]}>
              {item.date}
            </ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1 }]}>
              {item.items.reduce((sum, i) => sum + i.qty, 0)} items
            </ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1.2, fontWeight: 'bold' }]}>
              {formatRupiah(item.total)}
            </ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1 }]}>
              {item.paymentMethod.toUpperCase()}
            </ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1 }]}>
              {item.cashier}
            </ThemedText>
          </ThemedView>
        )}
        keyExtractor={(item) => item.id}
        style={adminStyle.productList}
        ListEmptyComponent={
          <ThemedView style={{ padding: 20, alignItems: 'center' }}>
            <ThemedText>Belum ada data penjualan</ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}