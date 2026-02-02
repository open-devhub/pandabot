const { Client } = require('discord.js');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
const sendEmbed = require('../../utils/sendEmbed');

module.exports = {
  /**
   * @param {Client} client
   *
   * */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }
    await interaction.deferReply();

    let allLevels = await Level.find().select('-_id userId level xp');
    if (allLevels.length === 0) {
      interaction.editReply('No one has any levels yet in this server.');
      return;
    }
    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    const top = allLevels.slice(0, 15);

    const entries = await Promise.all(
      top.map(async (t, idx) => {
        try {
          const member = await interaction.guild.members.fetch(t.userId);
          const needed = calculateLevelXp(t.level);
          return `${idx + 1}. **${member.user.tag}** — Level **${t.level}**`;
        } catch (e) {
          const needed = calculateLevelXp(t.level + 1);
          return `${idx + 1}. <@${t.userId}> — Level **${t.level}** (${
            t.xp
          }/${needed} XP)`;
        }
      })
    );

    sendEmbed({
      interaction,
      title: 'Leaderboard',
      description: entries.join('\n'),
      color: '#5865F2',
      footer: {
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ size: 64 }),
      },
    });
  },
  name: 'leaderboard',
  description: 'Shows top levels in the server.',
};
