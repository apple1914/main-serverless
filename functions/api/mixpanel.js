const axios = require("axios")
const MIXPANEL_SECRET = process.env.MIXPANEL_SECRET
const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN

const reportEvent = async ({
    username,
    eventProps,
    timestamp,
    eventName,
    insertId,
  }) => {
    const url = `https://api.mixpanel.com/import`;
  
    const newProperties = {
      ...eventProps,
      time: timestamp,
      distinct_id: username,
      token: MIXPANEL_TOKEN,
      $insert_id: insertId,
    };
    const payload = [{ event:eventName, properties: newProperties }];
  
    const headers = {
      "content-type": "application/json",
      Authorization: "Basic " + Buffer.from(`${MIXPANEL_SECRET}:`).toString("base64")
    };
  
    return axios
      .post(url, payload, { headers: headers })
      .then((res) => res.data)
      .catch((err) => {
        console.log(err.response.data);
        });
  };


const identifyUser = async ({ username, userProps }) => {
    const mxpPaylo = [
      {
        $token: MIXPANEL_TOKEN,
        $distinct_id: username,
        $set: userProps,
      },
    ];
    //should be solid
    return axios
      .post("https://api.mixpanel.com/engage#profile-set", mxpPaylo)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };


  module.exports = {identifyUser,reportEvent}