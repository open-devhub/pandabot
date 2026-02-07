module.exports = {
  name: "dontasktoask",
  description: "dontasktoask.com",
  aliases: ["dontasktoaskjustask"],
  callback: async (client, message, args) => {
    try {
      return message.channel.send("https://dontasktoask.com/");
    } catch (err) {}
  },
};
