const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

const { counts } = require('../../states/counting');
const { serverConfig } = require('../../../config.json');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      const guildId = interaction.guild.id;
      const channelId = serverConfig.countingChannel;
      const key = `${guildId}-${channelId}`;

      const newCount = interaction.options.getNumber('count');

      counts.set(key, {
        lastNum: newCount,
        lastUser: null,
        saves: 3,
      });

      const embed = new EmbedBuilder()
        .setTitle('Counter Updated')
        .setDescription(
          `The counter has been set to **${newCount}**.\nNext number should be **${
            newCount + 1
          }**.`
        )
        .setColor(0x5865f2);

      await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (err) {
      console.error('Error in /setcount command:', err);
      await interaction.reply({
        content: 'There was an error while setting the counter.',
        ephemeral: true,
      });
    }
  },
  name: 'setcount',
  description: 'Manually set the counting number',
  options: [
    {
      name: 'count',
      description: 'Count to set',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
