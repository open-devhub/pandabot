const { Client, Message } = require("discord.js");
const { serverConfig } = require("../../../config.json");
const calculateLevelXp = require("../../utils/calculateLevelXp");
const Level = require("../../models/Level");
const cooldowns = new Set();

function getHybridXp(min, max, messageContent) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const randomXp = Math.floor(Math.random() * (max - min + 1)) + min;

  const scale = 20;
  const cap = 10;
  const lengthBonus = Math.min(Math.floor(messageContent.length / scale), cap);

  return randomXp + lengthBonus;
}

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (
    !message.inGuild() ||
    message.author.bot ||
    cooldowns.has(message.author.id)
  )
    return;

  const xpToGive = getHybridXp(5, 15, message.content);

  const query = {
    userId: message.author.id,
  };

  try {
    const level = await Level.findOne(query);

    if (level) {
      level.xp += xpToGive;

      if (level.xp > calculateLevelXp(level.level)) {
        level.xp = 0;
        level.level += 1;

        const channelId = serverConfig.botCommandsChannel;
        const channel = message.guild.channels.cache.get(channelId);

        if (!channel) {
          message.channel.send(
            `${message.member}  just reached **level ${level.level}**! Keep it up! ⚡`,
          );
        } else {
          channel.send(
            `${message.member}  just reached **level ${level.level}**! Keep it up! ⚡`,
          );
        }

        const roles = [
          1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85,
          90, 95, 100,
        ];

        // give role if level matches, remove the previous level role
        if (roles.includes(level.level)) {
          const roleName = `lvl ${level.level}`;
          const role = message.guild.roles.cache.find(
            (r) => r.name === roleName,
          );
          if (role) {
            const member = message.member;
            member.roles.add(role).catch((e) => {
              console.log(`Error adding role: ${e}`);
            });

            const previousRoleName = `lvl ${
              level.level == 5 ? level.level - 4 : level.level - 5
            }`;
            const previousRole = message.guild.roles.cache.find(
              (r) => r.name === previousRoleName,
            );
            if (previousRole) {
              member.roles.remove(previousRole).catch((e) => {
                console.log(`Error removing role: ${e}`);
              });
            }
          }
        }
      }

      await level.save().catch((e) => {
        console.log(`Error saving updated level ${e}`);
        return;
      });
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }

    // if (!level)
    else {
      const newLevel = new Level({
        userId: message.author.id,
        xp: xpToGive,
      });

      await newLevel.save();
      cooldowns.add(message.author.id);
      setTimeout(() => {
        cooldowns.delete(message.author.id);
      }, 60000);
    }
  } catch (error) {
    console.log(`Error giving xp: ${error}`);
  }
};
