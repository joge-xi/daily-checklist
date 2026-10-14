"use client";

import { useSettings } from "@/hooks/use-settings";
import { useSyncService } from "@/hooks/use-sync";
import { useThemeContext } from "@/components/layout/theme-provider";
import { ThemeToggle } from "./theme-toggle";
import { DataManagement } from "./data-management";
import { AboutSection } from "./about-section";
import { SyncSection } from "@/components/sync/sync-section";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types";

const VIEW_OPTIONS = [
  { value: "today" as const, label: "今天" },
  { value: "week" as const, label: "周" },
  { value: "month" as const, label: "月" },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="hf-panel rounded-3xl p-5 space-y-4">
      <div className="border-b border-border-subtle/70 pb-3">
        <p className="hf-kicker">设置</p>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle/60 bg-surface-overlay/45 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingsContent() {
  const { settings, loading, update } = useSettings();
  const { theme, setTheme } = useThemeContext();
  const {
    syncState,
    isSyncConfigured,
    signInWithGoogle,
    signOut,
    syncNow,
  } = useSyncService();

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  function handleThemeChange(newTheme: Theme) {
    setTheme(newTheme);
    update({ theme: newTheme });
  }

  return (
    <div className="space-y-6">
      <Card title="外观">
        <ThemeToggle theme={theme} onChange={handleThemeChange} />
      </Card>

      <Card title="偏好设置">
        <SettingRow
          label="周一作为每周开始"
          description="影响周视图和统计"
        >
          <Switch
            checked={settings.weekStartsOn === 1}
            onCheckedChange={(checked) =>
              update({ weekStartsOn: checked ? 1 : 0 })
            }
            aria-label="周一作为每周开始"
          />
        </SettingRow>

        <SettingRow label="显示连续打卡" description="在习惯卡片上显示连续打卡次数">
          <Switch
            checked={settings.showStreaks}
            onCheckedChange={(showStreaks) => update({ showStreaks })}
            aria-label="显示连续打卡"
          />
        </SettingRow>

        <SettingRow
          label="显示完成率"
          description="显示完成百分比"
        >
          <Switch
            checked={settings.showCompletionRate}
            onCheckedChange={(showCompletionRate) => update({ showCompletionRate })}
            aria-label="显示完成率"
          />
        </SettingRow>

        <SettingRow
          label="默认视图"
          description="选择启动时显示的视图"
        >
          <div className="hf-panel-muted flex gap-1 rounded-2xl p-1" role="radiogroup" aria-label="默认视图">
            {VIEW_OPTIONS.map(({ value, label }) => {
              const active = settings.defaultView === value;
              return (
                <button
                  key={value}
                  role="radio"
                  aria-checked={active}
                  onClick={() => update({ defaultView: value })}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                    active
                      ? "border border-accent-blue/20 bg-accent-blue/10 text-accent-blue shadow-[var(--shadow-editorial-sm)]"
                      : "border border-transparent text-text-secondary hover:bg-surface-paper/70 hover:text-text-primary"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </SettingRow>
      </Card>

      <Card title="同步">
        <SyncSection
          syncState={syncState}
          isSyncConfigured={isSyncConfigured}
          onGoogle={signInWithGoogle}
          onSignOut={signOut}
          onSyncNow={syncNow}
        />
      </Card>

      <Card title="数据">
        <DataManagement />
      </Card>

      <Card title="关于">
        <AboutSection />
      </Card>
    </div>
  );
}
