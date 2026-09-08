import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { Events } from "discord.js";
import { config } from "../../config/app.ts";
import { client } from "../../index.ts";

export class StickyMessages extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.MessageCreate,
      enabled: config.modules.stickyMessages.enabled,
    });
  }

  public async run(message: Message) {
    if (message.author.bot) return;

    const stickyMessages = config.modules.stickyMessages.messages as Record<
      string,
      { content: string; react?: string[] }
    >;

    const stickyMessage = stickyMessages[message.channelId];

    if (!stickyMessage) return;

    (await message.channel.messages.fetch({ limit: 15 }))
      .find(
        (msg) =>
          msg.author.id === client.id && msg.content === stickyMessage.content,
      )
      ?.delete();

    if (message.channel.isSendable())
      await message.channel.send(stickyMessage.content);

    if (stickyMessage.react)
      stickyMessage.react.forEach(async (emoji) => await message.react(emoji));
  }
}
