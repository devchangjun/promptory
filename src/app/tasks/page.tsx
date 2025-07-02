"use client";
import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TaskListSkeleton } from "@/components/ui/loading";

interface Task {
  id: number;
  name: string;
  user_id: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      try {
        const { data, error } = await client.from("tasks").select();
        if (!error && data) {
          setTasks(data as Task[]);
        } else if (error) {
          console.error("Error loading tasks:", error);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [user, client]);

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await client.from("tasks").insert({ name: name.trim() });
      setName("");

      // 새로고침 없이 목록 갱신
      const { data } = await client.from("tasks").select();
      setTasks(data as Task[]);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
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
          disabled={submitting}
        />
        <Button type="submit" disabled={submitting || !name.trim()}>
          {submitting ? "추가 중..." : "추가"}
        </Button>
      </form>

      {loading ? (
        <TaskListSkeleton count={5} />
      ) : tasks.length > 0 ? (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="p-3 rounded bg-muted text-foreground">
              {task.name}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-muted-foreground py-10">
          <p>등록된 Task가 없습니다.</p>
          <p className="text-sm mt-2">위의 입력창에서 새로운 Task를 추가해보세요.</p>
        </div>
      )}
    </div>
  );
}
