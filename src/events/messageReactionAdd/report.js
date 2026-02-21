const { serverConfig } = require("../../../config.json");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async (client, reaction) => {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const message = reaction.message;
    if (!message.guild) return;
    if (message.author?.bot) return;
    const reportEmoji = "🚩";

    if (reaction.emoji.name !== reportEmoji) return;
    const { modLogChannel } = serverConfig;
    const channel = message.guild.channels.cache.get(modLogChannel);
    if (!channel || !modLogChannel) return;

    const existing = await channel.messages.fetch({ limit: 15 });
    if (existing.find((m) => m.embeds[0]?.footer?.text.includes(message.id)))
      return;

    if (modLogChannel) {
      const embed = new EmbedBuilder()
        .setTitle("Message Report")
        .setColor(0xff0000)
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        })
        .addFields(
          { name: "User", value: `${message.author}`, inline: true },
          {
            name: "Reporter",
            value: `${reaction.users.cache.first() || "Unknown"}`,
            inline: true,
          },
          { name: "Channel", value: `${message.channel}`, inline: true },
          {
            name: "Message",
            value: message.content
              ? `||${message.content}||`
              : `No text message`,
            inline: false,
          },
        )
        .setThumbnail(message.author.displayAvatarURL({ size: 1024 }))
        .setFooter({ text: `Report ID: ${message.id}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Jump to Message")
          .setStyle(ButtonStyle.Link)
          .setURL(message.url),
      );

      await channel.send({
        content: `<@&${serverConfig.moderatorRoleId}>`,
        embeds: [embed],
        components: [row],
      });
    }
  } catch (err) {
    console.error("Message report error:", err);
  }
};
