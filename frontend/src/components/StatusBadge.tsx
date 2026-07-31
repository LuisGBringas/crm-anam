import { STATUS_COLORS, STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_STATUS_LABELS } from "@/lib/status";
import type { TicketStatus, UnitStatus } from "@/lib/types";

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: UnitStatus }) {
  return <Badge label={STATUS_LABELS[status]} color={STATUS_COLORS[status]} />;
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge label={TICKET_STATUS_LABELS[status]} color={TICKET_STATUS_COLORS[status]} />;
}
