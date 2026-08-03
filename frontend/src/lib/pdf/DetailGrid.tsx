import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDF_COLORS } from "./theme";

export interface DetailField {
  label: string;
  value: string;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderStyle: "solid",
    marginBottom: 10,
  },
  cell: {
    width: "50%",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    borderTopStyle: "solid",
    padding: 6,
  },
  cellFirst: {
    borderTopWidth: 0,
  },
  label: {
    width: "42%",
    fontSize: 8.5,
    color: PDF_COLORS.muted,
  },
  value: {
    width: "58%",
    fontSize: 8.5,
    color: PDF_COLORS.text,
    fontWeight: 700,
  },
});

export function DetailGrid({ fields }: { fields: DetailField[] }) {
  const visible = fields.filter((f) => f.value && f.value !== "—");
  return (
    <View style={styles.grid}>
      {visible.map((field, i) => (
        <View
          key={field.label}
          style={[styles.cell, ...(i < 2 ? [styles.cellFirst] : [])]}
        >
          <Text style={styles.label}>{field.label}</Text>
          <Text style={styles.value}>{field.value}</Text>
        </View>
      ))}
    </View>
  );
}
