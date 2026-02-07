const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/Level");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply("You can only run this command inside a server.");
      return;
    }
    const mentionedUser = interaction.options.getUser("target-user");
    const targetUserId = mentionedUser?.id || interaction.member.id;
    const amount = interaction.options.getNumber("amount");
    const reason = interaction.options.getString("reason");
    let targetMember;
    try {
      targetMember = await interaction.guild.members.fetch(targetUserId);
    } catch (err) {
      const user =
        mentionedUser || (await interaction.client.users.fetch(targetUserId));
      targetMember = { user, presence: { status: "offline" } };
    }
    let fetchedLevel = await Level.findOne({ userId: targetUserId });
    if (!fetchedLevel) {
      fetchedLevel = new Level({
        userId: targetUserId,
        level: 0,
        xp: 0,
      });
    }
    fetchedLevel.xp += amount;
    let leveledUp = false;
    while (fetchedLevel.xp >= calculateLevelXp(fetchedLevel.level + 1)) {
      fetchedLevel.level += 1;
      leveledUp = true;
    }

    const roles = [
      1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
      95, 100,
    ];

    // give role if level matches, and remove the previous role
    if (roles.includes(fetchedLevel.level)) {
      const roleName = `lvl ${fetchedLevel.level}`;
      const role = interaction.guild.roles.cache.find(
        (r) => r.name === roleName,
      );
      if (role) {
        const member = interaction.member;
        member.roles.add(role).catch((e) => {
          console.log(`Error adding role: ${e}`);
        });

        const previousRoleName = `lvl ${
          fetchedLevel.level == 5
            ? fetchedLevel.level - 4
            : fetchedLevel.level - 5
        }`;
        const previousRole = interaction.guild.roles.cache.find(
          (r) => r.name === previousRoleName,
        );
        if (previousRole) {
          member.roles.remove(previousRole).catch((e) => {
            console.log(`Error removing role: ${e}`);
          });
        }
      }
    }

    await fetchedLevel.save();
    const suggestionEmbed = new EmbedBuilder()
      .setTitle("XP Added")
      .setDescription(`Added ${amount} XP to ${targetMember.user}`)
      .setFields(
        { name: "Reason", value: reason, inline: false },
        { name: "Level", value: `${fetchedLevel.level}`, inline: true },
        { name: "Total XP", value: `${fetchedLevel.xp}`, inline: true },
      )
      .setColor(0x5865f2)
      .setTimestamp()
      .setThumbnail(targetMember.user.displayAvatarURL({ size: 1024 }));

    return interaction.reply({ embeds: [suggestionEmbed] });
  },
  name: "addxp",
  description: "Give xp to someone",
  options: [
    {
      name: "target-user",
      description: "User to give xp to",
      type: ApplicationCommandOptionType.Mentionable,
      required: true,
    },
    {
      name: "amount",
      description: "Amount of xp to add",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
    {
      name: "reason",
      description: "Reason for adding xp",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
};
