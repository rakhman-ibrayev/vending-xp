import { useState } from 'react'
import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { Button } from './ui/button'

interface ExitModalProps {
  onClose: () => void
  isOpen: boolean
}

const ExitModal = ({ onClose, isOpen }: ExitModalProps) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleExit = () => {
    if (password === process.env.EXPO_PUBLIC_TECHNICIAN_CODE) {
      BackHandler.exitApp()
    } else {
      setError('Неверный пароль')
    }
  }

  return (
    <Modal animationType="fade" visible={isOpen} transparent>
      <Pressable onPress={onClose} style={styles.overlay} />

      <View style={styles.centeredView}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Вы уверены, что хотите выйти?</Text>

          <TextInput
            style={styles.input}
            placeholder="Пароль техника"
            secureTextEntry
            value={password}
            onChangeText={text => {
              setPassword(text)
              setError('')
            }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonRow}>
            <Button variant="secondary" onPress={onClose} style={{ flex: 1 }}>
              Отмена
            </Button>

            <Button onPress={handleExit} style={{ flex: 1 }}>
              Выйти
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    height: '100%',
    width: '100%',
    backgroundColor: '#000',
    opacity: 0.3,
    position: 'absolute',
    top: 0,
    left: 0
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 5,
    margin: 20,
    gap: 20
  },
  title: {
    fontSize: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 20
  },
  error: {
    color: '#e53935',
    marginBottom: 8
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8
  }
})

export { ExitModal, type ExitModalProps }
