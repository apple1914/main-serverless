const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

const { createWithdrawal } = require("./withdrawals");
const virtualBalanceServices = require("./virtualBalances");
const conversionUtils = require("../utils/conversions");
const jwt = require("jsonwebtoken");
const logServices = require("../services/logs");

const processMercuryoWebhook = async (payload) => {
  const { merchant_transaction_id, amount, currency, type, status } =
    payload.data;
  //save the logs here
  const depositId = merchant_transaction_id.slice(0, -2);
  logServices.saveOnrampLog({
    data: payload,
    depositId,
    eventName: [type, status].join("-"),
    createdAt: new Date(),
  });
  if (type != "withdraw" || status != "completed") {
    return;
  }

  await handleOnrampsWebhookData({
    depositId: depositId,
    cryptocurrency: currency.toUpperCase(),
    cryptoValue: amount,
  });

  return;
};

const processTransakWebhook = async ({ payload, isProd }) => {
  const environment = isProd === false ? "staging" : "production";
  functions.logger.log("environment", { environment });

  const tempAccessTokenDoc = await admin
    .firestore()
    .collection("transakTokens")
    .doc(environment)
    .get();
  functions.logger.log("tempAccessTokenDoc", tempAccessTokenDoc);
  const tempAccessTokenObj = tempAccessTokenDoc.data();
  const acessToken = tempAccessTokenObj.value;
  functions.logger.log("found acessToken", acessToken);

  let decodedPayload;
  try {
    decodedPayload = jwt.verify(payload, acessToken);
  } catch (err) {
    functions.logger.log("Err decoding webhook from transak token!", err);
  }
  if (!decodedPayload) {
    throw new Error(
      "error!!!!processTransakWebhook failed to decipher",
      acessToken
    );
  }

  functions.logger.log("decoded paylaod is", decodedPayload);

  const { eventID, webhookData } = decodedPayload;
  const { status, partnerOrderId, cryptoAmount, cryptoCurrency } = webhookData; //neccesary
  const {
    id,
    walletAddress,
    amountPaid,
    fiatAmount,
    fiatCurrency,
    conversionPrice,
    totalFee,
    referenceCode,
  } = webhookData; //useful for future

  logServices.saveOnrampLog({
    data: webhookData,
    depositId: partnerOrderId,
    eventName: eventID,
    createdAt: new Date(),
  });

  if (status == "COMPLETED" && eventID == "ORDER_COMPLETED") {
    functions.logger.log(
      "successs purchase and received crypto!",
      { eventID },
      webhookData
    );
    await handleOnrampsWebhookData({
      depositId: partnerOrderId,
      cryptocurrency: cryptoCurrency,
      cryptoValue: cryptoAmount,
    });
  }
  return;
};

const handleOnrampsWebhookData = async ({
  depositId,
  cryptocurrency,
  cryptoValue,
}) => {
  functions.logger.log("here at handleOnramps WebhookData", {
    depositId,
    cryptocurrency,
    cryptoValue,
  });
  const myDeposit = await fetchDepositById({ depositId });
  functions.logger.log("found my deposit by Id:", myDeposit, {
    cryptoValue,
    cryptocurrency,
  });

  const usdtAmount = await conversionUtils.parseWebhookCryptoValue({
    cryptoValue: cryptoValue,
    cryptocurrency: cryptocurrency,
  });
  functions.logger.log("usdtAmount:", usdtAmount);
  markPaidById({ depositId });

  if (myDeposit.withdrawal.triggerWithdrawal === true) {
    const withdrawalAddressId = myDeposit.withdrawal.withdrawalAddressId;
    functions.logger.log("onto withdrawqal!!", { withdrawalAddressId });
    await createWithdrawal({
      usdtAmount: usdtAmount,
      withdrawalAddressId,
      username: myDeposit.username,
      ignoreBalance: true,
    }); //TEMP_AWAIT
  } else {
    //either createWtihdrawal with ignroeBalance:true OR addToBalance
    await virtualBalanceServices.addToBalance({
      usdtAmount: usdtAmount,
      username: myDeposit.username,
    });
  }
};
const fetchDepositById = async ({ depositId }) => {
  const myDepositDoc = await admin
    .firestore()
    .collection("deposits")
    .doc(depositId)
    .get();
  const myDeposit = myDepositDoc.data();
  return { ...myDeposit, depositId };
};

const markPaidById = async ({ depositId }) => {
  const update = { completed: true };
  await admin.firestore().collection("deposits").doc(depositId).update(update);
  return;
};

module.exports = {
  processMercuryoWebhook,
  processTransakWebhook,
};
