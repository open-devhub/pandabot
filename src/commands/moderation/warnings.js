const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { serverConfig } = require("../../../config.json");
const { getDocument } = require("../../utils/firestore");

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser("target-user");
    let member = null;
    if (targetUser) {
      try {
        member = await interaction.guild.members.fetch(targetUser.id);
      } catch {
        member = null;
      }
    }

    if (!member) {
      await interaction.editReply({
        content: "Could not find that member in the guild.",
      });
      return;
    }

    const warnDoc = await getDocument("warns", member.id);
    let warns = [];
    if (warnDoc.exists()) {
      warns = warnDoc.data().warns || [];
    }

    const fields = [
      { name: "User", value: `${member}`, inline: true },
      { name: "Warning Count", value: `${warns.length}`, inline: true },
    ];

    warns.forEach((warn, index) => {
      fields.push({
        name: `Warn ${index + 1}`,
        value: `Moderator: <@${warn.moderatorId}>\nReason: ${warn.reason}`,
      });
    });

    const embed = new EmbedBuilder()
      .setTitle("User Warnings")
      .addFields(...fields)
      .setFooter({ text: `requested by ${interaction.user.tag}` })
      .setTimestamp()
      .setThumbnail(member.user.displayAvatarURL({ size: 1024 }));

    return interaction.editReply({ embeds: [embed] });
  },
  name: "warnings",
  description: "Display the number of warns a user has",
  options: [
    {
      name: "target-user",
      description: "The user whose warnings you want to check.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};
