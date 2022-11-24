import { registerAppEvent } from "../../private/playbackLoader.js";
import fs from "fs/promises";

export class App {
  updateCheckInterval = 1 * 60 * 1000;

  constructor(config) {
    this.config = config;
    (async () => {
      while (true) {
        (async () => {
          try {
            await this.checkForNewPictures();
          } catch (e) {
            console.log(e);
          }
        })();
        await new Promise((r) => setTimeout(r, this.updateCheckInterval));
      }
    })();
  }

  async checkForNewPictures() {
    let files = await fs.readdir(this.config.path);

    for (let fileName of files) {
      let file = await fs.stat(this.config.path + "/" + fileName);
      if (
        file.isFile() &&
        file.birthtime.getTime() > Date.now() - this.updateCheckInterval
      ) {
        let buffer = (
          await fs.readFile(this.config.path + "/" + fileName)
        ).toString("base64");

        let type = { mp4: "video/mp4", jpg: "image/jpeg", png: "image/png" }[
          fileName.split(".")[1]
        ];

        registerAppEvent({
          app: "Picture",
          type: "Upload",
          text: `A picture was taken: ${fileName}.`,
          media: [{ buffer, type }],
          open: this.mainUrl,
          time: file.birthtime.getTime(),
          points: this.config.points,
        });
      }
    }
  }
}
