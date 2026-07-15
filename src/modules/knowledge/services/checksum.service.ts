import fs from "node:fs";
import crypto from "node:crypto";

export class ChecksumService {
  async calculateFileChecksum(
    filePath: string
  ): Promise<string> {
    return new Promise(
      (resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("data", (chunk) => {
          hash.update(chunk);
        });
        stream.on("end", () => {
          resolve(hash.digest("hex"));
        });
        stream.on("error", reject);
      }
    );
  }
}