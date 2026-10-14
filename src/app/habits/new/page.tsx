"use client";

import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { Header } from "@/components/layout/header";
import { HabitForm } from "@/components/habits/habit-form";
import { useHabits } from "@/hooks/use-habits";
import { useToast } from "@/components/shared/toast";
import { MAX_ACTIVE_HABITS, HABIT_WARN_THRESHOLD } from "@/lib/utils";
import { DB_ERROR_MSG } from "@/lib/constants";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { logger } from "@/lib/logger";

export default function NewHabitPage() {
  const router = useRouter();
  const { create, activeHabits } = useHabits();
  const { toast } = useToast();

  const handleSubmit = async (data: Parameters<typeof create>[0]) => {
    if (activeHabits.length >= MAX_ACTIVE_HABITS) {
      toast(`已达 ${MAX_ACTIVE_HABITS} 个进行中的习惯上限。`, "error");
      return;
    }

    try {
      await create(data);
    } catch (error) {
      logger.error("Failed to create habit:", error);
      toast(DB_ERROR_MSG, "error");
      return;
    }

    if (activeHabits.length >= HABIT_WARN_THRESHOLD) {
      toast(`习惯已创建！你现有 ${activeHabits.length + 1} 个进行中的习惯。`, "info");
    } else {
      toast("习惯已创建！", "success");
    }

    router.push("/");
  };

  return (
    <ErrorBoundary>
      <PageContainer>
        <Header
          title="新建习惯"
          subtitle="创建一个要跟踪的习惯"
          eyebrow="习惯库"
          accentColor="var(--accent-emerald)"
        />
        <div className="max-w-xl">
          <HabitForm onSubmit={handleSubmit} submitLabel="创建习惯" />
        </div>
      </PageContainer>
    </ErrorBoundary>
  );
}
