import {
  ApplicationCommandRegistries,
  SapphireClient,
} from "@sapphire/framework";
import { getRootData } from "@sapphire/pieces";
import "@sapphire/plugin-editable-commands/register";
import { GatewayIntentBits, Partials } from "discord.js";
import { join } from "path";
import { config } from "./config/app.ts";
import { env } from "./config/env.ts";

// only register commands in the single server
ApplicationCommandRegistries.setDefaultGuildIds([config.settings.serverId]);

export const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],

  defaultPrefix: config.settings.prefixes.commands,
  loadMessageCommandListeners: true,
});

// scan for /interactions instead of /interaction-handler
client.stores
  .get("interaction-handlers")
  .registerPath(join(getRootData().root, "interactions"));

client.login(env.BOT_TOKEN);
