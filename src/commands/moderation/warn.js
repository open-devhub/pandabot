const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { serverConfig } = require('../../../config.json');
const { createDocument, getDocument } = require('../../utils/firestore');

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
        content: 'Warn roles are not configured correctly.',
      });
      return;
    }

    const { warn1, warn2, warn3 } = warnRoles;

    const warn1Role = interaction.guild.roles.cache.get(warn1);
    const warn2Role = interaction.guild.roles.cache.get(warn2);
    const warn3Role = interaction.guild.roles.cache.get(warn3);

    if (!warn1Role || !warn2Role || !warn3Role) {
      await interaction.editReply({
        content: 'One or more warn roles not found in the guild.',
      });
      return;
    }

    const targetOption = interaction.options.getUser('target-user');
    let member = null;
    if (targetOption) {
      try {
        member = await interaction.guild.members.fetch(targetOption.id);
      } catch {
        member = null;
      }
    }

    if (!member) {
      await interaction.editReply({
        content: 'Could not find that member in the guild.',
      });
      return;
    }

    const reason =
      interaction.options.getString('reason') || 'No reason provided';

    const hasWarn1 = member.roles.cache.has(warn1);
    const hasWarn2 = member.roles.cache.has(warn2);
    const hasWarn3 = member.roles.cache.has(warn3);

    const logChannel =
      interaction.guild.channels.cache.get(serverConfig.botCommandsChannel) ||
      null;

    let warnCount = 0;
    if (hasWarn3) warnCount = 3;
    else if (hasWarn2) warnCount = 2;
    else if (hasWarn1) warnCount = 1;

    const embed = new EmbedBuilder()
      .setTitle('Warn User')
      .addFields(
        { name: 'User', value: `${member}`, inline: true },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Warning Count', value: `${warnCount + 1}`, inline: true },
        { name: 'Reason', value: reason, inline: false },
      )
      .setTimestamp()
      .setThumbnail(member.user.displayAvatarURL({ size: 1024 }));

    try {
      if (!hasWarn1 && !hasWarn2 && !hasWarn3) {
        await member.roles.add(warn1);
        const warnDoc = await getDocument('warns', member.id);
        let warns = [];
        if (warnDoc.exists()) {
          warns = warnDoc.data().warns || [];
        }
        warns.push({
          moderatorId: interaction.user.id,
          reason: reason,
        });
        if (warns.length > 3) warns = warns.slice(-3);
        await createDocument('warns', member.id, { warns });
        if (logChannel) await logChannel.send({ embeds: [embed] });
        await interaction.editReply({
          content: `Added first warn to ${member}.`,
        });
        return;
      }

      if (hasWarn1 && !hasWarn2) {
        await member.roles.remove(warn1).catch(() => {});
        await member.roles.add(warn2);
        const warnDoc = await getDocument('warns', member.id);
        let warns = [];
        if (warnDoc.exists()) {
          warns = warnDoc.data().warns || [];
        }
        warns.push({
          moderatorId: interaction.user.id,
          reason: reason,
        });
        if (warns.length > 3) warns = warns.slice(-3);
        await createDocument('warns', member.id, { warns });
        if (logChannel) await logChannel.send({ embeds: [embed] });
        await interaction.editReply({
          content: `Upgraded warn to level 2 for ${member}.`,
        });
        return;
      }

      if (hasWarn2 && !hasWarn3) {
        await member.roles.remove(warn2).catch(() => {});
        await member.roles.add(warn3);
        const warnDoc = await getDocument('warns', member.id);
        let warns = [];
        if (warnDoc.exists()) {
          warns = warnDoc.data().warns || [];
        }
        warns.push({
          moderatorId: interaction.user.id,
          reason: reason,
        });
        if (warns.length > 3) warns = warns.slice(-3);
        await createDocument('warns', member.id, { warns });
        if (logChannel) await logChannel.send({ embeds: [embed] });
        await interaction.editReply({
          content: `Upgraded warn to level 3 for ${member}.`,
        });
        return;
      }

      if (hasWarn3) {
        await interaction.editReply({
          content: `${member} has been warned 3 times. Take a mod action or pass.`,
        });
        if (logChannel) await logChannel.send({ embeds: [embed] });
        return;
      }
    } catch (err) {
      console.error('Error applying warn roles:', err);
      await interaction.editReply({
        content: 'Failed to apply warn roles. Check bot permissions.',
      });
    }
  },
  name: 'warn',
  description: 'Warn a user',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to warn.',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason you want to warn.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.MuteMembers],
  botPermissions: [PermissionFlagsBits.ManageRoles],
};
