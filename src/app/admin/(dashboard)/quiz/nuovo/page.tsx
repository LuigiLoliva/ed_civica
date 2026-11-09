import Link from "next/link";
import type { Metadata } from "next";
import { QuizEditorStub } from "@/components/admin/QuizEditorStub";

export const metadata: Metadata = {
  title: "Nuovo quiz",
};

export default function AdminQuizNewPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/admin/quiz"
        className="text-sm text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        ← Elenco quiz
      </Link>
      <QuizEditorStub mode="create" />
    </div>
  );
}
