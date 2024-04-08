const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const cryptoServices = require("./crypto");
const virtualBalanceServices = require("./virtualBalances");
const { convertUsdtToCryptoccurency } = require("../utils/conversions");
const SUSPEND_WITHDRAWALS = true;

const createWithdrawalFromBalance = async (input) => {
  //TO DO +> move this function to next as well, since it's user triggered
  const { username, withdrawalAddressId, usdtAmount } = input;
  //ASSUME THIS IS THE STRAIGHT WITHDRAWAL
  const ignoreBalance = false;

  const myWithdrawalAddressDoc = await admin
    .firestore()
    .collection("withdrawalAddresses")
    .doc(withdrawalAddressId)
    .get();
  const { blockchain, cryptocurrency, address, nickname } =
    myWithdrawalAddressDoc.data();
  const withdrawalAddress = { address, nickname, blockchain, cryptocurrency };

  const definition = {
    username,
    withdrawalAddressId: withdrawalAddressId,
    usdtAmount: usdtAmount, //how much should be debited from the virtual baalnce
    cryptocurrency: cryptocurrency,
    createdAt: new Date(),
    withdrawalAddress: withdrawalAddress,
    funded: false,
    transacted: false,
    tusti: false,
    ignoreBalance,
  };
  const withdrawalDocRef = await admin
    .firestore()
    .collection("withdrawals")
    .add(definition);
  //withdrawalDocRef.id if need id

  return { success: true, result: { withdrawalId: withdrawalDocRef.id } };
};

const completeWithdrawal = async (input) => {
  const { withdrawalId } = input;

  const myWithdrawalDoc = await admin
    .firestore()
    .collection("withdrawals")
    .doc(withdrawalId)
    .get();
  const { username, usdtAmount, withdrawalAddressId, ignoreBalance } =
    myWithdrawalDoc.data();

  if (ignoreBalance === false) {
    const balance = await virtualBalanceServices.getBalance({ username });
    if (balance < usdtAmount) {
      return { success: false };
    }
  }

  const myWithdrawalAddressDoc = await admin
    .firestore()
    .collection("withdrawalAddresses")
    .doc(withdrawalAddressId)
    .get();
  const { blockchain, cryptocurrency, address, nickname } =
    myWithdrawalAddressDoc.data();

  const cryptoValue = await convertUsdtToCryptoccurency({
    usdtAmount: usdtAmount,
    cryptocurrency: cryptocurrency,
  });
  const update = { transacted: true };

  if (!SUSPEND_WITHDRAWALS) {
    const blockchainTransactionId = await cryptoServices.triggerCoinWithdrawal({
      toAddress: address,
      cryptocurrency: cryptocurrency,
      blockchain: blockchain,
      cryptoValue,
    });
    update["blockchainTransactionId"] = blockchainTransactionId;
    if (!blockchainTransactionId) {
      throw new Error("error completing withdrawal!");
    }
  }

  await admin
    .firestore()
    .collection("withdrawals")
    .doc(withdrawalId)
    .update(update);

  if (ignoreBalance === false) {
    await virtualBalanceServices.subtractFromBalance({ username, usdtAmount });
  }
  return null;
};

const markWithdrawalFunded = async ({ withdrawalId }) => {
  await admin
    .firestore()
    .collection("withdrawals")
    .doc(withdrawalId)
    .update({ funded: true });
  return;
};

module.exports = {
  createWithdrawalFromBalance,
  completeWithdrawal,
  markWithdrawalFunded,
};
