import PromptCard from "@/app/prompt/PromptCard";
import { Prompt } from "@/schemas/promptSchema";

interface PromptListProps {
  prompts: Prompt[];
  isLoading?: boolean;
  emptyText?: string;
}

export default function PromptList({ prompts, isLoading, emptyText }: PromptListProps) {
  if (isLoading) {
    return <div className="flex justify-center items-center py-10 text-muted-foreground">불러오는 중...</div>;
  }
  if (!prompts || prompts.length === 0) {
    return <div className="text-center text-gray-500 py-10">{emptyText || "데이터가 없습니다."}</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
