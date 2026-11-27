"use client";

import type { ReactNode } from "react";

import { ContentStage } from "@/components/content-stage/content-stage";

import styles from "./content-stage.module.css";

/** Wrapper route group (content): palco fisso + contenuto sopra. */
export function ContentShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.root}>
      <ContentStage />
      <div className={styles.flow}>{children}</div>
    </div>
  );
}