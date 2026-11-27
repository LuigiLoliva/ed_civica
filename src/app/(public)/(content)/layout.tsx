import { ContentShell } from "@/components/content-stage/content-shell";

export default function ContentRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContentShell>{children}</ContentShell>;
}