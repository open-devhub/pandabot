import { Precondition } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type CommandInteraction,
  type ContextMenuCommandInteraction,
  type Message,
} from "discord.js";

export class AdminOnly extends Precondition {
  public override async messageRun(message: Message) {
    return this.checkAdmin(
      message.member?.permissions.has(PermissionFlagsBits.Administrator),
      message.guild,
    );
  }

  public override async chatInputRun(interaction: CommandInteraction) {
    return this.checkAdmin(
      interaction.memberPermissions?.has(PermissionFlagsBits.Administrator),
      interaction.guild,
    );
  }

  public override async contextMenuRun(
    interaction: ContextMenuCommandInteraction,
  ) {
    return this.checkAdmin(
      interaction.memberPermissions?.has(PermissionFlagsBits.Administrator),
      interaction.guild,
    );
  }

  private checkAdmin(
    hasAdminPermission: boolean | undefined,
    guild: Message["guild"],
  ) {
    if (!guild) {
      return this.error({
        message: "This command can only be used in a server.",
      });
    }

    return hasAdminPermission
      ? this.ok()
      : this.error({
          message:
            "You must have the Administrator permission to run this command!",
        });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    AdminOnly: never;
  }
}
