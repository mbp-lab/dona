var responseTime = require('./analysis_plot/responseTime');
var sentReceived = require('./analysis_plot/sentReceived');
var sentReceivedDailyOverall = require('./analysis_plot/sentReceivedDailyOverall');
var sentReceivedDailyPerConversation = require('./analysis_plot/sentReceivedDailyPerConversation')
var dailyActivityTimesPerConversation = require('./analysis_plot/dailyActivityTimesPerConversation')
var sentReceivedSevenDayAverages = require('./analysis_plot/sentReceivedSevenDayAverages')
var dailyActivityTimes = require('./analysis_plot/dailyActivityTimes')
var dailyActivityTimesMean = require('./analysis_plot/dailyActivityTimesMean')


$(document).ready(function () {
  Object.keys(allData).forEach(function (dataSourceType) {
    const graphData = allData[dataSourceType];
    sentReceived(graphData.sentReceived, `${dataSourceType}MessagesOverTime`);
    sentReceivedDailyOverall(graphData.dailySentReceived, `${dataSourceType}SentReceivedOverall`);
    sentReceivedSevenDayAverages(graphData.dailySentReceived, `${dataSourceType}SentReceivedSevenDayAverages`);
    sentReceivedDailyPerConversation(graphData.dailySentReceivedPerConversation, `${dataSourceType}DailySentReceivedPerConversation`)
    dailyActivityTimes(graphData.dailySentHourMinutesPerConversation, graphData.dailyReceivedHourMinutesPerConversation, `${dataSourceType}DailyActivityTimes`);
    dailyActivityTimesMean(graphData.dailySentHourMinutesPerConversation, graphData.dailyReceivedHourMinutesPerConversation, `${dataSourceType}DailyActivityTimesMean`);
    dailyActivityTimesPerConversation(graphData.dailySentHourMinutesPerConversation, graphData.dailyReceivedHourMinutesPerConversation, `${dataSourceType}DailySentTimesPerConversation`)
    responseTime(graphData.responseTimes, `${dataSourceType}ResponseTimePlot`);
    console.log(graphData)
  })
});