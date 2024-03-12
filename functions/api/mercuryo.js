const axios = require("axios");
const { MERCURYO_WIDGET_ID_TEST } = require("../utils/transakKeyConfig");
const functions = require("firebase-functions");
const apiFetchDepositPrice = async ({
  currency,
  fiatAmount,
  cryptocurrency,
}) => {
  //always test
  functions.logger.log(
    "cryptocurrency we're fetching for is: ",
    cryptocurrency
  );
  const widgetId = MERCURYO_WIDGET_ID_TEST;
  const baseUrl = "https://api.mercuryo.io";

  const payload = {
    from: currency,
    to: cryptocurrency,
    amount: fiatAmount,
    widgetId,
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
  const widgetId = MERCURYO_WIDGET_ID_TEST;
  const baseUrl = "https://api.mercuryo.io";

  const payload = {
    from: currency,
    to: cryptocurrency,
    widgetId,
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

module.exports = { apiFetchDepositPrice, fetchDepositMinimum };
