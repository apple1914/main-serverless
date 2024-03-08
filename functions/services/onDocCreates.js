const analyticServices = require("./analytics");
const depositServices = require("./deposits");
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const virtualBalanceServices = require("./virtualBalances");

const onUserCreate = async (doc) => {
  functions.logger.log("triggered: onUserCreate");
  await virtualBalanceServices.createBalance({ username: doc.id });
  await analyticServices.reportEvent({
    username: doc.id,
    eventName: "signup",
    insertId: doc.id,
    userProps: { utm_campaign: doc.utm_campaign },
  });
};

const onWithdrawalAddressCreate = async (doc) => {
  functions.logger.log("triggered: onWithdrawalAddressCreate");

  await analyticServices.reportEvent({
    username: doc.username,
    eventName: "add-wiithdrawal-address",
    insertId: doc.id,
  });
};

const onDepositCreate = async (doc) => {
  functions.logger.log("triggered: onDepositCreate");

  await analyticServices.reportEvent({
    username: doc.username,
    eventName: "create-deposit",
    insertId: doc.id,
  });
};

const onOnrampLogCreate = async (doc) => {
  functions.logger.log("triggered: onOnrampLogCreate");
  const myDeposit = await depositServices.fetchDepositById({
    depositId: doc.depositId,
  });
  const username = myDeposit.username;
  const eventName = doc.eventName;
  await analyticServices.reportEvent({
    username: username,
    eventName: eventName,
    insertId: doc.id,
  });
};

const onUserEventCreate = async (doc) => {
  functions.logger.log("triggered: onUserEventCreate");
  await analyticServices.reportEvent({
    username: doc.username,
    eventName: doc.eventName,
    insertId: doc.id,
  });
};

module.exports = {
  onOnrampLogCreate,
  onUserCreate,
  onWithdrawalAddressCreate,
  onDepositCreate,
  onUserEventCreate,
};
