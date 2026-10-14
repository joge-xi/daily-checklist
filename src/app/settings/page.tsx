"use client";

import { PageContainer } from "@/components/layout/page-container";
import { Header } from "@/components/layout/header";
import { SettingsContent } from "@/components/settings/settings-content";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <PageContainer>
        <Header
          title="设置"
          subtitle="自定义你的使用体验"
          eyebrow="偏好设置"
          accentColor="var(--accent-amber)"
        />
        <SettingsContent />
      </PageContainer>
    </ErrorBoundary>
  );
}
