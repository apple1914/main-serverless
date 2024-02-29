
const functions = require('firebase-functions/v1');
const admin = require("firebase-admin");

const saveOnrampLog = async ({ data, depositId,eventName }) => {
  const mylogs = new OnrampLogs({
    data: !!data ? data : {},
    depositId,
    eventName:eventName
  });
  const definition = {depositId,eventName,data}
  await admin.firestore().collection("onrampLogs").add(definition)
  return
};

module.exports = { saveOnrampLog };
