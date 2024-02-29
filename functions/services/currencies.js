
const functions = require('firebase-functions/v1');
const admin = require("firebase-admin");
const transakApi = require("../api/transak")
const forexApi = require("../api/forex")
const FIAT_LEVELS = [
    1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 75,
    100, 200,
  ];

//
//
//------DEPOSIT RELATED IS BELOW THIS ------
//
//

const addDepositCurrency = async ({ currency }) => {
    const transakFiatCurrencies = await transakApi.fetchFiatCurrencies()
    
    const myTransakFiatCurrency = transakFiatCurrencies.find((currencyInfo) => currencyInfo.symbol === currency)
    if (!myTransakFiatCurrency) {
        return {status:404}
    }
    const allPaymentOptions = myTransakFiatCurrency.paymentOptions
    const myPaymentOptionInfo = allPaymentOptions.find((paymentOption)=>paymentOption.id === "credit_debit_card")
    if (!myPaymentOptionInfo) {
        return {status:400}
    }
    const minAmount = myPaymentOptionInfo.minAmount
    const definition = { currency,lastUpdateAttempt:Date.now(),fiatAmountMinimum:minAmount,createdAt:new Date() };
    await admin.firestore().collection("depositPrices").doc(currency).set(definition)
    return {status:200}
  };

const updateDepositPrice = async ({currency}) => {
    await admin.firestore().collection("depositPrices").doc(currency).update({lastUpdateAttempt: new Date()})
    const depositDoc = await admin.firestore().collection("depositPrices").doc(currency).get()
    const { fiatAmountMinimum } = depositDoc.data()
    const levels = FIAT_LEVELS;//lastUpdateAttempt
    const prices = {};
    for (const multiplier of levels) {
        const fiatAmount = multiplier * fiatAmountMinimum;
        const cryptoAmount = await transakApi.apiFetchDepositPrice({
            currency,
            fiatAmount,
        });
        const price = fiatAmount / cryptoAmount;
        const levelName = multiplier.toFixed(0).toString();
        prices[levelName] = price;
    }
    
    const update = { prices: prices };
    await admin.firestore().collection("depositPrices").doc(currency).update(update)

}

const fetchDepositCurrencyForUpdate = async () => {
    const depositCurrenciesRef = admin.firestore().collection("depositPrices")
    const snapshot = await depositCurrenciesRef.orderBy("lastUpdateAttempt").limit(1).get()
    // query(depositCurrenciesRef, orderBy("lastUpdateAttempt"), limit(1));
    const currs = []
    snapshot.forEach((doc)=> {
        const currency = doc.id
        currs.push(currency)
    })
    const oldestCur = currs[0]
    return oldestCur
}


//
//
//------WITHDRAW RELATED IS BELOW THIS ------
//
//




const initBatchWithdrawCurrencies = async () => {
    const latestRatesMap = await forexApi.fetchLatestRates()
    for (const [currency, value] of Object.entries(latestRatesMap)) {
        const definition = {currency,value,createdAt:new Date()}
        await admin.firestore().collection("withdrawValues").doc(currency).set(definition)
    }
    return
};

const updateAllWithdrawValues = async () => {
    const latestRatesMap = await forexApi.fetchLatestRates()
    for (const [currency, value] of Object.entries(latestRatesMap)) {
        try {
            await admin.firestore().collection("withdrawValues").doc(currency).update({value})

        } catch (e) {
            functions.logger.log(e)
            throw new Error("error with updateAllWithdrawValues")
        }
    }
    return
}



module.exports = {addDepositCurrency,updateDepositPrice,updateAllWithdrawValues,fetchDepositCurrencyForUpdate,initBatchWithdrawCurrencies}