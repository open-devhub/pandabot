const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "slowmode",
  description: "Set slowmode for the channel. Usage: !slowmode <duration>",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  callback(client, message, args) {
    try {
      const duration = parseInt(args[0], 10);
      if (isNaN(duration) || duration < 0 || duration > 21600) {
        return message.reply(
          "Please provide a valid duration in seconds (0-21600).",
        );
      }

      message.channel.setRateLimitPerUser(duration);
      message.reply(
        `Slowmode has been set to ${duration == 1 ? "1 second" : `${duration} seconds`} for this channel.`,
      );
    } catch (err) {
      console.error(err);
    }
  },
};
