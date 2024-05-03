const web3Apis = require("../api/web3Api");
const { convertUsdtToCryptoccurency } = require("../utils/conversions");

const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const BLOCKCHAIN_FOR_HOLDING_ADDRESS = "polygon";
const blockchainToWithdrawalSettings = {
  bsc: {
    fromAddress: process.env.BSC_DISTRIBUTOR_ADDRESS_PUBLIC_KEY,
    fromAddressPrivateKey: process.env.BSC_DISTRIBUTOR_ADDRESS_PRIVATE_KEY,
  },
  polygon: {
    fromAddress: process.env.POLYGON_DISTRIBUTOR_ADDRESS_PUBLIC_KEY, //same address fro polygon as for bsc
    fromAddressPrivateKey: process.env.POLYGON_DISTRIBUTOR_ADDRESS_PRIVATE_KEY, //same pk fro polygon as for bsc
    cryptocurrency: {
      coin: "MATIC",
      toklen: "USDT",
    },
  },
};
const triggerCoinWithdrawal = async ({
  //assume we only ever withdraw coins
  toAddress,
  blockchain,
  cryptoValue,
}) => {
  functions.logger.log("toAddress", toAddress);

  functions.logger.log("blockchain", blockchain);

  const withdrawalCryptoSettings = blockchainToWithdrawalSettings[blockchain];
  let transactionHash = "n/a";
  try {
    transactionHash = await web3Apis.sendCoins({
      fromAddress: withdrawalCryptoSettings.fromAddress,
      privateKey: withdrawalCryptoSettings.fromAddressPrivateKey,
      toAddress,
      cryptoValue,
      blockchain,
    });
  } catch (e) {
    functions.logger.log(e);
    await admin
      .firestore()
      .collection("globalHoldingAddressSettings")
      .doc("globalHoldingAddressSettings")
      .update({ hasEnoughToSend: false, updatedAt: new Date() });
  }

  return transactionHash;
};

const checkIfHoldingAddressHasEnoughBalance = async () => {
  const blockchain = BLOCKCHAIN_FOR_HOLDING_ADDRESS;
  const withdrawalCryptoSettings = blockchainToWithdrawalSettings[blockchain];
  const { address } = withdrawalCryptoSettings;
  const cryptoValueAvailable = await web3Apis.getBalance({
    address: "0xC6110bcF3749530c0a8F5eDF064bB96631de8757",
    blockchain: "polygon",
  });
  return cryptoValueAvailable;

  const usdtThreshold = 76;
  const cryptoValueThreshold = await convertUsdtToCryptoccurency({
    usdtAmount: usdtThreshold,
    cryptocurrency: withdrawalCryptoSettings.cryptocurrency.coin,
  });
  functions.logger.log("has enough  to send:", {
    answer: cryptoValueAvailable > cryptoValueThreshold,
    cryptoValueAvailable,
    cryptoValueThreshold,
  });
  if (cryptoValueAvailable > cryptoValueThreshold) return true;
  return false;
  //for future if you want to double thhread this to myultiple blockchains, blockchain should NOT be hardcoded
};

module.exports = {
  triggerCoinWithdrawal,
  checkIfHoldingAddressHasEnoughBalance,
};
