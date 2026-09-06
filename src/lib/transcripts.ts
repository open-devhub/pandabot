import type { Client, Message } from "discord.js";

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export async function buildTranscripts(client: Client, messages: Message[]) {
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Transcript</title>
    <style>
      body {
        margin: 0;
        background-color: #313338;
        font-family: "gg sans", "Segoe UI", Helvetica, Arial, sans-serif;
        color: #dbdee1;
      }
      .chat {
        max-width: 900px;
        padding: 20px;
      }
      .message-group {
        display: flex;
        padding: 3px 5px;
      }
      .message-group:has(.avatar) .message-content .header {
        padding-bottom: 5px;
      }
      .message-group:has(.avatar):not(:first-child) {
        margin-top: 12px;
      }
      .message-group:hover {
        background-color: rgba(255, 255, 255, 0.04);
      }
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 16px;
      }
      .message-content {
        flex: 1;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .username {
        font-weight: 500;
        font-size: 16px;
        color: #f2f3f5;
      }
      .timestamp {
        font-size: 12px;
        color: #949ba4;
      }
      .message {
        font-size: 15px;
        line-height: 1.375rem;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .message-wrapper {
        border-radius: 4px;
      }
      .reply {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #b5bac1;
        margin-bottom: 4px;
      }
      .reply-line {
        width: 20px;
        height: 1px;
        background: #4f545c;
        margin-right: 6px;
      }
      .reply span {
        opacity: 0.8;
      }
      .attachment img {
        max-width: 350px;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <div class="chat">
  `;

  let lastAuthor = null;

  for (const msg of messages) {
    try {
      const user = await client.users.fetch(msg.author.id);
      const avatar = user.displayAvatarURL({ size: 64 });
      const time = new Date(msg.createdTimestamp).toLocaleString();
      const sameAuthor = lastAuthor === msg.author.id;

      lastAuthor = msg.author.id;

      let replyHtml = "";

      if (msg.reference?.messageId) {
        const ref = messages.find((m) => m.id === msg.id);

        if (ref) {
          const refUser = await client.users.fetch(ref.author.id);

          replyHtml = `
            <div class="reply">
              <div class="reply-line"></div>
              <span><strong>${escapeHtml(refUser.username)}</strong>: ${escapeHtml(
                ref.content.slice(0, 40),
              )}</span>
            </div>
          `;
        }
      }

      const attachments = msg.attachments
        .map(
          (url) => `
          <div class="attachment">
            <img src="${url}">
          </div>
        `,
        )
        .join("");

      html += `
        <div class="message-group">
          ${
            sameAuthor
              ? `<div style="width:56px;"></div>`
              : `<img class="avatar" src="${avatar}">`
          }

          <div class="message-content">
          ${replyHtml}
            ${
              sameAuthor
                ? ""
                : `
              <div class="header">
                <span class="username">${escapeHtml(user.username)}</span>
                <span class="timestamp">${time}</span>
              </div>
            `
            }

              <div class="message-wrapper">
              <div class="message">${escapeHtml(msg.content || "").trim()}</div>
              ${attachments}
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      console.error(err);
    }
  }

  html += `
    </div>
  </body>
  </html>
  `;

  return html;
}
