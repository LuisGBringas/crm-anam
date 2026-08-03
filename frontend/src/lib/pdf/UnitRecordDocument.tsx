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
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  TICKET_ORIGEN_LABELS,
  UNIT_TYPE_LABELS,
} from "@/lib/status";
import type { StatusHistoryEntry, Ticket, Unit } from "@/lib/types";

const SOURCE_LABELS: Record<Unit["source"], string> = {
  osm: "OpenStreetMap",
  cosisi: "Inventario COSISI",
  manual: "Registro manual",
};

export function UnitRecordDocument({
  unit,
  history,
  relatedTickets,
}: {
  unit: Unit;
  history: StatusHistoryEntry[];
  relatedTickets: Ticket[];
}) {
  const fields = [
    { label: "Sitio / Aduana", value: unit.site_name || "—" },
    { label: "Código VPN", value: unit.vpn_code || "—" },
    {
      label: "Tipo",
      value: `${UNIT_TYPE_LABELS[unit.unit_type]}${
        unit.category ? ` · ${CATEGORY_LABELS[unit.category] ?? unit.category}` : ""
      }`,
    },
    { label: "Marca / Modelo", value: [unit.marca, unit.modelo].filter(Boolean).join(" / ") || "—" },
    { label: "Número de serie", value: unit.numero_serie || "—" },
    { label: "Hostname", value: unit.hostname || "—" },
    {
      label: "Capacidad",
      value: unit.capacity_label || (unit.capacity_mw ? `${unit.capacity_mw} MW` : "—"),
    },
    { label: "Ubicación en sitio", value: unit.rack_location || "—" },
    { label: "Responsable", value: unit.responsable_administracion || "—" },
    { label: "Criticidad", value: unit.criticidad || "—" },
    { label: "Ciudad", value: unit.address || "—" },
    {
      label: "Ubicación (mapa)",
      value:
        unit.latitude != null && unit.longitude != null
          ? `${unit.latitude.toFixed(4)}, ${unit.longitude.toFixed(4)}`
          : "Sin geocodificar",
    },
    { label: "Fuente del dato", value: SOURCE_LABELS[unit.source] },
  ];

  return (
    <Document
      title={`Informe de unidad — ${unit.name}`}
      author="Sistema de Gestión de Unidades de Energía — ANAM"
    >
      <Page size="LETTER" style={baseStyles.page} wrap>
        <ReportHeader />
        <ReportFooter />
        <PageNumber />

        <ReportDateLine eyebrow="Informe de unidad" />
        <ReportTitle title="Informe de Estatus de Unidad" subtitle={unit.name} />

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
            Estatus actual: {STATUS_LABELS[unit.status]}
          </Text>
        </View>

        <Text style={{ marginBottom: 10, fontSize: 9.5, lineHeight: 1.4, textAlign: "justify" }}>
          La unidad &quot;{unit.name}&quot; ubicada en {unit.site_name || "sitio sin especificar"}
          {" "}se encuentra registrada en el Sistema de Gestión de Unidades de Energía de la
          Agencia Nacional de Aduanas de México (ANAM), con estatus actual de{" "}
          {STATUS_LABELS[unit.status].toLowerCase()}.
          {unit.notes ? ` Observaciones: ${unit.notes}` : ""}
        </Text>

        <DetailGrid fields={fields} />

        {relatedTickets.length > 0 && (
          <>
            <Text style={{ fontSize: 10, fontWeight: 700, color: PDF_COLORS.primary, marginBottom: 4 }}>
              Tickets relacionados
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: PDF_COLORS.border,
                borderStyle: "solid",
                marginBottom: 10,
              }}
            >
              {relatedTickets.map((t, i) => (
                <View
                  key={t.id}
                  style={{
                    flexDirection: "row",
                    padding: 5,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: PDF_COLORS.border,
                    borderTopStyle: "solid",
                  }}
                >
                  <Text style={{ width: "20%", fontSize: 8.5 }}>
                    {t.ticket_number || TICKET_ORIGEN_LABELS[t.origen]}
                  </Text>
                  <Text style={{ width: "55%", fontSize: 8.5 }}>{t.problema || "—"}</Text>
                  <Text style={{ width: "25%", fontSize: 8.5, textAlign: "right" }}>
                    {t.estatus}
                  </Text>
                </View>
              ))}
            </View>
          </>
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
                      ? `${STATUS_LABELS[h.previous_status]} → ${STATUS_LABELS[h.new_status]}`
                      : `Creado como ${STATUS_LABELS[h.new_status]}`}
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
