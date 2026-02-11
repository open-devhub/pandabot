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

    const allowedEmojis = [
      "⭐",
      "🌟",
      "💀",
      "🤣",
      "😂",
      "❤️",
      "😍",
      "😻",
      "😹",
      "🔥",
      "👏",
      "😎",
      "🤯",
      "💯",
      "😱",
      "🤔",
      "🤩",
    ];

    const { starboardChannel, starboardExclude } = serverConfig;
    const { categories, channels } = starboardExclude;
    const reactionRequired = 5;

    const channel = message.guild.channels.cache.get(starboardChannel);
    if (!channel) return;
    if (Object.values(channels).includes(message.channel.id)) return;
    if (Object.values(categories).includes(message.channel.parentId)) return;

    const validReactions = message.reactions.cache.filter(
      (r) =>
        allowedEmojis.includes(r.emoji.name) && r.count >= reactionRequired,
    );

    if (validReactions.size === 0) return;

    const chosen = validReactions.sort((a, b) => b.count - a.count).first();

    const existing = await channel.messages.fetch({ limit: 7 });
    if (existing.find((m) => m.embeds[0]?.footer?.text.includes(message.id)))
      return;

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `**${chosen.emoji.toString()} ${chosen.count}**\n` +
          `${message.content ? `> ${message.content}` : "> *No text message*"}`,
      )
      .addFields(
        { name: "Author", value: `<@${message.author.id}>`, inline: true },
        { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
      )
      .setFooter({ text: `${message.id}` })
      .setTimestamp(message.createdAt);

    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      if (attachment.contentType?.startsWith("image")) {
        embed.setImage(attachment.url);
      } else {
        embed.addFields({
          name: "Attachment",
          value: `[Download File](${attachment.url})`,
        });
      }
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Jump to Message")
        .setStyle(ButtonStyle.Link)
        .setURL(message.url),
    );

    const sent = await channel.send({
      embeds: [embed],
      components: [row],
    });

    await sent.react(chosen.emoji.toString());
  } catch (err) {
    console.error("Starboard error:", err);
  }
};
