import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { Events } from "discord.js";
import { config } from "../../config/app.ts";
import { client } from "../../index.ts";

export class EasterEggs extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
      enabled: config.modules.easterEggs.enabled,
    });
  }

  public async run(message: Message) {
    if (message.author.bot) return;

    const random = Math.random();

    if (message.mentions.users?.has(client.id || "")) {
      const gifs = [
        "https://klipy.com/gifs/who-pinged-me-ping",
        "https://klipy.com/gifs/who-the-5",
        "https://klipy.com/gifs/slumber-disturb-1",
      ];

      const gif = gifs[Math.floor(Math.random() * gifs.length)];

      const chance = random < 0.05;

      if (chance && gif && message.channel.isSendable())
        await message.channel.send(gif);
    }

    switch (message.content) {
      case "aww":
      case "❤️":
        if (random < 0.1) await message.react("❤️");
        break;

      case "bruh":
      case "lol":
      case "lmao":
      case "seriously":
        if (random < 0.2) await message.react("😂");
        break;

      default:
        if (random < 0.01) await message.react("👀");
        break;
    }
  }
}
