"use client";

import { TicketDetailPanel } from "./TicketDetailPanel";

export function TicketDetailDrawer({
  ticketId,
  onClose,
  onChanged,
}: {
  ticketId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-primary">
            Vista ampliada del ticket
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <TicketDetailPanel
            ticketId={ticketId}
            onChanged={onChanged}
            onDeleted={onClose}
          />
        </div>
      </div>
    </div>
  );
}
