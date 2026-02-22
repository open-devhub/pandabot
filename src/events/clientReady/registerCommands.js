const { guildId } = require("../../../config.json");
const { ApplicationCommandType } = require("discord.js");
const areCommandsDifferent = require("../../utils/areCommandsDifferent");
const getApplicationCommands = require("../../utils/getApplicationCommands");
const getLocalCommands = require("../../utils/getLocalCommands");
const getAllFiles = require("../../utils/getAllFiles");
const path = require("path");

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const contextMenuCommands = [];
    const contextMenuCategories = getAllFiles(
      path.join(__dirname, "..", "..", "contextMenus"),
      true,
    );

    for (const contextMenuCategory of contextMenuCategories) {
      const contextMenuFiles = getAllFiles(contextMenuCategory);

      for (const file of contextMenuFiles) {
        const command = require(file);
        contextMenuCommands.push(command);
      }
    }

    const allCommands = [...localCommands, ...contextMenuCommands];
    const applicationCommands = await getApplicationCommands(client, guildId);

    for (const localCommand of allCommands) {
      const { name, description, options, type } = localCommand;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name,
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted command "${name}".`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          const commandData = { name };
          if (type === undefined || type === ApplicationCommandType.ChatInput) {
            commandData.description = description;
            commandData.options = options;
          } else {
            commandData.type = type;
          }

          await applicationCommands.edit(existingCommand.id, commandData);

          console.log(`🔁 Edited command "${name}".`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(
            `⏩ Skipping registering command "${name}" as it's set to delete.`,
          );
          continue;
        }

        const commandData = { name };
        if (type === undefined || type === ApplicationCommandType.ChatInput) {
          commandData.description = description;
          commandData.options = options;
        } else {
          commandData.type = type;
        }

        await applicationCommands.create(commandData);

        console.log(`👍 Registered command "${name}."`);
      }
    }
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
};
