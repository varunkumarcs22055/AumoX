import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · AUMOXO",
  robots: { index: false, follow: false },
};

// Transparent layout — child routes choose their own shell.
// (Authenticated pages live under (shell)/ and use AdminShell.)
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
