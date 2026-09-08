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

export class AFK extends Listener {
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

    const mentioned = message.mentions.users.first();

    if (!mentioned) return;

    const entry = db.get(mentioned.id);

    if (!entry) return;

    const embed = new EmbedBuilder()
      .setDescription(
        `${mentioned} is currently AFK${entry.reason ? `: ${entry.reason}` : ""}`,
      )
      .setAuthor({
        name: mentioned.displayName,
        iconURL: mentioned.displayAvatarURL(),
      })
      .setColor(colors.primary);

    db.put(mentioned.id, {
      ...entry,
      mentions: (entry.mentions ?? 0) + 1,
    });

    const msg = await message.reply({ embeds: [embed] });

    setTimeout(async () => await msg.delete(), 15_000);
  }
}
