import { Image, StyleSheet, Text, View } from "react-native";

interface ProductCardProps {
  name: string;
  price: string;
  imageUrl: string;
  description: string;
}

const ProductCard = ({
  name,
  price,
  imageUrl,
  description,
}: ProductCardProps) => (
  <View style={styles.card}>
    <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

    <View style={styles.info}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f1f1f1",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 240,
  },
  info: {
    padding: 16,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#222",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
});

export { ProductCard, type ProductCardProps };
