import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ParkingRequest } from "@truck-parking-platform/shared";
import { formatDateTime } from "../domain/format";
import { StatusBadge } from "./StatusBadge";

type Props = { request: ParkingRequest; onPress: () => void };

export function RequestCard({ request, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <Text style={styles.driver}>{request.driverName}</Text>
        <StatusBadge status={request.status} />
      </View>
      <Text style={styles.sub}>
        {request.licensePlate} · {request.truckType}
      </Text>
      <Text style={styles.sub}>
        {formatDateTime(request.requestedFrom)} →{" "}
        {formatDateTime(request.requestedUntil)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 4,
  },
  pressed: { opacity: 0.7 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  driver: { fontSize: 16, fontWeight: "600" },
  sub: { fontSize: 13, color: "#4b5563" },
});
