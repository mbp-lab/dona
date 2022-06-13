var responseTime = require('./analysis_plot/responseTime');
var sentReceived = require('./analysis_plot/sentReceived');
var sentReceivedDaily = require('./analysis_plot/sentReceivedDaily');
var sentReceivedDailyPerConversation = require('./analysis_plot/sentReceivedDailyPerConversation')
var dailyActivityTimesPerConversation = require('./analysis_plot/dailyActivityTimesPerConversation')
var sentReceivedSlidingWindowMean = require('./analysis_plot/sentReceivedSlidingWindowMean')
var dailyActivityTimes = require('./analysis_plot/dailyActivityTimes')
var dailyActivityTimesMean = require('./analysis_plot/dailyActivityTimesMean')
var polarPlot = require('./analysis_plot/polarPlot')
var animatedHorizontalBarChart = require('./analysis_plot/animatedHorizontalBarChart')


$(document).ready(function () {
    Object.keys(allData).forEach(function (dataSourceType) {
        const graphData = allData[dataSourceType];
        console.log(graphData)
        polarPlot(graphData.sentPerFriendPerMonth, graphData.conversationsFriends, `${dataSourceType}PolarPlot`);
        animatedHorizontalBarChart(graphData.sentPerFriendPerMonth, graphData.conversationsFriends, graphData.sentReceivedWords,`${dataSourceType}AnimatedHorizontalBarChart`);
        dailyActivityTimes(graphData.dailySentHoursPerConversation, graphData.dailyReceivedHoursPerConversation, `${dataSourceType}DailyActivityTimes`);
        responseTime(graphData.responseTimes, `${dataSourceType}ResponseTimePlot`);

        // when modal is opened the first time, render plots...
        // if this is done before the modal is opened, the width of the plots isnt correct
        $(`#${dataSourceType}sentReceivedModal`).on('shown.bs.modal', () => {
            sentReceived(graphData.sentReceived, `${dataSourceType}MessagesOverTime`);
            //sentReceivedDaily(graphData.dailySentReceived, `${dataSourceType}SentReceivedOverall`);
            sentReceivedDaily(graphData.dailyWordsSentReceived, `${dataSourceType}WordsSentReceivedOverall`);
            sentReceivedSlidingWindowMean(graphData.dailySentReceived, `${dataSourceType}SentReceivedSevenDayAverages`);

            sentReceivedDailyPerConversation(
                graphData.dailySentReceived,
                graphData.dailySentReceivedPerConversation,
                `${dataSourceType}DailySentReceivedPerConversation`,
                `.${dataSourceType}ConversationsSentReceivedDaily`,
                graphData.conversationsFriends
            )
        })

        $(`#${dataSourceType}dailyActivityModal`).on('shown.bs.modal', () => {
            dailyActivityTimesMean(graphData.dailySentHoursPerConversation, graphData.dailyReceivedHoursPerConversation, `${dataSourceType}DailyActivityTimesMean`);
            dailyActivityTimesPerConversation(
                graphData.dailySentHoursPerConversation,
                graphData.dailyReceivedHoursPerConversation,
                `${dataSourceType}DailySentTimesPerConversation`,
                `.${dataSourceType}ConversationsDailySentTimes`,
                graphData.conversationsFriends
            )
        })
    })
});
