const axios = require("axios");
const querystring = require("node:querystring");
const {
  MERCURYO_WIDGET_ID_TEST,
  MERCURYO_WIDGET_ID_PROD,
} = require("../utils/transakKeyConfig");
const functions = require("firebase-functions");
const apiFetchDepositPrice = async ({
  currency,
  fiatAmount,
  cryptocurrency,
  network,
}) => {
  //always test
  functions.logger.log(
    "cryptocurrency we're fetching for is: ",
    cryptocurrency
  );
  const widgetId = MERCURYO_WIDGET_ID_PROD;
  const baseUrl = "https://api.mercuryo.io"; //"https://sandbox-api.mrcr.io"

  const payload = {
    from: currency,
    to: cryptocurrency,
    amount: fiatAmount,
    widget_id: widgetId,
    type: "buy",
    network: network,
  };
  const url =
    baseUrl + "/v1.6/widget/buy/rate" + "?" + querystring.encode(payload);
  return axios
    .get(url)
    .then((res) => {
      return res.data.data;
    })
    .catch((err) => {
      functions.logger.log("err with transak apiFetchDepositPrice", err);
      functions.logger.log(
        "err.response with transak apiFetchDepositPrice",
        err.response
      );
      functions.logger.log(
        "err.response.data with transak apiFetchDepositPrice",
        err.response.data
      );
    });
};

const fetchDepositMinimum = async ({ currency, cryptocurrency }) => {
  const widgetId = MERCURYO_WIDGET_ID_PROD;
  const baseUrl = "https://api.mercuryo.io";

  const payload = {
    from: currency,
    to: cryptocurrency,
    widget_id: widgetId,
  };
  const url =
    baseUrl +
    "/v1.6/public/currency-limits" +
    "?" +
    querystring.encode(payload);
  return axios
    .get(url)
    .then((res) => {
      return res.data.data;
    })
    .catch((err) => {
      functions.logger.log("err with transak fetchDepositMinimum", err);
      functions.logger.log(
        "err.response with transak fetchDepositMinimum",
        err.response
      );
      functions.logger.log(
        "err.response.data with transak fetchDepositMinimum",
        err.response.data
      );
    });
};

const fetchDepositMinimumFake = async ({ currency, cryptocurrency }) => {
  const mins = {
    USD: 28,
    GBP: 22,
    EUR: 25,
    ARS: 24000,
    AUD: 42,
    BRL: 140,
    CAD: 37,
    CHF: 24,
    COP: 110000,
    CZK: 640,
    HKD: 220,
    ILS: 100,
    JPY: 4000,
    PLN: 110,
    RON: 125,
    SEK: 285,
    TRY: 880,
    VND: 700000,
  };
  const answer = mins[currency];
  const finalResult = {};
  finalResult[currency] = {
    min: answer,
  };
  return finalResult;
};

module.exports = {
  apiFetchDepositPrice,
  fetchDepositMinimum,
  fetchDepositMinimumFake,
};
