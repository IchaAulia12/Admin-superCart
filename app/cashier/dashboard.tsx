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
        console.log('MQTT connected successfully');
      } catch (error) {
        console.error('Failed to connect to MQTT:', error);
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
      return;
    }

    hasReceivedPaymentRef.current = true;

    try {
      const { items, id } = data;

      // Save user ID from MQTT payload
      setCurrentUserId(id || 'unknown');
      console.log('📥 Received user ID:', id);

      if (!items || !Array.isArray(items)) {
        console.error('Invalid MQTT data format');
        return;
      }

      const productsData: Product[] = [];

      for (const item of items) {
        const productDoc = await getDoc(doc(db, 'products', item.id));
        if (productDoc.exists()) {
          const p = productDoc.data();
          productsData.push({
            id: item.id,
            name: p.name,
            price: p.price,
            qty: item.qty,
            cartId: currentCartId || 'UNKNOWN',
            discount: p.discount || 0,
          });
        }
      }

      setProducts(productsData);

      // Stop listening after successful receipt
      if (currentSubscribedTopic) {
        mqttService.unsubscribe(currentSubscribedTopic, handleMQTTMessage);
        console.log(`🛑 Unsubscribed after first payment: ${currentSubscribedTopic}`);
        setCurrentSubscribedTopic(null);
      }

    } catch (err) {
      console.error(err);
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
      // Unsubscribe from previous topic if exists
      if (currentSubscribedTopic) {
        mqttService.unsubscribe(currentSubscribedTopic, handleMQTTMessage);
        console.log(`Unsubscribed from: ${currentSubscribedTopic}`);
      }

      // Reset received payment flag
      hasReceivedPaymentRef.current = false;

      // Subscribe to new topic with format: {cartId}/payment
      const topic = `${cartId}/payment`;
      mqttService.subscribe(topic, handleMQTTMessage);
      setCurrentSubscribedTopic(topic);
      setCurrentCartId(cartId);

      console.log(`Subscribed to topic: ${topic}`);
      Alert.alert(
        'Berhasil', 
        `Terhubung ke keranjang ${cartId}`
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
      // 1. Save to User History
      if (finalUserId !== 'unknown') {
        const userHistoryRef = collection(db, 'users', finalUserId, 'history');
        const transactionData = {
          cartNumber: finalCartId,
          items: products.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            subtotal: item.price * item.qty
          })),
          totalItems: totalItems,
          totalPrice: totalAmount,
          paymentMethod: method,
          cashPaid: cashPaid,
          change: cashPaid ? cashPaid - totalAmount : undefined,
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
          subtotal: item.price * item.qty
        })),
        totalItems: totalItems,
        totalPrice: totalAmount,
        paymentMethod: method,
        cashPaid: cashPaid,
        change: cashPaid ? cashPaid - totalAmount : undefined,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        status: 'paid'
      });

      console.log('✅ Transaction saved to global transactions');

      // 3. Send payment status "paid" via MQTT
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
        
        console.log('📤 Payment status sent to MQTT:', paymentStatusTopic, paymentStatusPayload);
      }

      // 4. Show receipt
      setReceiptData(receipt);
      setShowReceipt(true);
      setShowPayment(false);

      Alert.alert(
        'Pembayaran Berhasil!', 
        `Transaksi untuk user "${finalUserId}" telah disimpan.\nStatus pembayaran telah dikirim ke keranjang.`
      );

    } catch (error) {
      console.error('Error saving transaction:', error);
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