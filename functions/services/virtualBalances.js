const admin = require("firebase-admin");
const functions = require("firebase-functions");

const getBalance = async ({ username }) => {
  const myBalanceDoc = await admin
    .firestore()
    .collection("virtualBalances")
    .doc(username)
    .get();
  if (!myBalanceDoc.exists) {
    return undefined;
  }
  const myBalance = myBalanceDoc.data();
  return myBalance.value;
};

const createBalance = async ({ username }) => {
  const oldBalance = await getBalance({ username });
  if (!!oldBalance) {
    functions.logger.log("virtual balance already exists for", { username });
    throw new Error("virtual baalnce already exists for user!");
  }
  const definition = { value: 0.0, createdAt: new Date() };
  await admin
    .firestore()
    .collection("virtualBalances")
    .doc(username)
    .set(definition);
  return;
};

const addToBalance = async ({ username, usdtAmount }) => {
  await admin
    .firestore()
    .collection("virtualBalances")
    .doc(username)
    .update({
      value: admin.firestore.FieldValue.increment(usdtAmount),
    });
};

const subtractFromBalance = async ({ username, usdtAmount }) => {
  await admin
    .firestore()
    .collection("virtualBalances")
    .doc(username)
    .update({
      value: admin.firestore.FieldValue.increment(-1 * usdtAmount),
    });
};

module.exports = {
  getBalance,
  createBalance,
  addToBalance,
  subtractFromBalance,
};
