const mixpanelApi = require("../api/mixpanel")
const { v4: uuidv4 } = require("uuid");
const ignoreMxp = process.env.ignoreMxp === "true"
const functions = require('firebase-functions/v1');
const admin = require("firebase-admin")

const reportEvent = async ({username,eventName,insertId,userProps}) => {
    functions.logger.log("triggered reportEvent")
    if (ignoreMxp == true) {
        functions.logger.log("ignoreMxp is true, return")
        return
    }
    await updateUserProps({username,userProps})
    const timestamp = Date.now()
    const result = await mixpanelApi.reportEvent({username,eventName,eventProps:{},insertId:insertId || uuidv4(),timestamp:timestamp})
    functions.logger.log("mixpanel reportEvent res", result)
    return
}

const updateUserProps = async ({username,userProps}) => {
    if (ignoreMxp == true) return
    const defaultProps = {hodor:"yes"}
    const myUserProps = !!userProps ? {...userProps,defaultProps} : defaultProps
    const result = await mixpanelApi.identifyUser({username,userProps:myUserProps})
    functions.logger.log("mixpanel updaeUserProps res", result)
    return
}



module.exports={reportEvent}