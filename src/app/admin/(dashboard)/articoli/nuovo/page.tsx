import type { Metadata } from "next";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nuovo articolo",
};

export default function NuovoArticoloPage() {
  return <ArticleForm />;
}
