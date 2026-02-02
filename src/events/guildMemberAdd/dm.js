module.exports = async (client, member) => {
  if (!member || !member.id) return;

  try {
    const guildName = member.guild?.name || 'the server';
    const mention = member.user?.toString() || `<@${member.id}>`;

    const dmContent = `Hello ${mention}, 👋  

Welcome to **${guildName}**! We’re glad to have you here.

This community is built for people who enjoy creating, learning, and solving problems together. Its all about leveling up together:
- Building or refining a project? Share it with the community.
- Running into a bug or unexpected issue? Drop it in — someone will be happy to help.
- Learning something new or have knowledge to share? Jump into the relevant channels.
- Looking to collaborate or brainstorm ideas? Connect with other members.
- Exploring new tools, tech, or best practices? Start the conversation anytime.

Take a moment to explore the channels and get familiar with the server. If you ever have questions or need guidance, don’t hesitate to ask.

Welcome aboard — we’re excited to build and grow together 🚀
`;

    // attempt to dm tha new member, users may have dms from server members disabled
    await member.user.send({ content: dmContent }).catch((err) => {
      const msg = `Could not send welcome DM to ${
        member.user.tag || member.id
      }: ${err?.message || err}`;
      if (client?.logger?.info) client.logger.info(msg);
      else console.warn(msg);
    });
  } catch (err) {
    console.error('Error sending welcome DM on guildMemberAdd:', err);
  }
};
