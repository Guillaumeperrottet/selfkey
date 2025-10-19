"use client";

import { VanLoadingPage } from "@/components/ui/van-loading";
import { useSelfcampTranslation } from "@/hooks/useSelfcampTranslation";

export default function MapLoadingPage() {
  const { t } = useSelfcampTranslation();

  return (
    <VanLoadingPage message={t.loading.message} subtitle={t.loading.subtitle} />
  );
}
