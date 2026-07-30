"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { UnitForm } from "@/components/UnitForm";
import { createUnit } from "@/lib/api";

export default function NuevaUnidadPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-6">
        <h1 className="mb-4 text-xl font-semibold text-primary">
          Nueva unidad
        </h1>
        <div className="rounded-md border border-slate-200 bg-white p-6">
          <UnitForm
            submitLabel="Crear unidad"
            onCancel={() => router.push("/unidades")}
            onSubmit={async (values) => {
              const unit = await createUnit(values);
              router.push(`/unidades/${unit.id}`);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
