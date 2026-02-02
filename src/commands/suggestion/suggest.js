const { serverConfig } = require('../../../config.json');
const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: 'You can only run this command inside a server.',
        ephemeral: true,
      });
    }

    const suggestion = interaction.options.getString('suggestion');
    const image = interaction.options.getAttachment('image');

    const suggestionsChannel = interaction.guild.channels.cache.get(
      serverConfig.suggestionsChannel,
    );
    if (!suggestionsChannel) {
      return interaction.reply({
        content: 'Suggestions channel is not configured yet.',
        ephemeral: true,
      });
    }

    const suggestionEmbed = new EmbedBuilder()
      .setAuthor({
        name: `New Suggestion • ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(suggestion)
      .setColor(0x11ee11)
      .setFooter({
        text: `Use /suggest to send your own suggestion`,
      })
      .setTimestamp();

    if (image && image.url) {
      suggestionEmbed.setImage(image.url);
    }

    const sent = await suggestionsChannel.send({ embeds: [suggestionEmbed] });

    try {
      await sent.react('👍');
      await sent.react('👎');
      await sent.react('🤷');
    } catch (e) {
      // ignore
    }

    const thread = await sent.startThread({
      name: `Suggestion Discussion`,
      autoArchiveDuration: 1440,
    });

    return interaction.reply({
      content: `Your suggestion has been submitted. Thank you! A discussion thread has been created: ${thread.url}`,
      ephemeral: true,
    });
  },
  name: 'suggest',
  description: 'Make a suggestion for the server!',
  options: [
    {
      name: 'suggestion',
      description: 'The suggestion you want to make',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'image',
      description: 'Optional image attachment for the suggestion',
      type: ApplicationCommandOptionType.Attachment,
      required: false,
    },
  ],
};
