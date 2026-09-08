import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { EmbedBuilder, Events } from "discord.js";
import { open } from "lmdb";
import path from "path";
import { config } from "../../config/app.ts";
import { colors } from "../../constants/colors.ts";
import { dbkeys, dbPath } from "../../constants/db.ts";
import type { AFKDB } from "../../types/afk.ts";

const db = open<AFKDB, string>(path.join(dbPath, dbkeys.afk), {
  compression: true,
});

export class AFKBack extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
      enabled: config.modules.afk.enabled,
    });
  }

  public async run(message: Message) {
    if (message.author.bot) return;

    const entry = db.get(message.author.id);

    if (!entry) return;

    const embed = new EmbedBuilder()
      .setDescription(
        `Welcome back, ${message.author}! Your AFK status has been removed.`,
      )
      .setAuthor({
        name: message.author.displayName,
        iconURL: message.author.displayAvatarURL(),
      })
      .setFooter({
        text: `recieved ${entry.mentions ?? 0} mentions while AFK`,
      })
      .setColor(colors.success);

    db.remove(message.author.id);

    const msg = await message.reply({ embeds: [embed] });

    setTimeout(async () => await msg.delete(), 15_000);
  }
}
