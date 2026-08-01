/**
 * Sign a portable release artifact with the Ed25519 private key in ./private.key (hex).
 * Usage: node tools/sign_release.mjs <path-to-file>
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const fileToSign = process.argv[2];

if (!fileToSign || !fs.existsSync(fileToSign)) {
  console.error(
    "Bitte eine gültige Datei übergeben: node tools/sign_release.mjs <pfad-zur-datei>",
  );
  process.exit(1);
}

const keyPath = path.resolve("private.key");
if (!fs.existsSync(keyPath)) {
  console.error(
    "private.key nicht gefunden (Hex-Ed25519). Lege die Datei im Repo-Root ab oder schreibe sie in CI.",
  );
  process.exit(1);
}

const privateKeyHex = fs.readFileSync(keyPath, "utf8").trim();

const privDer = Buffer.concat([
  Buffer.from("302e020100300506032b657004220420", "hex"),
  Buffer.from(privateKeyHex, "hex"),
]);

const privateKey = crypto.createPrivateKey({
  key: privDer,
  format: "der",
  type: "pkcs8",
});

const fileData = fs.readFileSync(fileToSign);
const signature = crypto.sign(null, fileData, privateKey);
const sigHex = signature.toString("hex");
const sigPath = `${fileToSign}.sig`;

fs.writeFileSync(sigPath, sigHex);
console.log("Datei erfolgreich signiert.");
console.log(`Signatur gespeichert in: ${sigPath}`);
