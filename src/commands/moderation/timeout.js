const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const ms = require('ms');
const { serverConfig } = require('../../../config.json');

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    // resolve target member robustly
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

    const duration = interaction.options.getString('duration');
    const reason =
      interaction.options.getString('reason') || 'No reason provided';

    await interaction.deferReply({ ephemeral: true });

    if (!targetUser) {
      return interaction.editReply("That user doesn't exist in this server.");
    }

    if (targetUser.user.bot) {
      return interaction.editReply("I can't timeout a bot.");
    }

    const msDuration = ms(duration);
    if (isNaN(msDuration)) {
      return interaction.editReply('Please provide a valid timeout duration.');
    }

    if (msDuration < 5000 || msDuration > 2.419e9) {
      return interaction.editReply(
        'Timeout duration cannot be less than 5 seconds or more than 28 days.',
      );
    }

    const targetUserRolePosition = targetUser.roles.highest.position;
    const requestUserRolePosition = interaction.member.roles.highest.position;
    const botRolePosition = interaction.guild.members.me.roles.highest.position;

    if (targetUserRolePosition >= requestUserRolePosition) {
      return interaction.editReply(
        "You can't timeout that user because they have the same/higher role than you.",
      );
    }

    if (targetUserRolePosition >= botRolePosition) {
      return interaction.editReply(
        "I can't timeout that user because they have the same/higher role than me.",
      );
    }

    try {
      await targetUser.timeout(msDuration, reason);

      const { default: prettyMs } = await import('pretty-ms');

      const embed = new EmbedBuilder()
        .setTitle(
          targetUser.isCommunicationDisabled()
            ? 'Timeout Applied'
            : 'Timeout User',
        )
        .setColor(0x5865f2)
        .addFields(
          { name: 'User', value: targetUser.toString(), inline: true },
          {
            name: 'Moderator',
            value: interaction.user.toString(),
            inline: true,
          },
          {
            name: 'Duration',
            value: prettyMs(msDuration, { verbose: true }),
            inline: true,
          },
          { name: 'Reason', value: reason },
        )
        .setThumbnail(targetUser.user.displayAvatarURL({ size: 1024 }))
        .setTimestamp();

      const logChannel = interaction.guild.channels.cache.get(
        serverConfig.botCommandsChannel,
      );

      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      } else {
        console.warn(
          'Log channel not found, sending embed in current channel.',
        );
        await interaction.channel.send({ embeds: [embed] });
      }

      await interaction.editReply({
        content: `✅ Successfully timed out **${targetUser.user.tag}** for ${prettyMs(
          msDuration,
          { verbose: true },
        )}`,
      });
    } catch (error) {
      console.error(`There was an error when timing out: ${error}`);
      await interaction.editReply({
        content: '❌ An error occurred while timing out the user.',
      });
    }
  },

  name: 'timeout',
  description: 'Timeout a user.',
  options: [
    {
      name: 'target-user',
      description: 'The user you want to timeout.',
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: 'duration',
      description: 'Timeout duration (30m, 1h, 1d, etc).',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'reason',
      description: 'The reason for the timeout.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  permissionsRequired: [PermissionFlagsBits.ModerateMembers],
};
