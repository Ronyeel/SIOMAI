import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AccountCard({ item, currentUserEmail, onOpenOptions }) {
  const isMe = item.user_email === currentUserEmail;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(item.user_name);

  return (
    <View style={styles.userCard}>
      <View style={styles.userCardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.user_name}
              {isMe && <Text style={styles.meLabel}> (You)</Text>}
            </Text>
            
            {/* Role Tag */}
            <View
              style={[
                styles.roleTag,
                item.user_role === 'Admin' ? styles.tagAdminBg : styles.tagStaffBg,
              ]}
            >
              <Text
                style={[
                  styles.roleTagText,
                  item.user_role === 'Admin' ? styles.tagAdminText : styles.tagStaffText,
                ]}
              >
                {item.user_role}
              </Text>
            </View>
          </View>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.user_email}
          </Text>
        </View>
      </View>
      
      <View style={styles.userCardRight}>
        {/* Status Badge */}
        <View
          style={[
            styles.statusTag,
            item.user_status === 'Active' ? styles.statusActiveBg : styles.statusPendingBg,
          ]}
        >
          {item.user_status === 'Active' && (
            <Ionicons
              name="checkmark-circle-outline"
              size={14}
              color="#198754"
              style={{ marginRight: 2 }}
            />
          )}
          <Text
            style={[
              styles.statusTagText,
              item.user_status === 'Active' ? styles.statusActiveText : styles.statusPendingText,
            ]}
          >
            {item.user_status}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.optionsButton}
          onPress={(event) => onOpenOptions(item, event)}
          activeOpacity={0.6}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 12,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D00D14',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
    marginRight: 8,
  },
  meLabel: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: '600',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagAdminBg: {
    backgroundColor: '#FFF5F5',
  },
  tagStaffBg: {
    backgroundColor: '#F1F1F1',
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  tagAdminText: {
    color: '#D00D14',
  },
  tagStaffText: {
    color: '#555',
  },
  userEmail: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.45)',
    fontWeight: '600',
    marginTop: 2,
  },
  userCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActiveBg: {
    backgroundColor: '#E2FBE9',
  },
  statusPendingBg: {
    backgroundColor: '#FFF0E2',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusActiveText: {
    color: '#198754',
  },
  statusPendingText: {
    color: '#FF9500',
  },
  optionsButton: {
    padding: 6,
  },
});
