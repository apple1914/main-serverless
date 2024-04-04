const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const cryptoServices = require("./crypto");
const virtualBalanceServices = require("./virtualBalances");
const { convertUsdtToCryptoccurency } = require("../utils/conversions");
const createWithdrawal = async (input) => {
  const { username, withdrawalAddressId, usdtAmount, ignoreBalance } = input;

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
  const withdrawalAddress = { address, nickname, blockchain, cryptocurrency };

  const cryptoValue = await convertUsdtToCryptoccurency({
    usdtAmount: usdtAmount,
    cryptocurrency: cryptocurrency,
  });

  const definition = {
    username,
    withdrawalAddressId: withdrawalAddressId,
    usdtAmount: usdtAmount, //how much should be debited from the virtual baalnce
    cryptoValue: cryptoValue, //instruction for how much crypto to be sent out
    cryptocurrency: cryptocurrency,
    createdAt: new Date(),
    completed: false,
    withdrawalAddress: withdrawalAddress,
  };
  const withdrawalDocRef = await admin
    .firestore()
    .collection("withdrawals")
    .add(definition);
  //withdrawalDocRef.id if need id
  if (address.includes("faux")) {
    return { success: true };
  }
  const blockchainTransactionId = await cryptoServices.triggerCoinWithdrawal({
    toAddress: address,
    cryptocurrency: cryptocurrency,
    blockchain: blockchain,
    cryptoValue,
  });
  await admin
    .firestore()
    .collection("withdrawals")
    .doc(withdrawalDocRef.id)
    .update({ blockchainTransactionId });

  if (ignoreBalance === false) {
    await virtualBalanceServices.subtractFromBalance({ username, usdtAmount });
  }

  return { success: true };
};

module.exports = {
  createWithdrawal,
};
