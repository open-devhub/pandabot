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
    const ticketInfo = `If you're interested in partnering with us, feel free to open a ticket and tell us a bit about your server. Partnerships are a great way for communities to support each other through cross-promotion, collaboration, and shared growth within the tech space.

To open a partnership ticket, head over to <#${ticketChannelId}> and select the **“Partnership”** option from the dropdown menu. You’ll be guided through a short form where you can provide details about your server.

**Partnership Requirements:**

- Your server must have **at least 100 members**.
- The server should be **active**, with regular conversations and community engagement.
- Your community must be **Tech / IT related** (programming, development, cybersecurity, AI, etc).
- **SFW only** — servers containing NSFW or inappropriate content will not be considered.
- **Community must be enabled** on your Discord server.
- The server should have a **clear purpose or theme** that members can easily understand.
- Channels should be **well organized with a clean structure**.
- A **moderation team** should be present to maintain the server.
- **Server rules must be visible and accessible** to all members.
- The server must be **at least 2 weeks old**.
- You must provide a **permanent (non-expiring) invite link**.
- Your server must have a **partnerships channel** where our partnership message can remain visible.

**Partnership Benefits:**

- **Cross-promotion** between both communities through partnership channels.
- Increased **visibility and exposure** for your server within the DevHub community.
- Opportunities for **community collaborations** such as coding events, hackathons, or learning sessions.
- Ability to **share announcements or major updates** with our community when relevant.
- **Mutual support between staff teams**, including communication regarding community issues.
- Ability to submit **ban requests** to help keep both communities safe.
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
