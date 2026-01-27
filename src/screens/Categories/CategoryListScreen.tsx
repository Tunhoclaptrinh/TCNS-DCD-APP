import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Modal, SafeAreaView } from 'react-native';
import { apiClient } from '../../config/api.client';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CategoryListScreen = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get<any>('/categories');
            if (res.success) {
                setCategories(res.data);
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
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await apiClient.delete(`/categories/${id}`);
                        fetchCategories();
                    } catch (e) {
                        Alert.alert('Error', 'Delete failed');
                    }
                }
            }
        ]);
    };

    const handleSave = async () => {
        try {
            const data = { name, description };
            if (editingCategory) {
                await apiClient.put(`/categories/${editingCategory.id}`, data);
            } else {
                await apiClient.post('/categories', data);
            }
            setModalVisible(false);
            fetchCategories();
            resetForm();
        } catch (e) {
            Alert.alert('Error', 'Operation failed');
        }
    };

    const openEdit = (item: any) => {
        setEditingCategory(item);
        setName(item.name);
        setDescription(item.description);
        setModalVisible(true);
    };

    const openCreate = () => {
        resetForm();
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingCategory(null);
        setName('');
        setDescription('');
    };

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc}>{item.description}</Text>
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
                <Button title="Add New Category" onPress={openCreate} />
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    refreshing={loading}
                    onRefresh={fetchCategories}
                />

                <Modal visible={modalVisible} animationType="slide">
                    <SafeAreaView style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{editingCategory ? 'Edit Category' : 'Create Category'}</Text>
                        <Input label="Name" value={name} onChangeText={setName} />
                        <Input label="Description" value={description} onChangeText={setDescription} />
                        
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
    desc: { color: '#666', marginTop: 4 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
    modalContainer: { flex: 1, padding: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }
});

export default CategoryListScreen;
