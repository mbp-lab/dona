var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForMessagesPlot = require("./utils/formInputDataForMessagesPlot");

function sentReceivedDaily(data, plotId) {


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
            tickformat: '%d-%m-%Y',
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

    sortGraphDataPoints(data, true, false)
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

            const receivedMessagesTrace = {
                x: plotInputData.xAxis,
                y: plotInputData.yAxisReceivedMessages,
                mode: 'lines+markers',
                name: received,
                marker: { size: 4, color: "orange" }
            };

            const data = [sentMessagesTrace, receivedMessagesTrace];
            plotContainer.html("");
            Plotly.newPlot(plotId, data, layout, { responsive: true });

        })
        .catch((err) => console.log(err))


}

module.exports = sentReceivedDaily;

