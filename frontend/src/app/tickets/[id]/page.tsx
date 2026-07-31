"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TicketDetailPanel } from "@/components/TicketDetailPanel";

export default function TicketDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-6">
        <button
          onClick={() => router.push("/tickets")}
          className="mb-4 text-sm text-neutral hover:text-primary"
        >
          ← Volver a tickets
        </button>
        <div className="rounded-md border border-slate-200 bg-white p-6">
          <TicketDetailPanel
            ticketId={params.id}
            onChanged={() => {}}
            onDeleted={() => router.push("/tickets")}
          />
        </div>
      </div>
    </AppShell>
  );
}
