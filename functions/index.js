/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions/v1');
const currencyServices = require("./services/currencies")
const depositServices = require("./services/deposits")
const transakApi = require("./api/transak")
const admin = require("firebase-admin");
admin.initializeApp();


exports.currenciesInitBatchWithdrawCurrencies = functions.https.onRequest(async (req, res) => {
    await currencyServices.initBatchWithdrawCurrencies()
    res.status(200).send()
});

exports.currenciesUpdateAllWithdrawalValues = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async (context) => {
    await currencyServices.updateAllWithdrawValues()    
    return null;
  });
exports.currenciesInitDepositCurrency = functions.https.onRequest(async (req, res) => {
    const {currency} = req.body
    await currencyServices.addDepositCurrency({ currency });
    res.status(200).send()
});
exports.currenciesUpdateEarliestDepositPrice = functions.pubsub
  .schedule("every 10 minutes")
  .onRun(async (context) => {
    const hardcodedCurrency = req.body.currency
    await currencyServices.updateDepositPrice({currency: hardcodedCurrency || await currencyServices.fetchDepositCurrencyForUpdate()})
    return null;
  });


exports.depositsMercuryoDepositSuccessWebhook = functions.https.onRequest(async (req, res) => {
    const payload = req.body;
    await depositServices.processMercuryoWebhook(payload);
    res.status(200).send()
});

exports.depositsTransakDepositSuccessWebhookProduction = functions.https.onRequest(async (req, res) => {
    const payload = req.body.data;
    const isProd = true
    await depositServices.processTransakWebhook({payload,isProd:isProd});
    res.status(200).send()
});
exports.depositsTransakDepositSuccessWebhookStaging = functions.https.onRequest(async (req, res) => {
    const payload = req.body.data;
    const isProd = false
    await depositServices.processTransakWebhook({payload,isProd:isProd});
    res.status(200).send()
});

exports.depositsUpdateTransakToken = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const isProds = [true,false]
    for (const isProd of isProds) {

        const result = await transakApi.refreshAccessToken({isProd});
        const freshAccessToken = result.accessToken;
        functions.logger.log("freshAccessToken transak", freshAccessToken)
        const expiration = result.expiresAt;
        const docName = isProd ? "production" : "staging"
        await admin.firestore().collection("transakTokens").doc(docName).set({value:freshAccessToken, expiration:new Date(expiration*1000)})
    }

    return null;
  });



// exports.testEnvWorks = functions.https.onRequest(async (req, res) => {
//   const isProds = [true,false]
//   for (const isProd of isProds) {

//       const result = await transakApi.refreshAccessToken({isProd});
//       const freshAccessToken = result.accessToken;
//       functions.logger.log("freshAccessToken transak", freshAccessToken)
//       const expiration = result.expiresAt;
//       const docName = isProd ? "production" : "staging"
//       await admin.firestore().collection("transakTokens").doc(docName).set({value:freshAccessToken, expiration})
//   }    
//   res.status(200).send()
// });
// NOW remaining: 
// 1. on Doc creates and analytics hook up
// 
// 
