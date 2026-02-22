const { ApplicationCommandType } = require("discord.js");
const { serverConfig } = require("../../../config.json");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "Report Message",
  type: ApplicationCommandType.Message,

  callback: async (client, interaction) => {
    try {
      const message = interaction.targetMessage;
      if (!message.guild) return;
      if (message.author?.bot) {
        return interaction.reply({
          content: "You cannot report a bot message.",
          ephemeral: true,
        });
      }
      const { modLogChannel } = serverConfig;
      const channel = message.guild.channels.cache.get(modLogChannel);
      if (!channel || !modLogChannel) {
        return interaction.reply({
          content: "Reporting is not configured yet.",
          ephemeral: true,
        });
      }
      const existing = await channel.messages.fetch({ limit: 15 });
      if (
        existing.find((m) => m.embeds[0]?.footer?.text.includes(message.id))
      ) {
        return interaction.reply({
          content: "This message has already been reported recently.",
          ephemeral: true,
        });
      }
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
            value: `${interaction.user || "Unknown"}`,
            inline: true,
          },
          { name: "Channel", value: `<#${message.channel.id}>`, inline: true },
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
      return interaction.reply({
        content: "Message reported to moderators successfully.",
        ephemeral: true,
      });
    } catch (err) {
      console.log("Error in Report Message context menu:", err);
      return interaction.reply({
        content: "An error occurred while processing your report.",
        ephemeral: true,
      });
    }
  },
};
