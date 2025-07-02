import PromptCard from "@/app/prompt/PromptCard";
import { Prompt } from "@/schemas/promptSchema";
import { PromptListSkeleton } from "@/components/ui/loading";

interface PromptListProps {
  prompts: Prompt[];
  isLoading?: boolean;
  emptyText?: string;
  skeletonCount?: number;
}

export default function PromptList({ prompts, isLoading, emptyText, skeletonCount = 6 }: PromptListProps) {
  if (isLoading) {
    return <PromptListSkeleton count={skeletonCount} />;
  }

  if (!prompts || prompts.length === 0) {
    return <div className="text-center text-muted-foreground py-10">{emptyText || "데이터가 없습니다."}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
