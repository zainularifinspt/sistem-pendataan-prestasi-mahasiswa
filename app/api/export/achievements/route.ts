import ExcelJS from "exceljs";
import { and, desc, eq, ilike, sql, type SQL } from "drizzle-orm";

import { requireRole } from "@/lib/api/authz";
import { db } from "@/lib/db";
import { achievements, categories, user } from "@/lib/db/schema";

export const runtime = "nodejs";

const headerFill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD9D9D9" },
} satisfies ExcelJS.Fill;

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
};

const centerWrap: Partial<ExcelJS.Alignment> = {
  horizontal: "center",
  vertical: "middle",
  wrapText: true,
};

function formatExportFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `rekap-prestasi-akreditasi-${date}.xlsx`;
}

function getAchievementYear(date: Date) {
  return date.getFullYear();
}

export async function GET(request: Request) {
  const { response } = await requireRole(["DOSEN", "ADMIN"]);

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const conditions: SQL[] = [];
  const nim = searchParams.get("nim");
  const nama = searchParams.get("nama");
  const angkatan = searchParams.get("angkatan");
  const tahun = searchParams.get("tahun");
  const tingkat = searchParams.get("tingkat");
  const kategori = searchParams.get("kategori");
  const jenis = searchParams.get("jenis");

  if (nim) conditions.push(ilike(user.nimNip, `%${nim}%`));
  if (nama) conditions.push(ilike(user.name, `%${nama}%`));
  if (angkatan) conditions.push(eq(user.angkatan, Number(angkatan)));
  if (tahun) conditions.push(sql`extract(year from ${achievements.tanggalKegiatan}) = ${Number(tahun)}`);
  if (tingkat) conditions.push(eq(achievements.tingkatPrestasi, tingkat as never));
  if (kategori) conditions.push(eq(achievements.categoryId, kategori));
  if (jenis) conditions.push(eq(achievements.jenisPrestasi, jenis as never));

  const rows = await db
    .select({
      achievement: achievements,
      user,
      category: categories,
    })
    .from(achievements)
    .innerJoin(user, eq(achievements.userId, user.id))
    .innerJoin(categories, eq(achievements.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(achievements.tanggalKegiatan));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistem Pendataan Prestasi Mahasiswa";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Prestasi Mahasiswa", {
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
    },
    views: [{ state: "frozen", ySplit: 4 }],
  });

  worksheet.columns = [
    { key: "no", width: 7 },
    { key: "namaKegiatan", width: 34 },
    { key: "tahunPerolehan", width: 16 },
    { key: "jenisPrestasi", width: 20 },
    { key: "lokal", width: 18 },
    { key: "nasional", width: 15 },
    { key: "internasional", width: 20 },
    { key: "prestasiDicapai", width: 24 },
  ];

  worksheet.mergeCells("A1:H1");
  worksheet.getCell("A1").value = "Tabel 5 Prestasi Mahasiswa";
  worksheet.getCell("A1").font = { bold: true, size: 14 };
  worksheet.getCell("A1").alignment = { horizontal: "left", vertical: "middle" };

  worksheet.mergeCells("A2:A3");
  worksheet.mergeCells("B2:B3");
  worksheet.mergeCells("C2:C3");
  worksheet.mergeCells("D2:D3");
  worksheet.mergeCells("E2:G2");
  worksheet.mergeCells("H2:H3");

  worksheet.getCell("A2").value = "No.";
  worksheet.getCell("B2").value = "Nama\nKegiatan";
  worksheet.getCell("C2").value = "Tahun\nPerolehan";
  worksheet.getCell("D2").value = "Jenis\nPrestasi";
  worksheet.getCell("E2").value = "Tingkat 1)";
  worksheet.getCell("E3").value = "Lokal/Wilayah";
  worksheet.getCell("F3").value = "Nasional";
  worksheet.getCell("G3").value = "Internasional";
  worksheet.getCell("H2").value = "Prestasi\nyang\ndicapai\n2)";

  ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((column, index) => {
    const cell = worksheet.getCell(`${column}4`);
    cell.value = `(${index + 1})`;
  });

  [2, 3, 4].forEach((rowNumber) => {
    const row = worksheet.getRow(rowNumber);
    row.height = rowNumber === 2 ? 34 : 28;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = headerFill;
      cell.font = { bold: true };
      cell.alignment = centerWrap;
      cell.border = thinBorder;
    });
  });

  const dataStartRow = 5;
  rows.forEach((row, index) => {
    const worksheetRow = worksheet.getRow(dataStartRow + index);
    const level = row.achievement.tingkatPrestasi;

    worksheetRow.values = [
      index + 1,
      row.achievement.namaKegiatan,
      getAchievementYear(row.achievement.tanggalKegiatan),
      row.category.namaKategori,
      level === "LOKAL" ? "V" : "",
      level === "NASIONAL" ? "V" : "",
      level === "INTERNASIONAL" ? "V" : "",
      row.achievement.juaraPeringkat,
    ];
    worksheetRow.height = 24;
    worksheetRow.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cell.border = thinBorder;
      cell.alignment = {
        ...centerWrap,
        horizontal: columnNumber === 2 || columnNumber === 4 || columnNumber === 8 ? "left" : "center",
      };
    });
  });

  const totalRowNumber = dataStartRow + rows.length;
  worksheet.mergeCells(totalRowNumber, 1, totalRowNumber, 7);
  worksheet.getCell(totalRowNumber, 1).value = "Jumlah";
  worksheet.getCell(totalRowNumber, 8).value = rows.length;
  worksheet.getRow(totalRowNumber).height = 24;
  worksheet.getRow(totalRowNumber).eachCell({ includeEmpty: true }, (cell) => {
    cell.border = thinBorder;
    cell.font = { bold: true };
    cell.alignment = centerWrap;
  });
  worksheet.getCell(totalRowNumber, 8).fill = headerFill;

  const noteRow = totalRowNumber + 3;
  worksheet.getCell(noteRow, 1).value = "Keterangan:";
  worksheet.getCell(noteRow, 1).font = { bold: true, size: 12 };
  worksheet.getCell(noteRow + 1, 1).value = "1)";
  worksheet.getCell(noteRow + 1, 2).value = "Beri tanda centang (V) pada kolom yang sesuai";
  worksheet.getCell(noteRow + 2, 1).value = "2)";
  worksheet.getCell(noteRow + 2, 2).value =
    "Diisi dengan prestasi akademik atau non-akademik mahasiswa program studi yang diakreditasi.";
  worksheet.mergeCells(noteRow + 2, 2, noteRow + 2, 8);
  [noteRow + 1, noteRow + 2].forEach((rowNumber) => {
    worksheet.getRow(rowNumber).height = 22;
    worksheet.getCell(rowNumber, 1).alignment = { horizontal: "left", vertical: "top" };
    worksheet.getCell(rowNumber, 2).alignment = { horizontal: "left", vertical: "top", wrapText: true };
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${formatExportFilename()}"`,
    },
  });
}
