const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const transakApi = require("../api/transak");
const mercuryoApi = require("../api/mercuryo");
const forexApi = require("../api/forex");
const {
  MERCURYO_BUY_CURRENCY,
} = require("../utils/hardcodedCryptocurrencies.js");

const FIAT_LEVELS = [1, 1.25, 1.5, 2.5];
//fetchDepositMinimum
//
//
//------DEPOSIT RELATED IS BELOW THIS ------
//
//

const addDepositCurrency = async ({ currency }) => {
  const mercuryoResult = await mercuryoApi.fetchDepositMinimum({
    currency,
    cryptocurrency: MERCURYO_BUY_CURRENCY,
  });
  const fiatAmountMinimumFromMerc = mercuryoResult[currency]["min"];
  const fiatAmountMinimum = Number(fiatAmountMinimumFromMerc);
  const definition = {
    currency,
    lastUpdateAttempt: Date.now(),
    fiatAmountMinimum: fiatAmountMinimum,
    createdAt: new Date(),
  };
  await admin
    .firestore()
    .collection("depositPrices")
    .doc(currency)
    .set(definition);
  return { status: 200 };
};

const updateDepositPrice = async ({ currency }) => {
  await admin
    .firestore()
    .collection("depositPrices")
    .doc(currency)
    .update({ lastUpdateAttempt: new Date() });
  const depositDoc = await admin
    .firestore()
    .collection("depositPrices")
    .doc(currency)
    .get();
  const { fiatAmountMinimum } = depositDoc.data();
  const levels = FIAT_LEVELS; //lastUpdateAttempt
  const prices = {};
  for (const multiplier of levels) {
    const fiatAmount = multiplier * fiatAmountMinimum;
    const result = await mercuryoApi.apiFetchDepositPrice({
      currency,
      fiatAmount,
      cryptocurrency: MERCURYO_BUY_CURRENCY,
    });
    const cryptoAmount = Number(result.amount);
    const price = fiatAmount / cryptoAmount;
    const levelName = multiplier.toFixed(0).toString();
    prices[levelName] = price;
  }

  const update = { prices: prices };
  await admin
    .firestore()
    .collection("depositPrices")
    .doc(currency)
    .update(update);
};

const fetchDepositCurrencyForUpdate = async () => {
  const depositCurrenciesRef = admin.firestore().collection("depositPrices");
  const snapshot = await depositCurrenciesRef
    .orderBy("lastUpdateAttempt")
    .limit(1)
    .get();
  // query(depositCurrenciesRef, orderBy("lastUpdateAttempt"), limit(1));
  const currs = [];
  snapshot.forEach((doc) => {
    const currency = doc.id;
    currs.push(currency);
  });
  const oldestCur = currs[0];
  return oldestCur;
};

//
//
//------WITHDRAW RELATED IS BELOW THIS ------
//
//

const initBatchWithdrawCurrencies = async () => {
  const latestRatesMap = await forexApi.fetchLatestRates();
  for (const [currency, value] of Object.entries(latestRatesMap)) {
    const definition = { currency, value, createdAt: new Date() };
    await admin
      .firestore()
      .collection("withdrawValues")
      .doc(currency)
      .set(definition);
  }
  return;
};

const updateAllWithdrawValues = async () => {
  const latestRatesMap = await forexApi.fetchLatestRates();
  for (const [currency, value] of Object.entries(latestRatesMap)) {
    try {
      await admin
        .firestore()
        .collection("withdrawValues")
        .doc(currency)
        .update({ value });
    } catch (e) {
      functions.logger.log(e);
      throw new Error("error with updateAllWithdrawValues");
    }
  }
  return;
};

module.exports = {
  addDepositCurrency,
  updateDepositPrice,
  updateAllWithdrawValues,
  fetchDepositCurrencyForUpdate,
  initBatchWithdrawCurrencies,
};
