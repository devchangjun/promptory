"use client";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface Props {
  promptId: string;
  initialLikeCount?: number;
}

export default function PromptLikeButton({ promptId, initialLikeCount = 0 }: Props) {
  const { userId } = useAuth();
  const utils = trpc.useContext();

  // 좋아요 상태 조회 (인증된 사용자만)
  const { data: likeStatus, isLoading: isLikeStatusLoading } = trpc.prompt.getLikeStatus.useQuery(
    { promptId },
    {
      enabled: !!userId,
      initialData: { isLiked: false, likeCount: initialLikeCount },
    }
  );

  // 좋아요 토글 뮤테이션
  const toggleLikeMutation = trpc.prompt.toggleLike.useMutation({
    onMutate: async () => {
      // Optimistic update
      await utils.prompt.getLikeStatus.cancel({ promptId });

      const previousData = utils.prompt.getLikeStatus.getData({ promptId });

      if (previousData) {
        utils.prompt.getLikeStatus.setData(
          { promptId },
          {
            isLiked: !previousData.isLiked,
            likeCount: previousData.isLiked ? previousData.likeCount - 1 : previousData.likeCount + 1,
          }
        );
      }

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(data.action === "added" ? "좋아요를 추가했습니다!" : "좋아요를 취소했습니다!");

      // 관련된 쿼리들 무효화하여 데이터 동기화
      utils.prompt.getPromptById.invalidate({ id: promptId });
      utils.prompt.getPrompts.invalidate();
      utils.prompt.getLatestPrompts.invalidate();
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        utils.prompt.getLikeStatus.setData({ promptId }, context.previousData);
      }
      toast.error(error.message || "좋아요 처리에 실패했습니다.");
    },
  });

  const handleLike = () => {
    if (!userId) {
      toast.error("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }

    toggleLikeMutation.mutate({ promptId });
  };

  // 로딩 상태
  const isLoading = isLikeStatusLoading || toggleLikeMutation.isPending;

  // 좋아요 상태 (로그인하지 않은 경우 초기값 사용)
  const isLiked = userId ? likeStatus?.isLiked : false;
  const likeCount = likeStatus?.likeCount || initialLikeCount;

  return (
    <Button
      type="button"
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className="gap-1.5 min-w-[60px]"
      aria-label={isLiked ? "좋아요 취소" : "좋아요"}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
      )}
      {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
      <span className="sr-only">{isLiked ? "좋아요 취소" : "좋아요"}</span>
    </Button>
  );
}
