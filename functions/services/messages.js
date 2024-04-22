const admin = require("firebase-admin");
const functions = require("firebase-functions");

const saveMessage = async ({ body, role, roomId }) => {
  const myUserDoc = await admin
    .firestore()
    .collection("users")
    .doc(roomId)
    .get();
  const { email } = myUserDoc.data();
  const definition = { body, role, roomId, createdAt: new Date(), email };
  await admin.firestore().collection("messages").add(definition);
  return;
};

const fetchMessages = async ({ roomId }) => {
  const allMessages = await admin
    .firestore()
    .collection("messages")
    .where("roomId", "==", roomId)
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return allMessages;
}; //this should only ever be called by admin, cuz on web you should be caloling next api db instead
//this one contains an email field which is useful on admin but not on web

module.exports = { saveMessage, fetchMessages };
