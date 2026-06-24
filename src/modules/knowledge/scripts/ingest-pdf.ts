import path from "path";
import { PdfService } from "../services/pdf.service";

async function main() {
  const pdfService = new PdfService();

  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  const text = await pdfService.extractText(pdfPath);

  console.log("Characters:", text.length);
  console.log(text.slice(0, 2000));
}

main();