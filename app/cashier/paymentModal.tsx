import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { cashierStyle } from '../../styles/cashierStyle';
import { formatRupiah } from './dashboard';

const CloseIcon = () => <Text style={{ fontSize: 24 }}>✕</Text>;
const CreditCardIcon = () => <Text style={{ fontSize: 40 }}>💳</Text>;
const QRCodeIcon = () => <Text style={{ fontSize: 40 }}>📱</Text>;
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

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    if (method !== 'tunai') {
      onPaymentComplete(method);
      resetState();
    }
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
                >
                  <View style={cashierStyle.paymentMethodIcon}>
                    <CreditCardIcon />
                  </View>
                  <Text style={cashierStyle.paymentMethodTitle}>Transfer Bank</Text>
                  <Text style={cashierStyle.paymentMethodDesc}>
                    Transfer ke rekening toko
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={cashierStyle.paymentMethodCard}
                  onPress={() => handlePaymentMethodSelect('qris')}
                >
                  <View style={cashierStyle.paymentMethodIcon}>
                    <QRCodeIcon />
                  </View>
                  <Text style={cashierStyle.paymentMethodTitle}>QRIS</Text>
                  <Text style={cashierStyle.paymentMethodDesc}>Scan QR code untuk bayar</Text>
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
      </View>
    </Modal>
  );
}