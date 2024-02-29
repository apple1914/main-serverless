const axios = require("axios");
const querystring = require("node:querystring");
const {TRANSAK_API_KEY_PROD,TRANSAK_API_KEY_TEST,TRANSAK_SECRET_PROD,TRANSAK_SECRET_TEST} = require("../utils/transakKeyConfig")

const refreshAccessToken = async ({isProd}) => {
  const baseUrl = isProd ? "https://api.transak.com" : "https://api-stg.transak.com"
  const apiKey = isProd ? TRANSAK_API_KEY_PROD : TRANSAK_API_KEY_TEST
  const TRANSAK_SECRET = isProd ? TRANSAK_SECRET_PROD : TRANSAK_SECRET_TEST

  const url = `${baseUrl}/partners/api/v2/refresh-token`;
  const payload = { apiKey: apiKey };
  const headers = {
    "Content-Type": "application/json",
    "api-secret": TRANSAK_SECRET,
  };
  return axios
    .post(url, payload, { headers })
    .then((res) => {
      return res.data.data;
    })
    .catch((err) => {
      console.log("ERROR WITH refreshAccessToken transak");
      console.log(err);
    });
};

const fetchFiatCurrencies = async () => {
  //always test
  const baseUrl = "https://api-stg.transak.com"
  const apiKey = TRANSAK_API_KEY_TEST

  const url =
    baseUrl +
    "/api/v2/currencies/fiat-currencies" +
    "?apiKey" + apiKey

  return axios.get(url).then((res)=>res.data.response).catch((err)=>console.log(err))
}

const apiFetchDepositPrice = async ({ currency, fiatAmount }) => {
  //always test
  const apiKey = TRANSAK_API_KEY_TEST
  const baseUrl = "https://api-stg.transak.com"

  const payload = {
    partnerApiKey: apiKey,
    fiatCurrency: currency,
    fiatAmount,
    cryptoCurrency: "USDT",
    isBuyOrSell: "BUY",
    network: "bsc",
    paymentMethod: "credit_debit_card",
  };
  const url =
  baseUrl +
    "/api/v1/pricing/public/quotes" +
    "?" +
    querystring.encode(payload);
  return axios
    .get(url)
    .then((res) => {
      const cryptoValue = res.data.response.cryptoAmount;
      return cryptoValue;
    })
    .catch((err) => {
      console.log("err with transak apiFetchDepositPrice", err)
      console.log("err.response with transak apiFetchDepositPrice", err.response)
      console.log("err.response.data with transak apiFetchDepositPrice", err.response.data)

    });
};

module.exports = { refreshAccessToken,apiFetchDepositPrice,fetchFiatCurrencies };
