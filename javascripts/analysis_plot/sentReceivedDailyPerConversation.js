var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForMessagesPlot = require("./utils/formInputDataForMessagesPlot");



function sentReceivedDailyPerConversation(data, plotId, selectorID, conversationsFriends) {

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");

    const layout = {
        xaxis: {
            title: xAxis,
            tickangle: 45,
            color: "white",
            showgrid: false
        },
        yaxis: {
            title: yAxis,
            color: "white",
            showgrid: false
        },
        legend: {
            bgcolor: "#13223C",
            font: {color: "white"},
            x: 1.01,
            y: 1.16,
        },
        images: [
            {
                source: backGroundImages["horizontalBarChartBackground"],
                xref: "paper",
                yref: "paper",
                x: 0.5,
                y: 0.5,
                sizex: 1.5,
                sizey: 1.5,
                xanchor: "center",
                yanchor: "middle",
                sizing: "fill",
                opacity: 1,
                layer: "below"
            }
        ]
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
                    marker: { size: 4, color: "white" }
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
                    marker: { size: 4, color: "orange" }
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
        listOfConversations.push("Conversation with " + conversationsFriends[i].filter((participant) => participant !== "donor"))
    }

    let conversationSelector = document.querySelector(selectorID)

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
        plot(conversationSelector.value)
        Plotly.relayout(plotId, {
            'xaxis.autorange': true,
            'yaxis.autorange': true
        })
    }

    conversationSelector.addEventListener('change', updateConversation, false)


}

module.exports = sentReceivedDailyPerConversation;

