const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "slowmode",
  description: "Set slowmode for the channel. Usage: !slowmode <duration>",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  async callback(client, message, args) {
    try {
      const duration = parseInt(args[0], 10);
      if (isNaN(duration) || duration < 0 || duration > 21600) {
        return await message.reply(
          "Please provide a valid duration in seconds (0-21600).",
        );
      }

      await message.channel.setRateLimitPerUser(duration);
      await message.reply(
        `Slowmode has been set to ${duration == 1 ? "1 second" : `${duration} seconds`} for this channel.`,
      );
    } catch (err) {
      console.error(err);
    }
  },
};
