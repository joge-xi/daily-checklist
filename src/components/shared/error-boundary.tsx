"use client";

import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error("[ErrorBoundary]", { error, componentStack: info.componentStack });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center py-16 px-4",
          this.props.className
        )}
      >
        <div className="mb-6 rounded-2xl bg-surface p-4 border border-border-subtle">
          <AlertTriangle className="h-10 w-10 text-accent-orange" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          出了点问题
        </h3>
        <p className="text-sm text-text-secondary max-w-xs mb-6">
          发生了意外错误。你的数据是安全的——请尝试刷新或返回首页。
        </p>
        <div className="flex gap-3">
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-blue/90"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
          >
            <Home className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }
}
