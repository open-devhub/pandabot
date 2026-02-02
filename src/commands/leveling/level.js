const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require('discord.js');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    await interaction.deferReply();

    const mentionedUser = interaction.options.getUser('target-user');
    const targetUserId = mentionedUser?.id || interaction.member.id;

    let targetMember;
    try {
      targetMember = await interaction.guild.members.fetch(targetUserId);
    } catch (err) {
      const user =
        mentionedUser || (await interaction.client.users.fetch(targetUserId));
      targetMember = { user, presence: { status: 'offline' } };
    }

    const fetchedLevel = await Level.findOne({ userId: targetUserId });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUser
          ? `${targetMember.user.tag} doesn't have any levels yet. Try again when they chat a little bit more.`
          : "You don't have any levels yet. Chat a little bit and try again."
      );
      return;
    }

    let allLevels = await Level.find().select('-_id userId level xp');

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank =
      allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    const avatarUrl = targetMember.user.displayAvatarURL
      ? targetMember.user.displayAvatarURL({ size: 256 })
      : null;

    const rank = new EmbedBuilder()
      .setTitle(`${targetMember.user.username}'s Level`)
      .setFields(
        { name: 'Level', value: `${fetchedLevel.level}`, inline: true },
        {
          name: 'XP',
          value: `${fetchedLevel.xp}/${calculateLevelXp(fetchedLevel.level)}`,
          inline: true,
        },
        { name: 'Rank', value: `#${currentRank}`, inline: true }
      )
      .setThumbnail(avatarUrl)
      .setColor(0x5865F2)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    interaction.editReply({ embeds: [rank] });
  },

  name: 'level',
  description: "Shows your/someone's level.",
  options: [
    {
      name: 'target-user',
      description: 'The user whose level you want to see.',
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
