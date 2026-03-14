const { serverConfig } = require("../../../config.json");
const { counts } = require("../../states/counting");

module.exports = async (client, message) => {
  try {
    if (!message?.guild) return;
    if (message.author?.bot) return;

    const channel = message.channel;
    if (channel.id !== serverConfig.countingChannel) return;
    const guildId = message.guild.id;
    const key = `${guildId}-${channel.id}`;

    await message.channel
      .send(
        `Hey ${message.author}, please don't delete your counting messages! The current count is **${counts.get(key)?.lastNum || 0}**.`,
      )
      .catch(() => {});
  } catch (err) {
    console.error("Counting handler error:", err);
  }
};
