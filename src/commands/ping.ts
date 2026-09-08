import { Command } from "@sapphire/framework";
import { send } from "@sapphire/plugin-editable-commands";
import type { ChatInputCommandInteraction, Message } from "discord.js";

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: "ping",
      aliases: ["pong"],
      description: "Ping bot to see if it is alive",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public async messageRun(message: Message) {
    if (message.author.bot) return;

    const msg = await send(message, "Ping :3");

    const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
      msg.createdTimestamp - message.createdTimestamp
    }ms.`;

    return msg.edit(content);
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const msg = await interaction.reply("Ping :3");

    const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
      msg.createdTimestamp - interaction.createdTimestamp
    }ms.`;

    return msg.edit(content);
  }
}
