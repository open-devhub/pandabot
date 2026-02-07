module.exports = {
  name: "github",
  description: "GitHub organization link",
  aliases: ["gh", "opendevhub", "opendvh", "githublink", "githuborg"],
  callback: async (client, message, args) => {
    try {
      return message.channel.send("https://github.com/open-devhub");
    } catch (err) {}
  },
};
