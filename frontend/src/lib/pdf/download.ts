import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export async function downloadPdf(document: ReactElement, filename: string) {
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
