"use client";
import { useEffect, useState } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Prompt {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at?: string;
}

export default function AdminPromptsPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { session } = useSession();
  const isAdmin = isSignedIn && user?.publicMetadata?.role === "admin";
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function createClerkSupabaseClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      accessToken: async () => session?.getToken() ?? null,
    });
  }

  useEffect(() => {
    if (!isAdmin) return;
    const client = createClerkSupabaseClient();
    async function loadPrompts() {
      setLoading(true);
      setError(null);
      const { data, error } = await client.from("prompts").select("id, title, content, user_id, created_at");
      if (error) setError(error.message);
      else setPrompts(data as Prompt[]);
      setLoading(false);
    }
    loadPrompts();
  }, [isAdmin]);

  async function handleDelete(id: string) {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    const client = createClerkSupabaseClient();
    const { error } = await client.from("prompts").delete().eq("id", id);
    if (!error) setPrompts((prompts) => prompts.filter((p) => p.id !== id));
    else alert("삭제 실패: " + error.message);
  }

  if (!isLoaded) {
    return <div className="py-20 text-center">로딩 중...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="size-10 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">403 - 권한 없음</h2>
        <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">프롬프트 관리</h1>
      {loading && <p>로딩 중...</p>}
      {error && <p className="text-destructive">에러: {error}</p>}
      {!loading && prompts.length === 0 && <p>등록된 프롬프트가 없습니다.</p>}
      {!loading && prompts.length > 0 && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-muted text-foreground">
              <th className="p-2">ID</th>
              <th className="p-2">제목</th>
              <th className="p-2">내용</th>
              <th className="p-2">작성자</th>
              <th className="p-2">생성일</th>
              <th className="p-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt) => (
              <tr key={prompt.id} className="border-b">
                <td className="p-2 font-mono text-xs">{prompt.id}</td>
                <td className="p-2 max-w-[180px] truncate">{prompt.title}</td>
                <td className="p-2 max-w-[240px] truncate">{prompt.content}</td>
                <td className="p-2 font-mono text-xs">{prompt.user_id}</td>
                <td className="p-2">{prompt.created_at?.slice(0, 10)}</td>
                <td className="p-2">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(prompt.id)}>
                    <Trash2 className="size-4 mr-1" /> 삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
