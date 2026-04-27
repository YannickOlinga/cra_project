function escapeCsvCell(value) {
  const stringValue = value == null ? '' : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export function exportRowsToCsv(filename, headers, rows) {
  const csvRows = [
    headers.map((header) => escapeCsvCell(header.label)).join(','),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvCell(row[header.key])).join(','),
    ),
  ];

  const blob = new Blob([`\uFEFF${csvRows.join('\n')}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
