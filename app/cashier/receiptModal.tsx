import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert, Platform } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { cashierStyle } from '../../styles/cashierStyle';
import { ReceiptData, formatRupiah } from './dashboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

//const PrinterIcon = () => <Text style={{ fontSize: 20, color: 'white' }}>🖨️</Text>;

interface ReceiptModalProps {
  visible: boolean;
  receiptData: ReceiptData | null;
  onClose: () => void;
}

export default function ReceiptModal({
  visible,
  receiptData,
  onClose,
}: ReceiptModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const generatePDFFilename = (): string => {
    if (!receiptData) return 'receipt.pdf';
    
    const now = new Date();
    const date = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    const time = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/:/g, '-');
    
    return `${receiptData.cartId}-${time}-${date}.pdf`;
  };

  const generateHTMLReceipt = (): string => {
    if (!receiptData) return '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          }
          .receipt-container {
            border: 2px solid #000;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          .store-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .store-info {
            font-size: 12px;
            margin: 2px 0;
          }
          .info-section {
            margin: 15px 0;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin: 3px 0;
          }
          .items-section {
            margin: 15px 0;
          }
          .item {
            margin: 10px 0;
            border-bottom: 1px dotted #ccc;
            padding-bottom: 8px;
          }
          .item-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .item-detail {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }
          .total-section {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 15px 0;
            margin: 15px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: bold;
            margin: 8px 0;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 2px dashed #000;
            padding-top: 15px;
          }
          .footer-text {
            font-size: 12px;
            margin: 3px 0;
          }
          .bold {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header -->
          <div class="header">
            <div class="store-name">TOKO SERBAGUNA</div>
            <div class="store-info">Jl. Raya Makmur No. 123, Jakarta</div>
            <div class="store-info">Telp: 0812-3456-7890</div>
          </div>

          <!-- Info -->
          <div class="info-section">
            <div class="info-row">
              <span>Tanggal:</span>
              <span>${receiptData.date}</span>
            </div>
            <div class="info-row">
              <span>Kasir:</span>
              <span>Admin</span>
            </div>
            <div class="info-row">
              <span>No. Transaksi:</span>
              <span>TRX${Date.now()}</span>
            </div>
            <div class="info-row">
              <span>ID Keranjang:</span>
              <span class="bold">${receiptData.cartId}</span>
            </div>
          </div>

          <!-- Items -->
          <div class="items-section">
            ${receiptData.items.map(item => `
              <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-detail">
                  <span>${item.qty} x ${formatRupiah(item.price)}</span>
                  <span class="bold">${formatRupiah(item.qty * item.price)}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Total -->
          <div class="total-section">
            <div class="total-row">
              <span>TOTAL</span>
              <span>${formatRupiah(receiptData.total)}</span>
            </div>
            <div class="payment-row">
              <span>Metode Pembayaran:</span>
              <span class="bold">${receiptData.method.toUpperCase()}</span>
            </div>
            ${receiptData.method === 'tunai' ? `
              <div class="payment-row">
                <span>Tunai:</span>
                <span>${formatRupiah(receiptData.cashPaid || 0)}</span>
              </div>
              <div class="payment-row bold">
                <span>Kembalian:</span>
                <span>${formatRupiah(receiptData.change || 0)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-text">Terima kasih atas kunjungan Anda!</div>
            <div class="footer-text">Barang yang sudah dibeli tidak dapat ditukar</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const saveSaleToFirestore = async () => {
    if (isSaving || !receiptData) return;
    
    setIsSaving(true);
    try {
      const saleData = {
        transactionId: `TRX${Date.now()}`,
        cartId: receiptData.cartId,
        date: new Date().toISOString(),
        items: receiptData.items.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          qty: item.qty,
          subtotal: item.price * item.qty,
        })),
        total: receiptData.total,
        paymentMethod: receiptData.method,
        cashPaid: receiptData.cashPaid || null,
        change: receiptData.change || null,
        cashier: 'Admin', // TODO: Ganti dengan data kasir yang login
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'sales'), saleData);
      console.log('Sale saved to Firestore successfully');
    } catch (error) {
      console.error('Error saving sale to Firestore:', error);
      Alert.alert('Error', 'Gagal menyimpan data penjualan');
    } finally {
      setIsSaving(false);
    }
  };

  const printAndSavePDF = async () => {
    if (isPrinting || !receiptData) return;
    
    setIsPrinting(true);
    try {
      const html = generateHTMLReceipt();
      const filename = generatePDFFilename();

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html });
      
      console.log('PDF generated at:', uri);

      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        // Share/Save PDF
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Struk - ${filename}`,
          UTI: 'com.adobe.pdf'
        });
        
        Alert.alert('Sukses', `Struk PDF berhasil dibuat!\nNama file: ${filename}`);
      } else {
        // Fallback: just show alert
        Alert.alert('Info', `PDF dibuat di: ${uri}\nSharing tidak tersedia di platform ini.`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Gagal membuat PDF struk');
    } finally {
      setIsPrinting(false);
    }
  };

  // Auto-save saat receipt ditampilkan - useEffect HARUS selalu dipanggil
  useEffect(() => {
    if (visible && receiptData && !isSaving) {
      saveSaleToFirestore();
    }
  }, [visible, receiptData]);

  const handleClose = () => {
    onClose();
  };

  // Early return SETELAH semua hooks
  if (!receiptData) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={cashierStyle.modalOverlay}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={cashierStyle.receiptContainer}>
            {/* Header */}
            <View style={cashierStyle.receiptHeader}>
              <Text style={cashierStyle.receiptStoreName}>TOKO SERBAGUNA</Text>
              <Text style={cashierStyle.receiptStoreInfo}>
                Jl. Raya Makmur No. 123, Jakarta
              </Text>
              <Text style={cashierStyle.receiptStoreInfo}>Telp: 0812-3456-7890</Text>
            </View>

            {/* Info */}
            <View style={cashierStyle.receiptInfo}>
              <Text style={cashierStyle.receiptInfoText}>Tanggal: {receiptData.date}</Text>
              <Text style={cashierStyle.receiptInfoText}>Kasir: Admin</Text>
              <Text style={cashierStyle.receiptInfoText}>No. Transaksi: TRX{Date.now()}</Text>
              <Text style={[cashierStyle.receiptInfoText, { fontWeight: 'bold', color: '#0066cc' }]}>
                ID Keranjang: {receiptData.cartId}
              </Text>
            </View>

            {/* Items */}
            <View style={cashierStyle.receiptItems}>
              {receiptData.items.map((item, idx) => (
                <View key={idx} style={cashierStyle.receiptItem}>
                  <Text style={cashierStyle.receiptItemName}>{item.name}</Text>
                  <View style={cashierStyle.receiptItemDetail}>
                    <Text style={cashierStyle.receiptItemQty}>
                      {item.qty} x {formatRupiah(item.price)}
                    </Text>
                    <Text style={cashierStyle.receiptItemPrice}>
                      {formatRupiah(item.qty * item.price)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={cashierStyle.receiptTotal}>
              <View style={cashierStyle.receiptTotalRow}>
                <Text style={cashierStyle.receiptTotalLabel}>TOTAL</Text>
                <Text style={cashierStyle.receiptTotalAmount}>
                  {formatRupiah(receiptData.total)}
                </Text>
              </View>
              <View style={cashierStyle.receiptPaymentRow}>
                <Text style={cashierStyle.receiptPaymentLabel}>Metode Pembayaran</Text>
                <Text style={[cashierStyle.receiptPaymentValue, { textTransform: 'uppercase' }]}>
                  {receiptData.method}
                </Text>
              </View>
              {receiptData.method === 'tunai' && (
                <>
                  <View style={cashierStyle.receiptPaymentRow}>
                    <Text style={cashierStyle.receiptPaymentLabel}>Tunai</Text>
                    <Text style={cashierStyle.receiptPaymentValue}>
                      {formatRupiah(receiptData.cashPaid || 0)}
                    </Text>
                  </View>
                  <View style={cashierStyle.receiptPaymentRow}>
                    <Text style={[cashierStyle.receiptPaymentLabel, { fontWeight: 'bold' }]}>
                      Kembalian
                    </Text>
                    <Text style={[cashierStyle.receiptPaymentValue, { fontWeight: 'bold' }]}>
                      {formatRupiah(receiptData.change || 0)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Footer */}
            <View style={cashierStyle.receiptFooter}>
              <Text style={cashierStyle.receiptFooterText}>
                Terima kasih atas kunjungan Anda!
              </Text>
              <Text style={cashierStyle.receiptFooterText}>
                Barang yang sudah dibeli tidak dapat ditukar
              </Text>
            </View>

            {/* Buttons */}
            <View style={cashierStyle.receiptButtons}>
              <TouchableOpacity
                style={[cashierStyle.receiptButton, cashierStyle.receiptButtonPrint]}
                onPress={printAndSavePDF}
                disabled={isPrinting}
              >
                <Text style={cashierStyle.receiptButtonText}>
                  {isPrinting ? 'Membuat PDF...' : 'Cetak/Save PDF'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[cashierStyle.receiptButton, cashierStyle.receiptButtonNew]}
                onPress={handleClose}
              >
                <Text style={cashierStyle.receiptButtonText}>Transaksi Baru</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}