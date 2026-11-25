import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

const EXAMPLES = [
  "Pending requests",
  "Approved tankers",
  "Requests tonight",
  "Unusually long stays",
];

export function ExamplePrompts({
  onSelect,
}: {
  onSelect: (query: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {EXAMPLES.map((q) => (
        <Pressable
          key={q}
          onPress={() => onSelect(q)}
          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
        >
          <Text style={styles.text}>{q}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pressed: { opacity: 0.6 },
  text: { fontSize: 13, color: "#111827" },
});
