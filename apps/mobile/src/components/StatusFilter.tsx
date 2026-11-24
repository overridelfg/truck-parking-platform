import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ParkingStatus } from "@truck-parking-platform/shared";
import { STATUS_LABELS } from "../domain/status";
import { useFilterStore } from "../store/filterStore";

const OPTIONS: (ParkingStatus | "all")[] = [
  "all",
  "pending",
  "approved",
  "checked_in",
  "checked_out",
  "rejected",
];

export function StatusFilter() {
  const { status, setStatus } = useFilterStore();
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {OPTIONS.map((opt) => {
          const active = status === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => setStatus(opt)}
              style={[styles.chip, active && styles.active]}
            >
              <Text style={[styles.text, active && styles.activeText]}>
                {opt === "all" ? "All" : STATUS_LABELS[opt]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  scroll: { flexGrow: 0 },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
  },
  active: { backgroundColor: "#111827" },
  text: { fontSize: 13, color: "#111827", fontWeight: "500" },
  activeText: { color: "#fff" },
});
