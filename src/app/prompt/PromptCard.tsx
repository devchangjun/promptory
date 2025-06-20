import Link from "next/link";
import {
  Heart,
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
} from "lucide-react";
import { Prompt } from "@/types/prompt";

interface Props {
  prompt: Prompt;
  categoryName?: string;
  likeCount?: number;
}

// 카테고리별 색상/아이콘 (DB 기준)
const categoryStyleMap: Record<string, { color: string; icon: React.ReactNode }> = {
  마케팅: { color: "bg-yellow-100", icon: <Megaphone className="w-7 h-7 text-yellow-500" /> },
  개발: { color: "bg-blue-100", icon: <Code className="w-7 h-7 text-blue-500" /> },
  유튜브: { color: "bg-red-100", icon: <Youtube className="w-7 h-7 text-red-500" /> },
  디자인: { color: "bg-pink-100", icon: <Palette className="w-7 h-7 text-pink-500" /> },
  자기소개서: { color: "bg-rose-100", icon: <User className="w-7 h-7 text-rose-500" /> },
  사업아이디어: { color: "bg-indigo-100", icon: <Lightbulb className="w-7 h-7 text-indigo-500" /> },
  블로그: { color: "bg-orange-100", icon: <FileText className="w-7 h-7 text-orange-500" /> },
  SNS: { color: "bg-fuchsia-100", icon: <Instagram className="w-7 h-7 text-fuchsia-500" /> },
  교육: { color: "bg-green-100", icon: <GraduationCap className="w-7 h-7 text-green-500" /> },
  문학: { color: "bg-violet-100", icon: <PenLine className="w-7 h-7 text-violet-500" /> },
  취업: { color: "bg-cyan-100", icon: <BadgeCheck className="w-7 h-7 text-cyan-500" /> },
  자기계발: { color: "bg-lime-100", icon: <TrendingUp className="w-7 h-7 text-lime-500" /> },
  기타: { color: "bg-gray-100", icon: <HelpCircle className="w-7 h-7 text-gray-500" /> },
  기본: { color: "bg-purple-100", icon: <Star className="w-7 h-7 text-purple-400" /> },
};

export default function PromptCard({ prompt, categoryName, likeCount }: Props) {
  // 카테고리명에 따라 색상/아이콘 결정, 없으면 기본
  const style = categoryStyleMap[categoryName || ""] || categoryStyleMap["기본"];

  return (
    <Link
      href={`/prompt/${prompt.id}`}
      className="flex items-center gap-4 rounded-xl border border-gray-200 shadow-sm p-6 bg-white/90 hover:bg-white/95 transition min-w-[260px]"
    >
      {/* 좌측 아이콘 */}
      <div className={`w-14 h-14 flex items-center justify-center rounded-lg ${style.color}`}>{style.icon}</div>
      {/* 우측 텍스트/뱃지 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-base truncate">{prompt.title}</span>
          {categoryName && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
              {categoryName}
            </span>
          )}
          {typeof likeCount === "number" && likeCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-pink-100 text-pink-600">
              <Heart className="size-4" />
              {likeCount}
            </span>
          )}
        </div>
        <div className="text-gray-500 text-sm truncate">{prompt.content}</div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>작성자: {prompt.user_id}</span>
          <span>{prompt.created_at?.slice(0, 10)}</span>
        </div>
      </div>
    </Link>
  );
}
