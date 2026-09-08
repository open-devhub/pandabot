import { Events, Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { open } from "lmdb";
import path from "path";
import { config } from "../../config/app.ts";
import { dbkeys, dbPath } from "../../constants/db.ts";
import type { CountDB } from "../../types/counting.ts";

const db = open<CountDB, string>(path.join(dbPath, dbkeys.counting), {});

export class Counting extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
      enabled: config.modules.counting.enabled,
    });
  }

  async run(message: Message) {
    if (
      message.channelId !== config.modules.counting.channel ||
      message.author.bot
    )
      return;

    const count = Number(message.content.split(" ")[0]);

    if (isNaN(count)) return;

    const data = db.get(dbkeys.counting) ?? {
      lastUser: "",
      lastCount: 0,
      saves: 0,
    };

    const { lastUser, lastCount, saves } = data;

    if (lastUser && message.author.id === lastUser) {
      return await message.react("⁉️");
    }

    if (count !== lastCount + 1) {
      if (lastCount === 0) {
        await message.react("🫩");

        return message.channel.isSendable()
          ? await message.channel.send(
              `${message.author}, the count has been reset, the next count is 0.`,
            )
          : undefined;
      }

      if (saves > 0) {
        db.put(dbkeys.counting, { lastUser, lastCount, saves: saves - 1 });

        await message.react("❌");

        return message.channel.isSendable()
          ? await message.channel.send(
              `${message.author} burned a save by ruining the count at ${count}! You have ${saves - 1} saves left. The next count is ${lastCount + 1}`,
            )
          : undefined;
      }

      db.put(dbkeys.counting, { lastUser: "", lastCount: 0, saves: 0 });

      return message.channel.isSendable()
        ? await message.channel.send(
            `${message.author} ruined the count at ${count}! Count has been reset, the next number is 1.`,
          )
        : undefined;
    }

    let updatedSaves = saves;

    // rewards (+saves)
    if (count === 100) {
      const savesToAdd = 3;

      updatedSaves += savesToAdd;

      if (message.channel.isSendable())
        await message.channel.send(
          `We've reached ${count} counts!! ${savesToAdd} saves has been added! Keep it up ⚡`,
        );
    } else if (count % 500 === 0) {
      const savesToAdd = Math.min(count / 250, 10);

      updatedSaves += savesToAdd;

      if (message.channel.isSendable())
        await message.channel.send(
          `We've reached ${count} counts!! +${savesToAdd} saves has been added! Keep it up ⚡`,
        );
    }

    db.put(dbkeys.counting, {
      lastUser: message.author.id,
      lastCount: count,
      saves: updatedSaves,
    });

    await message.react("✅");
  }
}
