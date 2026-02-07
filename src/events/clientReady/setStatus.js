const { ActivityType } = require("discord.js");

module.exports = (client) => {
  client.user.setPresence({
    activities: [
      {
        name: "🎍 eating some bamboo",
        type: ActivityType.Playing,
      },
    ],
    status: "online",
  });
};
