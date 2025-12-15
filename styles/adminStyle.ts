import { Background } from "@react-navigation/elements";
import { StyleSheet, Dimensions, ViewStyle } from "react-native";

const isTablet = Dimensions.get('window').width >= 768;

// Palet Warna yang Lebih Modern (Inspirasi Supermarket/Teknologi)
const COLORS = {
    primaryBlue: '#007BFF',      // Biru utama (untuk tombol, highlight)
    secondaryBlue: '#4682B4',    // Biru sedang (untuk latar belakang sidebar, navbar)
    lightBlue: '#E6F0FF',        // Biru muda (untuk latar belakang aktif/header)
    white: '#FFFFFF',
    darkText: '#333333',
    lightText: '#EEEEEE',
    border: '#DDDDDD',
    success: '#28A745',
    danger: '#DC3545',
    gray: '#6C757D',
};

// Font Family Placeholder (Asumsikan Anda sudah mengimpor font kustom modern)
const FONT = {
    regular: 'System', // Ganti dengan nama font kustom modern, misalnya 'Avenir-Regular'
    bold: 'System',    // Ganti dengan nama font kustom modern, misalnya 'Avenir-Bold'
};
const baseButton: ViewStyle = {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
};

export const adminStyle = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.white, // Latar belakang putih bersih
    },
    // --- Sidebar Lebih Elegan ---
    sidebar: {
        width: isTablet ? 250 : 200,
        backgroundColor: COLORS.secondaryBlue, // Biru sedang yang lebih soft
        padding: isTablet ? 25 : 20,
        elevation: 5, // Shadow untuk Android
        shadowColor: '#000', // Shadow untuk iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    userInfo: {
    marginBottom: 36,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor:
     'rgba(255,255,255,0.25)',
    backgroundColor: COLORS.secondaryBlue,
},

usernameText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
    fontFamily: FONT.bold,
},

employeeIdText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    fontFamily: FONT.regular,
},

    menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
},

activeMenuItem: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryBlue,
},

menuText: {
    color: COLORS.lightText,
    fontSize: isTablet ? 16 : 14,
    fontFamily: FONT.regular,
    marginLeft: 12,
},

activeMenuText: {
    color: COLORS.secondaryBlue, // lebih gelap
    fontFamily: FONT.bold,
    fontWeight: '700',
},

    // --- Konten Utama Lebih Bersih ---
    mainContent: {
        flex: 1,
        padding: isTablet ? 30 : 20,
        backgroundColor: COLORS.white,
    },
    content: {
        flex: 1,
    },
    contentTitle: {
        fontSize: isTablet ? 28 : 24,
        fontWeight: 'bold',
        color: COLORS.darkText,
        marginBottom: 30,
        fontFamily: FONT.bold,
    },
    // --- Tabel Lebih Rapi ---
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: COLORS.lightBlue, // Header dengan warna biru muda
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderRadius: 8, // Sudut membulat
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primaryBlue, // Garis bawah biru
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
        color: COLORS.darkText,
        fontSize: isTablet ? 16 : 14,
        fontFamily: FONT.bold,
    },
    productList: {
        flex: 1,
    },
    productRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border, // Garis pemisah abu-abu tipis
        alignItems: 'center',
        backgroundColor: COLORS.white, // Latar belakang baris putih
    },
    productCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: isTablet ? 15 : 13,
        color: COLORS.darkText,
        fontFamily: FONT.regular,
    },
    updateButton: {
        backgroundColor: COLORS.primaryBlue, // Biru utama
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginLeft: 15,
        alignSelf: 'center',
    },
    updateButtonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '600',
        fontFamily: FONT.bold,
    },
    // --- Modal Lebih Modern ---
   modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        padding: isTablet ? 30 : 25,
        borderRadius: 12,
        width: isTablet ? '45%' : '85%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    modalTitle: {
        fontSize: isTablet ? 22 : 18,
        fontWeight: 'bold',
        color: COLORS.primaryBlue,
        marginBottom: 25,
        textAlign: 'center',
        fontFamily: FONT.bold,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
        marginBottom: 15,
        borderRadius: 6,
        fontSize: 16,
        fontFamily: FONT.regular,
        color: COLORS.darkText,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
    },
    saveButton: {
        backgroundColor: COLORS.success,
        ...baseButton,
    },
    deleteButton: {
        backgroundColor: COLORS.danger,
        ...baseButton,
    },
    cancelButton: {
        backgroundColor: COLORS.gray,
        ...baseButton,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: isTablet ? 15 : 13,
        fontFamily: FONT.bold,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: COLORS.primaryBlue,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
});