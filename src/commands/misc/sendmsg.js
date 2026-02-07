const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const buildModal = require("../../utils/buildModal");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild())
      return interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });

    const modalId = `sendmsg_modal_${interaction.user.id}_${Date.now()}`;
    const modal = buildModal(client, {
      customId: modalId,
      title: "Send Embed Message",
      fields: [
        {
          customId: "title",
          label: "Title",
          style: "SHORT",
          placeholder: "Message title",
          required: true,
          maxLength: 256,
        },
        {
          customId: "description",
          label: "Description",
          style: "PARAGRAPH",
          placeholder: "Message description (max 2048)",
          required: true,
          maxLength: 2048,
        },
        {
          customId: "footer",
          label: "Footer (optional)",
          style: "SHORT",
          placeholder: "Optional footer text for the embed",
          required: false,
          maxLength: 256,
        },
      ],
    });

    try {
      await interaction.showModal(modal);
    } catch (err) {
      console.error("Failed to show sendmsg modal:", err);
      return interaction.reply({
        content: "Something went wrong showing the form. Try again.",
        ephemeral: true,
      });
    }

    let modalSubmit;
    try {
      modalSubmit = await interaction.awaitModalSubmit({
        filter: (m) =>
          m.user.id === interaction.user.id && m.customId === modalId,
        time: 300000,
      });
    } catch (err) {
      console.error("sendmsg modal submit error or timeout:", err);
      return;
    }

    const title = modalSubmit.fields.getTextInputValue("title");
    const description = modalSubmit.fields.getTextInputValue("description");
    let footer = null;
    try {
      footer = modalSubmit.fields.getTextInputValue("footer") || null;
    } catch (e) {
      footer = null;
    }

    const targetChannel = interaction.channel;
    if (!targetChannel || !targetChannel.send) {
      try {
        await modalSubmit.reply({
          content: "Unable to send message to this channel.",
          ephemeral: true,
        });
      } catch {}
      return;
    }

    const suggestionEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x5865f2);
    if (footer) suggestionEmbed.setFooter({ text: footer });

    try {
      await targetChannel.send({ embeds: [suggestionEmbed] });
      await modalSubmit.reply({
        content: "Message sent successfully!",
        ephemeral: true,
      });
    } catch (err) {
      console.error("Failed to send message to channel:", err);
      try {
        await modalSubmit.reply({
          content: "Failed to send message to this channel.",
          ephemeral: true,
        });
      } catch {}
    }
  },
  name: "sendmsg",
  description: "Send embed from panda bot",
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
