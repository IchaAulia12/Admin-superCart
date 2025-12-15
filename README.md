# Setup IoT Cashier System dengan Firestore & MQTT

## 📋 Prerequisites

1. Node.js (versi 14 atau lebih baru)
2. Expo CLI
3. Firebase Account
4. MQTT Broker (HiveMQ, Mosquitto, atau cloud broker lainnya)

## 🔧 Setup Firebase

### 1. Buat Project Firebase
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add Project" dan ikuti instruksi
3. Aktifkan Firestore Database di menu "Build > Firestore Database"
4. Pilih mode "Production mode" atau "Test mode" sesuai kebutuhan

### 2. Konfigurasi Firebase di Aplikasi
1. Di Firebase Console, buka "Project Settings" (ikon gear)
2. Scroll ke bawah dan klik "Add app" → pilih Web (</> icon)
3. Copy konfigurasi Firebase yang diberikan
4. Buka file `config/firebaseConfig.ts`
5. Replace konfigurasi dengan config Anda:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Setup Firestore Collections

Buat collections berikut di Firestore:

#### Collection: `products`
```json
{
  "name": "string",
  "price": "number",
  "stock": "number",
  "discount": "number"
}
```

#### Collection: `sales`
```json
{
  "transactionId": "string",
  "date": "string (ISO)",
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "price": "number",
      "qty": "number",
      "subtotal": "number"
    }
  ],
  "total": "number",
  "paymentMethod": "string",
  "cashPaid": "number (optional)",
  "change": "number (optional)",
  "cashier": "string",
  "timestamp": "timestamp"
}
```

#### Collection: `employees`
```json
{
  "employeeId": "string",
  "name": "string",
  "username": "string",
  "password": "string",
  "role": "string (admin/cashier)"
}
```

#### Collection: `carts` (Optional - untuk manual input)
```json
{
  "items": [
    {
      "productId": "string",
      "qty": "number"
    }
  ]
}
```

### 4. Firestore Security Rules (Development)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // HANYA UNTUK DEVELOPMENT!
    }
  }
}
```

**⚠️ PENTING:** Untuk production, gunakan security rules yang lebih ketat!

## 🌐 Setup MQTT

### 1. Pilih MQTT Broker

#### Option A: HiveMQ Cloud (Gratis)
1. Daftar di [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/)
2. Buat cluster baru
3. Copy URL broker dan credentials

#### Option B: Local Mosquitto
```bash
# Install Mosquitto
sudo apt-get install mosquitto mosquitto-clients

# Start Mosquitto
sudo systemctl start mosquitto
```

### 2. Konfigurasi MQTT di Aplikasi

Buka file `services/mqttService.ts` dan update URL broker:

```typescript
await mqttService.connect('mqtt://YOUR_BROKER_URL:1883', {
  username: 'YOUR_USERNAME', // jika diperlukan
  password: 'YOUR_PASSWORD', // jika diperlukan
});
```

### 3. Format Data MQTT

IoT device harus publish data ke topic: `{cartId}/payment`

Format JSON:
```json
{
  "cartId": "001",
  "items": [
    {
      "productId": "P001",
      "qty": 2
    },
    {
      "productId": "P002",
      "qty": 1
    }
  ]
}
```

Contoh publish dengan mosquitto_pub:
```bash
mosquitto_pub -h broker.hivemq.com -t "001/payment" -m '{"cartId":"001","items":[{"productId":"P001","qty":2}]}'
```

## 📦 Install Dependencies

```bash
npm install
```

atau

```bash
yarn install
```

## 🚀 Menjalankan Aplikasi

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📂 Struktur File

```
├── config/
│   └── firebaseConfig.ts          # Konfigurasi Firebase
├── services/
│   └── mqttService.ts             # Service MQTT
├── screens/
│   ├── cashier/
│   │   ├── CashierDashboard.tsx   # Main dashboard kasir
│   │   ├── ProductList.tsx        # Daftar produk
│   │   ├── PaymentModal.tsx       # Modal pembayaran
│   │   └── ReceiptModal.tsx       # Modal struk (save to Firestore)
│   └── admin/
│       ├── dashboard.tsx          # Main admin dashboard
│       ├── ProductsRepository.tsx # CRUD products
│       ├── SalesReport.tsx        # Laporan penjualan
│       ├── PriceUpdate.tsx        # Update harga & diskon
│       └── ManageAccount.tsx      # Manajemen akun karyawan
```

## 🔄 Flow Aplikasi

### Cashier Flow:
1. **MQTT Subscribe** → Otomatis subscribe ke topic `{001-999}/payment`
2. **Receive Data** → Terima data dari IoT device
3. **Fetch Products** → Ambil detail produk dari Firestore berdasarkan `productId`
4. **Display Products** → Tampilkan di ProductList dengan qty yang bisa diedit
5. **Payment** → Proses pembayaran (Transfer/QRIS/Tunai)
6. **Receipt** → Tampilkan struk & auto-save ke Firestore collection `sales`

### Admin Flow:
1. **Products Repository** → CRUD products di Firestore
2. **Sales Report** → Lihat semua transaksi dari collection `sales`
3. **Price Update** → Update harga & diskon products
4. **Manage Account** → CRUD employees (admin/cashier)

## 🔐 Security Notes

### Production Checklist:
- [ ] Ganti Firestore rules dengan rules yang aman
- [ ] Implement proper authentication (Firebase Auth)
- [ ] Hash password sebelum simpan ke Firestore
- [ ] Gunakan MQTT dengan SSL/TLS
- [ ] Implement rate limiting
- [ ] Validate input data
- [ ] Sanitize user input

### Firestore Production Rules Example:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /sales/{saleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    
    match /employees/{employeeId} {
      allow read, write: if request.auth != null && 
                         get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 🐛 Troubleshooting

### Firebase Connection Error
- Pastikan config Firebase sudah benar
- Check internet connection
- Pastikan Firestore sudah diaktifkan di Firebase Console

### MQTT Connection Error
- Pastikan broker URL benar
- Check firewall settings
- Untuk local broker, pastikan Mosquitto running

### Data Tidak Muncul
- Check Firestore collections dan documents
- Pastikan field names sesuai dengan interface TypeScript
- Check console logs untuk error messages

## 📞 Support

Jika ada masalah, check:
1. Console logs di browser/terminal
2. Firebase Console → Firestore → Data
3. MQTT broker logs

## 📝 TODO untuk Production

- [ ] Implement Firebase Authentication
- [ ] Hash passwords dengan bcrypt
- [ ] Add loading states untuk semua async operations
- [ ] Implement error boundaries
- [ ] Add data validation
- [ ] Implement offline mode dengan React Native AsyncStorage
- [ ] Add unit tests
- [ ] Implement proper logging system
- [ ] Add analytics (Firebase Analytics)
- [ ] Optimize Firestore queries dengan indexes