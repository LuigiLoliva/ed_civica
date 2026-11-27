import { GiocaAmbient } from "@/components/immersive/gioca-ambient";

export default function GiocaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GiocaAmbient />
      <div className="relative z-10">{children}</div>
    </>
  );
}