const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { serverConfig } = require("../../../config.json");
const { deleteDocument } = require("../../utils/firestore");

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { warnRoles } = serverConfig;

    if (!warnRoles?.warn1 || !warnRoles?.warn2 || !warnRoles?.warn3) {
      await interaction.editReply({
        content: "Warn roles are not configured correctly.",
      });
      return;
    }

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

    const { warn1, warn2, warn3 } = warnRoles;
    const rolesToRemove = [warn1, warn2, warn3].filter((id) =>
      member.roles.cache.has(id),
    );

    if (rolesToRemove.length === 0) {
      await interaction.editReply({ content: `${member} has no warn roles.` });
      return;
    }

    const reason =
      interaction.options.getString("reason") || "No reason provided";

    try {
      for (const r of rolesToRemove) {
        await member.roles.remove(r).catch(() => {});
      }

      await deleteDocument("warns", member.id);

      const embed = new EmbedBuilder()
        .setTitle("Cleared Warns")
        .addFields(
          { name: "User", value: `${member}`, inline: true },
          { name: "Moderator", value: `${interaction.user}`, inline: true },
          { name: "Reason", value: reason, inline: false },
        )
        .setTimestamp()
        .setThumbnail(member.user.displayAvatarURL({ size: 1024 }));

      const logChannel =
        interaction.guild.channels.cache.get(serverConfig.botCommandsChannel) ||
        interaction.channel;

      if (logChannel) await logChannel.send({ embeds: [embed] });

      await interaction.editReply({
        content: `Cleared warn roles for ${member}.`,
      });
    } catch (err) {
      console.error("Failed clearing warn roles:", err);
      await interaction.editReply({
        content: "Failed to clear warn roles. Check bot permissions.",
      });
    }
  },
  name: "clearwarns",
  description: "Clear warns of a user",
  options: [
    {
      name: "target-user",
      description: "The user whose warns you want to clear.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for clearing warns.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.MuteMembers],
};
