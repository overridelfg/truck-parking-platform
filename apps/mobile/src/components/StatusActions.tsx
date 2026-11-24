import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type {
  ParkingStatus,
  UpdateStatusInput,
} from "@truck-parking-platform/shared";
import {
  ALLOWED_TRANSITIONS,
  STATUS_LABELS,
  isFinalStatus,
} from "../domain/status";
import { useDialog } from "./DialogProvider";

const ACTION_LABELS: Record<ParkingStatus, string> = {
  pending: "Pending",
  approved: "Approve",
  rejected: "Reject",
  checked_in: "Check in",
  checked_out: "Check out",
};

type Props = {
  current: ParkingStatus;
  disabled?: boolean;
  onSubmit: (input: UpdateStatusInput) => void;
};

export function StatusActions({ current, disabled, onSubmit }: Props) {
  const [spot, setSpot] = useState("");
  const { confirm, notify } = useDialog();
  const options = ALLOWED_TRANSITIONS[current];

  if (options.length === 0) {
    return (
      <Text style={styles.final}>
        This request is final. No further actions.
      </Text>
    );
  }

  const needsSpot = options.includes("approved");

  const run = async (next: ParkingStatus) => {
    if (next === "approved" && !spot.trim()) {
      await notify({
        title: "Parking spot required",
        message: "Enter a parking spot ID to approve this request.",
        variant: "error",
      });
      return;
    }

    const input: UpdateStatusInput =
      next === "approved"
        ? { status: next, parkingSpotId: spot.trim() }
        : { status: next };

    if (isFinalStatus(next)) {
      const ok = await confirm({
        title: `${ACTION_LABELS[next]} request?`,
        message: `The status will become "${STATUS_LABELS[next]}" and cannot be changed afterwards.`,
        variant: next === "rejected" ? "danger" : "default",
        confirmLabel: ACTION_LABELS[next],
      });
      if (!ok) return;
    }

    onSubmit(input);
  };

  return (
    <View style={styles.box}>
      {needsSpot && (
        <TextInput
          value={spot}
          onChangeText={setSpot}
          placeholder="Parking spot ID (e.g. A-12)"
          autoCapitalize="characters"
          style={styles.input}
        />
      )}
      {options.map((next) => (
        <Pressable
          key={next}
          disabled={disabled}
          onPress={() => run(next)}
          style={[
            styles.button,
            next === "rejected" && styles.danger,
            disabled && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>{ACTION_LABELS[next]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  danger: { backgroundColor: "#dc2626" },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  final: { color: "#6b7280", textAlign: "center", paddingVertical: 8 },
});
