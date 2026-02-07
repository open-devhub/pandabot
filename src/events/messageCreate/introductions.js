const { serverConfig } = require("../../../config.json");

module.exports = async (client, message) => {
  if (!message || !message.guild || message.author?.bot) return;

  const channel = message.channel;
  if (channel.id !== serverConfig.introductionsChannel) return;

  const stickyMessageContent =
    "**Welcome to DevHub!** Please introduce yourself by sharing your preferred name/nickname, favorite languages/tools/frameworks, areas of interest, hobbies outside tech, and what you hope to learn or contribute here. We’re excited you’re here!";

  try {
    const fetched = await channel.messages.fetch({ limit: 10 });

    const stickies = fetched.filter(
      (msg) =>
        msg.author.id === client.user.id &&
        msg.content === stickyMessageContent,
    );

    for (const msg of stickies.values()) {
      await msg.delete().catch(() => {});
    }

    await channel.send(stickyMessageContent);
  } catch (err) {
    console.error("Sticky refresh error:", err);
  }

  try {
    if (message.reference) return;
    await message.react("👋").catch(() => {});

    const welcomeEmojiId = serverConfig.emojis?.welcomeEmoji;
    if (welcomeEmojiId) {
      const customEmoji = message.guild.emojis.cache.get(welcomeEmojiId);
      if (customEmoji) {
        await message.react(customEmoji).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Intro reaction error:", err);
  }
};
