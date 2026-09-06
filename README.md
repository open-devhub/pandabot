<div align="center">

# 🐼 Panda Bot

**The all-in-one Discord bot powering the DevHub server.**

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](./LICENSE)
[![Made with discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![Runtime: Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1?logo=bun&logoColor=white)](https://bun.sh)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

Panda is a [self hostable] discord bot that keeps DevHub engaging, organized, and fun with community management, gamification, and a little bit of magic.

</div>

## ✨ Features

| Feature              | Description                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Welcome System**   | Greets new members with embeds in the server **and** via DM, plus a sticky introduction message with 👋 reactions. |
| **Ticketing System** | Clean support-ticket creation and management with transcripts and an admin log channel.                            |
| **Starboard**        | Messages that reach enough reactions are promoted to the starboard channel.                                        |
| **Suggestions**      | Collect, queue, vote on, and mark community suggestions as implemented.                                            |
| **Counting Game**    | Classic counting-channel game with a per-user count leaderboard, plus reset/set-count tools.                       |
| **AFK System**       | Set an AFK status and get notified when someone pings you.                                                         |
| **Rule Lookup**      | Instantly fetch any rule embed with `?r<number>`.                                                                  |
| **Moderation Tools** | Purge, lock/unlock, hide/unhide, slowmode, and a user-report context menu.                                         |
| **Macros**           | Quick community macros triggered with the `++` prefix.                                                             |

## 🛠️ Tech Stack

- **[Sapphirejs](https://sapphirejs.dev)**: Discord bot framework
- **[discord.js](https://discord.js.org)** v14: Discord API
- **[Bun](https://bun.sh)**: runtime & package manager
- **[LMDB](https://www.mongodb.com)**: persistent local storage

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- A [Discord application](https://discord.com/developers/applications) with a bot token

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-username/pandabot.git
   cd pandabot
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure your environment**

   Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

   Then set your Discord token in `.env`.

4. **Run the bot**

   ```bash
   bun start        # production
   bun dev          # development with watch mode
   ```

## 🤝 Contributing

We welcome contributions! Open an issue or submit a pull request.

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guide.

## 📜 License

Panda Bot is released under the **GPL-3.0** License. See [LICENSE](./LICENSE) for details.
