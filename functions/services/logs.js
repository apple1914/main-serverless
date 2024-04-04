const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

const saveOnrampLog = async ({ data, depositId, eventName }) => {
  const definition = { depositId, eventName, data, createdAt: new Date() };
  await admin.firestore().collection("onrampLogs").add(definition);
  functions.logger.log("onrampLog saved");
  return;
};

module.exports = { saveOnrampLog };
