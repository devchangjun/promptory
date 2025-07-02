import { useEffect } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface UseRealtimePromptsOptions {
  enabled?: boolean;
  showToasts?: boolean;
}

export function useRealtimePrompts(options: UseRealtimePromptsOptions = {}) {
  const { enabled = true, showToasts = true } = options;
  const { session } = useSession();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled || !session) return;

    let supabaseClient;

    const setupRealtimeSubscription = async () => {
      try {
        // 인증된 Supabase 클라이언트 생성
        const token = await session.getToken({ template: "supabase" });

        supabaseClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
          }
        );

        // 프롬프트 테이블 변경사항 구독
        const promptsChannel = supabaseClient
          .channel("prompts_realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "prompts" },
            (payload: Record<string, unknown>) => {
              console.log("Prompts realtime update:", payload);

              // tRPC 캐시 무효화하여 최신 데이터 다시 가져오기
              utils.prompt.getPrompts.invalidate();
              utils.prompt.getLatestPrompts.invalidate();

              if (showToasts) {
                const eventType = (payload as Record<string, unknown>).eventType as string;
                const newRecord = (payload as Record<string, unknown>).new as Record<string, unknown>;

                switch (eventType) {
                  case "INSERT":
                    if (newRecord?.user_id !== session.user?.id) {
                      toast.success("새로운 프롬프트가 등록되었습니다!", {
                        description: (newRecord?.title as string) || "새 프롬프트",
                      });
                    }
                    break;
                  case "UPDATE":
                    toast.info("프롬프트가 수정되었습니다.");
                    break;
                  case "DELETE":
                    toast.info("프롬프트가 삭제되었습니다.");
                    break;
                }
              }
            }
          )
          .subscribe();

        // 좋아요 테이블 변경사항 구독
        const likesChannel = supabaseClient
          .channel("likes_realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "likes" },
            (payload: Record<string, unknown>) => {
              console.log("Likes realtime update:", payload);

              // 좋아요 관련 캐시만 무효화
              utils.prompt.getPrompts.invalidate();
              utils.prompt.getLatestPrompts.invalidate();

              const eventType = (payload as Record<string, unknown>).eventType as string;
              if (showToasts && eventType === "INSERT") {
                // 자신의 프롬프트에 좋아요가 달린 경우에만 알림
                // 실제로는 프롬프트 작성자 확인 로직이 필요
                const isMyPrompt = false; // 추후 구현
                if (isMyPrompt) {
                  toast.success("회원님의 프롬프트에 좋아요가 달렸습니다! ❤️");
                }
              }
            }
          )
          .subscribe();

        console.log("✅ Realtime subscriptions established");

        return () => {
          promptsChannel.unsubscribe();
          likesChannel.unsubscribe();
          console.log("🔌 Realtime subscriptions cleaned up");
        };
      } catch (error) {
        console.error("Failed to setup realtime subscription:", error);
        if (showToasts) {
          toast.error("실시간 연결에 실패했습니다. 새로고침을 시도해주세요.");
        }
      }
    };

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup?.then((cleanupFn) => cleanupFn?.());
    };
  }, [enabled, session, utils, showToasts]);

  return {
    // 실시간 연결 상태나 추가 기능이 필요하면 여기에 추가
  };
}
