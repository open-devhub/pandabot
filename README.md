<div align="center">

# 🐼 Panda Bot

**The all-in-one Discord bot powering the DevHub server.**

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](./LICENSE)
[![Made with discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![Runtime: Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1?logo=bun&logoColor=white)](https://bun.sh)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

Panda keeps DevHub engaging, organized, and fun — with community management, moderation, gamification, and a little bit of magic.

</div>

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 👋 **Welcome System** | Greets new members with embeds in the server **and** via DM, plus a sticky introduction message with 👋 reactions. |
| 🔐 **Captcha Verification** | New members complete a visual captcha (via DM) before gaining full access; suspended members can verify to restore access. |
| 🎫 **Ticketing System** | Clean support-ticket creation and management with transcripts and an admin log channel. |
| ⭐ **Starboard** | Messages that reach enough reactions are promoted to the starboard channel. |
| 💡 **Suggestions** | Collect, queue, vote on, and mark community suggestions as implemented. |
| 🔢 **Counting Game** | Classic counting-channel game with a per-user count leaderboard, plus reset/set-count tools. |
| 🧑‍💻 **Profiles** | Custom profiles with bio, stack, GitHub, portfolio, hobbies & badge roles (Admin, Developer, VIP, Bug Hunter, and more). |
| 😴 **AFK System** | Set an AFK status and get notified when someone pings you. |
| 📜 **Rule Lookup** | Instantly fetch any rule embed with `p!r<number>`. |
| 🧰 **Moderation Tools** | Purge, lock/unlock, hide/unhide, slowmode, and a user-report context menu. |
| ⚡ **Macros** | Quick community macros triggered with the `++` prefix. |
| 🛠️ **Utility Commands** | Slash + prefix commands: ping, snowflake decoding, DM sending, custom embeds/messages, and more. |

## 🛠️ Tech Stack

- **[discord.js](https://discord.js.org)** v14: Discord API
- **[Bun](https://bun.sh)**: runtime & package manager
- **[MongoDB](https://www.mongodb.com)** (Mongoose): persistent storage
- **[Firebase](https://firebase.google.com)**: cloud services
- **[captcha-canvas](https://www.npmjs.com/package/captcha-canvas)**: verification captchas

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- A [Discord application](https://discord.com/developers/applications) with a bot token
- MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))
- (Optional) Firebase project credentials

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

   Then set your Discord token and MongoDB URI in `.env`.

4. **Run the bot**

   ```bash
   bun start        # production
   bun dev          # development with watch mode
   ```

> [!TIP]
> Slash commands are registered automatically on startup. Set `REGISTER_COMMANDS=false` in `.env` to skip registration.

## 🤝 Contributing

We welcome contributions! Open an issue or submit a pull request — see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guide.

## 📜 License

Panda Bot is released under the **GPL-3.0** License. See [LICENSE](./LICENSE) for details.