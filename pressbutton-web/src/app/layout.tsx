import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { EnterpriseProvider } from "../contexts/EnterpriseContext";
// import TokenDebugger from "../components/TokenDebugger"; // 暂时注释掉，不需要显示token debug

export const metadata: Metadata = {
  title: "pressbutton",
  description: "Next.js app for pressbutton with enterprise features",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EnterpriseProvider>
          <AuthProvider>
            {children}
            {/* <TokenDebugger /> */} {/* 暂时注释掉，不需要显示token debug */}
          </AuthProvider>
        </EnterpriseProvider>
      </body>
    </html>
  );
}
