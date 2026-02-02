const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { serverConfig } = require('../../../config.json');
const { createDocument, getDocument } = require('../../utils/firestore');

const BASE_TIMEOUT_MINUTES = 30;
const BLOCK_LIMIT = 3;

const warningCooldowns = new Map();
let lastUpdate = Date.now();

const MOD_PING_COOLDOWN_MS = 10 * 60 * 1000;
const modPingCooldowns = new Map();
let lastModPingClear = Date.now();

function wildcardToRegex(word) {
  const escaped = word.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped.replace(/\*/g, '.*'), 'i');
}

module.exports = async (client, message) => {
  try {
    if (!message.guild || message.author.bot) return;

    if (Date.now() - lastModPingClear > 60 * 60 * 1000) {
      modPingCooldowns.clear();
      lastModPingClear = Date.now();
    }

    const me = message.guild.members.me;
    if (!me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;

    const filePath = path.join(__dirname, '../../data/blacklist.txt');

    const patterns = fs
      .readFileSync(filePath, 'utf8')
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean)
      .map(wildcardToRegex);

    const words = message.content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, ' ')
      .split(/\s+/);

    let count = 0;
    for (const word of words) {
      if (patterns.some((regex) => regex.test(word))) count++;
    }

    if (count === 0) return;

    const now = Date.now();
    if (now - lastUpdate > 120 * 60 * 1000) {
      warningCooldowns.clear();
    }

    await message.delete().catch(() => {});

    lastUpdate = now;

    let userWarnings = warningCooldowns.get(message.author.id) || [];
    userWarnings = userWarnings.filter((time) => now - time < 120 * 60 * 1000);

    const member = await message.guild.members.fetch(message.author.id);

    if (count >= BLOCK_LIMIT || userWarnings.length >= 3) {
      const warnDoc = await getDocument('warns', member.id);
      const warns = warnDoc.exists() ? warnDoc.data().warns || [] : [];
      const durationMinutes =
        warns.length > 0
          ? warns.length * BASE_TIMEOUT_MINUTES
          : BASE_TIMEOUT_MINUTES;
      const timeoutDuration = durationMinutes * 60 * 1000;

      if (!member.isCommunicationDisabled()) {
        await member.timeout(timeoutDuration, `Repeated use of blocked words`);
      }

      const { default: prettyMs } = await import('pretty-ms');

      const embed = new EmbedBuilder()
        .setTitle('Timeout Applied')
        .setColor(0x5865f2)
        .addFields(
          { name: 'User', value: member.toString(), inline: true },
          { name: 'Moderator', value: client.user.toString(), inline: true },
          {
            name: 'Duration',
            value: prettyMs(timeoutDuration),
            inline: true,
          },
          {
            name: 'Reason',
            value: `Repeated use of blocked words`,
          },
        )
        .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

      const logChannel =
        message.guild.channels.cache.get(serverConfig.botCommandsChannel) ||
        null;

      if (logChannel && message.channel.id !== logChannel.id) {
        await logChannel.send({ embeds: [embed] });
      }
    } else {
      userWarnings.push(now);
      warningCooldowns.set(message.author.id, userWarnings);

      const { warnRoles } = serverConfig;
      const { warn1, warn2, warn3 } = warnRoles;

      const hasWarn1 = member.roles.cache.has(warn1);
      const hasWarn2 = member.roles.cache.has(warn2);
      const hasWarn3 = member.roles.cache.has(warn3);

      let warnLevel = 1;

      if (!hasWarn1 && !hasWarn2 && !hasWarn3) {
        await member.roles.add(warn1);
        warnLevel = 1;
      } else if (hasWarn1 && !hasWarn2) {
        await member.roles.remove(warn1).catch(() => {});
        await member.roles.add(warn2);
        warnLevel = 2;
      } else if (hasWarn2 && !hasWarn3) {
        await member.roles.remove(warn2).catch(() => {});
        await member.roles.add(warn3);
        warnLevel = 3;
      } else {
        warnLevel = 3;
      }

      const warnDoc = await getDocument('warns', member.id);
      let warns = warnDoc.exists() ? warnDoc.data().warns || [] : [];
      warns.push({
        moderatorId: client.user.id,
        reason: 'Used blocked words',
      });
      if (warns.length > 3) warns = warns.slice(-3);
      await createDocument('warns', member.id, { warns });

      await message.channel.send(
        `⚠️ ${message.author}, your message contained blocked words and was removed. This incident will be reported to the staff team`,
      );

      const logChannel =
        message.guild.channels.cache.get(serverConfig.botCommandsChannel) ||
        null;

      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('Warn User')
          .setColor(0xff0000)
          .addFields(
            { name: 'User', value: `${member}`, inline: true },
            { name: 'Moderator', value: `${client.user}`, inline: true },
            { name: 'Warning Count', value: `${warnLevel}`, inline: true },
            { name: 'Reason', value: 'Used blocked words' },
          )
          .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }

      const modLogChannel =
        message.guild.channels.cache.get(serverConfig.modLogChannel) || null;

      if (modLogChannel) {
        const embed = new EmbedBuilder()
          .setTitle('Blocked Words Detected')
          .setColor(0xff0000)
          .addFields(
            { name: 'User', value: `${member}`, inline: true },
            { name: 'Channel', value: `${message.channel}`, inline: true },
            { name: 'Blocked Words Count', value: `${count}`, inline: true },
            { name: 'Warning Count', value: `${warnLevel}`, inline: true },
            { name: 'Message', value: `||${message.content}||`, inline: false },
          )
          .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
          .setTimestamp();

        const userKey = member.id;
        const lastPing = modPingCooldowns.get(userKey) || 0;
        if (Date.now() - lastPing > MOD_PING_COOLDOWN_MS) {
          modPingCooldowns.set(userKey, Date.now());
          await modLogChannel.send({
            content: `<@&${serverConfig.moderatorRoleId}>`,
            embeds: [embed],
          });
        } else {
          await modLogChannel.send({ embeds: [embed] });
        }
      }
    }
  } catch (err) {
    console.error('BlockWords Error:', err);
  }
};
