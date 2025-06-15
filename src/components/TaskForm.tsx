"use client";
import { useState } from "react";
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskFormProps {
  onTaskCreated?: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { session } = useSession();

  function createClerkSupabaseClient() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      accessToken: async () => session?.getToken() ?? null,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const client = createClerkSupabaseClient();
    const { error } = await client.from("tasks").insert({ name });
    setLoading(false);
    setName("");
    if (!error && onTaskCreated) onTaskCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        autoFocus
        type="text"
        name="name"
        placeholder="새 Task 입력"
        onChange={(e) => setName(e.target.value)}
        value={name}
        required
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "추가 중..." : "추가"}
      </Button>
    </form>
  );
}
