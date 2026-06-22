import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

/**
 * A generic bottom-sheet style dropdown picker modal.
 * Used for Branch, Status and Category filter selectors.
 */
export default function DropdownFilterModal({
  visible,
  title,
  options = [],
  selectedOption,
  onSelect,
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Options */}
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = item === selectedOption;
              return (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {item}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color="#D00D14" />
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  optionTextSelected: {
    color: '#D00D14',
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: '#F4F4F4',
    marginHorizontal: 24,
  },
  cancelBtn: {
    margin: 20,
    marginBottom: 0,
    backgroundColor: '#F4F4F4',
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#555',
  },
});
