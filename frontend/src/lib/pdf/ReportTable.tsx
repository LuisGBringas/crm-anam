import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDF_COLORS } from "./theme";

export interface ReportColumn<T> {
  header: string;
  width: string; // ej. "20%"
  render: (row: T) => string;
}

const styles = StyleSheet.create({
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderStyle: "solid",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: PDF_COLORS.primary,
  },
  headerCell: {
    padding: 5,
    fontSize: 8.5,
    fontWeight: 700,
    color: "#ffffff",
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    borderTopStyle: "solid",
  },
  rowAlt: {
    backgroundColor: PDF_COLORS.rowAlt,
  },
  cell: {
    padding: 5,
    fontSize: 8.5,
    color: PDF_COLORS.text,
  },
});

export function ReportTable<T>({
  columns,
  rows,
}: {
  columns: ReportColumn<T>[];
  rows: T[];
}) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow} fixed>
        {columns.map((col) => (
          <Text key={col.header} style={[styles.headerCell, { width: col.width }]}>
            {col.header}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <View key={i} style={[styles.row, ...(i % 2 === 1 ? [styles.rowAlt] : [])]} wrap={false}>
          {columns.map((col) => (
            <Text key={col.header} style={[styles.cell, { width: col.width }]}>
              {col.render(row)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
