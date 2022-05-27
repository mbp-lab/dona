var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForMessagesPlot = require("./utils/formInputDataForMessagesPlot");



function sentReceivedDailyPerConversation(data, plotId) {

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");

    const layout = {
        /*
        legend: {
            x: -.1,
            y: 1.2
        },

         */
        xaxis: {
            title: xAxis,
            tickangle: 45
        },
        yaxis: {
            title: yAxis
        },
    };

    let getMeanData = (y) => {
        let sum = 0;
        y.forEach((entry) => sum += entry)
        let mean = sum / y.length
        return y.map((entry) => mean)
    }

    let plot = (conversationIndex) => {
        sortGraphDataPoints(data[conversationIndex], true, false)
            .then((sortedDataPoints) => {
                return formInputDataForMessagesPlot(sortedDataPoints, true);
            })
            .then((plotInputData) => {
                const sentMessagesTrace = {
                    x: plotInputData.xAxis,
                    y: plotInputData.yAxisSentMessages,
                    mode: 'lines+markers',
                    name: sent,
                    marker: { size: 4 }
                };

                const meanSentMessagesTrace = {
                    x: plotInputData.xAxis,
                    y: getMeanData(plotInputData.yAxisSentMessages),
                    mode: 'lines',
                    name: sent,
                    visible: 'legendonly'
                };

                const receivedMessagesTrace = {
                    x: plotInputData.xAxis,
                    y: plotInputData.yAxisReceivedMessages,
                    mode: 'lines+markers',
                    name: received,
                    marker: { size: 4 }
                };

                const meanReceivedMessagesTrace = {
                    x: plotInputData.xAxis,
                    y: getMeanData(plotInputData.yAxisReceivedMessages),
                    mode: 'lines',
                    name: received,
                    visible: 'legendonly'
                };

                const data = [sentMessagesTrace, receivedMessagesTrace, meanSentMessagesTrace, meanReceivedMessagesTrace];
                plotContainer.html("");
                Plotly.newPlot(plotId, data, layout, { responsive: true });

            })
            .catch((err) => console.log(err))
    }

    // plot default
    plot(0)

    let listOfConversations = []
    for (let i = 0; i < data.length; i++) {
        listOfConversations.push("Conversation " + i)
    }

    let conversationSelector = document.querySelector('.conversationsSentReceivedDaily')

    let assignOptions = (options, selector) => {
        for (var i = 0; i < options.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = options[i];
            currentOption.value = i;
            selector.appendChild(currentOption);
        }
    }

    assignOptions(listOfConversations, conversationSelector)

    let updateConversation = () => {
        console.log(conversationSelector.value)
        plot(conversationSelector.value)
        Plotly.relayout(plotId, {
            'xaxis.autorange': true,
            'yaxis.autorange': true
        })
    }

    conversationSelector.addEventListener('change', updateConversation, false)


}

module.exports = sentReceivedDailyPerConversation;

