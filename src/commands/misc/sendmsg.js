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

    const content = interaction.options.getString("content");

    try {
      await interaction.channel.send(
        content.length > 2000 ? content.slice(0, 1997) + "..." : content,
      );
      await interaction.reply({
        content: "Message sent successfully.",
        ephemeral: true,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      await interaction.reply({
        content: "Something went wrong sending the message. Try again.",
        ephemeral: true,
      });
    }
  },
  name: "sendmsg",
  description: "Send message from panda bot",
  options: [
    {
      name: "content",
      description: "Message content to send (max 2000 characters)",
      type: ApplicationCommandOptionType.String,
      required: true,
      maxLength: 2000,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
