const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const { serverConfig } = require('../../../config.json');
const { updateDocument, getDocument } = require('../../utils/firestore');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const optMember = interaction.options.getMember('target-user');
    if (!optMember) {
      return interaction.reply({
        content: "That user doesn't exist in this server.",
        ephemeral: true,
      });
    }
    const suspendedRole = interaction.guild.roles.cache.get(
      serverConfig.suspendedRoleId,
    );
    if (!optMember.roles.cache.has(suspendedRole.id)) {
      return interaction.reply({
        content: 'This user is not suspended.',
        ephemeral: true,
      });
    }
    // get current suspension from firestore from `suspensions` collection
    const suspensionDoc = await getDocument('suspensions', optMember.id);
    if (!suspensionDoc.exists()) {
      return interaction.reply({
        content: 'No suspension record found for this user.',
        ephemeral: true,
      });
    }
    const suspension = suspensionDoc.data();

    if (!suspension || !suspension.moderatorId || !suspension.reason) {
      return interaction.reply({
        content: 'Suspension record is incomplete or corrupted.',
        ephemeral: true,
      });
    }
    const embed = new EmbedBuilder()
      .setTitle(`Suspension Info for ${optMember.user.tag}`)
      .setColor('Orange')
      .addFields(
        { name: 'User Suspended', value: `<@${optMember.id}>`, inline: true },
        {
          name: 'Moderator',
          value: `<@${suspension.moderatorId}>`,
          inline: true,
        },
        {
          name: 'Reason',
          value: suspension.reason || 'No reason provided',
          inline: false,
        },
      )
      .setThumbnail(optMember.user.displayAvatarURL({ size: 1024 }))
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  },
  name: 'checksuspension',
  description: 'Check if a user is suspended.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to check.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
