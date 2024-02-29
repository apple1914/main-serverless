const axios = require("axios");

const fetchPrice = async ({ cryptocurrency }) => {
  const headers = { "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY };
  const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${cryptocurrency}`;
  return axios
    .get(url, { headers })
    .then((res) => res.data.data)
    .catch((err) => {
      console.log(err.response.data);
    });
};

module.exports = { fetchPrice };
