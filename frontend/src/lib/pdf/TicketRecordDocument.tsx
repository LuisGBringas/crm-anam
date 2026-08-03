import { Document, Page, Text, View } from "@react-pdf/renderer";
import { DetailGrid } from "./DetailGrid";
import {
  baseStyles,
  ClosingMark,
  PageNumber,
  ReportDateLine,
  ReportFooter,
  ReportHeader,
  ReportTitle,
} from "./Letterhead";
import { PDF_COLORS, formatShortDateEs } from "./theme";
import { TICKET_ORIGEN_LABELS, TICKET_STATUS_LABELS } from "@/lib/status";
import type { Ticket, TicketStatusHistoryEntry } from "@/lib/types";

export function TicketRecordDocument({
  ticket,
  history,
}: {
  ticket: Ticket;
  history: TicketStatusHistoryEntry[];
}) {
  const fields = [
    { label: "Origen", value: TICKET_ORIGEN_LABELS[ticket.origen] },
    { label: "Número de ticket", value: ticket.ticket_number || "—" },
    { label: "Sitio / Aduana", value: ticket.site_name || "—" },
    { label: "Área", value: ticket.area || "—" },
    { label: "Equipo", value: ticket.equipo || "—" },
    { label: "Número de serie", value: ticket.numero_serie || "—" },
    { label: "Fecha de apertura", value: formatShortDateEs(ticket.fecha_apertura) },
    { label: "Contacto Aduana", value: ticket.contacto_aduana || "—" },
    { label: "Contacto ANAM", value: ticket.contacto_anam || "—" },
  ];

  return (
    <Document
      title={`Informe de ticket — ${ticket.site_name ?? ticket.id}`}
      author="Sistema de Gestión de Unidades de Energía — ANAM"
    >
      <Page size="LETTER" style={baseStyles.page} wrap>
        <ReportHeader />
        <ReportFooter />
        <PageNumber />

        <ReportDateLine eyebrow="Informe de ticket" />
        <ReportTitle
          title="Informe de Ticket de Mantenimiento / Incidencia"
          subtitle={ticket.site_name || undefined}
        />

        <View
          style={{
            alignSelf: "center",
            marginBottom: 12,
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: PDF_COLORS.primary,
            borderStyle: "solid",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: 700, color: PDF_COLORS.primary }}>
            Estatus actual: {TICKET_STATUS_LABELS[ticket.estatus]}
          </Text>
        </View>

        <Text style={{ marginBottom: 10, fontSize: 9.5, lineHeight: 1.4, textAlign: "justify" }}>
          El presente ticket, de origen {TICKET_ORIGEN_LABELS[ticket.origen]},
          da seguimiento a la incidencia reportada en{" "}
          {ticket.site_name || "el sitio referido"}
          {ticket.equipo ? `, sobre el equipo ${ticket.equipo}` : ""}. Su estatus actual es{" "}
          {TICKET_STATUS_LABELS[ticket.estatus].toLowerCase()}.
        </Text>

        <DetailGrid fields={fields} />

        {ticket.problema && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: PDF_COLORS.primary, marginBottom: 3 }}>
              Problemática
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, textAlign: "justify" }}>
              {ticket.problema}
            </Text>
          </View>
        )}

        {ticket.ultimo_avance && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: PDF_COLORS.primary, marginBottom: 3 }}>
              Último avance
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, textAlign: "justify" }}>
              {ticket.ultimo_avance}
            </Text>
          </View>
        )}

        {ticket.notes && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: PDF_COLORS.primary, marginBottom: 3 }}>
              Notas
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, textAlign: "justify" }}>
              {ticket.notes}
            </Text>
          </View>
        )}

        {history.length > 0 && (
          <>
            <Text style={{ fontSize: 10, fontWeight: 700, color: PDF_COLORS.primary, marginBottom: 4 }}>
              Bitácora de estatus
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: PDF_COLORS.border,
                borderStyle: "solid",
              }}
            >
              {history.map((h, i) => (
                <View
                  key={h.id}
                  style={{
                    flexDirection: "row",
                    padding: 5,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: PDF_COLORS.border,
                    borderTopStyle: "solid",
                  }}
                >
                  <Text style={{ width: "22%", fontSize: 8.5 }}>
                    {formatShortDateEs(h.changed_at)}
                  </Text>
                  <Text style={{ width: "78%", fontSize: 8.5 }}>
                    {h.previous_status
                      ? `${TICKET_STATUS_LABELS[h.previous_status]} → ${TICKET_STATUS_LABELS[h.new_status]}`
                      : `Creado como ${TICKET_STATUS_LABELS[h.new_status]}`}
                    {h.note ? ` — ${h.note}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <ClosingMark />
      </Page>
    </Document>
  );
}
