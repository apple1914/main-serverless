const axios = require("axios");
const blockchainSettingsChainegateway = {
  bsc: { blockchain: "bsc" },
};
const CHAINEGATEWAY_BSC_DISTRIBUTOR_ADDRESS_PASSWORD =
  process.env.CHAINEGATEWAY_BSC_DISTRIBUTOR_ADDRESS_PASSWORD;
const CHAINEGATEWAY_API_KEY = process.env.CHAINEGATEWAY_API_KEY;

const sendCoins = async ({
  fromAddress,
  toAddress,
  cryptoValue,
  blockchain,
}) => {
  const url = `https://api.chaingateway.io/v2/${blockchainSettingsChainegateway[blockchain].blockchain}/transactions`;
  const payload = {
    from: fromAddress,
    to: toAddress,
    amount: cryptoValue.toFixed(2).toString(),
    password: CHAINEGATEWAY_BSC_DISTRIBUTOR_ADDRESS_PASSWORD,
  };
  const headers = { Authorization: CHAINEGATEWAY_API_KEY };
  return axios
    .post(url, payload, { headers })
    .then((res) => res.status)
    .catch((err) => {
      console.log(err);
      return err.response.status;
    });
};

const getTransactionInfo = async ({ transactionId }) => {
  const url = `https://api.chaingateway.io/v2/${blockchainSettingsChainegateway[blockchain].blockchain}/transactions/${transactionId}/decoded`;
  const headers = { Authorization: CHAINEGATEWAY_API_KEY };
  return axios
    .get(url, { headers })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      console.log(err.response.data);
    });
};

const getRateByCurrency = async ({ cryptocurrency }) => {
  const url = `https://api.chaingateway.io/v2/markets/prices/${cryptocurrency.toLowerCase()}/USD`;
  const headers = { Authorization: CHAINEGATEWAY_API_KEY };
  return axios
    .get(url, { headers })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      console.log(err.response.data);
    });
};

module.exports = { sendCoins, getTransactionInfo, getRateByCurrency };
//easiest = assume sendCoins is final, i.e. don't expect any webhooks after this one, if u get 200, assume it's done deal
