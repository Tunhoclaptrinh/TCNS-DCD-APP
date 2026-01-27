import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Modal, SafeAreaView } from 'react-native';
import { apiClient } from '../../config/api.client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const UserListScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/users');
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
      Alert.alert('Confirm Delete', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: async () => {
              try {
                  await apiClient.delete(`/users/${id}`);
                  fetchUsers();
              } catch (e) {
                  Alert.alert('Error', 'Delete failed');
              }
          }}
      ]);
  };

  const handleSave = async () => {
      try {
          const data = { name, email, ...(password ? { password } : {}) };
          if (editingUser) {
              await apiClient.put(`/users/${editingUser.id}`, data);
          } else {
              await apiClient.post('/users', data);
          }
          setModalVisible(false);
          fetchUsers();
          resetForm();
      } catch (e) {
          Alert.alert('Error', 'Operation failed');
      }
  };

  const openEdit = (user: any) => {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setPassword('');
      setModalVisible(true);
  };

  const openCreate = () => {
      resetForm();
      setModalVisible(true);
  };

  const resetForm = () => {
      setEditingUser(null);
      setName('');
      setEmail('');
      setPassword('');
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.fullName || item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>{item.role}</Text>
      </View>
      <View style={styles.actions}>
          <Button title="Edit" variant="outline" onPress={() => openEdit(item)} />
          <Button title="Delete" variant="danger" onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
        <Button title="Add New User" onPress={openCreate} />
        <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={fetchUsers}
        />

        <Modal visible={modalVisible} animationType="slide">
            <SafeAreaView style={styles.modalContainer}>
                <Text style={styles.modalTitle}>{editingUser ? 'Edit User' : 'Create User'}</Text>
                <Input label="Name" value={name} onChangeText={setName} />
                <Input label="Email" value={email} onChangeText={setEmail} />
                {!editingUser && <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />}
                
                <Button title="Save" onPress={handleSave} />
                <Button title="Cancel" variant="outline" onPress={() => setModalVisible(false)} />
            </SafeAreaView>
        </Modal>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  card: { padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8 },
  name: { fontWeight: 'bold', fontSize: 16 },
  email: { color: '#666' },
  role: { fontStyle: 'italic', marginTop: 4, color: 'blue' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }
});

export default UserListScreen;
