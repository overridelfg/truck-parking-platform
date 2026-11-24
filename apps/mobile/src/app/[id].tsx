import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useDialog } from "../components/DialogProvider";
import { StatusActions } from "../components/StatusActions";
import { StatusBadge } from "../components/StatusBadge";
import { ErrorView, LoadingView } from "../components/StateViews";
import { formatDateTime } from "../domain/format";
import { STATUS_LABELS } from "../domain/status";
import { useParkingRequest, useUpdateStatus } from "../hooks/parkingRequests";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "@/components/BackButton";
import { ScreenHeader } from "@/components/ScreenHeader";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notify } = useDialog();
  const { data, isLoading, isError, error, refetch } = useParkingRequest(id);
  const update = useUpdateStatus(id);

  if (isLoading) return <LoadingView />;
  if (isError || !data) {
    return (
      <ErrorView
        message={error?.message ?? "Request not found"}
        onRetry={refetch}
      />
    );
  }

  const errorMessage = (error as Error | null)?.message ?? "Request not found";

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={styles.screen}
    >
      <ScreenHeader title="Request details" showBack />

      {isLoading ? (
        <LoadingView />
      ) : isError || !data ? (
        <ErrorView message={errorMessage} onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{data.driverName}</Text>
            <StatusBadge status={data.status} />
          </View>

          <View style={styles.card}>
            <Row label="ID" value={data.id} />
            <Row label="Driver" value={data.driverName} />
            <Row label="License plate" value={data.licensePlate} />
            <Row label="Truck type" value={data.truckType} />
            <Row
              label="Requested from"
              value={formatDateTime(data.requestedFrom)}
            />
            <Row
              label="Requested until"
              value={formatDateTime(data.requestedUntil)}
            />
            <Row
              label="Parking spot"
              value={data.parkingSpotId ?? "Not assigned"}
            />
          </View>

          <StatusActions
            current={data.status}
            disabled={update.isPending}
            onSubmit={(input) =>
              update.mutate(input, {
                onSuccess: (u) =>
                  notify({
                    title: "Status updated",
                    message: `The request is now "${STATUS_LABELS[u.status]}".`,
                    variant: "success",
                  }),
                onError: (e) =>
                  notify({
                    title: "Update failed",
                    message: e.message,
                    variant: "error",
                  }),
              })
            }
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f3f4f6" },

  container: { padding: 16, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },

  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { color: "#6b7280" },
  value: { fontWeight: "500", flexShrink: 1, textAlign: "right" },
});
