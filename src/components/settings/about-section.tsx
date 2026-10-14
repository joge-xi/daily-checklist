import { Shield } from "lucide-react";
import { APP_VERSION } from "@/lib/version";

export function AboutSection() {
  return (
    <div className="space-y-3 rounded-2xl border border-border-subtle/70 bg-surface-overlay/45 p-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-text-primary">HabitFlow</span>
        <span className="text-text-muted">v{APP_VERSION}</span>
      </div>
      <p className="flex items-start gap-2 text-text-secondary">
        <Shield className="h-4 w-4 mt-0.5 shrink-0 text-accent-blue" />
        你的数据只保存在这台设备上。无需账户，无服务器，无追踪。
      </p>
    </div>
  );
}
