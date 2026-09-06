import { Listener } from "@sapphire/framework";
import type { GuildMember } from "discord.js";
import { Events } from "discord.js";
import { open } from "lmdb";
import path from "path";
import { dbkeys, dbPath } from "../../constants/db.ts";
import type { AFKDB } from "../../types/afk.ts";

const afkDB = open<AFKDB, string>(path.join(dbPath, dbkeys.afk), {
  compression: true,
});

export class DBCleanup extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options,
  ) {
    super(context, {
      ...options,
      event: Events.GuildMemberRemove,
    });
  }

  public run(member: GuildMember) {
    if (member.user.bot) return;

    afkDB.remove(member.user.id);
  }
}
