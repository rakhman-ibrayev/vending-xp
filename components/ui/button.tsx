import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
}

const Button = ({
  children,
  onPress,
  disabled,
  style,
  variant = "primary",
}: ButtonProps) => {
  const isSecondary = variant === "secondary";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary && styles.secondaryButton,
        {
          backgroundColor: isSecondary
            ? "#fff"
            : disabled
            ? "#a1a1a1"
            : "#00aa6f",
        },
        style,
      ]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.text, isSecondary && styles.secondaryText]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    height: 64,
    justifyContent: "center",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#e53935",
  },
  text: {
    color: "#fff",
    fontSize: 20,
  },
  secondaryText: {
    color: "#e53935",
  },
});

export { Button, type ButtonProps };
