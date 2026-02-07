const { deleteDocument } = require("../../utils/firestore");

module.exports = async (client, member) => {
  try {
    await deleteDocument("warns", member.id);
    await deleteDocument("suspensions", member.id);
  } catch (error) {
    console.error(
      `Error clearing Firestore documents on member leave for ${member.user.tag}:`,
      error,
    );
  }
};
