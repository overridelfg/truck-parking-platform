import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAssistantQuery } from "../hooks/assistant";
import { AssistantInput } from "./AssistantInput";
import { AssistantResult } from "./AssistantResult";
import { ExamplePrompts } from "./ExamplePrompts";
import { ErrorView } from "./StateViews";

export function AssistantBar() {
  const router = useRouter();
  const [text, setText] = useState("");
  const ask = useAssistantQuery();

  const run = (query: string) => {
    const q = query.trim();
    if (q && !ask.isPending) ask.mutate(q);
  };

  const submit = () => run(text);

  const pick = (query: string) => {
    setText(query);
    run(query);
  };

  const clear = () => {
    ask.reset();
    setText("");
  };

  const showExamples = !ask.isPending && (!ask.data || !ask.data.understood);

  return (
    <View style={styles.box}>
      <AssistantInput
        value={text}
        onChange={setText}
        onSubmit={submit}
        pending={ask.isPending}
      />

      {showExamples && <ExamplePrompts onSelect={pick} />}

      {ask.isPending && (
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Thinking…</Text>
        </View>
      )}

      {ask.isError && (
        <View style={styles.error}>
          <ErrorView message={ask.error.message} onRetry={submit} />
        </View>
      )}

      {ask.data && !ask.isPending && (
        <AssistantResult
          response={ask.data}
          onOpen={(id) => router.push({ pathname: "/[id]", params: { id } })}
          onClear={clear}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
  error: { height: 140 },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  loadingText: { color: "#6b7280", fontSize: 14 },
});
