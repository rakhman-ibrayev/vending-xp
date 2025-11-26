import type React from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle
} from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

interface NumpadButtonProps {
  text: React.ReactNode
  onPress: () => void
  disabled?: boolean
  buttonStyle?: ViewStyle
  buttonTextStyle?: TextStyle
}

const NumpadButton = ({
  buttonStyle,
  disabled,
  onPress,
  buttonTextStyle,
  text
}: NumpadButtonProps) => (
  <TouchableOpacity
    style={[styles.button, buttonStyle, disabled && styles.disabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.5}
  >
    <Text
      style={[
        styles.buttonText,
        buttonTextStyle,
        disabled && styles.disabledText
      ]}
    >
      {text}
    </Text>
  </TouchableOpacity>
)

interface NumpadProps {
  onNumberPress: (digit: number) => void
  onBackspacePress: () => void
  onClearPress: () => void
  disabled?: boolean
  buttonStyle?: ViewStyle
  buttonTextStyle?: TextStyle
  containerStyle?: ViewStyle
}

const Numpad = ({
  onNumberPress,
  onBackspacePress,
  onClearPress,
  disabled = false,
  buttonStyle,
  buttonTextStyle,
  containerStyle
}: NumpadProps) => {
  const renderButton = (number: number) => (
    <NumpadButton
      key={number}
      text={number}
      disabled={disabled}
      buttonStyle={buttonStyle}
      buttonTextStyle={buttonTextStyle}
      onPress={() => onNumberPress(number)}
    />
  )

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Numbers 1-9 in 3x3 grid */}
      <View style={styles.row}>
        {renderButton(1)}
        {renderButton(2)}
        {renderButton(3)}
      </View>

      <View style={styles.row}>
        {renderButton(4)}
        {renderButton(5)}
        {renderButton(6)}
      </View>

      <View style={styles.row}>
        {renderButton(7)}
        {renderButton(8)}
        {renderButton(9)}
      </View>

      {/* Bottom row with 0 in center */}
      <View style={styles.row}>
        <NumpadButton
          text="Очистить"
          buttonStyle={styles.backSpace}
          buttonTextStyle={styles.clearButtonText}
          onPress={onClearPress}
        />

        {renderButton(0)}

        <NumpadButton
          text={<MaterialIcons name="backspace" color="#9ca3af" size={24} />}
          buttonStyle={styles.backSpace}
          onPress={onBackspacePress}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 18
  },
  button: {
    flex: 1,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f4f4f4'
  },
  backSpace: {
    backgroundColor: '#f6f6f6'
  },
  clearButtonText: {
    fontSize: 20,
    color: '#9ca3af'
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1f2937'
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#f3f4f6'
  },
  disabledText: {
    color: '#9ca3af'
  }
})

export { Numpad, type NumpadProps }
