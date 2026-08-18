import { EmbedBuilder } from "discord.js";
import Counting from "../../models/Counting.js";

export default {
  name: "countinglb",
  description: "View the counting leaderboard",
  aliases: ["clb", "countlb", "countingtop"],
  callback: async (client, message, args) => {
  try {
    if (message.author.bot) return;

    const counts = await Counting.find()
      .sort({ counts: -1 })
      .limit(15)
      .select("userId counts -_id");

    const embed = new EmbedBuilder()
      .setTitle("Counting Leaderboard")
      .setColor(0x2b2d31);

    if (counts.length === 0) {
      embed.setDescription("No counts yet!");
    } else {
      embed.setDescription(
        counts
          .map((entry, index) => {
            const isAuthor = entry.userId === message.author.id;
            return `**${index + 1}.** <@${entry.userId}>${isAuthor ? " (You)" : ""} - **${entry.counts}**`;
          })
          .join("\n")
      );
    }

    await message.reply({
      embeds: [embed],
    });
  } catch (error) {
    console.error("Error in countinglb command:", error);
    await message.reply({
      content: "An error occurred while fetching the leaderboard.",
    }).catch(() => {});
  }
},
