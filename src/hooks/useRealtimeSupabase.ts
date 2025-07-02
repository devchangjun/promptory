import { useEffect, useState, useCallback } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient, RealtimeChannel, SupabaseClient, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { toast } from "sonner";

interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

interface UseRealtimeSupabaseReturn {
  client: SupabaseClient | null;
  isConnected: boolean;
  subscribe: (
    tableName: string,
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
    filter?: { event?: "INSERT" | "UPDATE" | "DELETE" | "*"; schema?: string }
  ) => RealtimeSubscription | null;
}

export function useRealtimeSupabase(): UseRealtimeSupabaseReturn {
  const { session } = useSession();
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 인증된 Supabase 클라이언트 생성
  const createAuthenticatedClient = useCallback(async () => {
    if (!session) return null;

    try {
      const token = await session.getToken({ template: "supabase" });

      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: false,
          },
          global: {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        }
      );

      return supabaseClient;
    } catch (error) {
      console.error("Failed to create authenticated Supabase client:", error);
      return null;
    }
  }, [session]);

  // 클라이언트 초기화 및 연결 상태 관리
  useEffect(() => {
    let mounted = true;

    const initializeClient = async () => {
      const newClient = await createAuthenticatedClient();

      if (!mounted) return;

      if (newClient) {
        setClient(newClient);
        setIsConnected(true);
      } else {
        setClient(null);
        setIsConnected(false);
      }
    };

    initializeClient();

    return () => {
      mounted = false;
    };
  }, [createAuthenticatedClient]);

  // 실시간 구독 함수
  const subscribe = useCallback(
    (
      tableName: string,
      callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
      filter: { event?: "INSERT" | "UPDATE" | "DELETE" | "*"; schema?: string } = {}
    ): RealtimeSubscription | null => {
      if (!client || !isConnected) {
        console.warn("Supabase client not connected for realtime subscription");
        return null;
      }

      const channelName = `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const channel = client
        .channel(channelName)
        .on(
          "postgres_changes" as "postgres_changes",
          {
            event: filter.event || "*",
            schema: filter.schema || "public",
            table: tableName,
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            try {
              callback(payload);
            } catch (error) {
              console.error("Error in realtime callback:", error);
              toast.error("실시간 업데이트 처리 중 오류가 발생했습니다.");
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(`✅ Realtime subscription active for ${tableName}`);
          } else if (status === "CHANNEL_ERROR") {
            console.error(`❌ Realtime subscription error for ${tableName}`);
            toast.error(`${tableName} 실시간 연결에 오류가 발생했습니다.`);
          } else if (status === "TIMED_OUT") {
            console.warn(`⏰ Realtime subscription timeout for ${tableName}`);
            toast.warning(`${tableName} 실시간 연결이 시간 초과되었습니다.`);
          }
        });

      const unsubscribe = () => {
        channel.unsubscribe();
        console.log(`🔌 Unsubscribed from ${tableName} realtime updates`);
      };

      return { channel, unsubscribe };
    },
    [client, isConnected]
  );

  return {
    client,
    isConnected,
    subscribe,
  };
}
