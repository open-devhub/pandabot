const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");

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

    if (interaction.guild.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: "You must be the owner of the server to use this command.",
        ephemeral: true,
      });
    }

    const modalId = `dm_modal_${interaction.user.id}_${Date.now()}`;
    const modal = buildModal(client, {
      customId: modalId,
      title: "Send Message",
      fields: [
        {
          customId: "content",
          label: "Content",
          style: "PARAGRAPH",
          placeholder: "Message content (max 2048)",
          required: true,
          maxLength: 2048,
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
      console.error("dm modal submit error or timeout:", err);
      return;
    }

    const content = modalSubmit.fields.getTextInputValue("content");
    const user = interaction.options.getUser("target-user");

    try {
      await user.send(content);
      await modalSubmit.reply({
        content: "Message sent successfully!",
        ephemeral: true,
      });
    } catch (err) {
      console.error("Failed to send DM:", err);
      try {
        await modalSubmit.reply({
          content: "Failed to send message to this user.",
          ephemeral: true,
        });
      } catch {}
    }
  },
  name: "dm",
  description: "Direct message a user",
  options: [
    {
      name: "target-user",
      description: "The user to DM",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
