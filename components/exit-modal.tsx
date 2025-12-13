import { useEffect, useState } from 'react'
import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Button } from './ui/button'
import { Numpad } from './numpad'
import { useMachine } from '@/entities/machines/use-machine'

interface ExitModalProps {
  onClose: () => void
  isOpen: boolean
}

const ExitModal = ({ onClose, isOpen }: ExitModalProps) => {
  const machineQuery = useMachine()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleNumberPress = (digit: number) => {
    setCode(prev => prev + digit.toString())
    setError('')
  }

  const handleBackspace = () => {
    setCode(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    setCode('')
  }

  const handleExit = () => {
    if (
      code === machineQuery.data?.data.data?.technician_password ||
      code === process.env.EXPO_PUBLIC_TECHNICIAN_CODE
    ) {
      BackHandler.exitApp()
      onClose()
    } else {
      setError('Неверный пароль')
    }
  }

  useEffect(() => {
    setCode('')
    setError('')
  }, [isOpen])

  return (
    <Modal animationType="fade" visible={isOpen} transparent>
      <Pressable onPress={onClose} style={styles.overlay} />

      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Вы уверены, что хотите выйти?</Text>

          <View
            style={[
              styles.passwordDisplay,
              error && styles.passwordDisplayError
            ]}
          >
            <Text style={styles.passwordText}>{'*'.repeat(code.length)}</Text>
          </View>

          <Numpad
            onNumberPress={handleNumberPress}
            onBackspacePress={handleBackspace}
            onClearPress={handleClear}
            containerStyle={styles.numpad}
          />

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
    opacity: 0.5,
    position: 'absolute',
    top: 0,
    left: 0
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 36,
    gap: 20,
    width: '100%'
  },
  title: {
    fontSize: 20
  },
  passwordDisplay: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
    justifyContent: 'center'
  },
  passwordDisplayError: {
    borderColor: '#e53935'
  },
  passwordText: {
    fontSize: 20,
    textAlign: 'center'
  },
  numpad: {
    marginTop: 20
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginTop: 8
  }
})

export { ExitModal, type ExitModalProps }
