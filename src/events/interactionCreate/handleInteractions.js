import { fileURLToPath , pathToFileURL } from "url";
import path from "path";
import getAllFiles from "../../utils/getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const interactions = [];
const interactionFiles = getAllFiles(
  path.join(__dirname, "..", "..", "interactions"),
);
for (const file of interactionFiles) {
  const mod = await import(pathToFileURL(file).href);
  const command = (mod && mod.default) || mod;
  interactions.push(command);
}

export default async (client, interaction) => {
  try {
    const interactionObject = interactions.find(
      (cmd) => cmd?.id === interaction.customId,
    );

    if (!interactionObject) return;

    if (typeof interactionObject.callback === "function") {
      await interactionObject.callback(client, interaction);
    }
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
};
