import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob(['\ufeff', content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(headers: string[], rows: string[][], filename: string): void {
  const lines = [headers, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
  downloadBlob(lines, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

export function exportToXlsx(headers: string[], rows: string[][], filename: string): void {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPdf(headers: string[], rows: string[][], filename: string): void {
  const doc = new jsPDF();
  autoTable(doc, { head: [headers], body: rows });
  doc.save(`${filename}.pdf`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function printTable(headers: string[], rows: string[][], title: string): void {
  const headerHtml = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
  const bodyHtml = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: sans-serif; font-size: 12px; }
    h2 { margin-bottom: 12px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    tr:nth-child(even) td { background: #fafafa; }
  </style>
</head>
<body>
  <h2>${escapeHtml(title)}</h2>
  <table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export async function copyToClipboard(headers: string[], rows: string[][]): Promise<void> {
  const tsv = [headers, ...rows].map((r) => r.join('\t')).join('\n');
  await navigator.clipboard.writeText(tsv);
}
