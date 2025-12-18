import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { cashierStyle } from '../../styles/cashierStyle';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import mqttService from '../../mqttService';
import ProductList from './productList';
import PaymentModal from './paymentModal';
import ReceiptModal from './receiptModal';

// Icons
const CheckIcon = () => <Text style={{ color: 'white', fontSize: 24 }}>✓</Text>;
const ShoppingCartIcon = () => <Text style={{ fontSize: 28 }}>🛒</Text>;

export interface Product {
  id: string;
  name: string;
  price: number;
  qty: number;
  cartId: string;
  discount?: number;
}

export interface ReceiptData {
  date: string;
  items: Product[];
  total: number;
  method: string;
  cashPaid?: number;
  change?: number;
  cartId: string;
  userId?: string;
}

export const formatRupiah = (num: number): string => {
  return `Rp ${num.toLocaleString('id-ID')}`;
};

export default function CashierDashboard() {
  const [cartId, setCartId] = useState('');
  const [currentCartId, setCurrentCartId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentSubscribedTopic, setCurrentSubscribedTopic] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [mqttConnected, setMqttConnected] = useState(false);

  // Connect to MQTT on component mount
  useEffect(() => {
    const initMQTT = async () => {
      try {
        await mqttService.connect('wss://test.mosquitto.org:8081/mqtt');
        setMqttConnected(true);
        console.log('✅ MQTT connected successfully');
      } catch (error) {
        console.error('❌ Failed to connect to MQTT:', error);
        Alert.alert('Error', 'Gagal terhubung ke MQTT broker');
      }
    };

    initMQTT();

    return () => {
      mqttService.disconnect();
    };
  }, []);

  const hasReceivedPaymentRef = React.useRef(false);

  const handleMQTTMessage = async (data: any) => {
    // Stop if already received payment
    if (hasReceivedPaymentRef.current) {
      console.log('⚠️ Already received payment data, ignoring...');
      return;
    }

    console.log('📨 Received MQTT message:', JSON.stringify(data, null, 2));

    try {
      // Parse data jika berupa string
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse MQTT data as JSON:', e);
          return;
        }
      }

      const { items, id } = parsedData;

      if (!items || !Array.isArray(items)) {
        console.error('❌ Invalid MQTT data format. Expected: { id: "userId", items: [...] }');
        console.error('Received:', parsedData);
        return;
      }

      if (items.length === 0) {
        console.warn('⚠️ Items array is empty');
        return;
      }

      // Save user ID from MQTT payload
      setCurrentUserId(id || 'unknown');
      console.log('📥 Received user ID:', id);

      console.log(`🛒 Processing ${items.length} items...`);

      const productsData: Product[] = [];
      const notFoundProducts: string[] = [];

      for (const item of items) {
        if (!item.id) {
          console.warn('⚠️ Item missing id:', item);
          continue;
        }

        const productDoc = await getDoc(doc(db, 'products', item.id));
        if (productDoc.exists()) {
          const p = productDoc.data();
          productsData.push({
            id: item.id,
            name: p.name,
            price: p.price,
            qty: item.qty || 1,
            cartId: currentCartId || 'UNKNOWN',
            discount: p.discount || 0,
          });
          console.log(`✅ Added product: ${p.name} (qty: ${item.qty || 1})`);
        } else {
          console.warn(`⚠️ Product not found in database: ${item.id}`);
          notFoundProducts.push(item.id);
        }
      }

      // Set flag after processing to prevent looping
      hasReceivedPaymentRef.current = true;

      if (productsData.length > 0) {
        setProducts(productsData);
        console.log(`✅ Successfully loaded ${productsData.length} products to cart`);
        
        // Show warning if some products not found
        if (notFoundProducts.length > 0) {
          Alert.alert(
            'Peringatan',
            `${productsData.length} produk berhasil ditambahkan.\n\n${notFoundProducts.length} produk tidak ditemukan:\n${notFoundProducts.slice(0, 3).join(', ')}${notFoundProducts.length > 3 ? '...' : ''}`
          );
        }

        // Stop listening after receiving payment
        if (currentSubscribedTopic) {
          mqttService.unsubscribe(currentSubscribedTopic, handleMQTTMessage);
          console.log(`🛑 Unsubscribed after receiving payment: ${currentSubscribedTopic}`);
          setCurrentSubscribedTopic(null);
        }
      } else {
        console.error('❌ No valid products found');
        const errorMessage = notFoundProducts.length > 0
          ? `Produk tidak ditemukan di database:\n${notFoundProducts.join(', ')}\n\nPastikan produk sudah terdaftar di Firebase.`
          : 'Tidak ada produk valid yang ditemukan';
        
        Alert.alert('Error', errorMessage);
        
        // Stop listening after error to prevent looping
        if (currentSubscribedTopic) {
          mqttService.unsubscribe(currentSubscribedTopic, handleMQTTMessage);
          console.log(`🛑 Unsubscribed after error: ${currentSubscribedTopic}`);
          setCurrentSubscribedTopic(null);
        }
      }

    } catch (err) {
      console.error('❌ Error processing MQTT message:', err);
      Alert.alert('Error', 'Gagal memproses data dari MQTT');
    }
  };

  const handleAddCart = async () => {
    if (!cartId.trim()) {
      Alert.alert('Error', 'Masukkan ID keranjang!');
      return;
    }

    if (!mqttConnected) {
      Alert.alert('Error', 'MQTT belum terhubung!');
      return;
    }

    try {
      // Unsubscribe dari topic sebelumnya jika ada
      if (currentSubscribedTopic) {
        mqttService.unsubscribe(currentSubscribedTopic, handleMQTTMessage);
        console.log(`Unsubscribed from: ${currentSubscribedTopic}`);
      }

      // Reset state untuk cart baru
      hasReceivedPaymentRef.current = false;
      setProducts([]);
      setCurrentUserId(null);

      // Subscribe ke topic baru dengan format: {cartId}/payment
      const topic = `${cartId.trim()}/payment`;
      mqttService.subscribe(topic, handleMQTTMessage);
      setCurrentSubscribedTopic(topic);
      setCurrentCartId(cartId.trim());

      console.log(`✅ Subscribed to topic: ${topic}`);
      console.log(`🔄 Reset payment flag, ready to receive data`);
      
      Alert.alert(
        'Berhasil', 
        `Terhubung ke keranjang ${cartId.trim()}\nMenunggu data dari topic...`
      );
      
      // Clear input
      setCartId('');
    } catch (error) {
      console.error('Error subscribing to MQTT:', error);
      Alert.alert('Error', 'Gagal subscribe ke topic MQTT');
    }
  };

  const updateQty = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, qty: newQty } : p)));
  };

  const removeProduct = (id: string) => {
    Alert.alert('Konfirmasi', 'Hapus produk ini dari keranjang?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => setProducts((prev) => prev.filter((p) => p.id !== id)),
      },
    ]);
  };

  const calculateTotal = (): number => {
    return products.reduce((sum, p) => {
      const discountedPrice = p.price * (1 - (p.discount || 0) / 100);
      return sum + discountedPrice * p.qty;
    }, 0);
  };

  const totalItems = products.reduce((sum, p) => sum + p.qty, 0);
  const totalAmount = calculateTotal();

  const handlePaymentComplete = async (method: string, cashPaid?: number) => {
    const finalCartId = currentCartId || 'UNKNOWN';
    const finalUserId = currentUserId || 'unknown';
    
    const receipt: ReceiptData = {
      date: new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
      }),
      items: products,
      total: totalAmount,
      method: method,
      cashPaid: cashPaid,
      change: cashPaid ? cashPaid - totalAmount : undefined,
      cartId: finalCartId,
      userId: finalUserId,
    };

    try {
      // 1. Save to User History (if userId is available)
      if (finalUserId !== 'unknown') {
        const userHistoryRef = collection(db, 'users', finalUserId, 'history');
        const transactionData = {
          cartNumber: finalCartId,
          items: products.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            subtotal: item.price * item.qty * (1 - (item.discount || 0) / 100)
          })),
          totalItems: totalItems,
          totalPrice: totalAmount,
          paymentMethod: method,
          cashPaid: cashPaid || null,
          change: cashPaid ? cashPaid - totalAmount : null,
          timestamp: serverTimestamp(),
          createdAt: new Date().toISOString(),
          status: 'paid'
        };

        await addDoc(userHistoryRef, transactionData);
        console.log('✅ Transaction saved to user history:', finalUserId);
      }

      // 2. Save to Global Transactions
      await addDoc(collection(db, 'transactions'), {
        cartNumber: finalCartId,
        userId: finalUserId,
        items: products.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          subtotal: item.price * item.qty * (1 - (item.discount || 0) / 100)
        })),
        totalItems: totalItems,
        totalPrice: totalAmount,
        paymentMethod: method,
        cashPaid: cashPaid || null,
        change: cashPaid ? cashPaid - totalAmount : null,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        status: 'paid'
      });

      console.log('✅ Transaction saved to global transactions');

      // 3. 🔥 SEND PAYMENT STATUS "PAID" VIA MQTT (untuk tunai DAN transfer)
      if (mqttConnected && finalCartId !== 'UNKNOWN') {
        const paymentStatusTopic = `${finalCartId}/payment-status`;
        const paymentStatusPayload = {
          status: 'paid',
          userId: finalUserId,
          cartId: finalCartId,
          totalAmount: totalAmount,
          paymentMethod: method,
          timestamp: new Date().toISOString()
        };

        mqttService.publish(
          paymentStatusTopic, 
          JSON.stringify(paymentStatusPayload)
        );
        
        console.log('📤 Payment status "paid" sent to MQTT:', paymentStatusTopic);
        console.log('📤 Payload:', paymentStatusPayload);
      }

      // 4. Show receipt
      setReceiptData(receipt);
      setShowReceipt(true);
      setShowPayment(false);

      Alert.alert(
        'Pembayaran Berhasil!', 
        `Transaksi untuk user "${finalUserId}" telah disimpan.\nStatus pembayaran telah dikirim ke keranjang via MQTT.`
      );

    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      Alert.alert('Error', 'Gagal menyimpan transaksi: ' + (error as Error).message);
    }
  };

  const resetTransaction = () => {
    setProducts([]);
    setShowReceipt(false);
    setReceiptData(null);
    setCurrentUserId(null);
    
    // Unsubscribe from current topic
    if (currentSubscribedTopic) {
      mqttService.unsubscribe(currentSubscribedTopic, handleMQTTMessage);
      setCurrentSubscribedTopic(null);
      setCurrentCartId(null);
    }

    // Reset payment received flag
    hasReceivedPaymentRef.current = false;
  };

  return (
    <ThemedView style={cashierStyle.container}>
      {/* Header */}
      <View style={cashierStyle.header}>
        <Text style={cashierStyle.headerTitle}>Dashboard Kasir IoT</Text>
        <Text style={cashierStyle.headerSubtitle}>
          Scan keranjang belanja untuk memulai transaksi
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          {mqttConnected ? (
            <Text style={{ color: 'green', fontSize: 12 }}>● MQTT Connected</Text>
          ) : (
            <Text style={{ color: 'red', fontSize: 12 }}>● MQTT Disconnected</Text>
          )}
          {currentSubscribedTopic && (
            <Text style={{ color: 'blue', fontSize: 12 }}>
              📡 Listening: {currentSubscribedTopic}
            </Text>
          )}
          {currentUserId && (
            <Text style={{ color: 'purple', fontSize: 12 }}>
              👤 User: {currentUserId}
            </Text>
          )}
        </View>
      </View>

      {/* Add Cart Section */}
      <View style={cashierStyle.addCartContainer}>
        <View style={cashierStyle.addCartHeader}>
          <ShoppingCartIcon />
          <Text style={cashierStyle.addCartTitle}>Add Shopping Cart</Text>
        </View>
        <View style={cashierStyle.addCartInputRow}>
          <View style={cashierStyle.addCartDivider} />
          <TextInput
            style={cashierStyle.cartInput}
            placeholder="Masukkan ID Keranjang"
            value={cartId}
            onChangeText={setCartId}
            onSubmitEditing={handleAddCart}
          />
          <TouchableOpacity style={cashierStyle.addCartButton} onPress={handleAddCart}>
            <CheckIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={cashierStyle.mainContent}>
        {products.length > 0 ? (
          <ProductList
            products={products}
            totalItems={totalItems}
            totalAmount={totalAmount}
            onUpdateQty={updateQty}
            onRemoveProduct={removeProduct}
            onCheckout={() => setShowPayment(true)}
          />
        ) : (
          <View style={cashierStyle.emptyState}>
            <ShoppingCartIcon />
            <Text style={cashierStyle.emptyStateText}>
              Belum ada produk. Masukkan ID keranjang dan klik centang untuk mulai listening.
            </Text>
            {currentSubscribedTopic && (
              <>
                <Text style={{ color: '#666', marginTop: 10, fontSize: 12 }}>
                  Menunggu data dari topic: {currentSubscribedTopic}
                </Text>
                <Text style={{ color: '#999', marginTop: 5, fontSize: 10, textAlign: 'center' }}>
                  Format JSON:{'\n'}
                  {`{ id: "username", items: [{ id: "product_id", qty: 2 }] }`}
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPayment}
        totalAmount={totalAmount}
        onClose={() => setShowPayment(false)}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        visible={showReceipt}
        receiptData={receiptData}
        onClose={resetTransaction}
      />
    </ThemedView>
  );
}