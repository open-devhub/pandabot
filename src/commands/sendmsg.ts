import { Command } from "@sapphire/framework";
import type { ChatInputCommandInteraction } from "discord.js";

export class SendMessage extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: "sendmsg",
      description: "Send a message as the bot",
      preconditions: ["AdminOnly"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("The text to send in the current channel")
            .setRequired(true),
        ),
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString("text", true);

    if (interaction.channel?.isSendable()) await interaction.channel.send(text);

    await interaction.reply({ content: "Text sent.", ephemeral: true });
  }
}
