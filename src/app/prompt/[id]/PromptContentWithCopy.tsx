"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
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
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="relative mb-6">
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10"
        aria-label="복사하기"
      >
        <Copy className="size-4" />
      </Button>
      <pre className="bg-muted rounded-md p-4 text-base overflow-x-auto whitespace-pre-wrap min-h-[80px]">
        <code>{content}</code>
      </pre>
    </div>
  );
}
