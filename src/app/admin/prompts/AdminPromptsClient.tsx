"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trash2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useSession } from "@clerk/nextjs";

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
  const [editOpen, setEditOpen] = useState(false);
  const { session } = useSession();

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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const client = await createSupabaseClient();
    const { data, error } = await client
      .from("prompts")
      .insert({ title: newTitle, content: newContent })
      .select()
      .single();
    if (!error && data) {
      setPrompts((prev) => [data as Prompt, ...prev]);
      setNewTitle("");
      setNewContent("");
    } else {
      alert("등록 실패: " + (error?.message || ""));
    }
  }

  function startEdit(prompt: Prompt) {
    setEditingId(prompt.id);
    setEditTitle(prompt.title);
    setEditContent(prompt.content);
    setEditOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setEditOpen(false);
  }

  async function handleEditSave(id: string) {
    const client = await createSupabaseClient();

    const { data, error } = await client
      .from("prompts")
      .update({ title: editTitle, content: editContent })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (!error && data) {
      setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, title: data.title, content: data.content } : p)));
      setEditingId(null);
      setEditOpen(false);
    } else if (!error && !data) {
      alert("수정할 프롬프트를 찾을 수 없습니다.");
    } else {
      alert("수정 실패: " + (error?.message || ""));
    }
  }

  async function handleDelete(id: string) {
    const client = await createSupabaseClient();
    const { error } = await client.from("prompts").delete().eq("id", id);
    if (!error) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("삭제 실패: " + error.message);
    }
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
      {prompts.length === 0 && <p>등록된 프롬프트가 없습니다.</p>}
      {prompts.length > 0 && (
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
                <td className="p-2 flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => startEdit(prompt)}>
                    <Pencil className="size-4 mr-1" /> 수정
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-md px-3 py-1 flex items-center gap-2"
                    onClick={() => handleDelete(prompt.id)}
                    disabled={!session}
                  >
                    <Trash2 className="size-4" /> 삭제
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* 수정 모달 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl w-full">
          <DialogHeader>
            <DialogTitle>프롬프트 수정</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="제목"
              className="w-full"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="내용"
              rows={8}
              className="rounded-md border border-input bg-background p-3 text-base resize-y min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="default" onClick={() => editingId && handleEditSave(editingId)}>
              <Check className="size-4 mr-1" /> 저장
            </Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="size-4 mr-1" /> 취소
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
