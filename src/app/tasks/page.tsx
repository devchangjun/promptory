"use client";
import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Task {
  id: number;
  name: string;
  user_id: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const { user } = useUser();
  const { session } = useSession();

  function createClerkSupabaseClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      accessToken: async () => session?.getToken() ?? null,
    });
  }

  const client = createClerkSupabaseClient();

  useEffect(() => {
    if (!user) return;
    async function loadTasks() {
      setLoading(true);
      const { data, error } = await client.from("tasks").select();
      if (!error && data) setTasks(data as Task[]);
      setLoading(false);
    }
    loadTasks();
  }, [user]);

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await client.from("tasks").insert({ name });
    setName("");
    // 새로고침 없이 목록 갱신
    const { data } = await client.from("tasks").select();
    setTasks(data as Task[]);
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">나의 Tasks</h1>
      <form onSubmit={createTask} className="flex gap-2 mb-6">
        <Input
          autoFocus
          type="text"
          name="name"
          placeholder="새 Task 입력"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />
        <Button type="submit">추가</Button>
      </form>
      {loading && <p>로딩 중...</p>}
      {!loading && tasks.length > 0 && (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="p-3 rounded bg-muted text-foreground">
              {task.name}
            </li>
          ))}
        </ul>
      )}
      {!loading && tasks.length === 0 && <p>등록된 Task가 없습니다.</p>}
    </div>
  );
}
