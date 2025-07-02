import Link from "next/link";
import { Prompt } from "@/schemas/promptSchema";
import {
  FileText,
  Star,
  Megaphone,
  Code,
  Youtube,
  Palette,
  User,
  Lightbulb,
  Instagram,
  GraduationCap,
  PenLine,
  BadgeCheck,
  TrendingUp,
  HelpCircle,
  ThumbsUp,
} from "lucide-react";

interface Props {
  prompt: Prompt;
  className?: string;
}

// 카테고리별 색상/아이콘 (다크모드 호환)
const categoryStyleMap: Record<string, { color: string; icon: React.ReactNode }> = {
  마케팅: {
    color: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: <Megaphone className="w-7 h-7 text-yellow-500 dark:text-yellow-400" />,
  },
  개발: {
    color: "bg-blue-100 dark:bg-blue-900/30",
    icon: <Code className="w-7 h-7 text-blue-500 dark:text-blue-400" />,
  },
  유튜브: {
    color: "bg-red-100 dark:bg-red-900/30",
    icon: <Youtube className="w-7 h-7 text-red-500 dark:text-red-400" />,
  },
  디자인: {
    color: "bg-pink-100 dark:bg-pink-900/30",
    icon: <Palette className="w-7 h-7 text-pink-500 dark:text-pink-400" />,
  },
  자기소개서: {
    color: "bg-rose-100 dark:bg-rose-900/30",
    icon: <User className="w-7 h-7 text-rose-500 dark:text-rose-400" />,
  },
  사업아이디어: {
    color: "bg-indigo-100 dark:bg-indigo-900/30",
    icon: <Lightbulb className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />,
  },
  블로그: {
    color: "bg-orange-100 dark:bg-orange-900/30",
    icon: <FileText className="w-7 h-7 text-orange-500 dark:text-orange-400" />,
  },
  SNS: {
    color: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
    icon: <Instagram className="w-7 h-7 text-fuchsia-500 dark:text-fuchsia-400" />,
  },
  교육: {
    color: "bg-green-100 dark:bg-green-900/30",
    icon: <GraduationCap className="w-7 h-7 text-green-500 dark:text-green-400" />,
  },
  문학: {
    color: "bg-violet-100 dark:bg-violet-900/30",
    icon: <PenLine className="w-7 h-7 text-violet-500 dark:text-violet-400" />,
  },
  취업: {
    color: "bg-cyan-100 dark:bg-cyan-900/30",
    icon: <BadgeCheck className="w-7 h-7 text-cyan-500 dark:text-cyan-400" />,
  },
  자기계발: {
    color: "bg-lime-100 dark:bg-lime-900/30",
    icon: <TrendingUp className="w-7 h-7 text-lime-500 dark:text-lime-400" />,
  },
  기타: {
    color: "bg-gray-100 dark:bg-gray-800/50",
    icon: <HelpCircle className="w-7 h-7 text-gray-500 dark:text-gray-400" />,
  },
  기본: {
    color: "bg-purple-100 dark:bg-purple-900/30",
    icon: <Star className="w-7 h-7 text-purple-400 dark:text-purple-300" />,
  },
};

export default function PromptCard({ prompt, className }: Props) {
  // 카테고리명에 따라 색상/아이콘 결정, 없으면 기본
  const style = categoryStyleMap[prompt.category || ""] || categoryStyleMap["기본"];

  return (
    <Link
      href={`/prompt/${prompt.id}`}
      className={`relative flex items-center gap-4 rounded-xl border border-border shadow-sm p-6 bg-card hover:bg-card/80 transition-all duration-200 min-w-[260px] ${className}`}
    >
      {/* 카테고리 뱃지 - 우측 상단 고정 */}
      {prompt.category && (
        <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
          {prompt.category}
        </span>
      )}

      {/* 좌측 아이콘 */}
      <div className={`w-14 h-14 flex items-center justify-center rounded-lg ${style.color}`}>{style.icon}</div>

      {/* 우측 텍스트/뱃지 */}
      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-base truncate text-card-foreground">{prompt.title}</span>
          {prompt.likeCount && prompt.likeCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300">
              <ThumbsUp className="size-4" />
              {prompt.likeCount}
            </span>
          )}
        </div>
        <div className="text-muted-foreground text-sm truncate">{prompt.content}</div>
        <div className="flex justify-between items-center text-xs text-muted-foreground/70 mt-2">
          <span className="truncate flex-1 mr-2" title={`작성자: ${prompt.user_id}`}>
            작성자: {prompt.user_id}
          </span>
          <span className="shrink-0">{prompt.created_at?.slice(0, 10)}</span>
        </div>
      </div>
    </Link>
  );
}
