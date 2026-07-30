"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { UnitDetailPanel } from "@/components/UnitDetailPanel";

export default function UnidadDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-6">
        <button
          onClick={() => router.push("/unidades")}
          className="mb-4 text-sm text-neutral hover:text-primary"
        >
          ← Volver a la lista
        </button>
        <div className="rounded-md border border-slate-200 bg-white p-6">
          <UnitDetailPanel
            unitId={params.id}
            onChanged={() => {}}
            onDeleted={() => router.push("/unidades")}
          />
        </div>
      </div>
    </AppShell>
  );
}
