import path from "node:path";

import {
  ChecksumService,
} from "@/modules/knowledge/services/checksum.service";

async function main() {
  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  const checksumService =
    new ChecksumService();

  const checksum =
    await checksumService
      .calculateFileChecksum(pdfPath);

  console.log({
    pdfPath,
    checksum,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});