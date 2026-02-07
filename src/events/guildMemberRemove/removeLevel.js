const Level = require("../../models/Level");

module.exports = async (client, member) => {
  if (!member || !member.id) return;

  try {
    const deleted = await Level.findOneAndDelete({ userId: member.id });
  } catch (err) {
    console.error("Error removing level document on guildMemberRemove:", err);
  }
};
