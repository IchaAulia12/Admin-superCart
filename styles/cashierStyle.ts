import { StyleSheet, Dimensions, ViewStyle, TextStyle } from "react-native";

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

// Palet Warna Modern untuk Kasir
const COLORS = {
    primaryGreen: '#28A745',      // Hijau utama (untuk sukses, checkout)
    secondaryGreen: '#20C997',    // Hijau tosca (untuk highlight)
    lightGreen: '#D4EDDA',        // Hijau muda (untuk background aktif)
    primaryBlue: '#007BFF',       // Biru utama (untuk info, cart)
    lightBlue: '#E6F0FF',         // Biru muda
    white: '#FFFFFF',
    darkText: '#333333',
    lightText: '#6C757D',
    border: '#DDDDDD',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    gray: '#6C757D',
    lightGray: '#F8F9FA',
    shadowColor: '#000000',
};

// Font Family
const FONT = {
    regular: 'System',
    bold: 'System',
    medium: 'System',
};

const baseShadow = {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
};

export const cashierStyle = StyleSheet.create({
    // Container Utama
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    
    // Header Section
    header: {
        backgroundColor: COLORS.white,
        paddingHorizontal: isTablet ? 30 : 20,
        paddingVertical: isTablet ? 25 : 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...baseShadow,
    },
    
    headerTitle: {
        fontSize: isTablet ? 28 : 24,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 8,
        fontFamily: FONT.bold,
    },
    
    headerSubtitle: {
        fontSize: isTablet ? 16 : 14,
        color: COLORS.lightText,
        fontFamily: FONT.regular,
    },
    
    // Add Cart Section
    addCartContainer: {
        backgroundColor: COLORS.white,
        margin: isTablet ? 20 : 15,
        padding: isTablet ? 25 : 20,
        borderRadius: 12,
        ...baseShadow,
    },
    
    addCartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    
    addCartTitle: {
        fontSize: isTablet ? 18 : 16,
        fontWeight: '600',
        color: COLORS.darkText,
        marginLeft: 10,
        fontFamily: FONT.bold,
    },
    
    addCartInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    
    addCartDivider: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: 15,
    },
    
    cartInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: isTablet ? 14 : 12,
        fontSize: isTablet ? 16 : 14,
        backgroundColor: COLORS.white,
        fontFamily: FONT.regular,
    },
    
    addCartButton: {
        backgroundColor: COLORS.success,
        width: isTablet ? 50 : 45,
        height: isTablet ? 50 : 45,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Main Content
    mainContent: {
        flex: 1,
        paddingHorizontal: isTablet ? 20 : 15,
    },
    
    // Summary Card
    summaryCard: {
        backgroundColor: COLORS.white,
        padding: isTablet ? 25 : 20,
        borderRadius: 12,
        marginBottom: isTablet ? 20 : 15,
        ...baseShadow,
    },
    
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    
    summaryLabel: {
        fontSize: isTablet ? 16 : 14,
        color: COLORS.lightText,
        fontFamily: FONT.regular,
    },
    
    summaryValue: {
        fontSize: isTablet ? 18 : 16,
        fontWeight: '600',
        color: COLORS.darkText,
        fontFamily: FONT.bold,
    },
    
    totalContainer: {
        borderTopWidth: 2,
        borderTopColor: COLORS.primaryBlue,
        paddingTop: 15,
        marginTop: 10,
    },
    
    totalLabel: {
        fontSize: isTablet ? 18 : 16,
        fontWeight: 'bold',
        color: COLORS.darkText,
        fontFamily: FONT.bold,
    },
    
    totalAmount: {
        fontSize: isTablet ? 32 : 28,
        fontWeight: 'bold',
        color: COLORS.primaryBlue,
        fontFamily: FONT.bold,
    },
    
    // Product Table
    tableContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: isTablet ? 20 : 15,
        ...baseShadow,
    },
    
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightBlue,
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primaryBlue,
    },
    
    tableHeaderCell: {
        fontWeight: 'bold',
        fontSize: isTablet ? 15 : 13,
        color: COLORS.darkText,
        textAlign: 'center',
        fontFamily: FONT.bold,
    },
    
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    
    tableCell: {
        fontSize: isTablet ? 14 : 12,
        color: COLORS.darkText,
        textAlign: 'center',
        fontFamily: FONT.regular,
    },
    
    tableCellBold: {
        fontWeight: '600',
        fontFamily: FONT.bold,
    },
    
    // Column Widths
    colId: {
        width: '12%',
    },
    
    colName: {
        width: '25%',
    },
    
    colQty: {
        width: '20%',
    },
    
    colPrice: {
        width: '20%',
    },
    
    colTotal: {
        width: '18%',
    },
    
    colAction: {
        width: '5%',
    },
    
    // Quantity Control
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    
    qtyButton: {
        backgroundColor: COLORS.lightGray,
        width: 30,
        height: 30,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    
    qtyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkText,
        fontFamily: FONT.bold,
    },
    
    qtyInput: {
        width: 50,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 6,
        paddingVertical: 5,
        fontSize: isTablet ? 14 : 12,
        backgroundColor: COLORS.white,
        fontFamily: FONT.regular,
    },
    
    // Action Buttons
    deleteButton: {
        padding: 8,
    },
    
    checkoutButton: {
        backgroundColor: COLORS.primaryBlue,
        paddingVertical: isTablet ? 18 : 15,
        borderRadius: 10,
        alignItems: 'center',
        margin: isTablet ? 20 : 15,
        ...baseShadow,
    },
    
    checkoutButtonText: {
        color: COLORS.white,
        fontSize: isTablet ? 18 : 16,
        fontWeight: 'bold',
        fontFamily: FONT.bold,
    },
    
    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    
    emptyStateText: {
        fontSize: isTablet ? 18 : 16,
        color: COLORS.lightText,
        marginTop: 20,
        fontFamily: FONT.regular,
    },
    
    // Payment Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    modalContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        width: isTablet ? '60%' : '90%',
        maxHeight: '80%',
        ...baseShadow,
    },
    
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isTablet ? 25 : 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    
    modalTitle: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: 'bold',
        color: COLORS.darkText,
        fontFamily: FONT.bold,
    },
    
    closeButton: {
        padding: 5,
    },
    
    modalContent: {
        padding: isTablet ? 25 : 20,
    },
    
    // Payment Summary
    paymentSummary: {
        backgroundColor: COLORS.lightBlue,
        padding: 20,
        borderRadius: 10,
        marginBottom: 25,
    },
    
    paymentSummaryText: {
        fontSize: isTablet ? 14 : 12,
        color: COLORS.lightText,
        marginBottom: 5,
        fontFamily: FONT.regular,
    },
    
    paymentTotal: {
        fontSize: isTablet ? 36 : 30,
        fontWeight: 'bold',
        color: COLORS.primaryBlue,
        fontFamily: FONT.bold,
    },
    
    // Payment Methods
    paymentMethodsGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    
    paymentMethodCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: isTablet ? 25 : 20,
        alignItems: 'center',
    },
    
    paymentMethodActive: {
        borderColor: COLORS.primaryBlue,
        backgroundColor: COLORS.lightBlue,
    },
    
    paymentMethodIcon: {
        marginBottom: 12,
    },
    
    paymentMethodTitle: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 5,
        fontFamily: FONT.bold,
    },
    
    paymentMethodDesc: {
        fontSize: isTablet ? 12 : 11,
        color: COLORS.lightText,
        textAlign: 'center',
        fontFamily: FONT.regular,
    },
    
    // Cash Input
    cashInputContainer: {
        marginTop: 20,
    },
    
    cashInputLabel: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: '600',
        color: COLORS.darkText,
        marginBottom: 10,
        fontFamily: FONT.bold,
    },
    
    cashInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: isTablet ? 15 : 12,
        fontSize: isTablet ? 20 : 18,
        backgroundColor: COLORS.white,
        fontFamily: FONT.regular,
    },
    
    changeContainer: {
        backgroundColor: COLORS.lightGreen,
        padding: 15,
        borderRadius: 8,
        marginTop: 15,
    },
    
    changeLabel: {
        fontSize: isTablet ? 14 : 12,
        color: COLORS.lightText,
        marginBottom: 5,
        fontFamily: FONT.regular,
    },
    
    changeAmount: {
        fontSize: isTablet ? 28 : 24,
        fontWeight: 'bold',
        color: COLORS.success,
        fontFamily: FONT.bold,
    },
    
    // Modal Buttons
    modalButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 25,
    },
    
    modalButton: {
        flex: 1,
        paddingVertical: isTablet ? 16 : 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    
    modalButtonPrimary: {
        backgroundColor: COLORS.success,
    },
    
    modalButtonSecondary: {
        backgroundColor: COLORS.gray,
    },
    
    modalButtonText: {
        color: COLORS.white,
        fontSize: isTablet ? 16 : 14,
        fontWeight: 'bold',
        fontFamily: FONT.bold,
    },
    
    // Receipt
    receiptContainer: {
        backgroundColor: COLORS.white,
        padding: isTablet ? 30 : 25,
        borderRadius: 12,
        width: isTablet ? '50%' : '90%',
    },
    
    receiptHeader: {
        borderBottomWidth: 2,
        //borderBottomStyle: 'dashed',
        borderBottomColor: COLORS.border,
        paddingBottom: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    
    receiptStoreName: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 8,
        fontFamily: FONT.bold,
    },
    
    receiptStoreInfo: {
        fontSize: isTablet ? 13 : 12,
        color: COLORS.lightText,
        textAlign: 'center',
        fontFamily: FONT.regular,
    },
    
    receiptInfo: {
        marginBottom: 20,
    },
    
    receiptInfoText: {
        fontSize: isTablet ? 13 : 12,
        color: COLORS.darkText,
        marginBottom: 5,
        fontFamily: FONT.regular,
    },
    
    receiptItems: {
        borderBottomWidth: 1,
        //borderBottomStyle: 'dashed',
        borderBottomColor: COLORS.border,
        paddingBottom: 20,
        marginBottom: 20,
    },
    
    receiptItem: {
        marginBottom: 15,
    },
    
    receiptItemName: {
        fontSize: isTablet ? 14 : 13,
        color: COLORS.darkText,
        marginBottom: 5,
        fontFamily: FONT.regular,
    },
    
    receiptItemDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    
    receiptItemQty: {
        fontSize: isTablet ? 13 : 12,
        color: COLORS.lightText,
        fontFamily: FONT.regular,
    },
    
    receiptItemPrice: {
        fontSize: isTablet ? 13 : 12,
        color: COLORS.lightText,
        fontFamily: FONT.regular,
    },
    
    receiptTotal: {
        marginBottom: 20,
    },
    
    receiptTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    
    receiptTotalLabel: {
        fontSize: isTablet ? 16 : 14,
        fontWeight: 'bold',
        color: COLORS.darkText,
        fontFamily: FONT.bold,
    },
    
    receiptTotalAmount: {
        fontSize: isTablet ? 18 : 16,
        fontWeight: 'bold',
        color: COLORS.darkText,
        fontFamily: FONT.bold,
    },
    
    receiptPaymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    
    receiptPaymentLabel: {
        fontSize: isTablet ? 13 : 12,
        color: COLORS.lightText,
        fontFamily: FONT.regular,
    },
    
    receiptPaymentValue: {
        fontSize: isTablet ? 13 : 12,
        color: COLORS.lightText,
        fontFamily: FONT.regular,
    },
    
    receiptFooter: {
        borderTopWidth: 1,
        //borderTopStyle: 'dashed',
        borderTopColor: COLORS.border,
        paddingTop: 20,
        alignItems: 'center',
    },
    
    receiptFooterText: {
        fontSize: isTablet ? 12 : 11,
        color: COLORS.lightText,
        textAlign: 'center',
        marginBottom: 5,
        fontFamily: FONT.regular,
    },
    
    // Receipt Buttons
    receiptButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 25,
        textAlign: 'center',
    },
    
    receiptButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isTablet ? 16 : 14,
        borderRadius: 8,
        gap: 8,
    },
    
    receiptButtonPrint: {
        backgroundColor: COLORS.primaryBlue,
        alignSelf: 'center',
    },
    
    receiptButtonNew: {
        backgroundColor: COLORS.success,
    },
    
    receiptButtonText: {
        color: COLORS.white,
        fontSize: isTablet ? 16 : 14,
        fontWeight: 'bold',
        fontFamily: FONT.bold,
        textAlign: 'center',
    },
    // Logo Container
  logoContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});