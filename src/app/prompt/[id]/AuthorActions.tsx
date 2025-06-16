"use client";

import { useSession } from "@clerk/nextjs";
import EditPromptButton from "./EditPromptButton";

interface AuthorActionsProps {
  promptId: string;
  authorId: string;
}

export default function AuthorActions({ promptId, authorId }: AuthorActionsProps) {
  const { session } = useSession();
  const isAuthor = session?.user.id === authorId;

  if (!isAuthor) return null;

  return <EditPromptButton promptId={promptId} />;
}
