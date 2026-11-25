import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
};

export const ASSISTANT_MAX_LENGTH = 500;

export function AssistantInput({ value, onChange, onSubmit, pending }: Props) {
  const disabled = pending || !value.trim();
  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder='Ask: "approved tankers"'
        maxLength={ASSISTANT_MAX_LENGTH}
        returnKeyType="send"
        onSubmitEditing={onSubmit}
        editable={!pending}
        style={styles.input}
      />
      <Pressable
        onPress={onSubmit}
        disabled={disabled}
        style={[styles.button, disabled && styles.disabled]}
      >
        {pending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ask</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
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
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
