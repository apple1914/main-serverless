/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const cors = require("cors")({ origin: true });

const functions = require("firebase-functions/v1");
const currencyServices = require("./services/currencies");
const depositServices = require("./services/deposits");
const withdrawalServices = require("./services/withdrawals");
const userServices = require("./services/users");
const virtualBalanceServices = require("./services/virtualBalances");
const onDocCreateServices = require("./services/onDocCreates");
const adminDashboardServices = require("./services/adminDashboard");

const transakApi = require("./api/transak");
const tronApi = require("./api/tron");
const admin = require("firebase-admin");
admin.initializeApp();

exports.currenciesInitBatchWithdrawCurrencies = functions.https.onRequest(
  async (req, res) => {
    await currencyServices.initBatchWithdrawCurrencies();
    res.status(200).send();
  }
);

exports.currenciesUpdateAllWithdrawalValues = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async (context) => {
    await currencyServices.updateAllWithdrawValues();
    return null;
  });
exports.currenciesInitDepositCurrency = functions.https.onRequest(
  async (req, res) => {
    const { currency } = req.body;
    await currencyServices.addDepositCurrency({ currency });
    res.status(200).send();
  }
);

exports.currenciesUpdateEarliestDepositPrice = functions.pubsub
  .schedule("every 2 minutes")
  .onRun(async (context) => {
    const currency = await currencyServices.fetchDepositCurrencyForUpdate();
    functions.logger.log("chosen currency for update:", currency);
    await currencyServices.updateDepositPrice({ currency: currency });
    return null;
  });

exports.depositsMercuryoDepositSuccessWebhookTest = functions.https.onRequest(
  async (req, res) => {
    const payload = req.body.data;
    functions.logger.log("SHABOINK!", payload);
    await depositServices.processMercuryoWebhook(payload);
    res.status(200).send();
  }
);

exports.depositsMercuryoDepositSuccessWebhook = functions.https.onRequest(
  async (req, res) => {
    const payload = req.body.data;
    functions.logger.log("SHABOINK!", payload);
    await depositServices.processMercuryoWebhook(payload);
    res.status(200).send();
  }
);

exports.depositsTransakDepositSuccessWebhookProduction =
  functions.https.onRequest(async (req, res) => {
    const payload = req.body.data;
    const isProd = true;
    await depositServices.processTransakWebhook({ payload, isProd: isProd });
    res.status(200).send();
  });
exports.depositsTransakDepositSuccessWebhookStaging = functions.https.onRequest(
  async (req, res) => {
    const payload = req.body.data;
    const isProd = false;
    await depositServices.processTransakWebhook({ payload, isProd: isProd });
    res.status(200).send();
  }
);

exports.virtualBalancesAdd5BonusByEmail = functions.https.onRequest(
  async (req, res) => {
    const email = req.query.email;
    const username = await userServices.lookupUsernameByEmail({ email });
    await virtualBalanceServices.addToBalance({
      username: username,
      usdtAmount: 5.0,
    });
    res.status(200).send();
  }
);

exports.depositsUpdateTransakToken = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const isProds = [true, false];
    for (const isProd of isProds) {
      const result = await transakApi.refreshAccessToken({ isProd });
      const freshAccessToken = result.accessToken;
      functions.logger.log("freshAccessToken transak", freshAccessToken);
      const expiration = result.expiresAt;
      const docName = isProd ? "production" : "staging";
      await admin
        .firestore()
        .collection("transakTokens")
        .doc(docName)
        .set({
          value: freshAccessToken,
          expiration: new Date(expiration * 1000),
        });
    }
    return null;
  });

exports.onUserCreate = functions.firestore
  .document("/users/{docId}")
  .onCreate((snap, context) => {
    const userData = snap.data();
    const id = context.params.docId;
    return onDocCreateServices.onUserCreate({ ...userData, id: id });
  });

exports.onWithdrawalAddressCreate = functions.firestore
  .document("/withdrawalAddresses/{docId}")
  .onCreate((snap, context) => {
    const id = context.params.docId;
    const docData = snap.data();
    return onDocCreateServices.onWithdrawalAddressCreate({
      ...docData,
      id: id,
    });
  });
