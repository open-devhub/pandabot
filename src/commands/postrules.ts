import { Command } from "@sapphire/framework";
import type { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";
import { config } from "../config/app.ts";
import { colors } from "../constants/colors.ts";
import rules from "../data/rules.json" with { type: "json" };

export class PostRules extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: "postrules",
      aliases: ["rules"],
      description: "Server rules",
      preconditions: ["AdminOnly"],
    });
  }

  public async messageRun(message: Message) {
    if (message.author.bot) return;

    const ruleList = rules
      .map((rule) =>
        [`### ${rule.t}`, rule.pts.map((pt) => `- ${pt}`).join("\n")].join(
          "\n",
        ),
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`${message.guild?.name} Server Rules`)
      .setDescription(ruleList)
      .setColor(colors.primary)
      .setThumbnail(message.guild?.iconURL() ?? null);

    if (message.channel.isSendable())
      await message.channel.send({ embeds: [embed] });

    if (config.modules.macros.deleteOG) await message.delete();
  }
}
