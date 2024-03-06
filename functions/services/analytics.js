const mixpanelApi = require("../api/mixpanel")
const { v4: uuidv4 } = require("uuid");

const reportEvent = async ({username,eventName,insertId,userProps}) => {
    functions.logger.log("triggered reportEvent")
    
    await updateUserProps({username,userProps})
    const timestamp = Date.now()
    const result = await mixpanelApi.reportEvent({username,eventName,eventProps:{},insertId:insertId || uuidv4(),timestamp:timestamp})
    functions.logger.log("mixpanel reportEvent res", result)
    return
}

const updateUserProps = async ({username,userProps}) => {
    const defaultProps = {hodor:"yes"}
    const myUserProps = !!userProps ? {...userProps,defaultProps} : defaultProps
    const result = await mixpanelApi.identifyUser({username,userProps:myUserProps})
    functions.logger.log("mixpanel updaeUserProps res", result)
    return
}



module.exports={reportEvent}