const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { serverConfig } = require('../../../config.json');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const optMember = interaction.options.getMember('target-user');
    const optUser = interaction.options.getUser('target-user');
    let targetUser = optMember;

    if (!targetUser && optUser) {
      try {
        targetUser = await interaction.guild.members.fetch(optUser.id);
      } catch (err) {
        console.error('Failed to fetch member:', err);
      }
    }

    const reason =
      interaction.options.getString('reason') || 'No reason provided';

    await interaction.deferReply({ ephemeral: true });

    if (!targetUser) {
      return interaction.editReply("That user doesn't exist in this server.");
    }

    if (targetUser.id === interaction.guild.ownerId) {
      return interaction.editReply('Cannot ban the server owner.');
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      return interaction.editReply(
        "You can't ban that user because they have the same/higher role than you."
      );
    }

    if (targetUserRolePosition >= botRolePosition) {
      return interaction.editReply(
        "I can't ban that user because they have the same/higher role than me."
      );
    }

    try {
      await targetUser.ban({ reason });

      const embed = new EmbedBuilder()
        .setTitle('Banned User')
        .setColor(0x5865f2)
        .addFields(
          { name: 'User', value: targetUser.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason }
        )
        .setThumbnail(targetUser.user.displayAvatarURL({ size: 1024 }))
        .setTimestamp();

      const logChannel =
        interaction.guild.channels.cache.get(serverConfig.botCommandsChannel);

      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      } else {
        console.warn('Log channel not found, sending embed in current channel.');
        await interaction.channel.send({ embeds: [embed] });
      }

      await interaction.editReply({
        content: `✅ Successfully banned **${targetUser.user.tag}**`,
      });
    } catch (error) {
      console.error(`There was an error when banning: ${error}`);
      await interaction.editReply({
        content: '❌ An error occurred while banning the user.',
      });
    }
  },

  name: 'ban',
  description: 'Bans a member from this server.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to ban.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason you want to ban.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
};
