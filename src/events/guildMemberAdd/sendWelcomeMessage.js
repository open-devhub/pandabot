const { serverConfig } = require('../../../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = async (client, member) => {
  if (!member || !member.id) return;

  try {
    const guildName = member.guild?.name || 'the server';
    const mention = member.user?.toString() || `<@${member.id}>`;
    const welcomeChannelId = serverConfig.welcomeChannel;

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x11dd44)
      .setTitle(`Welcome to ${guildName}, ${member.user.username}! 🎉`)
      .setDescription(
        `Welcome ${mention}! We're delighted to have you join us in **${guildName}**.\n` +
          `Take a moment to explore the channels, introduce yourself, and connect with the community.\n` +
          `Once again, a warm welcome aboard — we look forward to your contributions and conversations! 🌟`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      await welcomeChannel.send({ embeds: [welcomeEmbed] });
    } else {
      console.warn(
        `Welcome channel with ID ${welcomeChannelId} not found in guild ${guildName}.`
      );
    }
  } catch (err) {
    console.error('Error sending welcome message on guildMemberAdd:', err);
  }
};
