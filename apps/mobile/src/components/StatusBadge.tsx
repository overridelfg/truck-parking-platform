import { StyleSheet, Text, View } from "react-native";
import type { ParkingStatus } from "@truck-parking-platform/shared";
import { STATUS_COLORS, STATUS_LABELS } from "../domain/status";

export function StatusBadge({ status }: { status: ParkingStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
      <Text style={styles.text}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
