const UTC_HOUR_STARTS = 14;
const UTC_HOUR_ENDS = 22;
const amOrPmSchedNow = () => {
  const timeNow = new Date();
  const hoursNow = timeNow.getUTCHours();
  const dayOfWeek = timeNow.getDay();
  const properDays = [1, 2, 3, 4, 5];
  if (properDays.includes(dayOfWeek)) {
    if (hoursNow >= UTC_HOUR_STARTS && hoursNow < UTC_HOUR_ENDS) {
      return "pm";
    }
  }
  return "am";
};

module.exports = { amOrPmSchedNow };
