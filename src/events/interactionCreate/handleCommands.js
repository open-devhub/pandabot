import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import data from "../../../config.json" with { type: "json" };
import getAllFiles from "../../utils/getAllFiles.js";
import getLocalCommands from "../../utils/getLocalCommands.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { devs, guildId } = data;

export default async (client, interaction) => {
  if (!interaction.isCommand()) return;

  const localCommands = await getLocalCommands();
  const contextMenuCommands = [];
  const contextMenuCategories = getAllFiles(
    path.join(__dirname, "..", "..", "contextMenus"),
    true,
  );

  for (const contextMenuCategory of contextMenuCategories) {
    const contextMenuFiles = getAllFiles(contextMenuCategory);

    for (const file of contextMenuFiles) {
      const command = await import(pathToFileURL(file).href);
      contextMenuCommands.push(command);
    }
  }

  const allCommands = [...localCommands, ...contextMenuCommands];

  try {
    const commandObject = allCommands.find(
      (cmd) => cmd.name === interaction.commandName,
    );

    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        interaction.reply({
          content: "Only developers are allowed to run this command.",
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!(interaction.guild.id === guildId)) {
        interaction.reply({
          content: "This command cannot be ran here.",
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: "Not enough permissions.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.members.me;

        if (!bot.permissions.has(permission)) {
          interaction.reply({
            content: "I don't have enough permissions.",
            ephemeral: true,
          });
          return;
        }
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
};
