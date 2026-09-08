import { Command } from "@sapphire/framework";
import type { ChatInputCommandInteraction } from "discord.js";

export class DM extends Command {
  public constructor(context: Command.LoaderContext) {
    super(context, {
      name: "dm",
      description: "Send a message as the bot in someone's dms",
      preconditions: ["OwnerOnly"],
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to send dm to")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("The text to send in the user's dms")
            .setRequired(true),
        ),
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", true);
    const text = interaction.options.getString("text", true);

    await user.send(text);

    await interaction.reply({ content: "DM sent.", ephemeral: true });
  }
}
