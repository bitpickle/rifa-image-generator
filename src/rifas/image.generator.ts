import puppeteer from "puppeteer";
import { Client } from "minio";
import { uuidv7 } from "uuidv7";

export function generateImageHtml(
  soldNumbers: number[],
  totalAmount: number,
  name: string
): string {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
          }
          h1 {
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          td {
            width: 10%;
            padding: 10px;
            border: 1px solid #ddd;
            text-align: center;
            font-size: 16px;
            background-color: #fff;
          }
          td.sold {
            background-color: #4caf50;
            color: #fff;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Tabela da Rifa ${name}</h1>
          <table>
            <tr>
              ${Array.from({ length: totalAmount }, (_, index) => {
                const number = index + 1;
                const isSold = soldNumbers.includes(number);
                return (
                  `<td class="${isSold ? "sold" : ""}">${number}</td>` +
                  ((index + 1) % 10 === 0 ? "</tr><tr>" : "")
                );
              }).join("")}
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;
}

export async function htmlToImage(html = "") {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  await page.setContent(html);

  const content = await page.$("body");
  const imageBuffer = await content!.screenshot({ omitBackground: true });

  await page.close();
  await browser.close();

  return imageBuffer;
}

export async function saveImageOnMinio(
  imageBuffer: Uint8Array<ArrayBufferLike>
) {
  const minio = new Client({
    endPoint: "minio-api.bitpickle.dev",
    port: 443,
    useSSL: true,
    accessKey: "lXp3uovgW428LraywbBU",
    secretKey: "9G5GkHBYgVy6FTfb8VSEoPCtgmP2kbpAaL9IZcdV",
  });

  const uuid = uuidv7() + ".png";

  await minio.putObject("dev", uuid, Buffer.from(imageBuffer), undefined, {
    "content-type": "image/png",
    "content-disposition": "inline",
  });
  return minio.presignedGetObject("dev", uuid, 60 * 60 * 24, {
    "response-content-disposition": "inline",
    "response-content-type": "image/png",
  });
}
