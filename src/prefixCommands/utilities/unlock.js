const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "unlock",
  description: "Unlocks current channel.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  async callback(client, message, args) {
    try {
      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        {
          SendMessages: true,
        },
      );
      await message.reply("Channel has been unlocked.");
    } catch (err) {
      console.error("Error unlocking channel:", err);
    }
  },
};
