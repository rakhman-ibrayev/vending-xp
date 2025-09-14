import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

type PageContainerProps = ComponentProps<typeof View>;

const PageContainer = ({ style, ...rest }: PageContainerProps) => {
  return <View style={[styles.container, style]} {...rest} />;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1,
    gap: 24,
    backgroundColor: "#ffffff",
  },
});

export { PageContainer };
