"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TicketForm } from "@/components/TicketForm";
import { createTicket } from "@/lib/api";

export default function NuevoTicketPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-6">
        <h1 className="mb-4 text-xl font-semibold text-primary">
          Nuevo ticket
        </h1>
        <div className="rounded-md border border-slate-200 bg-white p-6">
          <TicketForm
            submitLabel="Crear ticket"
            onCancel={() => router.push("/tickets")}
            onSubmit={async (values) => {
              const ticket = await createTicket(values);
              router.push(`/tickets/${ticket.id}`);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
