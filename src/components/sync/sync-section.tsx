/**
 * SyncSection — settings page section for managing cloud sync.
 *
 * States:
 *   - Not configured: shows a message to set up env vars
 *   - Not signed in:  shows "Enable Sync" button → opens SyncAuthModal
 *   - Signed in:      shows status, last synced time, "Sync now" & "Sign out"
 */

"use client";

import { useState } from "react";
import { Cloud, CloudOff, RefreshCw, LogOut, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncAuthModal } from "./sync-auth-modal";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { SyncState } from "@/lib/sync/types";

interface SyncSectionProps {
  syncState: SyncState;
  isSyncConfigured: boolean;
  onGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSyncNow: () => Promise<void>;
}

export function SyncSection({
  syncState,
  isSyncConfigured,
  onGoogle,
  onSignOut,
  onSyncNow,
}: SyncSectionProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!isSyncConfigured) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border-subtle/60 bg-surface-overlay/45 px-3 py-2.5">
        <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
        <div>
          <p className="text-sm font-medium text-text-primary">未配置同步</p>
          <p className="mt-0.5 text-xs text-text-muted">
            添加 <code className="font-mono">NEXT_PUBLIC_POCKETBASE_URL</code> 以开启云同步。
          </p>
        </div>
      </div>
    );
  }

  if (!syncState.isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle/60 bg-surface-overlay/45 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">云同步</p>
            <p className="text-xs text-text-muted mt-0.5">
              登录以跨设备同步你的习惯
            </p>
          </div>
          <Button size="sm" onClick={() => setAuthModalOpen(true)}>
            开启
          </Button>
        </div>

        <SyncAuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          onGoogle={onGoogle}
        />
      </>
    );
  }

  return (
    <div className="space-y-2">
      {/* Account row */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle/60 bg-surface-overlay/45 px-3 py-2.5">
        <div className="min-w-0 flex items-center gap-2">
          <Cloud className="h-4 w-4 shrink-0 text-accent-blue" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {syncState.user?.email}
            </p>
            <p className="text-xs text-text-muted mt-0.5">跨设备同步</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-surface-paper/70 hover:text-text-primary transition-colors"
          title="退出登录"
          aria-label="退出登录"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Sync status row */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle/60 bg-surface-overlay/45 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <SyncStatusIcon status={syncState.status} />
          <div>
            <p className="text-sm font-medium text-text-primary">
              {syncStatusLabel(syncState)}
            </p>
            {syncState.lastSyncedAt && syncState.status !== "syncing" && (
              <p className="text-xs text-text-muted mt-0.5">
                {formatDistanceToNow(new Date(syncState.lastSyncedAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </p>
            )}
            {syncState.status === "error" && syncState.errorMessage && (
              <p className="text-xs text-red-400 mt-0.5">
                <AlertCircle className="mr-1 inline-block h-3 w-3 align-text-bottom" />
                {syncState.errorMessage}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          disabled={syncState.status === "syncing"}
          onClick={onSyncNow}
          className="shrink-0"
        >
          <RefreshCw
            className={cn("h-4 w-4", syncState.status === "syncing" && "animate-spin")}
          />
          <span className="sr-only">立即同步</span>
        </Button>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function syncStatusLabel(state: SyncState): string {
  switch (state.status) {
    case "syncing":
      return "同步中…";
    case "success":
      return "已是最新";
    case "error":
      return "同步失败";
    default:
      return state.lastSyncedAt ? "已是最新" : "尚未同步";
  }
}

function SyncStatusIcon({ status }: { status: SyncState["status"] }) {
  if (status === "success" || (status === "idle")) {
    return <CheckCircle className="h-4 w-4 shrink-0 text-accent-green" />;
  }
  if (status === "error") {
    return <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />;
  }
  if (status === "syncing") {
    return (
      <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
    );
  }
  return <Cloud className="h-4 w-4 shrink-0 text-text-muted" />;
}
