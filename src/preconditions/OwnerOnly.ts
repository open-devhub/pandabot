import { Precondition } from "@sapphire/framework";
import {
  type CommandInteraction,
  type ContextMenuCommandInteraction,
  type Message,
} from "discord.js";

export class OwnerOnly extends Precondition {
  public override async messageRun(message: Message) {
    return this.checkOwner(message.member?.id, message.guild);
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkOwner(interaction.user.id, interaction.guild);
  }

  public override async contextMenuRun(
    interaction: ContextMenuCommandInteraction,
  ) {
    return this.checkOwner(interaction.user.id, interaction.guild);
  }

  private checkOwner(userId: string | undefined, guild: Message["guild"]) {
    if (!guild) {
      return this.error({
        message: "This command can only be used in a server.",
      });
    }

    return userId === guild.ownerId
      ? this.ok()
      : this.error({
          message: "You must be the owner to run this command!",
        });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}
