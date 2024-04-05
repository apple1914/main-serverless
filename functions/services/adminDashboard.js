const admin = require("firebase-admin");
const functions = require("firebase-functions");

const fetchDepositsByUsername = async ({ username }) => {
  const snapshot = await admin
    .firestore()
    .collection("deposits")
    .where("username", "==", username)
    .get();
  const results = [];
  snapshot.forEach((doc) => {
    const depositId = doc.id;
    const { completed, createdAt, fiatAmount, fiatCurrency, withdrawal } =
      doc.data();
    const withdrawalAddressId = withdrawal?.withdrawalAddressId;
    const triggerWithdrawal = withdrawal?.triggerWithdrawal;

    const interResult = {
      depositId,
      completed,
      createdAt,
      fiatAmount,
      fiatCurrency,
      withdrawal: {
        triggerWithdrawal: triggerWithdrawal,
        withdrawalAddressId: withdrawalAddressId,
      },
    };
    results.push(interResult);
  });
  return results;
};

const fetchOnrampLogsByDepositId = async ({ depositId }) => {
  const snapshot = await admin
    .firestore()
    .collection("onrampLogs")
    .where("depositId", "==", depositId)
    .get();
  const results = [];
  snapshot.forEach((doc) => {
    const { createdAt, eventName } = doc.data();
    const [eventType, eventStatus] = eventName.split("-");
    results.push({ createdAt, eventType, eventStatus, eventName });
  });
  return results;
};

const fetchWithdrawalAddressByWithdrawalAddressId = async ({
  withdrawalAddressId,
}) => {
  const myDoc = await admin
    .firestore()
    .collection("withdrawalAddresses")
    .doc(withdrawalAddressId)
    .get();
  const { nickname, address, blockchain } = myDoc.data();
  return { nickname, address, blockchain };
};

const fetchLast50Withdrawals = async () => {
  const snapshot = await admin
    .firestore()
    .collection("withdrawals")
    .orderBy("createdAt")
    .limit(50)
    .get();

  const results = [];
  snapshot.forEach((doc) => {
    const withdrawalId = doc.id;
    const { usdtAmount, withdrawalAddressId, withdrawalAddress, completed } =
      doc.data();
    results.push({
      withdrawalId,
      usdtAmount,
      withdrawalAddressId,
      withdrawalAddress,
      completed,
    });
  });
  return results;
};

const markWithdrawalCompleted = async ({ withdrawalId }) => {
  const update = { completed: true };
  await admin
    .firestore()
    .collection("withdrawals")
    .doc(withdrawalId)
    .update(update);
  return;
};

const setCustomerSupportCurrentAgent = async ({ name }) => {
  const snapshotOldOnDuty = await admin
    .firestore()
    .collection("customerSupportAgents")
    .where("isOnDuty", "==", true)
    .get();
  await admin
    .firestore()
    .collection("customerSupportAgents")
    .doc(snapshotOldOnDuty.docs[0].id)
    .update({ isOnDuty: false });

  const snapshotNewOnDuty = await admin
    .firestore()
    .collection("customerSupportAgents")
    .where("name", "==", name)
    .get();
  await admin
    .firestore()
    .collection("customerSupportAgents")
    .doc(snapshotNewOnDuty.docs[0].id)
    .update({ isOnDuty: true });

  return;
};

const fetchCustomerSupportCurrentAgent = async () => {
  const snapshotOnDuty = await admin
    .firestore()
    .collection("customerSupportAgents")
    .where("isOnDuty", "==", true)
    .get();

  const myAgentDoc = await admin
    .firestore()
    .collection("customerSupportAgents")
    .doc(snapshotOnDuty.docs[0].id)
    .get();
  const { name } = myAgentDoc.data();
  return name;
};

module.exports = {
  fetchDepositsByUsername,
  fetchOnrampLogsByDepositId,
  fetchWithdrawalAddressByWithdrawalAddressId,
  fetchLast50Withdrawals,
  markWithdrawalCompleted,
  fetchCustomerSupportCurrentAgent,
  setCustomerSupportCurrentAgent,
};