exports.onDepositCreate = functions.firestore
  .document("/deposits/{docId}")
  .onCreate((snap, context) => {
    const id = context.params.docId;
    const docData = snap.data();
    return onDocCreateServices.onDepositCreate({ ...docData, id: id });
  });

exports.onOnrampLogCreate = functions.firestore
  .document("/onrampLogs/{docId}")
  .onCreate((snap, context) => {
    const id = context.params.docId;
    const docData = snap.data();
    return onDocCreateServices.onOnrampLogCreate({ ...docData, id: id });
  });

exports.onUserEventCreate = functions.firestore
  .document("/userEvents/{docId}")
  .onCreate((snap, context) => {
    const id = context.params.docId;
    const docData = snap.data();
    return onDocCreateServices.onUserEventCreate({ ...docData, id: id });
  });

exports.createWithdrawal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    return "Unauthenticated calls are not allowed.";
  }
  const withdrawalAddressId = data.withdrawalAddressId;
  const usdtAmount = data.usdtAmount;
  const username = context.auth.uid;

  const { success } = await withdrawalServices.createWithdrawalFromBalance({
    username,
    usdtAmount,
    withdrawalAddressId,
  });

  return {
    success,
  };
});

exports.triggerWithdrawalTransactionOnWithdrawalFundedStatusChange =
  functions.firestore
    .document("/withdrawals/{docId}")
    .onUpdate((snap, context) => {
      const withdrawalBefore = snap.before.data();
      const withdrawalAfter = snap.after.data();

      if (
        withdrawalBefore.funded === false &&
        withdrawalAfter.funded === true &&
        withdrawalAfter.transacted === false
      ) {
        return withdrawalServices.completeWithdrawal({
          withdrawalId: context.params.docId,
        });
      }
      return null;
    });

exports.fetchUsernameByEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { email } = req.body;
    const username = await userServices.lookupUsernameByEmail({ email });
    if (!username) {
      return res.status(404).send();
    }

    res.status(200).send(username);
  });
});

exports.fetchDepositsByUsername = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { username } = req.body;
    const results = await adminDashboardServices.fetchDepositsByUsername({
      username,
    });
    res.status(200).send(results);
  });
});

exports.fetchOnrampLogsByDepositId = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { depositId } = req.body;
    const results = await adminDashboardServices.fetchOnrampLogsByDepositId({
      depositId,
    });
    res.status(200).send(results);
  });
});

exports.fetchWithdrawalAddressByWithdrawalAddressId = functions.https.onRequest(
  (req, res) => {
    cors(req, res, async () => {
      const { withdrawalAddressId } = req.body;
      const result =
        await adminDashboardServices.fetchWithdrawalAddressByWithdrawalAddressId(
          {
            withdrawalAddressId,
          }
        );
      res.status(200).send(result);
    });
  }
);

exports.fetchLast50Withdrawals = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const results = await adminDashboardServices.fetchLast50Withdrawals();
    res.status(200).send(results);
  });
});

exports.markWithdrawalCompleted = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { withdrawalId } = req.body;

    await adminDashboardServices.markWithdrawalCompleted({
      withdrawalId,
    });
    res.status(200).send();
  });
});

exports.fetchCustomerSupportCurrentAgent = functions.https.onRequest(
  (req, res) => {
    cors(req, res, async () => {
      const result =
        await adminDashboardServices.fetchCustomerSupportCurrentAgent();
      res.status(200).send(result);
    });
  }
); //used

exports.setCustomerSupportCurrentAgent = functions.https.onRequest(
  (req, res) => {
    cors(req, res, async () => {
      const { name } = req.body;
      await adminDashboardServices.setCustomerSupportCurrentAgent({ name });
      res.status(200).send();
    });
  }
);

exports.testDeleteMe = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { username, usdtAmount, withdrawalAddressId } = req.body;
    const { success, result } =
      await withdrawalServices.createWithdrawalFromBalance({
        username,
        usdtAmount,
        withdrawalAddressId,
      });
    res.status(200).send(result);
  });
});
// exports.testDeleteMe = functions.https.onRequest(async (req, res) => {
//   const { toAddress, cryptoValue } = req.body;
//   const blockchain = "tron";
//   const result = await transakApi.tronApi({
//     toAddress,
//     cryptoValue,
//     blockchain,
//   });
//   res.status(200).send(result);
// });

//fetchWithdrawalTrackingInfo
