"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  content: string;
}

export default function PromptContentWithCopy({ content }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("프롬프트가 복사되었습니다!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative mb-6 group">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800/80 hover:bg-gray-700/80 text-white border-0 h-8 px-3"
        aria-label="복사하기"
      >
        {copied ? (
          <>
            <Check className="size-3 mr-1.5" />
            <span className="text-xs">복사됨</span>
          </>
        ) : (
          <>
            <Copy className="size-3 mr-1.5" />
            <span className="text-xs">복사</span>
          </>
        )}
      </Button>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        {/* 상단 타이틀 바 - 코드 에디터 스타일 */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 ml-2">prompt.txt</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{content.length} characters</div>
        </div>

        {/* 프롬프트 내용 */}
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
