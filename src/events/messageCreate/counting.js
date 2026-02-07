const { serverConfig } = require("../../../config.json");
const { counts } = require("../../states/counting");

module.exports = async (client, message) => {
  try {
    if (!message?.guild) return;
    if (message.author?.bot) return;

    const channel = message.channel;
    const guildId = message.guild.id;
    const key = `${guildId}-${channel.id}`;

    if (channel.id !== serverConfig.countingChannel) return;

    const content = message.content.trim();

    let num = null;

    if (/^[0-9]+$/.test(content)) {
      num = parseInt(content, 10);
    } else if (/^[0-9+\-*/().%\s^]+$/.test(content)) {
      try {
        const safeExpr = content.replace(/\^/g, "**");
        if (/([+\-*/%^]{2,})/.test(safeExpr.replace(/\s+/g, ""))) return;

        const res = Function(`"use strict"; return (${safeExpr})`)();
        if (
          typeof res === "number" &&
          Number.isFinite(res) &&
          Number.isInteger(res)
        ) {
          num = res;
        } else {
          return;
        }
      } catch {
        return;
      }
    } else {
      return;
    }

    const state = counts.get(key) || { lastNum: 0, lastUser: null, saves: 3 };
    if (typeof state.saves !== "number" || state.saves < 0) state.saves = 3;

    if (state.lastNum === 0) {
      if (num === 1) {
        counts.set(key, {
          lastNum: 1,
          lastUser: message.author.id,
          saves: state.saves,
        });
        try {
          await message.react("✅");
        } catch {}
        return;
      } else {
        counts.set(key, { lastNum: 0, lastUser: null, saves: 3 });
        await message.channel.send(
          `${message.author}, the count should start at **1**. Counter has been reset.`,
        );
        return;
      }
    }

    if (message.author.id === state.lastUser) {
      await message.channel.send(
        `${message.author}, you can't count twice in a row.`,
      );
      message.react("💢").catch(() => {});
      return;
    }

    if (num === state.lastNum + 1) {
      const newState = {
        lastNum: num,
        lastUser: message.author.id,
        saves: state.saves,
      };
      counts.set(key, newState);

      try {
        switch (num) {
          case 25:
            await message.react("🌟");
            break;
          case 50:
            await message.react("😎");
            break;
          case 75:
            await message.react("✨");
            break;
          case 100:
            await message.react("💯");
            await message.react("🏆");
            break;
          case 150:
            await message.react("🎉");
            break;
          case 200:
            await message.react("🥳");
            break;
          case 250:
            await message.react("🚀");
            break;
          case 300:
            await message.react("🌕");
            break;
          case 400:
            await message.react("🎆");
            break;
          case 500:
            await message.react("👑");
            break;
          case 750:
            await message.react("🤩");
            break;
          case 1000:
            await message.react("🏅");
            await message.react("🏆");
            await message.react("🎉");
            await message.channel.send(
              `Incredible! We've reached **1000** counts! GGs! 🎉🏆`,
            );
            break;
          default:
            await message.react("✅");
        }
      } catch {}
      return;
    }

    if (state.lastNum >= 100 && state.saves > 0) {
      state.saves -= 1;
      counts.set(key, state);
      await message.channel.send(
        `${message.author}, wrong number — expected **${
          state.lastNum + 1
        }**. You have **${state.saves}** save${
          state.saves === 1 ? "" : "s"
        } left before the counter resets.`,
      );
      return;
    }

    const expected = state.lastNum + 1;
    counts.set(key, { lastNum: 0, lastUser: null, saves: 3 });
    await message.channel.send(
      `${message.author}, wrong number — expected **${expected}**. Counter has been reset, the next number should be **1**`,
    );
    message.react("❌").catch(() => {});
    return;
  } catch (err) {
    console.error("Counting handler error:", err);
  }
};
