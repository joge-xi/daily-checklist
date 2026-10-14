import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { APP_VERSION, BUILD_DATE } from "@/lib/version";

function formatBuildDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return format(new Date(iso), "MMM d, yyyy", { locale: zhCN });
  } catch {
    return null;
  }
}

export function AppFooter() {
  const formatted = formatBuildDate(BUILD_DATE);

  return (
    <footer className="px-6 py-4 text-center font-mono text-eyebrow uppercase tracking-[0.12em] text-gray-500">
      v{APP_VERSION}
      {formatted && <> · 构建于 {formatted}</>}
    </footer>
  );
}
