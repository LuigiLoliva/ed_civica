"use client";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type ArticleReadingBodyProps = {
  paragraphs: string[];
};

/**
 * Corpo lettura: tipografia editoriale + Reveal foundation per paragrafo.
 */
export function ArticleReadingBody({ paragraphs }: ArticleReadingBodyProps) {
  return (
    <div className="article-prose space-y-6 text-base leading-[1.8] sm:text-lg sm:leading-[1.85]">
      {paragraphs.map((paragraph, index) => (
        <Reveal
          key={`${index}-${paragraph.slice(0, 40)}`}
          delay={Math.min(index * 0.04, 0.2)}
          variant="fade-up"
        >
          <p
            className={cn(
              "text-pretty text-foreground/90",
              index === 0 && "article-dropcap",
            )}
          >
            {paragraph}
          </p>
        </Reveal>
      ))}
    </div>
  );
}
