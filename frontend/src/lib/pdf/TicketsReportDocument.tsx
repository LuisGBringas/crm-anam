import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
  baseStyles,
  ClosingMark,
  PageNumber,
  ReportDateLine,
  ReportFooter,
  ReportHeader,
  ReportTitle,
} from "./Letterhead";
import { ReportTable, type ReportColumn } from "./ReportTable";
import { PDF_COLORS } from "./theme";
import { TICKET_ORIGEN_LABELS, TICKET_STATUS_LABELS, TICKET_STATUS_LIST } from "@/lib/status";
import type { Ticket } from "@/lib/types";

const MAX_ROWS = 400;

const columns: ReportColumn<Ticket>[] = [
  { header: "Sitio", width: "22%", render: (t) => t.site_name || "—" },
  { header: "Equipo", width: "18%", render: (t) => t.equipo || "—" },
  { header: "Origen", width: "13%", render: (t) => TICKET_ORIGEN_LABELS[t.origen] },
  { header: "Ticket #", width: "15%", render: (t) => t.ticket_number || "—" },
  {
    header: "Problemática",
    width: "20%",
    render: (t) => (t.problema ? t.problema.slice(0, 90) : "—"),
  },
  { header: "Estatus", width: "12%", render: (t) => TICKET_STATUS_LABELS[t.estatus] },
];

export function TicketsReportDocument({
  tickets,
  filterDescription,
}: {
  tickets: Ticket[];
  filterDescription: string;
}) {
  const rows = tickets.slice(0, MAX_ROWS);
  const truncated = tickets.length > MAX_ROWS;

  const byStatus = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.estatus] = (acc[t.estatus] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Document
      title="Informe de Tickets — CRM ANAM"
      author="Sistema de Gestión de Unidades de Energía — ANAM"
    >
      <Page size="LETTER" style={baseStyles.page} wrap>
        <ReportHeader />
        <ReportFooter />
        <PageNumber />

        <ReportDateLine eyebrow="Informe de tickets" />
        <ReportTitle
          title="Informe de Tickets de Mantenimiento e Incidencias"
          subtitle={filterDescription}
        />

        <Text style={{ marginBottom: 10, fontSize: 9.5, lineHeight: 1.4 }}>
          El presente informe fue generado por el Sistema de Gestión de Unidades de
          Energía de la Agencia Nacional de Aduanas de México (ANAM) y contiene el
          seguimiento de {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
          {filterDescription ? `, filtrados por: ${filterDescription}` : ""}.
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
          {TICKET_STATUS_LIST.map((status) => (
            <View
              key={status}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: PDF_COLORS.border,
                borderStyle: "solid",
                padding: 6,
              }}
            >
              <Text style={{ fontSize: 8, color: PDF_COLORS.muted }}>
                {TICKET_STATUS_LABELS[status]}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: PDF_COLORS.primary }}>
                {byStatus[status] ?? 0}
              </Text>
            </View>
          ))}
        </View>

        <ReportTable columns={columns} rows={rows} />

        {truncated && (
          <Text style={{ marginTop: 6, fontSize: 8, color: PDF_COLORS.muted }}>
            Se muestran los primeros {MAX_ROWS} de {tickets.length} registros. Aplica más
            filtros para acotar el informe.
          </Text>
        )}

        <ClosingMark />
      </Page>
    </Document>
  );
}
