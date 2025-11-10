import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductCardProps {
  name: string;
  imageUrl: string;
  description: string;
  onRemove: () => void;
}

const ProductCard = ({
  name,
  imageUrl,
  description,
  onRemove,
}: ProductCardProps) => (
  <View style={styles.card}>
    <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      <Text style={styles.description}>{description}</Text>
    </View>

    <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
      <MaterialIcons name="highlight-remove" size={28} color="#888" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f1f1f1",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 12,
    width: "100%",
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: 200,
    backgroundColor: "#eaeaea",
  },
  info: {
    gap: 4,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#222",
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  removeButton: {
    marginLeft: "auto",
    alignSelf: "flex-start",
  },
});

export { ProductCard, type ProductCardProps };
