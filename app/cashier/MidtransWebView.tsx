import React, { useRef } from 'react';
import { ActivityIndicator, Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MidtransWebViewProps {
  visible: boolean;
  snapUrl: string;
  onClose: () => void;
  onPaymentResult: (result: 'success' | 'pending' | 'error') => void;
}

export default function MidtransWebView({ visible, snapUrl, onClose, onPaymentResult }: MidtransWebViewProps) {
  const hasProcessedResult = useRef(false);

  // Listen for navigation changes to detect payment result
  const handleNavigationStateChange = (navState: any) => {
    const url = navState.url || '';
    
    // Prevent multiple processing
    if (hasProcessedResult.current) return;

    console.log('🔍 Midtrans navigation URL:', url);

    // Check for success indicators (Midtrans redirect patterns)
    const isSuccess = 
      // Standard Midtrans finish URLs
      url.includes('/finish') ||
      url.includes('/vtweb/finish') ||
      url.includes('/snap/v2/vtweb/finish') ||
      // Status codes
      url.includes('status_code=200') ||
      url.includes('status_code=201') && url.includes('settlement') ||
      // Transaction status
      url.includes('transaction_status=settlement') ||
      url.includes('transaction_status=capture') ||
      // Example.com redirect (Midtrans sandbox redirect)
      (url.includes('example.com') && !url.includes('error')) ||
      // Any URL that contains success indicators after payment
      (url.includes('example.com') && (url.includes('success') || url.includes('settlement')));

    // Check for pending indicators
    const isPending = 
      url.includes('/pending') ||
      url.includes('/vtweb/pending') ||
      url.includes('transaction_status=pending') ||
      (url.includes('status_code=201') && !url.includes('settlement'));

    // Check for error indicators
    const isError = 
      url.includes('/error') ||
      url.includes('/vtweb/error') ||
      url.includes('transaction_status=deny') ||
      url.includes('transaction_status=cancel') ||
      url.includes('transaction_status=expire') ||
      url.includes('status_code=400') ||
      url.includes('status_code=401') ||
      url.includes('status_code=402') ||
      url.includes('status_code=403') ||
      (url.includes('example.com') && url.includes('error'));

    if (isSuccess) {
      hasProcessedResult.current = true;
      console.log('✅ Payment success detected from URL:', url);
      // Close WebView first, then show alert
      setTimeout(() => {
        onClose();
      onPaymentResult('success');
      }, 300);
    } else if (isPending) {
      hasProcessedResult.current = true;
      console.log('⏳ Payment pending detected from URL:', url);
      setTimeout(() => {
      onClose();
      onPaymentResult('pending');
      }, 300);
    } else if (isError) {
      hasProcessedResult.current = true;
      console.log('❌ Payment error detected from URL:', url);
      setTimeout(() => {
      onClose();
      onPaymentResult('error');
      }, 300);
    }
  };

  // Reset flag when modal opens
  React.useEffect(() => {
    if (visible) {
      hasProcessedResult.current = false;
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Close Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              hasProcessedResult.current = false;
              onClose();
            }}
          >
            <Text style={styles.closeButtonText}>✕ Tutup</Text>
          </TouchableOpacity>
        </View>
        
        <WebView
          source={{ uri: snapUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState
          onShouldStartLoadWithRequest={(request) => {
            // Allow all navigation
            return true;
          }}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Memuat halaman pembayaran...</Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});
