const { devs, guildId } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const getAllFiles = require("../../utils/getAllFiles");
const path = require("path");

module.exports = async (client, interaction) => {
  if (!interaction.isCommand()) return;

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
