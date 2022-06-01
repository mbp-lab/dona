var responseTime = require('./analysis_plot/responseTime');
var sentReceived = require('./analysis_plot/sentReceived');
var sentReceivedDaily = require('./analysis_plot/sentReceivedDaily');
var sentReceivedDailyPerConversation = require('./analysis_plot/sentReceivedDailyPerConversation')
var dailyActivityTimesPerConversation = require('./analysis_plot/dailyActivityTimesPerConversation')
var sentReceivedSevenDayAverages = require('./analysis_plot/sentReceivedSevenDayAverages')
var dailyActivityTimes = require('./analysis_plot/dailyActivityTimes')
var dailyActivityTimesMean = require('./analysis_plot/dailyActivityTimesMean')
var polarPlot = require('./analysis_plot/polarPlot')


$(document).ready(function () {
    Object.keys(allData).forEach(function (dataSourceType) {
        const graphData = allData[dataSourceType];
        polarPlot(graphData.sentPerFriendPerMonth, graphData.conversationsFriends, `${dataSourceType}PolarPlot`);
        sentReceived(graphData.sentReceived, `${dataSourceType}MessagesOverTime`);
        sentReceivedDaily(graphData.dailySentReceived, `${dataSourceType}SentReceivedOverall`);
        sentReceivedDaily(graphData.dailyWordsSentReceived, `${dataSourceType}WordsSentReceivedOverall`);
        sentReceivedSevenDayAverages(graphData.dailySentReceived, `${dataSourceType}SentReceivedSevenDayAverages`);
        sentReceivedDailyPerConversation(
            graphData.dailySentReceivedPerConversation,
            `${dataSourceType}DailySentReceivedPerConversation`,
            `.${dataSourceType}ConversationsSentReceivedDaily`,
            graphData.conversationsFriends
        )
        dailyActivityTimes(graphData.dailySentHoursPerConversation, graphData.dailyReceivedHoursPerConversation, `${dataSourceType}DailyActivityTimes`);
        dailyActivityTimesMean(graphData.dailySentHoursPerConversation, graphData.dailyReceivedHoursPerConversation, `${dataSourceType}DailyActivityTimesMean`);
        dailyActivityTimesPerConversation(
            graphData.dailySentHoursPerConversation,
            graphData.dailyReceivedHoursPerConversation,
            `${dataSourceType}DailySentTimesPerConversation`,
            `.${dataSourceType}ConversationsDailySentTimes`,
            graphData.conversationsFriends
        )
        responseTime(graphData.responseTimes, `${dataSourceType}ResponseTimePlot`);
        console.log(graphData)
    })
});