import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, router } from 'expo-router';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';


const { width, height } = Dimensions.get('window');
const isTablet = width > 600; // Simple check for tablet

export default function LoginScreen() {
  const [loginType, setLoginType] = useState<'admin' | 'cashier' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const handleLogin = async () => {
  try {
    if (!password) {
      Alert.alert('Error', 'Password wajib diisi');
      return;
    }

    // ======================
    // ADMIN LOGIN
    // ======================
    if (loginType === 'admin') {
      if (!username) {
        Alert.alert('Error', 'Username wajib diisi');
        return;
      }

      const q = query(
        collection(db, 'employees'),
        where('username', '==', username)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert('Error', 'Admin tidak ditemukan');
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      if (data.password !== password) {
        Alert.alert('Error', 'Password salah');
        return;
      }

      if (data.role !== 'admin') {
        Alert.alert('Error', 'Akun ini bukan admin');
        return;
      }

      Alert.alert('Success', 'Login admin berhasil');
      router.replace('/admin/dashboard');
    }

    // ======================
    // CASHIER LOGIN
    // ======================
    if (loginType === 'cashier') {
      if (!employeeId) {
        Alert.alert('Error', 'Employee ID wajib diisi');
        return;
      }

      const employeeRef = doc(
        db,
        'employees',
        employeeId.trim().toUpperCase()
      );

      const docSnap = await getDoc(employeeRef);

      if (!docSnap.exists()) {
        Alert.alert('Error', 'Employee ID tidak ditemukan');
        return;
      }

      const data = docSnap.data();

      if (data.password !== password) {
        Alert.alert('Error', 'Password salah');
        return;
      }

      if (data.role !== 'cashier') {
        Alert.alert('Error', 'Akun ini bukan cashier');
        return;
      }

      Alert.alert('Success', 'Login cashier berhasil');
      router.replace('/cashier/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Error', 'Terjadi kesalahan saat login');
  }
};


  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Login</ThemedText>
      
      {!loginType && (
        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setLoginType('admin')}>
            <ThemedText style={styles.buttonText}>Admin</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setLoginType('cashier')}>
            <ThemedText style={styles.buttonText}>Cashier</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {loginType === 'admin' && (
        <ThemedView style={styles.formContainer}>
          <ThemedText type="subtitle">Admin Login</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <ThemedText style={styles.buttonText}>Login</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLoginType(null)}>
            <ThemedText style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {loginType === 'cashier' && (
        <ThemedView style={styles.formContainer}>
          <ThemedText type="subtitle">Cashier Login</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Employee ID"
            value={employeeId}
            onChangeText={setEmployeeId}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <ThemedText style={styles.buttonText}>Login</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLoginType(null)}>
            <ThemedText style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 40,
    fontSize: isTablet ? 32 : 24,
  },
  buttonContainer: {
    width: isTablet ? '50%' : '80%',
    gap: 20,
  },
  button: {
    backgroundColor: '#A1CEDC',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
  },
  formContainer: {
    width: isTablet ? '50%' : '80%',
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    fontSize: isTablet ? 18 : 16,
  },
  loginButton: {
    backgroundColor: '#1D3D47',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#A1CEDC',
  },
});