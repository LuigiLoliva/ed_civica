import Link from "next/link";
import type { Metadata } from "next";
import { QuizEditorStub } from "@/components/admin/QuizEditorStub";
import { requireAdminOrDemo } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nuovo quiz",
};

export default async function AdminQuizNewPage() {
  await requireAdminOrDemo();

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
