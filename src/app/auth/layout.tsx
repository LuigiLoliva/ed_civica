import { AuthAmbient } from "@/components/immersive/auth-ambient";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthAmbient />
      <div className="relative z-10">{children}</div>
    </>
  );
}