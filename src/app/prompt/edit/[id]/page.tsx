"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Prompt {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id?: string | null;
}

export default function EditPromptPage({ params }: { params: { id: string } }) {
  const { session } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function createSupabaseClient() {
    const token = await session?.getToken({ template: "supabase" });
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
    });
  }

  useEffect(() => {
    const fetchPrompt = async () => {
      const client = await createSupabaseClient();
      const { data } = await client.from("prompts").select("*").eq("id", params.id).single();

      if (data) {
        // 작성자가 아닌 경우 메인 페이지로 리다이렉트
        if (data.user_id !== session?.user.id) {
          toast.error("수정 권한이 없습니다.");
          router.push("/");
          return;
        }
        setPrompt(data);
      }
    };

    if (session) {
      fetchPrompt();
    }
  }, [params.id, session, router, createSupabaseClient]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt) return;

    try {
      setIsLoading(true);
      const client = await createSupabaseClient();

      const { error } = await client
        .from("prompts")
        .update({
          title: prompt.title,
          content: prompt.content,
        })
        .eq("id", prompt.id);

      if (error) throw error;

      toast.success("프롬프트가 수정되었습니다.");
      router.push(`/prompt/${prompt.id}`);
    } catch (error) {
      console.error(error);
      toast.error("프롬프트 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!prompt) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">프롬프트 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            value={prompt.title}
            onChange={(e) => setPrompt({ ...prompt, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <Textarea
            id="content"
            value={prompt.content}
            onChange={(e) => setPrompt({ ...prompt, content: e.target.value })}
            className="min-h-[200px]"
            required
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "수정 중..." : "수정하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}
