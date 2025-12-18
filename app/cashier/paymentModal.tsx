import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { cashierStyle } from '../../styles/cashierStyle';
import { formatRupiah } from './dashboard';
import MidtransWebView from './MidtransWebView';

// Get the host IP from Expo manifest or use default
function getDevServerHost(): string {
  const manifest = Constants.expoConfig?.extra?.devServerHost;
  if (manifest) return manifest;

  const debuggerHost = Constants.expoConfig?.hostUri || Constants.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  return '192.168.110.244'; // Default fallback - sesuaikan dengan IP Anda
}

// Call local dev server to get Snap URL (for development only)
async function getMidtransSnapUrl(totalAmount: number): Promise<string> {
  const host = getDevServerHost();
  const url = `http://${host}:3001/snap?amount=${totalAmount}`;
  
  console.log(`🔗 Fetching Snap URL from: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`❌ Snap URL fetch failed: ${resp.status} - ${errorText}`);
      throw new Error(`Failed to get Snap URL: ${resp.status} ${errorText}`);
    }
    
    const data = await resp.json();
    
    if (!data.snap_url) {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid response: snap_url not found');
    }
    
    console.log(`✅ Snap URL received: ${data.snap_url.substring(0, 50)}...`);
    return data.snap_url;
  } catch (error: any) {
    console.error('❌ Error fetching Snap URL:', error);
    
    if (error.name === 'AbortError') {
      throw new Error(`Timeout: Server tidak merespons dalam 10 detik. Pastikan dev server berjalan di ${host}:3001`);
    }
    
    if (error.message?.includes('Network request failed') || 
        error.message?.includes('Failed to connect') ||
        error.message?.includes('NetworkError')) {
      throw new Error(`Tidak bisa terhubung ke server di ${host}:3001\n\nPastikan:\n1. Dev server berjalan: node scripts/dev-server.js\n2. IP address benar: ${host}\n3. Firewall tidak memblokir port 3001`);
    }
    
    throw error;
  }
}

const CloseIcon = () => <Text style={{ fontSize: 24 }}>✕</Text>;
const CreditCardIcon = () => <Text style={{ fontSize: 40 }}>💳</Text>;
const CashIcon = () => <Text style={{ fontSize: 40 }}>💵</Text>;

interface PaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onClose: () => void;
  onPaymentComplete: (method: string, cashPaid?: number) => void;
}

export default function PaymentModal({
  visible,
  totalAmount,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [showMidtrans, setShowMidtrans] = useState(false);
  const [snapUrl, setSnapUrl] = useState<string | null>(null);
  const [loadingSnap, setLoadingSnap] = useState(false);

  const handlePaymentMethodSelect = async (method: string) => {
    setPaymentMethod(method);
    if (method === 'transfer') {
      // For transfer payment, open Midtrans Snap
      setLoadingSnap(true);
      try {
        const url = await getMidtransSnapUrl(totalAmount);
        setSnapUrl(url);
        setShowMidtrans(true);
      } catch (e: any) {
        const errorMessage = e?.message || 'Gagal mendapatkan Snap URL';
        console.error('Payment method select error:', e);
        Alert.alert(
          'Error', 
          errorMessage + '\n\nPastikan dev server berjalan:\nnode scripts/dev-server.js'
        );
        setPaymentMethod('');
      } finally {
        setLoadingSnap(false);
      }
    }
    // For cash payment, do nothing here - wait for user to enter amount
  };

  const handleCashPayment = () => {
    const cash = parseInt(cashAmount);
    if (!cash || cash < totalAmount) {
      Alert.alert('Error', 'Jumlah uang tidak cukup!');
      return;
    }
    onPaymentComplete('tunai', cash);
    resetState();
  };

  const resetState = () => {
    setPaymentMethod('');
    setCashAmount('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={cashierStyle.modalOverlay}>
        <View style={cashierStyle.modalContainer}>
          {/* Header */}
          <View style={cashierStyle.modalHeader}>
            <Text style={cashierStyle.modalTitle}>Pilih Metode Pembayaran</Text>
            <TouchableOpacity
              style={cashierStyle.closeButton}
              onPress={handleClose}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>
          <ScrollView style={cashierStyle.modalContent}>
            {/* Summary */}
            <View style={cashierStyle.paymentSummary}>
              <Text style={cashierStyle.paymentSummaryText}>Total Belanja</Text>
              <Text style={cashierStyle.paymentTotal}>{formatRupiah(totalAmount)}</Text>
            </View>
            {/* Payment Methods */}
            {!paymentMethod ? (
              <View style={cashierStyle.paymentMethodsGrid}>
                <TouchableOpacity
                  style={cashierStyle.paymentMethodCard}
                  onPress={() => handlePaymentMethodSelect('transfer')}
                  disabled={loadingSnap}
                >
                  <View style={cashierStyle.paymentMethodIcon}>
                    <CreditCardIcon />
                  </View>
                  <Text style={cashierStyle.paymentMethodTitle}>Transfer Bank</Text>
                  <Text style={cashierStyle.paymentMethodDesc}>
                    Transfer via Midtrans
                  </Text>
                  {loadingSnap && <Text style={{ color: 'gray', fontSize: 12, marginTop: 8 }}>Memuat...</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={cashierStyle.paymentMethodCard}
                  onPress={() => setPaymentMethod('tunai')}
                >
                  <View style={cashierStyle.paymentMethodIcon}>
                    <CashIcon />
                  </View>
                  <Text style={cashierStyle.paymentMethodTitle}>Tunai</Text>
                  <Text style={cashierStyle.paymentMethodDesc}>
                    Pembayaran dengan uang tunai
                  </Text>
                </TouchableOpacity>
              </View>
            ) : paymentMethod === 'tunai' ? (
              <View>
                <View style={cashierStyle.cashInputContainer}>
                  <Text style={cashierStyle.cashInputLabel}>Jumlah Uang Dibayar</Text>
                  <TextInput
                    style={cashierStyle.cashInput}
                    value={cashAmount}
                    onChangeText={setCashAmount}
                    placeholder="Masukkan jumlah uang"
                    keyboardType="numeric"
                  />
                </View>

                {cashAmount && parseInt(cashAmount) >= totalAmount && (
                  <View style={cashierStyle.changeContainer}>
                    <Text style={cashierStyle.changeLabel}>Kembalian</Text>
                    <Text style={cashierStyle.changeAmount}>
                      {formatRupiah(parseInt(cashAmount) - totalAmount)}
                    </Text>
                  </View>
                )}

                <View style={cashierStyle.modalButtonsContainer}>
                  <TouchableOpacity
                    style={[cashierStyle.modalButton, cashierStyle.modalButtonSecondary]}
                    onPress={() => {
                      setPaymentMethod('');
                      setCashAmount('');
                    }}
                  >
                    <Text style={cashierStyle.modalButtonText}>Kembali</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[cashierStyle.modalButton, cashierStyle.modalButtonPrimary]}
                    onPress={handleCashPayment}
                  >
                    <Text style={cashierStyle.modalButtonText}>Proses Pembayaran</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
        {/* Midtrans Snap WebView (always rendered at modal root) */}
        {showMidtrans && snapUrl && (
          <MidtransWebView
            visible={showMidtrans}
            snapUrl={snapUrl}
            onClose={() => {
              setShowMidtrans(false);
              setSnapUrl(null);
              setPaymentMethod('');
            }}
            onPaymentResult={(result) => {
              // Close WebView first
              setShowMidtrans(false);
              setSnapUrl(null);
              
              if (result === 'success') {
                // Show success alert
                Alert.alert(
                  '✅ Pembayaran Berhasil',
                  'Transaksi berhasil diproses!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onPaymentComplete('transfer');
                        resetState();
                      }
                    }
                  ],
                  { cancelable: false }
                );
              } else if (result === 'pending') {
                Alert.alert(
                  '⏳ Pembayaran Pending',
                  'Transaksi sedang diproses. Silakan cek status pembayaran di dashboard atau email Anda.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setPaymentMethod('');
                        resetState();
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  '❌ Pembayaran Gagal',
                  'Transaksi gagal atau dibatalkan. Silakan coba lagi.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setPaymentMethod('');
                        resetState();
                      }
                    }
                  ]
                );
              }
            }}
          />
        )}
      </View>
    </Modal>
  );
}