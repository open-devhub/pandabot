const { SlashCommandBuilder } = require("discord.js");


const cooldown = new Map();
const COOLDOWN_TIME = 5000; //  5 secnds

const badWords = [
  "fuck",
  "shit",
  "bitch" // Add more words rn
];

const adPatterns = [
  /(https?:\/\/[^\s]+)/gi, // This may avoid promo
  /(discord\.gg\/[^\s]+)/gi,
  /(www\.[^\s]+)/gi
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emojify")
    .setDescription("Convert text into regional indicator emojis")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Text to convert")
        .setRequired(true)
    ),

  name: "emojify",

  async execute(ctx, args) {
    const userId = ctx.user?.id || ctx.author?.id;

  
    if (cooldown.has(userId)) {
      const timeLeft = cooldown.get(userId) + COOLDOWN_TIME - Date.now();
      if (timeLeft > 0) {
        const msg = `⏳ Wait ${Math.ceil(timeLeft / 1000)}s before using this again.`;
        return ctx.reply ? ctx.reply({ content: msg, ephemeral: true }) : ctx.channel.send(msg);
      }
    }
    cooldown.set(userId, Date.now());

    setTimeout(() => cooldown.delete(userId), COOLDOWN_TIME);

  
    let text;
    if (ctx.options) {
      text = ctx.options.getString("text");
    } else {
      text = args.join(" ");
    }

    if (!text) {
      return ctx.reply
        ? ctx.reply("❌ Please provide text.")
        : ctx.channel.send("❌ Please provide text.");
    }

    const lowerText = text.toLowerCase();

  
    if (badWords.some(word => lowerText.includes(word))) {
      return ctx.reply
        ? ctx.reply("🚫 Your message contains inappropriate words.")
        : ctx.channel.send("🚫 Your message contains inappropriate words.");
    }


    if (adPatterns.some(pattern => pattern.test(text))) {
      return ctx.reply
        ? ctx.reply("🚫 Advertisements or links are not allowed.")
        : ctx.channel.send("🚫 Advertisements or links are not allowed.");
    }


    const result = text
      .toLowerCase()
      .split("")
      .map(char => {
        if (/[a-z]/.test(char)) {
          return `:regional_indicator_${char}:`;
        }
        if (char === " ") return "   ";
        return char;
      })
      .join("");


    if (ctx.reply) {
      return ctx.reply(result);
    } else {
      return ctx.channel.send(result);
    }
  }
};
