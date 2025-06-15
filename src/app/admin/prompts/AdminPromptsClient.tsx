"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Prompt {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at?: string;
}

interface AdminPromptsClientProps {
  initialPrompts: Prompt[];
}

export default function AdminPromptsClient({ initialPrompts }: AdminPromptsClientProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function createSupabaseClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  }

  async function reloadPrompts() {
    setLoading(true);
    setError(null);
    const client = createSupabaseClient();
    const { data, error } = await client.from("prompts").select("id, title, content, user_id, created_at");
    if (!error) setPrompts(data as Prompt[]);
    else setError(error.message);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const client = createSupabaseClient();
    const { error } = await client.from("prompts").insert({ title: newTitle, content: newContent });
    if (!error) {
      setNewTitle("");
      setNewContent("");
      reloadPrompts();
    } else {
      alert("등록 실패: " + error.message);
    }
  }

  function startEdit(prompt: Prompt) {
    setEditingId(prompt.id);
    setEditTitle(prompt.title);
    setEditContent(prompt.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  }

  async function handleEditSave(id: string) {
    const client = createSupabaseClient();
    const { error } = await client.from("prompts").update({ title: editTitle, content: editContent }).eq("id", id);
    if (!error) {
      setEditingId(null);
      reloadPrompts();
    } else {
      alert("수정 실패: " + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    const client = createSupabaseClient();
    const { error } = await client.from("prompts").delete().eq("id", id);
    if (!error) setPrompts((prompts) => prompts.filter((p) => p.id !== id));
    else alert("삭제 실패: " + error.message);
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">프롬프트 관리</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6 items-end">
        <Input placeholder="제목" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-48" />
        <Input
          placeholder="내용"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="default" disabled={!newTitle.trim() || !newContent.trim()}>
          등록
        </Button>
      </form>
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
                <td className="p-2 max-w-[180px] truncate">
                  {editingId === prompt.id ? (
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-40" />
                  ) : (
                    prompt.title
                  )}
                </td>
                <td className="p-2 max-w-[240px] truncate">
                  {editingId === prompt.id ? (
                    <Input value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  ) : (
                    prompt.content
                  )}
                </td>
                <td className="p-2 font-mono text-xs">{prompt.user_id}</td>
                <td className="p-2">{prompt.created_at?.slice(0, 10)}</td>
                <td className="p-2 flex gap-1">
                  {editingId === prompt.id ? (
                    <>
                      <Button size="sm" variant="default" onClick={() => handleEditSave(prompt.id)}>
                        <Check className="size-4 mr-1" /> 저장
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="size-4 mr-1" /> 취소
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(prompt)}>
                      <Pencil className="size-4 mr-1" /> 수정
                    </Button>
                  )}
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
