import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { RequestCard } from "../components/RequestCard";
import { StatusFilter } from "../components/StatusFilter";
import { EmptyView, ErrorView, LoadingView } from "../components/StateViews";
import { useParkingRequests } from "../hooks/parkingRequests";
import { useFilterStore } from "../store/filterStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AssistantBar } from "@/components/AssistantBar";

export default function RequestListScreen() {
  const router = useRouter();
  const status = useFilterStore((s) => s.status);
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useParkingRequests();

  const items = useMemo(() => {
    const list = data ?? [];
    const filtered =
      status === "all" ? list : list.filter((r) => r.status === status);
    return [...filtered].sort(
      (a, b) => Date.parse(a.requestedFrom) - Date.parse(b.requestedFrom),
    );
  }, [data, status]);

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error.message} onRetry={refetch} />;

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
    >
      <ScreenHeader title="Parking requests" />

      <StatusFilter />
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onPress={() =>
              router.push({ pathname: "/[id]", params: { id: item.id } })
            }
          />
        )}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={<EmptyView message="No parking requests" />}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
      <AssistantBar />
    </SafeAreaView>
  );
}
