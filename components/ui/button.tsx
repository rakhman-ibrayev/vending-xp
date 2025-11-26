import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native'

interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

const Button = ({
  children,
  onPress,
  disabled,
  style,
  textStyle,
  variant = 'primary',
  isLoading = false
}: ButtonProps) => {
  const isSecondary = variant === 'secondary'

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary && styles.secondaryButton,
        {
          backgroundColor: isSecondary
            ? '#fff'
            : disabled
              ? '#029964'
              : '#00aa6f',
          opacity: disabled ? 0.7 : 1
        },
        style
      ]}
      disabled={disabled || isLoading}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isSecondary ? '#e53935' : '#fff'}
        />
      ) : (
        <Text
          style={[styles.text, textStyle, isSecondary && styles.secondaryText]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    height: 64,
    justifyContent: 'center'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#e53935'
  },
  text: {
    color: '#fff',
    fontSize: 20
  },
  secondaryText: {
    color: '#e53935'
  }
})

export { Button, type ButtonProps }
