import { StyleSheet, Text, View } from "react-native";
import { BackButton } from "./BackButton";

type Props = { title: string; showBack?: boolean };

export function ScreenHeader({ title, showBack = false }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.side}>{showBack && <BackButton />}</View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
  },
  side: { width: 40, height: 40 },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
});
