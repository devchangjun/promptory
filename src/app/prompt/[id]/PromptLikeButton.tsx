"use client";
import { useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface Props {
  promptId: string;
}

export default function PromptLikeButton({ promptId }: Props) {
  const { session } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = !!session;

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      accessToken: async () => session?.getToken() ?? null,
    });
    async function fetchLike() {
      // 내 좋아요 여부
      if (isLoggedIn) {
        const { data } = await supabase.from("likes").select("id").eq("prompt_id", promptId).limit(1);
        setLiked(!!data && data.length > 0);
      }
      // 전체 카운트
      const { count } = await supabase
        .from("likes")
        .select("id", { count: "exact", head: true })
        .eq("prompt_id", promptId);
      setCount(count || 0);
    }
    fetchLike();
    // eslint-disable-next-line
  }, [promptId, isLoggedIn]);

  async function handleLike() {
    if (!isLoggedIn) {
      toast.error("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }
    setLoading(true);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      accessToken: async () => session?.getToken() ?? null,
    });
    if (liked) {
      // 좋아요 취소
      const { error } = await supabase.from("likes").delete().eq("prompt_id", promptId);
      if (!error) {
        setLiked(false);
        setCount((c) => c - 1);
      } else {
        toast.error("좋아요 취소 실패");
      }
    } else {
      // 좋아요 추가
      const { error } = await supabase.from("likes").insert({ prompt_id: promptId });
      if (!error) {
        setLiked(true);
        setCount((c) => c + 1);
      } else {
        toast.error("좋아요 실패");
      }
    }
    setLoading(false);
  }

  return (
    <Button
      type="button"
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className="gap-1"
      aria-label="좋아요"
    >
      <Heart className={liked ? "fill-primary text-primary" : ""} />
      {count > 0 && <span>{count}</span>}
      <span className="sr-only">좋아요</span>
    </Button>
  );
}
