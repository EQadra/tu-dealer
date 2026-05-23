// components/FooterMenu.js
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'

const FooterMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleCenterPress = () => setMenuOpen(true)

  const options = [
    { icon: 'person-add', text: 'Add User' },
    { icon: 'settings', text: 'Settings' },
    { icon: 'help', text: 'Help & Support' },
  ]

  return (
    <>
      {/* Floating Menu */}
      <View style={styles.footer}>
        {['Shop', 'Orders', '', 'Admin', 'Profile'].map((item, i) => {
          const isCenter = i === 2
          if (isCenter) {
            return (
              <TouchableOpacity
                key={i}
                style={styles.centerButton}
                onPress={handleCenterPress}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </TouchableOpacity>
            )
          }

          return (
            <TouchableOpacity key={i} style={styles.iconButton}>
              <Ionicons name="home" size={20} color="#555" />
              <Text style={styles.iconLabel}>{item}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Modal con opciones */}
      <Modal visible={menuOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.modalMenu}>
            {options.map((opt, index) => (
              <TouchableOpacity key={index} style={styles.optionItem}>
                <MaterialIcons
                  name={opt.icon}
                  size={20}
                  color="#4caf50"
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 64,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 10,
    color: '#333',
    marginTop: 2,
  },
  centerButton: {
    backgroundColor: '#4caf50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    top: -30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalMenu: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
})

export default FooterMenu
