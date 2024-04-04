const admin = require("firebase-admin");
const functions = require("firebase-functions");

const lookupUsernameByEmail = async ({ email }) => {
  const myUserSnapshot = await admin
    .firestore()
    .collection("users")
    .where("email", "==", email)
    .get();
  const usernames = [];
  myUserSnapshot.forEach((doc) => {
    const username = doc.id;
    usernames.push(username);
  });
  return usernames[0];
};

module.exports = { lookupUsernameByEmail };
