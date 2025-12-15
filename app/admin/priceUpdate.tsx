import React, { useState, useEffect } from 'react';
import { TouchableOpacity, FlatList, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { adminStyle } from "../../styles/adminStyle";
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface ProductPrice {
  id: string;
  name: string;
  priceBefore: number;
  discount: number;
  priceAfter: number;
}

const formatRupiah = (num: number) => {
  return `Rp ${num.toLocaleString('id-ID').replace(/,/g, '.')},00`;
};

export default function PriceUpdate() {
  const [products, setProducts] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductPrice | null>(null);
  const [priceForm, setPriceForm] = useState({
    price: '',
    discount: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData: ProductPrice[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const price = data.price || 0;
        const discount = data.discount || 0;
        const priceAfter = price * (1 - discount / 100);
        
        productsData.push({
          id: doc.id,
          name: data.name,
          priceBefore: price,
          discount: discount,
          priceAfter: priceAfter,
        });
      });
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Gagal memuat data produk dari Firestore');
    } finally {
      setLoading(false);
    }
  };

  const openEditPriceModal = (product: ProductPrice) => {
    setEditingProduct(product);
    setPriceForm({
      price: product.priceBefore.toString(),
      discount: product.discount.toString(),
    });
    setModalVisible(true);
  };

  const handleSavePrice = async () => {
    if (!priceForm.price) {
      Alert.alert('Error', 'Mohon isi harga');
      return;
    }

    setSaving(true);
    try {
      const price = parseFloat(priceForm.price);
      const discount = parseFloat(priceForm.discount) || 0;

      await updateDoc(doc(db, 'products', editingProduct!.id), {
        price: price,
        discount: discount,
      });

      Alert.alert('Sukses', 'Harga dan diskon berhasil diupdate');
      setModalVisible(false);
      setEditingProduct(null);
      fetchProducts(); // Refresh data
    } catch (error) {
      console.error('Error updating price:', error);
      Alert.alert('Error', 'Gagal mengupdate harga');
    } finally {
      setSaving(false);
    }
  };

  const calculatePriceAfter = () => {
    const price = parseFloat(priceForm.price) || 0;
    const discount = parseFloat(priceForm.discount) || 0;
    return price * (1 - discount / 100);
  };

  if (loading) {
    return (
      <ThemedView style={[adminStyle.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0066cc" />
        <ThemedText style={{ marginTop: 10 }}>Memuat data produk...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={adminStyle.content}>
      <ThemedText type="title" style={adminStyle.contentTitle}>Update Price and Discount</ThemedText>
      <ThemedView style={adminStyle.tableHeader}>
        <ThemedText style={[adminStyle.headerCell, { flex: 1 }]}>ID</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1.5 }]}>Product Name</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1.2 }]}>Price Before</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 0.8 }]}>Discount</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1.2 }]}>Price After</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 0.8 }]}>Action</ThemedText>
      </ThemedView>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ThemedView style={adminStyle.productRow}>
            <ThemedText style={[adminStyle.productCell, { flex: 1 }]}>{item.id}</ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1.5 }]}>{item.name}</ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1.2 }]}>
              {formatRupiah(item.priceBefore)}
            </ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 0.8 }]}>{item.discount}%</ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1.2, fontWeight: 'bold' }]}>
              {formatRupiah(item.priceAfter)}
            </ThemedText>
            <TouchableOpacity 
              style={[adminStyle.updateButton, { flex: 0.8 }]} 
              onPress={() => openEditPriceModal(item)}
            >
              <ThemedText style={adminStyle.updateButtonText}>Update</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        keyExtractor={(item) => item.id}
        style={adminStyle.productList}
        ListEmptyComponent={
          <ThemedView style={{ padding: 20, alignItems: 'center' }}>
            <ThemedText>Belum ada data produk</ThemedText>
          </ThemedView>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <ThemedView style={adminStyle.modalContainer}>
          <ThemedView style={adminStyle.modalContent}>
            <ThemedText type="title" style={adminStyle.modalTitle}>
              Edit Price: {editingProduct?.name}
            </ThemedText>
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Price"
              value={priceForm.price}
              onChangeText={(text) => setPriceForm({ ...priceForm, price: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Discount (%)"
              value={priceForm.discount}
              onChangeText={(text) => setPriceForm({ ...priceForm, discount: text })}
              keyboardType="numeric"
            />
            
            {/* Preview Price After Discount */}
            {priceForm.price && (
              <ThemedView style={{ 
                padding: 15, 
                backgroundColor: '#f0f9ff', 
                borderRadius: 8, 
                marginVertical: 10,
                borderWidth: 1,
                borderColor: '#0066cc',
              }}>
                <ThemedText style={{ fontSize: 12, color: '#666' }}>
                  Harga Setelah Diskon:
                </ThemedText>
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#0066cc' }}>
                  {formatRupiah(calculatePriceAfter())}
                </ThemedText>
              </ThemedView>
            )}

            <ThemedView style={adminStyle.modalButtons}>
              <TouchableOpacity 
                style={adminStyle.saveButton} 
                onPress={handleSavePrice}
                disabled={saving}
              >
                <ThemedText style={adminStyle.buttonText}>
                  {saving ? 'Menyimpan...' : 'Save'}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={adminStyle.cancelButton} 
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <ThemedText style={adminStyle.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}