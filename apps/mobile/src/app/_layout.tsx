import { DialogProvider } from "@/components/DialogProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }),
  );
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <DialogProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
          </Stack>
        </DialogProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
