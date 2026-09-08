import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { EmbedBuilder, Events } from "discord.js";
import { config } from "../../config/app.ts";
import { colors } from "../../constants/colors.ts";
import rules from "../../data/rules.json" with { type: "json" };

export class Rules extends Listener {
  constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
      enabled: config.modules.macros.enabled,
    });
  }

  public async run(message: Message) {
    if (message.author.bot) return;

    const prefix = config.settings.prefixes.macros.find((p) =>
      message.content.startsWith(p),
    );

    if (!prefix) return;

    const ruleNumber = message.content.split(prefix)[1]?.split(" ")[0];

    if (!ruleNumber) return;

    const rule = rules.find((r) => r.c === ruleNumber);

    if (!rule) return;

    if (config.modules.macros.deleteOG) await message.delete();

    const embed = new EmbedBuilder()
      .setTitle(rule.t)
      .setDescription(rule.pts.map((pt) => `- ${pt}`).join("\n"))
      .setColor(colors.primary)
      .setThumbnail(message.guild?.iconURL() ?? null);

    if (message.channel.isSendable())
      await message.channel.send({ embeds: [embed] });
  }
}
