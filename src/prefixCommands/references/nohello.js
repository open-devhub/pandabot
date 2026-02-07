module.exports = {
  name: "nohello",
  description: "nohello.net",
  callback: async (client, message, args) => {
    try {
      return message.channel.send("https://nohello.net/");
    } catch (err) {}
  },
};
