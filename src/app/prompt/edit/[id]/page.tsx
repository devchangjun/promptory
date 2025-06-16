import EditPromptPageClient from "./EditPromptPageClient";

export default async function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditPromptPageClient id={id} />;
}
