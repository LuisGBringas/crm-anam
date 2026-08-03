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
import { CATEGORY_LABELS, STATUS_LABELS, UNIT_TYPE_LABELS } from "@/lib/status";
import type { Unit } from "@/lib/types";

const MAX_ROWS = 400;

const columns: ReportColumn<Unit>[] = [
  { header: "Nombre", width: "28%", render: (u) => u.name },
  { header: "Tipo", width: "13%", render: (u) => UNIT_TYPE_LABELS[u.unit_type] },
  {
    header: "Categoría",
    width: "15%",
    render: (u) => (u.category ? CATEGORY_LABELS[u.category] ?? u.category : "—"),
  },
  { header: "Sitio", width: "29%", render: (u) => u.site_name || "—" },
  { header: "Estatus", width: "15%", render: (u) => STATUS_LABELS[u.status] },
];

export function UnitsReportDocument({
  units,
  filterDescription,
}: {
  units: Unit[];
  filterDescription: string;
}) {
  const rows = units.slice(0, MAX_ROWS);
  const truncated = units.length > MAX_ROWS;

  const byStatus = units.reduce<Record<string, number>>((acc, u) => {
    acc[u.status] = (acc[u.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Document
      title="Informe de Unidades — CRM ANAM"
      author="Sistema de Gestión de Unidades de Energía — ANAM"
    >
      <Page size="LETTER" style={baseStyles.page} wrap>
        <ReportHeader />
        <ReportFooter />
        <PageNumber />

        <ReportDateLine eyebrow="Informe de unidades" />
        <ReportTitle
          title="Informe de Unidades de Energía y Auxiliares"
          subtitle={filterDescription}
        />

        <Text style={{ marginBottom: 10, fontSize: 9.5, lineHeight: 1.4 }}>
          El presente informe fue generado por el Sistema de Gestión de Unidades de
          Energía de la Agencia Nacional de Aduanas de México (ANAM) y contiene el
          estatus de {units.length} unidad{units.length === 1 ? "" : "es"} registrada
          {units.length === 1 ? "" : "s"} en el sistema
          {filterDescription ? `, filtradas por: ${filterDescription}` : ""}.
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 6 }}>
          {(["correcto", "mantenimiento_programado", "mantenimiento_necesario"] as const).map(
            (status) => (
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
                  {STATUS_LABELS[status]}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: 700, color: PDF_COLORS.primary }}>
                  {byStatus[status] ?? 0}
                </Text>
              </View>
            )
          )}
        </View>

        <ReportTable columns={columns} rows={rows} />

        {truncated && (
          <Text style={{ marginTop: 6, fontSize: 8, color: PDF_COLORS.muted }}>
            Se muestran los primeros {MAX_ROWS} de {units.length} registros. Aplica más
            filtros para acotar el informe.
          </Text>
        )}

        <ClosingMark />
      </Page>
    </Document>
  );
}
