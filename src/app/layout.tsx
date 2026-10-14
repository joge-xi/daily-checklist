import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/shared/toast";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import "./globals.css";

const THEME_COLOR_LIGHT = "#F4F4F0"; // Inkwell --ivory
const THEME_COLOR_DARK = "#0F1018";  // Inkwell dark --ivory

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://joge-xi.github.io/daily-checklist/"
  ),
  title: "HabitFlow",
  description:
    "用美观、私密的习惯追踪器记录你的每日习惯。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HabitFlow",
  },
  openGraph: {
    title: "HabitFlow — 私密习惯追踪",
    description:
      "用连续打卡、统计和美观的离线优先追踪器养成更好的习惯。你的数据只保存在你的设备上。",
    images: [{ url: "/og-image.png", width: 1536, height: 1024 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitFlow — 私密习惯追踪",
    description:
      "用连续打卡、统计和美观的离线优先追踪器养成更好的习惯。",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR_DARK },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/daily-checklist/icons/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("habitflow-theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <div
          id="splash"
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            transition: "opacity 0.4s ease-out",
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
                #splash{background:var(--ivory)}
                #splash img{width:72px;height:72px;border-radius:16px;animation:splash-pulse 1.8s ease-in-out infinite}
                #splash .splash-name{font-family:var(--serif);font-size:1.25rem;font-weight:500;letter-spacing:-0.01em;color:var(--slate)}
                #splash .splash-tagline{font-family:var(--mono);font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-500)}
                @keyframes splash-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.85;transform:scale(1.04)}}
              `,
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/daily-checklist/icons/icon-192.png" alt="" width={72} height={72} />
          <div style={{ textAlign: "center" }}>
            <div className="splash-name">HabitFlow</div>
            <div className="splash-tagline">贵在坚持</div>
          </div>
        </div>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-paper focus:shadow-lg"
        >
          跳到主要内容
        </a>
        <ThemeProvider>
          <ToastProvider>
            <AppShell>
              <ErrorBoundary>{children}</ErrorBoundary>
            </AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
