const { EmbedBuilder } = require("discord.js");
const { serverConfig } = require("../../../config.json");

module.exports = {
  name: "partnershipinfo",
  description: "Provides information about partnership.",
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: (client, interaction) => {
    const ticketChannelId = serverConfig.ticketChannel;
    const ticketInfo = `If you're interested in partnering with us, we welcome you to open a ticket and provide details about your server. Partnerships can include collaborations, cross-promotions, or any mutually beneficial arrangements that align with our community values.
    To open a partnership ticket, go to <#${ticketChannelId}> and use the dropdown menu to select the "Partnership" option. You’ll be guided through a simple form to provide some information about your server.

**Partnership Requirements:**
- Atleast 75 members in your server.
- Your server should be active and have a clear focus or theme.
- SFW content only. We do not partner with servers that contain NSFW or inappropriate content.
- Tech/IT related by any means.
- Have active moderation team and clear rules in place.

**Partnership Benefits:**
- Increased visibility and exposure for your server within our community.
- Opportunities for cross-promotion and collaboration on events or activities.
- Access to our resources and support for mutual growth.
`;

    const embed = new EmbedBuilder()
      .setTitle("📘 Partnership Info")
      .setDescription(ticketInfo.trim())
      .setColor(0x5865f2)
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  },
};
