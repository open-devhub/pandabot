const { EmbedBuilder } = require("discord.js");
const { serverConfig } = require("../../../config.json");

module.exports = {
  name: "ticketinfo",
  description: "Provides information about tickets.",
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: (client, interaction) => {
    const ticketChannelId = serverConfig.ticketChannel;
    const ticketInfo = `Tickets are the best way to get help and ensure moderators can respond quickly. Here’s what you can use them for:
- 🧩 General Support: For questions, technical issues, or anything else you need assistance with, tickets help us track and resolve them.
- 🎭 Request Unban / Unmute: If you or a friend need to appeal a ban, mute or suspend, open a ticket and provide the details.
- 🚨 Report User: If you need to report someone, tickets make sure the moderators see it right away and can investigate properly.
- ⚒️ Apply For Staff: Interested in joining our moderation team? Use a ticket to submit your application and tell us why you’d be a great fit.
- 📝 Other: For any other reasons, open a ticket and explain your situation.

To open a ticket, go to <#${ticketChannelId}> and use the dropdown menu to select your ticket type. You’ll be guided through a simple form to explain your reason. I will handle the process, create a private channel for your case, and keep everything neat and secure. Thanks for helping us keep the community clean ✨`;

    const embed = new EmbedBuilder()
      .setTitle("📘 Ticket Guide")
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
