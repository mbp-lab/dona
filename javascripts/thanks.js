var responseTime = require('./analysis_plot/responseTime');
var sentReceived = require('./analysis_plot/sentReceived');
var sentReceivedDailyPerConversation = require('./analysis_plot/sentReceivedDailyPerConversation')
var dailyActivityTimes = require('./analysis_plot/dailyActivityTimes')
var dailyActivityTimesMean = require('./analysis_plot/dailyActivityTimesMean')
var animatedPolarPlot = require('./analysis_plot/animatedPolarPlot')
var animatedHorizontalBarChart = require('./analysis_plot/animatedHorizontalBarChart')
var animatedHorizontalBarChartOverall = require('./analysis_plot/animatedHorizontalBarChartOverall')
const animatedDayPartsActivityPlot = require("./analysis_plot/animatedDayPartsActivityPlot");
const dayPartsActivityOverallPlot = require("./analysis_plot/dayPartsActivityOverallPlot");
var responseTimeBarChart = require('./analysis_plot/responseTimeBarChart');
let animatedResponseTimeBarChart = require('./analysis_plot/animatedResponseTimeBarChart')


$(document).ready(function () {
    Object.keys(allData).forEach(function (dataSourceType) {
        const graphData = allData[dataSourceType];
        console.log(graphData)

        // reminders to also do the next questionnaire, after 1 min, after 5 min and after 15min
        setTimeout(() => {
            alert("Please don't forget to fill out the next questionnaire. Thanks :)")
        }, 60000)
        setTimeout(() => {
            alert("Please don't forget to fill out the next questionnaire. Thanks :)")
        }, 300000)
        setTimeout(() => {
            alert("Please don't forget to fill out the next questionnaire. Thanks :)")
        }, 900000)

        animatedPolarPlot(
            graphData.sentReceivedPerMonthPerConversation,
            graphData.conversationsFriends,
            `${dataSourceType}AnimatedPolarPlot`,
        );

        animatedHorizontalBarChart(
            graphData.sentReceivedPerMonthPerConversation,
            graphData.conversationsFriends,
            `${dataSourceType}AnimatedHorizontalBarChart`
        );

        dailyActivityTimes(
            graphData.dailySentHoursPerConversation,
            graphData.dailyReceivedHoursPerConversation,
            graphData.conversationsFriends,
            `${dataSourceType}DailyActivityTimes`
        );


        responseTimeBarChart(
            graphData.responseTimes,
            `${dataSourceType}ResponseTimeBarChart`
        );


        // when modal is opened the first time, render plots...
        // if this is done before the modal is opened, the width of the plots isnt correct
        $(`#${dataSourceType}sentReceivedModal`).on('shown.bs.modal', () => {
            sentReceived(graphData.sentReceived, `${dataSourceType}MessagesOverTime`);

            animatedHorizontalBarChartOverall(
                graphData.sentReceivedPerMonthPerConversation,
                graphData.conversationsFriends,
                `${dataSourceType}AnimatedHorizontalBarChartOverall`
            )

            sentReceivedDailyPerConversation(
                graphData.dailyWordsSentReceived,
                graphData.dailySentReceivedPerConversation,
                `${dataSourceType}SentReceivedSlidingWindowMean`,
                graphData.conversationsFriends,
                true
            )

            sentReceivedDailyPerConversation(
                graphData.dailyWordsSentReceived,
                graphData.dailySentReceivedPerConversation,
                `${dataSourceType}DailySentReceivedPerConversation`,
                graphData.conversationsFriends,
                false
            )
        })

        $(`#${dataSourceType}dailyActivityModal`).on('shown.bs.modal', () => {


            dayPartsActivityOverallPlot(
                graphData.dailySentHoursPerConversation,
                graphData.dailyReceivedHoursPerConversation,
                graphData.conversationsFriends,
                `${dataSourceType}DayPartsActivityOverallPlot`
            )

            animatedDayPartsActivityPlot(
                graphData.dailySentHoursPerConversation,
                graphData.dailyReceivedHoursPerConversation,
                graphData.conversationsFriends,
                `${dataSourceType}DayPartsActivityPlot`
            )
            /*
            dailyActivityTimesMean(
                graphData.dailySentHoursPerConversation,
                graphData.dailyReceivedHoursPerConversation,
                `${dataSourceType}DailyActivityTimesMean`
            );

             */
        })

        $(`#${dataSourceType}responseTimeModal`).on('shown.bs.modal', () => {
            animatedResponseTimeBarChart(
                graphData.responseTimes,
                `${dataSourceType}AnimatedResponseTimeBarChart`
            );

            responseTime(
                graphData.responseTimes,
                `${dataSourceType}ResponseTimePlot`
            );
        })
    })
});
