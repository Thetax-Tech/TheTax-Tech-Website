import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Theta X Tech Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors theme="system" closeButton />
    </>
  );
}
