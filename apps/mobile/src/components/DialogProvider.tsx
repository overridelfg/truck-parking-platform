import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Variant = "default" | "danger" | "success" | "error";

type DialogState = {
  title: string;
  message: string;
  variant: Variant;
  confirmLabel: string;
  cancelLabel: string | null;
  resolve: (value: boolean) => void;
};

type ConfirmOptions = {
  title: string;
  message: string;
  variant?: Variant;
  confirmLabel?: string;
  cancelLabel?: string;
};

type NotifyOptions = {
  title: string;
  message: string;
  variant?: "success" | "error";
};

type DialogApi = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  notify: (opts: NotifyOptions) => Promise<void>;
};

const DialogContext = createContext<DialogApi | null>(null);

const COLORS: Record<Variant, string> = {
  default: "#111827",
  danger: "#dc2626",
  success: "#16a34a",
  error: "#dc2626",
};

const ICONS: Record<Variant, string> = {
  default: "?",
  danger: "!",
  success: "✓",
  error: "✕",
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const close = useCallback(
    (value: boolean) => {
      dialog?.resolve(value);
      setDialog(null);
    },
    [dialog],
  );

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) =>
        setDialog({
          title: opts.title,
          message: opts.message,
          variant: opts.variant ?? "default",
          confirmLabel: opts.confirmLabel ?? "Confirm",
          cancelLabel: opts.cancelLabel ?? "Cancel",
          resolve,
        }),
      ),
    [],
  );

  const notify = useCallback(
    (opts: NotifyOptions) =>
      new Promise<void>((resolve) =>
        setDialog({
          title: opts.title,
          message: opts.message,
          variant: opts.variant ?? "success",
          confirmLabel: "OK",
          cancelLabel: null,
          resolve: () => resolve(),
        }),
      ),
    [],
  );

  const api = useMemo(() => ({ confirm, notify }), [confirm, notify]);
  const color = dialog ? COLORS[dialog.variant] : COLORS.default;

  return (
    <DialogContext.Provider value={api}>
      {children}
      <Modal
        visible={dialog !== null}
        transparent
        animationType="fade"
        onRequestClose={() => close(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => close(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            {dialog && (
              <>
                <View
                  style={[styles.iconCircle, { backgroundColor: `${color}1A` }]}
                >
                  <Text style={[styles.icon, { color }]}>
                    {ICONS[dialog.variant]}
                  </Text>
                </View>
                <Text style={styles.title}>{dialog.title}</Text>
                <Text style={styles.message}>{dialog.message}</Text>

                <View style={styles.buttons}>
                  {dialog.cancelLabel && (
                    <Pressable
                      onPress={() => close(false)}
                      style={({ pressed }) => [
                        styles.button,
                        styles.cancel,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.cancelText}>
                        {dialog.cancelLabel}
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => close(true)}
                    style={({ pressed }) => [
                      styles.button,
                      { backgroundColor: color },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.confirmText}>
                      {dialog.confirmLabel}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  icon: { fontSize: 26, fontWeight: "700" },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  buttons: { flexDirection: "row", gap: 10, marginTop: 22, width: "100%" },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  cancel: { backgroundColor: "#f3f4f6" },
  cancelText: { color: "#111827", fontWeight: "600" },
  confirmText: { color: "#fff", fontWeight: "600" },
  pressed: { opacity: 0.8 },
});
