var sentReceived = require('./analysis_plot/sentReceived');
var sentReceivedDailyPerConversation = require('./analysis_plot/sentReceivedDailyPerConversation')
var dailyActivityTimes = require('./analysis_plot/dailyActivityTimes')
var animatedPolarPlot = require('./analysis_plot/animatedPolarPlot')
var animatedHorizontalBarChart = require('./analysis_plot/animatedHorizontalBarChart')
var animatedHorizontalBarChartOverall = require('./analysis_plot/animatedHorizontalBarChartOverall')
const animatedDayPartsActivityPlot = require("./analysis_plot/animatedDayPartsActivityPlot");
const dayPartsActivityOverallPlot = require("./analysis_plot/dayPartsActivityOverallPlot");
var responseTimeBarChart = require('./analysis_plot/responseTimeBarChart');
let animatedResponseTimeBarChart = require('./analysis_plot/animatedResponseTimeBarChart')
const breaksInConvPlot = require("./analysis_plot/breaksInConvPlot");
const createListOfConversations = require("./analysis_plot/utils/createListOfConversations");


$(document).ready(function () {
    // reminders to also do the next questionnaire, after 5 min and after 15min
    const reminder = i18n.reminder
    setTimeout(() => {
        alert(reminder)
    }, 300000)
    setTimeout(() => {
        alert(reminder)
    }, 900000)

    Object.keys(allData).forEach(function (dataSourceType) {
        const graphData = allData[dataSourceType];
        console.log(graphData)

        // remove friend "System" from friends of conversations
        const systemName = i18n.systemName
        const chatWith = i18n.chatWith
        let conversationsWithoutSystem = []
        graphData.conversationsFriends.forEach((conversation) => {
            conversationsWithoutSystem.push(conversation.filter((friend) => friend !== systemName))
        })
        const listOfConversations = createListOfConversations(
            conversationsWithoutSystem,
            chatWith
        )

        animatedPolarPlot(
            graphData.sentReceivedPerMonthPerConversation,
            listOfConversations,
            `${dataSourceType}AnimatedPolarPlot`,
        );

        animatedHorizontalBarChart(
            graphData.sentReceivedPerMonthPerConversation,
            listOfConversations,
            `${dataSourceType}AnimatedHorizontalBarChart`
        );

        dailyActivityTimes(
            graphData.dailySentHoursPerConversation,
            graphData.dailyReceivedHoursPerConversation,
            listOfConversations,
            `${dataSourceType}DailyActivityTimes`
        );


        responseTimeBarChart(
            graphData.responseTimes,
            `${dataSourceType}ResponseTimeBarChart`
        );


        // when modal is opened the first time, render plots...
        // if this is done before the modal is opened, the width of the plots isnt correct

        const sentReceivedModal = $(`#${dataSourceType}sentReceivedModal`)
        const dailyActivityModal = $(`#${dataSourceType}dailyActivityModal`)
        const responseTimeModal = $(`#${dataSourceType}responseTimeModal`)
        sentReceivedModal.on('shown.bs.modal', () => {
            sentReceived(graphData.sentReceived, `${dataSourceType}MessagesOverTime`);

            animatedHorizontalBarChartOverall(
                graphData.sentReceivedPerMonthPerConversation,
                listOfConversations,
                `${dataSourceType}AnimatedHorizontalBarChartOverall`
            )

            sentReceivedDailyPerConversation(
                graphData.dailyWordsSentReceived,
                graphData.dailySentReceivedPerConversation,
                `${dataSourceType}SentReceivedSlidingWindowMean`,
                listOfConversations,
                true
            )

            sentReceivedDailyPerConversation(
                graphData.dailyWordsSentReceived,
                graphData.dailySentReceivedPerConversation,
                `${dataSourceType}DailySentReceivedPerConversation`,
                listOfConversations,
                false
            )
        })

        dailyActivityModal.on('shown.bs.modal', () => {
            dayPartsActivityOverallPlot(
                graphData.dailySentHoursPerConversation,
                graphData.dailyReceivedHoursPerConversation,
                `${dataSourceType}DayPartsActivityOverallPlot`
            )

            animatedDayPartsActivityPlot(
                graphData.dailySentHoursPerConversation,
                graphData.dailyReceivedHoursPerConversation,
                `${dataSourceType}DayPartsActivityPlot`
            )
        })

        responseTimeModal.on('shown.bs.modal', () => {
            animatedResponseTimeBarChart(
                graphData.responseTimes,
                `${dataSourceType}AnimatedResponseTimeBarChart`
            );

            breaksInConvPlot(
                graphData.dailySentReceivedPerConversation,
                listOfConversations,
                `${dataSourceType}BreaksInConvPlot`
            );
        })


        // without this an explanation modal opened within another modal isn't scrollable for some reason
        $('body').on('shown.bs.modal', function () {
            $('body').addClass('modal-open');
        });


    })

});
