
const functions = require('firebase-functions/v1');
const admin = require("firebase-admin");
const cryptoServices = require("./crypto");
const {convertUsdtToCryptoccurency} = require("../utils/conversions");

const createWithdrawal = async (input) => {
  const {
    username,
    withdrawalAddressId, //value to indicate that it can be small or big
    usdtAmount,
  } = input;
  
  if (!withdrawalAddressId) {
    throw new Error("this shouldn't happen");
  }
  if (!usdtAmount) {
    throw new Error("this shouldn't happen");
  }
  const myWithdrawalAddressDoc = await admin.firestore().collection("withdrawalAddress").doc(withdrawalAddressId).get()
  const {blockchain,cryptocurrency,toAddress} = myWithdrawalAddressDoc.data()

  const cryptoValue = await convertUsdtToCryptoccurency({
    usdtAmount: usdtAmount,
    cryptocurrency: cryptocurrency,
  });

  const definition = {
    username,
    withdrawalAddressId: withdrawalAddressId,
    usdtAmount: usdtAmount, //how much should be debited from the virtual baalnce
    cryptoValue: cryptoValue, //instruction for how much crypto to be sent out
    cryptocurrency:cryptocurrency
  };
  const withdrawalDocRef = await admin.firestore().collection("withdrawals").add(definition)
  //withdrawalDocRef.id if need id
  
  const blockchainTransactionId = await cryptoServices.triggerCoinWithdrawal({
    toAddress: toAddress,
    cryptocurrency: cryptocurrency,
    blockchain: blockchain,
    cryptoValue,
  });
  functions.logger.log("withdrawal procesed",{withdrawalId:withdrawalDocRef.id,blockchainTransactionId})
  return { status: 200 };
};


module.exports = {
  createWithdrawal,
};
