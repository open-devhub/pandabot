const { serverConfig } = require("../../../config.json");

module.exports = {
  name: "rules",
  description: "Sends link to rule channel",
  aliases: ["rule", "communityrules"],
  callback: async (client, message, args) => {
    try {
      const rulesChannel = serverConfig.rulesChannel;
      const info = `Rules aren’t here to kill the vibe, they’re here to keep the community strong. Please have a quick peek at <#${rulesChannel}> when you can.`;
      return message.channel.send(info);
    } catch (err) {}
  },
};
