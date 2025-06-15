import Link from "next/link";
import { Heart } from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id?: string | null;
  created_at?: string;
}

interface Props {
  prompt: Prompt;
  categoryName?: string;
  likeCount?: number;
}

export default function PromptCard({ prompt, categoryName, likeCount }: Props) {
  return (
    <Link
      href={`/prompt/${prompt.id}`}
      className="p-4 border rounded-lg shadow-sm bg-card transition hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 block"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="font-semibold text-lg truncate">{prompt.title}</div>
        {categoryName && (
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            {categoryName}
          </span>
        )}
        {typeof likeCount === "number" && (
          <span className="flex items-center gap-1 ml-2 text-xs text-gray-500">
            <Heart className="size-4" />
            {likeCount}
          </span>
        )}
      </div>
      <div className="text-sm text-muted-foreground line-clamp-2 mb-1">{prompt.content}</div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>작성자: {prompt.user_id}</span>
        <span>{prompt.created_at?.slice(0, 10)}</span>
      </div>
    </Link>
  );
}
