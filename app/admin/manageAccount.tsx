import React, { useState, useEffect } from 'react';
import { TouchableOpacity, FlatList, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { adminStyle } from "../../styles/adminStyle";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'cashier';
}

export default function ManageAccount() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    employeeId: '',
    name: '',
    username: '',
    password: '',
    role: 'cashier' as 'admin' | 'cashier',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'employees'));
      const employeesData: Employee[] = [];
      
      querySnapshot.forEach((doc) => {
        employeesData.push({
          id: doc.id,
          ...doc.data(),
        } as Employee);
      });
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Gagal memuat data karyawan dari Firestore');
    } finally {
      setLoading(false);
    }
  };

  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      employeeId: '',
      name: '',
      username: '',
      password: '',
      role: 'cashier',
    });
    setIsAdding(true);
    setModalVisible(true);
  };

  const openEditEmployeeModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      employeeId: employee.employeeId,
      name: employee.name,
      username: employee.username,
      password: employee.password,
      role: employee.role,
    });
    setIsAdding(false);
    setModalVisible(true);
  };

  const handleSaveEmployee = async () => {
  if (
    !employeeForm.employeeId ||
    !employeeForm.name ||
    !employeeForm.username ||
    !employeeForm.password
  ) {
    Alert.alert('Error', 'Mohon isi semua field');
    return;
  }

  setSaving(true);

  try {
    const employeeId = employeeForm.employeeId.trim().toUpperCase();

    const employeeRef = doc(db, 'employees', employeeId);

    const employeeData = {
      name: employeeForm.name,
      username: employeeForm.username,
      password: employeeForm.password, // ⚠️ hash di production
      role: employeeForm.role,
      createdAt: new Date().toISOString(),
    };

    // 🔎 cek apakah doc dengan employeeId sudah ada
    const docSnap = await getDoc(employeeRef);

    if (isAdding) {
      if (docSnap.exists()) {
        Alert.alert('Error', 'Employee ID sudah terdaftar');
        setSaving(false);
        return;
      }

      // 🔎 cek username unik
      const existingEmployee = employees.find(
        e => e.username === employeeForm.username
      );
      if (existingEmployee) {
        Alert.alert('Error', 'Username sudah digunakan');
        setSaving(false);
        return;
      }

      await setDoc(employeeRef, employeeData);
      Alert.alert('Sukses', 'Karyawan berhasil ditambahkan');
    } else {
      // edit mode
      const existingEmployee = employees.find(
        e =>
          e.username === employeeForm.username &&
          e.id !== employeeId
      );
      if (existingEmployee) {
        Alert.alert('Error', 'Username sudah digunakan');
        setSaving(false);
        return;
      }

      await updateDoc(employeeRef, employeeData);
      Alert.alert('Sukses', 'Data karyawan berhasil diupdate');
    }

    setModalVisible(false);
    setEditingEmployee(null);
    fetchEmployees();
  } catch (error) {
    console.error('Error saving employee:', error);
    Alert.alert('Error', 'Gagal menyimpan data karyawan');
  } finally {
    setSaving(false);
  }
};


  const handleDeleteEmployee = () => {
    if (!editingEmployee) return;

    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus karyawan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await deleteDoc(doc(db, 'employees', editingEmployee.id));
              Alert.alert('Sukses', 'Karyawan berhasil dihapus');
              setModalVisible(false);
              setEditingEmployee(null);
              fetchEmployees(); // Refresh data
            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert('Error', 'Gagal menghapus karyawan');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={[adminStyle.content, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0066cc" />
        <ThemedText style={{ marginTop: 10 }}>Memuat data karyawan...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={adminStyle.content}>
      <ThemedText type="title" style={adminStyle.contentTitle}>Manage Account</ThemedText>
      
      <ThemedView style={{ marginBottom: 15 }}>
        <ThemedText style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>
          Total Karyawan: {employees.length} ({employees.filter(e => e.role === 'admin').length} Admin, {employees.filter(e => e.role === 'cashier').length} Cashier)
        </ThemedText>
      </ThemedView>

      <ThemedView style={adminStyle.tableHeader}>
        <ThemedText style={[adminStyle.headerCell, { flex: 1 }]}>Employee ID</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1.2 }]}>Name</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1 }]}>Username</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 1 }]}>Password</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 0.8 }]}>Role</ThemedText>
        <ThemedText style={[adminStyle.headerCell, { flex: 0.8 }]}>Action</ThemedText>
      </ThemedView>

      <FlatList
        data={employees}
        renderItem={({ item }) => (
          <ThemedView style={adminStyle.productRow}>
            <ThemedText style={[adminStyle.productCell, { flex: 1 }]}>{item.employeeId}</ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1.2 }]}>{item.name}</ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1 }]}>{item.username}</ThemedText>
            <ThemedText style={[adminStyle.productCell, { flex: 1 }]}>{'*'.repeat(item.password.length)}</ThemedText>
            <ThemedText style={[
              adminStyle.productCell, 
              { flex: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }
            ]}>
              {item.role}
            </ThemedText>
            <TouchableOpacity 
              style={[adminStyle.updateButton, { flex: 0.8 }]} 
              onPress={() => openEditEmployeeModal(item)}
            >
              <ThemedText style={adminStyle.updateButtonText}>Edit</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        keyExtractor={(item) => item.id}
        style={adminStyle.productList}
        ListEmptyComponent={
          <ThemedView style={{ padding: 20, alignItems: 'center' }}>
            <ThemedText>Belum ada data karyawan</ThemedText>
          </ThemedView>
        }
      />

      <TouchableOpacity style={adminStyle.fab} onPress={openAddEmployeeModal}>
        <ThemedText style={adminStyle.fabText}>+</ThemedText>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <ThemedView style={adminStyle.modalContainer}>
          <ThemedView style={adminStyle.modalContent}>
            <ThemedText type="title" style={adminStyle.modalTitle}>
              {isAdding ? 'Add Employee' : 'Edit Employee'}
            </ThemedText>
            
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Employee ID (e.g., EMP001)"
              value={employeeForm.employeeId}
              onChangeText={(text) => setEmployeeForm({ ...employeeForm, employeeId: text })}
            />
            
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Name"
              value={employeeForm.name}
              onChangeText={(text) => setEmployeeForm({ ...employeeForm, name: text })}
            />
            
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Username"
              value={employeeForm.username}
              onChangeText={(text) => setEmployeeForm({ ...employeeForm, username: text })}
              autoCapitalize="none"
            />
            
            <TextInput
              style={adminStyle.modalInput}
              placeholder="Password"
              value={employeeForm.password}
              onChangeText={(text) => setEmployeeForm({ ...employeeForm, password: text })}
              secureTextEntry
            />

            {/* Role Selection */}
            <ThemedView style={{ marginVertical: 10 }}>
              <ThemedText style={{ marginBottom: 8, fontWeight: 'bold' }}>Role:</ThemedText>
              <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[
                    adminStyle.updateButton,
                    { flex: 1 },
                    employeeForm.role === 'cashier' && { backgroundColor: '#0066cc' }
                  ]}
                  onPress={() => setEmployeeForm({ ...employeeForm, role: 'cashier' })}
                >
                  <ThemedText style={[
                    adminStyle.updateButtonText,
                    employeeForm.role === 'cashier' && { color: 'white' }
                  ]}>
                    Cashier
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    adminStyle.updateButton,
                    { flex: 1 },
                    employeeForm.role === 'admin' && { backgroundColor: '#0066cc' }
                  ]}
                  onPress={() => setEmployeeForm({ ...employeeForm, role: 'admin' })}
                >
                  <ThemedText style={[
                    adminStyle.updateButtonText,
                    employeeForm.role === 'admin' && { color: 'white' }
                  ]}>
                    Admin
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            <ThemedView style={adminStyle.modalButtons}>
              <TouchableOpacity 
                style={adminStyle.saveButton} 
                onPress={handleSaveEmployee}
                disabled={saving}
              >
                <ThemedText style={adminStyle.buttonText}>
                  {saving ? 'Menyimpan...' : 'Save'}
                </ThemedText>
              </TouchableOpacity>
              {!isAdding && (
                <TouchableOpacity 
                  style={adminStyle.deleteButton} 
                  onPress={handleDeleteEmployee}
                  disabled={saving}
                >
                  <ThemedText style={adminStyle.buttonText}>Delete</ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={adminStyle.cancelButton} 
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <ThemedText style={adminStyle.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}