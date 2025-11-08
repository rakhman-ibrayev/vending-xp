import type React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface NumpadButtonProps {
  text: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
}

const NumpadButton = ({
  buttonStyle,
  disabled,
  onPress,
  buttonTextStyle,
  text,
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
        disabled && styles.disabledText,
      ]}
    >
      {text}
    </Text>
  </TouchableOpacity>
);

interface NumpadProps {
  onNumberPress: (digit: number) => void;
  onBackspacePress: () => void;
  disabled?: boolean;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

const Numpad = ({
  onNumberPress,
  onBackspacePress,
  disabled = false,
  buttonStyle,
  buttonTextStyle,
  containerStyle,
}: NumpadProps) => {
  const renderButton = (number: number, style?: ViewStyle) => (
    <NumpadButton
      key={number}
      text={number}
      disabled={disabled}
      buttonStyle={buttonStyle}
      buttonTextStyle={buttonTextStyle}
      onPress={() => onNumberPress(number)}
    />
  );

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
        <View style={styles.emptySpace} />

        {renderButton(0)}

        <NumpadButton
          text={<MaterialIcons name="backspace" color="#8f8f8f" size={20} />}
          buttonStyle={styles.backSpace}
          onPress={onBackspacePress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    height: 80,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backSpace: {
    backgroundColor: "#f9fafb",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
  },
  emptySpace: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: "#f3f4f6",
  },
  disabledText: {
    color: "#9ca3af",
  },
});

export { Numpad, type NumpadProps };
