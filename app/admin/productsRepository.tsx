import React, { useState, useEffect } from 'react';
import { TouchableOpacity, FlatList, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { adminStyle } from "../../styles/adminStyle";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  discount: number;
}

const formatRupiah = (num: number) => {
  return `Rp ${num.toLocaleString('id-ID').replace(/,/g, '.')},00`;
};

export default function ProductsRepository() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    price: '',
    stock: '',
    discount: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch products from Firestore
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData: Product[] = [];
      
      querySnapshot.forEach((docSnap) => {
        productsData.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as Product);
      });
      
      // Sort by ID
      productsData.sort((a, b) => a.id.localeCompare(b.id));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Gagal memuat data produk dari Firestore');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      discount: product.discount.toString(),
    });
    setIsAdding(false);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      id: '',
      name: '',
      price: '',
      stock: '',
      discount: '',
    });
    setIsAdding(true);
    setModalVisible(true);
  };

  const checkProductIdExists = async (productId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking product ID:', error);
      return false;
    }
  };

  const handleSaveProduct = async () => {
    // Validation
    if (!productForm.id || !productForm.name || !productForm.price || !productForm.stock) {
      Alert.alert('Error', 'Mohon isi semua field yang diperlukan (ID, Name, Price, Stock)');
      return;
    }

    // Validate Product ID format (alphanumeric, no spaces)
    const productIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!productIdRegex.test(productForm.id)) {
      Alert.alert(
        'Error', 
        'Product ID hanya boleh mengandung huruf, angka, underscore (_), dan dash (-)\nTidak boleh ada spasi!'
      );
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        discount: parseFloat(productForm.discount) || 0,
      };

      if (isAdding) {
        // Check if Product ID already exists
        const exists = await checkProductIdExists(productForm.id);
        if (exists) {
          Alert.alert('Error', `Product ID "${productForm.id}" sudah terdaftar!\nSilakan gunakan ID lain.`);
          setSaving(false);
          return;
        }

        // Add new product with custom ID
        await setDoc(doc(db, 'products', productForm.id), productData);
        Alert.alert('Sukses', `Produk dengan ID "${productForm.id}" berhasil ditambahkan`);
      } else {
        // Update existing product (ID tidak bisa diubah)
        await updateDoc(doc(db, 'products', editingProduct!.id), productData);
        Alert.alert('Sukses', 'Produk berhasil diupdate');
      }

      setModalVisible(false);
      setEditingProduct(null);
      fetchProducts(); // Refresh data
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = () => {
    if (!editingProduct) return;

    Alert.alert(
      'Konfirmasi',
      `Apakah Anda yakin ingin menghapus produk "${editingProduct.name}"?\nID: ${editingProduct.id}`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await deleteDoc(doc(db, 'products', editingProduct.id));
              Alert.alert('Sukses', 'Produk berhasil dihapus');
              setModalVisible(false);
              setEditingProduct(null);
              fetchProducts(); // Refresh data
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Gagal menghapus produk');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <ThemedView style={adminStyle.productRow}>
      <ThemedText style={[adminStyle.productCell, { fontWeight: 'bold', color: '#0066cc' }]}>
        {item.id}
      </ThemedText>
      <ThemedText style={adminStyle.productCell}>{item.name}</ThemedText>
      <ThemedText style={adminStyle.productCell}>{formatRupiah(item.price)}</ThemedText>
      <ThemedText style={adminStyle.productCell}>{item.stock}</ThemedText>
      <ThemedText style={adminStyle.productCell}>{item.discount}%</ThemedText>
      <TouchableOpacity style={adminStyle.updateButton} onPress={() => openEditModal(item)}>
        <ThemedText style={adminStyle.updateButtonText}>Update</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

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
      <ThemedText type="title" style={adminStyle.contentTitle}>Products Repository</ThemedText>
      
      {/* Info Box */}
      <ThemedView style={{ 
        backgroundColor: '#e3f2fd', 
        padding: 12, 
        borderRadius: 8, 
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#0066cc'
      }}>
        <ThemedText style={{ fontSize: 12, color: '#0d47a1' }}>
          💡 <ThemedText style={{ fontWeight: 'bold' }}>Product ID</ThemedText> harus sesuai dengan barcode di kemasan produk.
          ID tidak bisa diubah setelah dibuat. Format: huruf, angka, underscore (_), dash (-).
        </ThemedText>
      </ThemedView>

      <ThemedView style={adminStyle.tableHeader}>
        <ThemedText style={adminStyle.headerCell}>Product ID</ThemedText>
        <ThemedText style={adminStyle.headerCell}>Name</ThemedText>
        <ThemedText style={adminStyle.headerCell}>Price</ThemedText>
        <ThemedText style={adminStyle.headerCell}>Stock</ThemedText>
        <ThemedText style={adminStyle.headerCell}>Discount</ThemedText>
        <ThemedText style={adminStyle.headerCell}>Action</ThemedText>
      </ThemedView>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        style={adminStyle.productList}
        ListEmptyComponent={
          <ThemedView style={{ padding: 30, alignItems: 'center' }}>
            <ThemedText style={{ color: '#666', fontSize: 16 }}>Belum ada produk</ThemedText>
            <ThemedText style={{ color: '#999', fontSize: 12, marginTop: 5 }}>
              Klik tombol + untuk menambah produk
            </ThemedText>
          </ThemedView>
        }
      />
      
      <TouchableOpacity style={adminStyle.fab} onPress={openAddModal}>
        <ThemedText style={adminStyle.fabText}>+</ThemedText>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <ThemedView style={adminStyle.modalContainer}>
          <ThemedView style={adminStyle.modalContent}>
            <ThemedText type="title" style={adminStyle.modalTitle}>
              {isAdding ? 'Add New Product' : 'Edit Product'}
            </ThemedText>
            
            {/* Product ID Input */}
            <ThemedView style={{ marginBottom: 5 }}>
              <ThemedText style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>
                Product ID {isAdding && '(sesuai barcode)'}
              </ThemedText>
              <TextInput
                style={[
                  adminStyle.modalInput,
                  !isAdding && { backgroundColor: '#f0f0f0', color: '#999' }
                ]}
                placeholder="Contoh: P001, PROD-123, SKU_ABC"
                value={productForm.id}
                onChangeText={(text) => setProductForm({ ...productForm, id: text.trim() })}
                editable={isAdding} // ID hanya bisa diisi saat tambah, tidak bisa edit
                autoCapitalize="characters"
              />
              {!isAdding && (
                <ThemedText style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                  ID tidak dapat diubah
                </ThemedText>
              )}
            </ThemedView>

            <TextInput
              style={adminStyle.modalInput}
              placeholder="Product Name"
              value={productForm.name}
              onChangeText={(text) => setProductForm({ ...productForm, name: text })}
            />
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Price (Rupiah)"
              value={productForm.price}
              onChangeText={(text) => setProductForm({ ...productForm, price: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Stock"
              value={productForm.stock}
              onChangeText={(text) => setProductForm({ ...productForm, stock: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Discount (%)"
              value={productForm.discount}
              onChangeText={(text) => setProductForm({ ...productForm, discount: text })}
              keyboardType="numeric"
            />
            <ThemedView style={adminStyle.modalButtons}>
              <TouchableOpacity 
                style={adminStyle.saveButton} 
                onPress={handleSaveProduct}
                disabled={saving}
              >
                <ThemedText style={adminStyle.buttonText}>
                  {saving ? 'Menyimpan...' : 'Save'}
                </ThemedText>
              </TouchableOpacity>
              {editingProduct && (
                <TouchableOpacity 
                  style={adminStyle.deleteButton} 
                  onPress={handleDeleteProduct}
                  disabled={saving}
                >
                  <ThemedText style={adminStyle.buttonText}>Delete</ThemedText>
                </TouchableOpacity>
              )}
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