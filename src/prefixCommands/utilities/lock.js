const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "lock",
  description: "Locks current channel.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  callback(client, message, args) {
    try {
      message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false,
      });
      message.reply("Channel has been locked.");
    } catch (err) {
      console.error("Error locking channel:", err);
    }
  },
};
