import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { FileText } from "lucide-react";
import PromptForm from "./PromptForm";

interface Category {
  id: string;
  name: string;
}

async function getCategories(): Promise<Category[]> {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from("categories").select("id, name");
  return data || [];
}

export default async function PromptNewPage() {
  const categories = await getCategories();
  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-8">
        <FileText className="size-6" /> 프롬프트 작성
      </h1>
      <PromptForm categories={categories} />
    </div>
  );
}
