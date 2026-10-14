"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const GLOBAL_SHORTCUTS: ShortcutEntry[] = [
  { keys: ["N"], description: "\u65b0\u5efa\u4e60\u60ef" },
  { keys: ["T"], description: "\u524d\u5f80\u4eca\u5929" },
  { keys: ["W"], description: "\u524d\u5f80\u5468" },
  { keys: ["M"], description: "\u524d\u5f80\u6708" },
  { keys: ["S"], description: "\u524d\u5f80\u7edf\u8ba1" },
  { keys: ["?"], description: "\u663e\u793a\u5feb\u6377\u952e" },
  { keys: ["\u2318", "K"], description: "\u547d\u4ee4\u9762\u677f" },
];

const PAGE_SHORTCUTS: ShortcutEntry[] = [
  { keys: ["1"], description: "\u5207\u6362\u7b2c 1 \u4e2a\u4e60\u60ef\uff08\u4eca\u5929\uff09" },
  { keys: ["\u2190"], description: "\u4e0a\u5468 / \u4e0a\u6708" },
  { keys: ["\u2192"], description: "\u4e0b\u5468 / \u4e0b\u6708" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 bg-surface border border-border-subtle rounded-md px-1.5 py-0.5 text-xs font-mono text-text-secondary">
      {children}
    </kbd>
  );
}

function ShortcutList({ title, entries }: { title: string; entries: ShortcutEntry[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.description}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-text-secondary">
              {entry.description}
            </span>
            <div className="flex gap-1">
              {entry.keys.map((key, i) => (
                <Kbd key={i}>{key}</Kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KeyboardShortcutsModal({
  open,
  onOpenChange,
}: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>键盘快捷键</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <ShortcutList title="全局" entries={GLOBAL_SHORTCUTS} />
          <ShortcutList title="页面专属" entries={PAGE_SHORTCUTS} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
