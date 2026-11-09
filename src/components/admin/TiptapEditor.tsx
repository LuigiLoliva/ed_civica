"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  error?: string;
}

export function TiptapEditor({
  value,
  onChange,
  disabled,
  error,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Placeholder.configure({
        placeholder: "Scrivi il corpo dell'articolo… Usa H2/H3 per i titoli.",
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[220px] px-4 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del link", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Caricamento editor…
      </div>
    );
  }

  const tools: Array<{
    label: string;
    active?: boolean;
    onClick: () => void;
    icon: React.ReactNode;
  }> = [
    {
      label: "Grassetto",
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
      icon: <Bold className="size-4" />,
    },
    {
      label: "Corsivo",
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
      icon: <Italic className="size-4" />,
    },
    {
      label: "Titolo H2",
      active: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      icon: <Heading2 className="size-4" />,
    },
    {
      label: "Titolo H3",
      active: editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      icon: <Heading3 className="size-4" />,
    },
    {
      label: "Elenco puntato",
      active: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      icon: <List className="size-4" />,
    },
    {
      label: "Elenco numerato",
      active: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      icon: <ListOrdered className="size-4" />,
    },
    {
      label: "Citazione",
      active: editor.isActive("blockquote"),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      icon: <Quote className="size-4" />,
    },
    {
      label: "Link",
      active: editor.isActive("link"),
      onClick: setLink,
      icon: <LinkIcon className="size-4" />,
    },
    {
      label: "Annulla",
      onClick: () => editor.chain().focus().undo().run(),
      icon: <Undo className="size-4" />,
    },
    {
      label: "Ripeti",
      onClick: () => editor.chain().focus().redo().run(),
      icon: <Redo className="size-4" />,
    },
  ];

  return (
    <div>
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-card",
          error ? "border-destructive" : "border-border",
        )}
      >
        <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
          {tools.map((tool) => (
            <Button
              key={tool.label}
              type="button"
              size="icon-sm"
              variant={tool.active ? "default" : "ghost"}
              aria-label={tool.label}
              title={tool.label}
              onClick={tool.onClick}
            >
              {tool.icon}
            </Button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
      <p className="mt-1 text-xs text-muted-foreground">
        H2/H3, elenchi e citazioni. Le immagini si aggiungono sotto (max{" "}
        {4}).
      </p>
    </div>
  );
}
