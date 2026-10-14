"use client";

import { useRef, useState } from "react";
import { Download, Upload, Trash2, Sprout, Layers3, Rocket, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DangerConfirmDialog } from "@/components/shared/danger-confirm-dialog";
import { useToast } from "@/components/shared/toast";
import { logger } from "@/lib/logger";
import {
  buildExportPayload,
  downloadJson,
  exportAsCSV,
  downloadZip,
  parseImportFile,
  validateImportData,
  applyImport,
  clearAllData,
} from "@/lib/export-import";

const CLEAR_CONFIRM_WORD = "DELETE";

const SAMPLE_IMPORTS = [
  {
    id: "starter",
    label: "入门示例",
    description: "5 个习惯和约 30 天的记录",
    href: "/sample-data/habitflow-sample-starter.json",
    icon: Sprout,
  },
  {
    id: "standard",
    label: "标准示例",
    description: "13 个习惯和约 5 个月的记录",
    href: "/sample-data/habitflow-sample-standard.json",
    icon: Layers3,
  },
  {
    id: "power",
    label: "进阶用户示例",
    description: "26 个习惯和约 1 年的记录",
    href: "/sample-data/habitflow-sample-power-user.json",
    icon: Rocket,
  },
] as const;

export function DataManagement() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{
    habits: number;
    completions: number;
    data: Parameters<typeof applyImport>[0];
    sourceLabel?: string;
  } | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  function openImportPreview(data: Parameters<typeof applyImport>[0], sourceLabel?: string) {
    setImportPreview({
      habits: data.data.habits.length,
      completions: data.data.completions.length,
      data,
      sourceLabel,
    });
  }

  async function handleExport() {
    try {
      const payload = await buildExportPayload();
      downloadJson(payload);
      toast("数据导出成功");
    } catch (error) {
      logger.error("Failed to export data:", error);
      toast("数据导出失败", "error");
    }
  }

  async function handleExportCSV() {
    try {
      const blob = await exportAsCSV();
      const today = new Date().toISOString().split("T")[0];
      downloadZip(blob, `habitflow-export-${today}.zip`);
      toast("CSV 已导出");
    } catch (error) {
      logger.error("Failed to export CSV:", error);
      toast("CSV 导出失败", "error");
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    e.target.value = "";

    try {
      const raw = await parseImportFile(file);
      const result = validateImportData(raw);

      if (!result.valid) {
        toast(`文件无效：${result.errors[0] ?? "未知错误"}`, "error");
        return;
      }

      openImportPreview(result.data);
    } catch (error) {
      logger.error("Failed to parse import file:", error);
      toast("无法读取文件。请确保它是有效的 JSON。", "error");
    }
  }

  async function handleLoadSample(sample: (typeof SAMPLE_IMPORTS)[number]) {
    setLoadingSampleId(sample.id);
    try {
      const response = await fetch(sample.href, {
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        toast(`加载示例失败（${response.status}）`, "error");
        return;
      }

      const raw = await response.json();
      const result = validateImportData(raw);
      if (!result.valid) {
        toast(`示例无效：${result.errors[0] ?? "未知错误"}`, "error");
        return;
      }

      openImportPreview(result.data, sample.label);
    } catch (error) {
      logger.error("Failed to load sample data:", error);
      toast("无法加载示例数据", "error");
    } finally {
      setLoadingSampleId(null);
    }
  }

  async function handleConfirmImport() {
    if (!importPreview) return;

    try {
      await applyImport(importPreview.data);
      toast("数据导入成功");
      setImportPreview(null);
      window.location.href = "/";
    } catch (error) {
      logger.error("Failed to import data:", error);
      toast("数据导入失败", "error");
    }
  }

  async function handleClear() {
    try {
      await clearAllData();
      toast("所有数据已清空");
      window.location.href = "/";
    } catch (error) {
      logger.error("Failed to clear data:", error);
      toast("清空数据失败", "error");
    }
  }

  return (
    <>
      <div className="space-y-3">
        <div className="rounded-2xl border border-border-subtle/70 bg-surface-overlay/45 p-2">
          <Button variant="secondary" className="w-full justify-start gap-3" onClick={handleExport}>
            <Download className="h-4 w-4" />
            导出数据
          </Button>
        </div>

        <div className="rounded-2xl border border-border-subtle/70 bg-surface-overlay/45 p-2">
          <Button variant="secondary" className="w-full justify-start gap-3" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4" />
            导出为 CSV
          </Button>
        </div>

        <div className="rounded-2xl border border-border-subtle/70 bg-surface-overlay/45 p-2">
          <Button
            variant="secondary"
            className="w-full justify-start gap-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            导入数据
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-error hover:text-error hover:bg-error/10"
          onClick={() => setClearOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          清空所有数据
        </Button>
        <p className="text-xs text-text-muted">
          在导入或清空数据前，请先导出备份。
        </p>

        <div className="rounded-2xl border border-border-subtle/70 bg-surface-overlay/35 p-3">
          <div className="mb-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
              加载示例数据
            </p>
            <p className="mt-1 text-xs text-text-muted">
              使用预置的习惯和完成记录快速体验应用。
            </p>
            <p className="mt-1 text-xs text-text-muted">
              加载示例数据后，你将返回首页。
            </p>
          </div>
          <div className="space-y-2">
            {SAMPLE_IMPORTS.map((sample) => {
              const Icon = sample.icon;
              const loading = loadingSampleId === sample.id;
              return (
                <div
                  key={sample.id}
                  className="rounded-xl border border-border-subtle/60 bg-surface-paper/40 p-2"
                >
                  <Button
                    variant="secondary"
                    className="h-auto w-full justify-start gap-3 px-3 py-2"
                    onClick={() => handleLoadSample(sample)}
                    disabled={Boolean(loadingSampleId)}
                  >
                    <span className="rounded-lg border border-border-subtle/70 bg-surface-overlay/60 p-1.5">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-sm">{loading ? "加载中…" : sample.label}</span>
                      <span className="block text-xs font-normal text-text-muted">
                        {sample.description}
                      </span>
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelected}
          aria-label="导入 JSON 文件"
        />
      </div>

      {/* Import preview dialog */}
      <Dialog open={importPreview !== null} onOpenChange={() => setImportPreview(null)}>
        <DialogContent onClose={() => setImportPreview(null)}>
          <DialogHeader>
            <DialogTitle>{importPreview?.sourceLabel ? "加载示例数据" : "导入数据"}</DialogTitle>
            <DialogDescription>
              {importPreview?.sourceLabel ? (
                <>
                  这将加载 <strong>{importPreview.sourceLabel}</strong> 并替换你当前的数据。
                </>
              ) : (
                <>这将把所有现有数据替换为 </>
              )}{" "}
              包含 {importPreview?.habits} 个习惯和{" "}
              {importPreview?.completions} 条完成记录。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportPreview(null)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleConfirmImport}>
              {importPreview?.sourceLabel ? "替换并加载示例" : "替换并导入"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear all data dialog */}
      <DangerConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="清空所有数据"
        description="这将永久删除所有习惯、完成记录和设置。此操作无法撤销。"
        confirmWord={CLEAR_CONFIRM_WORD}
        confirmLabel="删除全部"
        onConfirm={handleClear}
      />
    </>
  );
}
