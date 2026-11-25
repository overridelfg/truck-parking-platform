import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { AssistantResponse } from "@truck-parking-platform/shared";
import { STATUS_LABELS } from "../domain/status";
import { StatusBadge } from "./StatusBadge";
import { useState } from "react";

type Props = {
  response: AssistantResponse;
  onOpen: (id: string) => void;
  onClear: () => void;
};
const PREVIEW_COUNT = 3;

export function AssistantResult({ response, onOpen, onClear }: Props) {
  const { answer, understood, matches, source, suggestion } = response;

  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? matches : matches.slice(0, PREVIEW_COUNT);
  const hiddenCount = matches.length - visible.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.answer, !understood && styles.hint]}>
          {answer}
        </Text>
        <View style={styles.sourceTag}>
          <Text style={styles.sourceText}>
            {source === "llm" ? "AI" : "Rules"}
          </Text>
        </View>
      </View>

      {matches.length > 0 && (
        <View style={styles.list}>
          <ScrollView
            style={expanded ? styles.listExpanded : undefined}
            nestedScrollEnabled
          >
            {visible.map((m, i) => (
              <Pressable
                key={m.id}
                onPress={() => onOpen(m.id)}
                style={({ pressed }) => [
                  styles.item,
                  i > 0 && styles.itemBorder,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.itemText}>
                  <Text style={styles.driver}>{m.driverName}</Text>
                  <Text style={styles.sub}>
                    {m.licensePlate} · {m.truckType}
                  </Text>
                </View>
                <StatusBadge status={m.status} />
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              </Pressable>
            ))}
          </ScrollView>

          {matches.length > PREVIEW_COUNT && (
            <Pressable
              onPress={() => setExpanded((v) => !v)}
              style={styles.toggle}
            >
              <Text style={styles.toggleText}>
                {expanded ? "Show less" : `Show all (${matches.length})`}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {suggestion && (
        <View style={styles.suggestion}>
          <Ionicons name="bulb-outline" size={18} color="#2563eb" />
          <View style={styles.suggestionText}>
            <Text style={styles.suggestionTitle}>Suggested action</Text>
            <Text style={styles.suggestionBody}>
              {suggestion.reason} Set to "{STATUS_LABELS[suggestion.status]}"?
            </Text>
          </View>
          <Pressable
            onPress={() => onOpen(suggestion.requestId)}
            style={({ pressed }) => [
              styles.suggestionButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.suggestionButtonText}>Review</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={onClear} hitSlop={8} style={styles.clear}>
        <Text style={styles.clearText}>Clear</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  answer: { flex: 1, fontWeight: "600", fontSize: 15, color: "#111827" },
  hint: { fontWeight: "400", color: "#6b7280" },
  sourceTag: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sourceText: { fontSize: 11, fontWeight: "600", color: "#6b7280" },
  list: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  item: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10 },
  itemBorder: { borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  itemText: { flex: 1, gap: 2 },
  driver: { fontSize: 14, fontWeight: "600", color: "#111827" },
  sub: { fontSize: 12, color: "#6b7280" },
  pressed: { opacity: 0.6 },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    padding: 10,
  },
  suggestionText: { flex: 1, gap: 2 },
  suggestionTitle: { fontSize: 12, fontWeight: "700", color: "#2563eb" },
  suggestionBody: { fontSize: 13, color: "#374151" },
  suggestionButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  clear: { alignSelf: "flex-start" },
  clearText: { color: "#6b7280", fontSize: 13 },
  listExpanded: { maxHeight: 260 },
  toggle: {
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  toggleText: { fontSize: 13, fontWeight: "600", color: "#2563eb" },
});
