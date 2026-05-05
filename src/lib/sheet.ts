export type Row = Record<string, string>;

export async function loadSheetByName(sheetName: string) {
  const apiKey = import.meta.env.PUBLIC_GOOGLE_SHEETS_API_KEY as string | undefined;
  const spreadsheetId = import.meta.env.PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID as string | undefined;
  if (!apiKey || !spreadsheetId) {
    throw new Error("Env Google Sheets API belum lengkap: PUBLIC_GOOGLE_SHEETS_API_KEY / PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID");
  }

  const range = encodeURIComponent(`${sheetName}!A1:ZZZ`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Sheets API gagal untuk sheet '${sheetName}': ${res.status}`);
  }
  const data = await res.json();
  const values: string[][] = data.values ?? [];
  const headers: string[] = values[0] ?? [];
  const rows: Row[] = (values.slice(1) ?? []).map((line) => {
    const rec: Row = {};
    headers.forEach((h, idx) => {
      rec[h] = line[idx] ?? "";
    });
    return rec;
  });

  const total = rows.length;
  const totalSudah = rows.filter((r) => (r.status ?? "").toLowerCase() === "sudah").length;
  const totalBelum = rows.filter((r) => (r.status ?? "").toLowerCase() !== "sudah").length;

  return { headers, rows, total, totalSudah, totalBelum, source: "api" };
}
