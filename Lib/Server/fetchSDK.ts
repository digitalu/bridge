import AdmZip from 'adm-zip';
import { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';

export const fetchSdkRoute = (req: IncomingMessage, res: ServerResponse) => {
  if (!fs.existsSync('bridge.config.json')) throw new Error('No Config');

  const cfg = JSON.parse(fs.readFileSync('bridge.config.json', 'utf-8'));

  const zip = new AdmZip();
  zip.addLocalFolder(cfg.sdkLocation);
  const zipFileContents = zip.toBuffer();
  const fileName = 'sdk.zip';
  const fileType = 'application/zip';

  return res
    .writeHead(200, { 'Content-Disposition': `attachment; filename="${fileName}"`, 'Content-Type': fileType })
    .end(zipFileContents);
};
