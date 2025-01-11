import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import {
  generateImageHtml,
  htmlToImage,
  saveImageOnMinio,
} from "./rifas/image.generator";
import staticPlugin from "@elysiajs/static";

const app = new Elysia()
  .use(swagger())
  .use(staticPlugin())
  .post(
    "/",
    async ({ body, set }) => {
      const { numeros, totalBilhetes, nomeRifa } = body;
      const html = generateImageHtml(numeros, totalBilhetes, nomeRifa);
      const image = await htmlToImage(html);
      const url = await saveImageOnMinio(image);
      console.log(url);
      return {
        url,
      };
    },
    {
      body: t.Object({
        numeros: t.Array(t.Number()),
        totalBilhetes: t.Number(),
        nomeRifa: t.String(),
      }),
    }
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
