import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { open } from "lmdb";
import path from "path";
import { config } from "../../config/app.ts";
import { dbkeys, dbPath } from "../../constants/db.ts";
import type { CountDB } from "../../types/counting.ts";

const db = open<CountDB, string>(path.join(dbPath, dbkeys.counting), {});

export class CountMessageDelete extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.MessageDelete,
      enabled: config.modules.counting.enabled,
    });
  }

  public async run(message: Message) {
    if (
      message.author.bot ||
      message.channelId !== config.modules.counting.channel
    )
      return;

    const count = Number(message.content.split(" ")[0]);

    if (isNaN(count)) return;

    const data = db.get(dbkeys.counting) ?? {
      lastUser: "",
      lastCount: 0,
      saves: 0,
    };

    const { lastUser, lastCount } = data;

    if (count !== lastCount || message.author.id !== lastUser) return;

    if (message.channel.isSendable())
      await message.channel.send(
        `${message.author} just deleted their count, the next count is still ${lastCount + 1}`,
      );
  }
}
