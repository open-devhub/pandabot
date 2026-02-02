const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const { serverConfig } = require('../../../config.json');
const { deleteDocument, getDocument } = require('../../utils/firestore');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const optMember = interaction.options.getMember('target-user');
    const reason =
      interaction.options.getString('reason') || 'No reason provided';
    const suspendedRole = interaction.guild.roles.cache.get(
      serverConfig.suspendedRoleId
    );
    await interaction.deferReply({ ephemeral: true });

    if (!optMember) {
      return interaction.editReply("That user doesn't exist in this server.");
    }

    if (!optMember.roles.cache.has(suspendedRole.id)) {
      return interaction.editReply('This user is not suspended.');
    }

    const targetUserRolePosition = optMember.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;
    if (targetUserRolePosition >= requestUserRolePosition) {
      return interaction.editReply(
        "You can't unsuspend that user because they have the same/higher role than you."
      );
    }
    if (targetUserRolePosition >= botRolePosition) {
      return interaction.editReply(
        "I can't suspend that user because they have the same/higher role than me."
      );
    }
    try {
      await optMember.roles.remove(suspendedRole, `Unsuspended: ${reason}`);
    } catch (error) {
      console.error('Error suspending user:', error);
      return interaction.editReply(
        'There was an error unsuspending that user. Please try again.'
      );
    }
    // get current suspensions from firestore from suspensions collection
    const suspensionDoc = await getDocument('suspensions', optMember.id);

    if (suspensionDoc.exists()) {
      await deleteDocument('suspensions', optMember.id);
    }

    const embed = new EmbedBuilder()
      .setTitle('User Unsuspended')
      .setColor(0x5865f2)
      .addFields(
        {
          name: 'Unsuspended User',
          value: `${optMember.user}`,
          inline: true,
        },
        {
          name: 'Moderator',
          value: `${interaction.user}`,
          inline: true,
        },
        { name: 'Reason', value: reason, inline: false }
      )
      .setThumbnail(optMember.user.displayAvatarURL({ size: 1024 }))
      .setTimestamp();

    const logChannel = interaction.guild.channels.cache.get(
      serverConfig.botCommandsChannel
    );

    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('Log channel not found, sending embed in current channel.');
      await interaction.channel.send({ embeds: [embed] });
    }

    await interaction.editReply({
      content: `✅ Successfully Unsuspended **${optMember.user.tag}**`,
    });
  },
  name: 'unsuspend',
  description: 'Unsuspend a user from the server.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to unsuspend.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason you want to unsuspend.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
