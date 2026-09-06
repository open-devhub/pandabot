import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { Events } from "discord.js";
import { config } from "../../config/app.ts";
import macros from "../../data/macros.json" with { type: "json" };

export class Macros extends Listener {
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

    const macroText = message.content.split(prefix)[1]?.split(" ")[0];

    if (!macroText) return;

    const macro = macros.find(
      (m) => m.c === macroText || m.a?.includes(macroText),
    );

    if (!macro) return;

    if (config.modules.macros.deleteOG) await message.delete();

    if (message.channel.isSendable()) await message.channel.send(macro.r);
  }
}
