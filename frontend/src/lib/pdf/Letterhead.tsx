import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatLongDateEs, OFFICIAL_YEAR_LABEL, PDF_COLORS } from "./theme";

export const PAGE_PADDING = 56; // 0.78in, deja espacio a los margenes del letterhead
export const CONTENT_TOP = 118;
export const CONTENT_BOTTOM = 76;

export const baseStyles = StyleSheet.create({
  page: {
    paddingTop: CONTENT_TOP,
    paddingBottom: CONTENT_BOTTOM,
    paddingHorizontal: PAGE_PADDING,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: PDF_COLORS.text,
  },
  headerFixed: {
    position: "absolute",
    top: 24,
    left: PAGE_PADDING,
    right: PAGE_PADDING,
  },
  headerImage: {
    width: "100%",
  },
  footerFixed: {
    position: "absolute",
    bottom: 22,
    left: PAGE_PADDING,
    right: PAGE_PADDING,
  },
  footerImage: {
    width: "100%",
    marginBottom: 4,
  },
  pageNumber: {
    position: "absolute",
    bottom: 22,
    right: PAGE_PADDING,
    fontSize: 8,
    color: PDF_COLORS.muted,
  },
  dateLine: {
    textAlign: "right",
    fontSize: 9.5,
    color: PDF_COLORS.text,
    marginBottom: 2,
  },
  eyebrow: {
    textAlign: "right",
    fontSize: 9,
    color: PDF_COLORS.muted,
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    textAlign: "center",
    color: PDF_COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    color: PDF_COLORS.muted,
    marginBottom: 16,
  },
  closingMark: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 10,
    color: PDF_COLORS.text,
  },
});

export function ReportHeader() {
  return (
    <View style={baseStyles.headerFixed} fixed>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image style={baseStyles.headerImage} src="/reportes/header-letterhead.png" />
    </View>
  );
}

export function ReportFooter() {
  return (
    <View style={baseStyles.footerFixed} fixed>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image style={baseStyles.footerImage} src="/reportes/footer-banner.png" />
      <Text style={{ fontSize: 7, color: PDF_COLORS.muted, textAlign: "center" }}>
        {OFFICIAL_YEAR_LABEL} · Sistema de Gestión de Unidades de Energía · ANAM
      </Text>
    </View>
  );
}

export function PageNumber() {
  return (
    <Text
      style={baseStyles.pageNumber}
      fixed
      render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
    />
  );
}

export function ReportDateLine({ eyebrow }: { eyebrow: string }) {
  return (
    <>
      <Text style={baseStyles.dateLine}>{formatLongDateEs()}</Text>
      <Text style={baseStyles.eyebrow}>{eyebrow}</Text>
    </>
  );
}

export function ReportTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <Text style={baseStyles.title}>{title}</Text>
      {subtitle && <Text style={baseStyles.subtitle}>{subtitle}</Text>}
    </>
  );
}

export function ClosingMark() {
  return <Text style={baseStyles.closingMark}>-0-</Text>;
}
