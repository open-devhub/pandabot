const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "unlock",
  description: "Unlocks current channel.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  callback(client, message, args) {
    try {
      message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: true,
      });
      message.reply("Channel has been unlocked.");
    } catch (err) {
      console.error("Error unlocking channel:", err);
    }
  },
};
