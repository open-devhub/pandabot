import { Listener } from "@sapphire/framework";
import type { Client } from "discord.js";
import { ActivityType, Events, PresenceUpdateStatus } from "discord.js";
import { logger } from "../../lib/logger.ts";

export class Ready extends Listener {
  public presenceInterval: NodeJS.Timeout | undefined;

  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      // once: true,
      event: Events.ClientReady,
    });
  }

  private setPresence(client: Client) {
    const update = () => {
      client.user?.setPresence({
        activities: [
          {
            name: "too lazy to load commands...",
            type: ActivityType.Listening,
          },
        ],
        status: PresenceUpdateStatus.DoNotDisturb,
      });
    };

    update();

    if (this.presenceInterval) clearInterval(this.presenceInterval);

    this.presenceInterval = setInterval(update, 60 * 60 * 1000);
  }

  public run(client: Client) {
    logger.info(`Logged in as '${client.user?.username}'`);

    this.setPresence(client);
  }
}
