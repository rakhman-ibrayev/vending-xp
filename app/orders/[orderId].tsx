import { PageContainer } from "@/components/page-container";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

const Order = () => {
  const { orderId } = useLocalSearchParams();

  return (
    <PageContainer>
      <Text>{orderId}</Text>
    </PageContainer>
  );
};

export default Order;
