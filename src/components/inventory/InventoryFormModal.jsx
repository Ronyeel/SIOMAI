import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CATEGORIES, BRANCHES, STOCK_STATUSES } from '../../data/mockInventory';

export default function InventoryFormModal({
  visible,
  mode = 'add',
  initialData = null,
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('product'); // product or ingredient
  const [category, setCategory] = useState('Best Sellers');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [price, setPrice] = useState('');
  const [branch, setBranch] = useState('Main Branch');
  const [status, setStatus] = useState('Normal');

  // Load initialData when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setType(initialData.type || 'product');
      setCategory(initialData.category || 'Best Sellers');
      setStock(initialData.stock ? initialData.stock.toString() : '');
      setUnit(initialData.unit || 'pcs');
      setPrice(initialData.price ? initialData.price.toString() : '');
      setBranch(initialData.branch || 'Main Branch');
      setStatus(initialData.status || 'Normal');
    } else {
      // Reset for add mode
      setName('');
      setType('product');
      setCategory('Best Sellers');
      setStock('');
      setUnit('pcs');
      setPrice('');
      setBranch('Main Branch');
      setStatus('Normal');
    }
  }, [mode, initialData, visible]);

  const handleSubmit = () => {
    onSubmit({
      name,
      type,
      category,
      stock,
      unit,
      price,
      branch,
      status,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlayBackground}>
        <View style={styles.modalContentCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'edit' ? 'Edit Item' : 'Add Inventory Item'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Item Type</Text>
            <View style={styles.chipsRow}>
              {['product', 'ingredient'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, type === t && styles.chipActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Item Name"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Stock Level</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Stock"
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>

              <View style={{ width: 100 }}>
                <Text style={styles.inputLabel}>Unit</Text>
                <View style={styles.chipsRow}>
                  {['pcs', 'kg'].map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.chip, { flex: 1 }, unit === u && styles.chipActive]}
                      onPress={() => setUnit(u)}
                    >
                      <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {type === 'product' && (
              <>
                <Text style={styles.inputLabel}>Price (₱)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Price in PHP"
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Branch Assigned</Text>
            <View style={styles.chipsRow}>
              {BRANCHES.map((br) => (
                <TouchableOpacity
                  key={br}
                  style={[styles.chip, branch === br && styles.chipActive]}
                  onPress={() => setBranch(br)}
                >
                  <Text style={[styles.chipText, branch === br && styles.chipTextActive]}>
                    {br}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Stock Status</Text>
            <View style={styles.chipsRow}>
              {STOCK_STATUSES.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.chip, status === st && styles.chipActive]}
                  onPress={() => setStatus(st)}
                >
                  <Text style={[styles.chipText, status === st && styles.chipTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {mode === 'edit' ? 'Save Changes' : 'Add Item'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContentCard: {
    backgroundColor: '#F6F6F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  closeButton: {
    padding: 2,
  },
  modalForm: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
    marginTop: 14,
  },
  formInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#D00D14',
    borderColor: '#D00D14',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  chipTextActive: {
    color: '#FFF',
  },
  submitBtn: {
    backgroundColor: '#D00D14',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 12,
    shadowColor: '#D00D14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
