var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForMessagesPlot = require("./utils/formInputDataForMessagesPlot");

function sentReceivedSevenDayAverages(dataTotal, plotId) {

    // the area under the curves could be filled with bar charts,
    // that show for each day what each conversation is adding to the resulting total

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


    let getXDayMeanData = (y, days) => {
        let sum, mean;
        resultArray = []

        for (let i = 0; i < y.length; i++) {
            let sliced = y.slice(i, i + days)
            sum = 0
            sliced.forEach((entry) => sum += entry)
            mean = sum / sliced.length
            resultArray.push(mean)
        }

        return resultArray
    }

    sortGraphDataPoints(dataTotal, true, false)
        .then((sortedDataPoints) => {
            return formInputDataForMessagesPlot(sortedDataPoints, true);
        })
        .then((plotInputData) => {
            const sentMessagesTrace = {
                x: plotInputData.xAxis,
                y: getXDayMeanData(plotInputData.yAxisSentMessages, 29),
                mode: 'lines+markers',
                name: sent + " x Day Mean",
                marker: { size: 4 }
            };

            const receivedMessagesTrace = {
                x: plotInputData.xAxis,
                y: getXDayMeanData(plotInputData.yAxisReceivedMessages, 29),
                mode: 'lines+markers',
                name: received + " x Day Mean",
                marker: { size: 4 }
            };


            const data = [sentMessagesTrace, receivedMessagesTrace];
            plotContainer.html("");
            Plotly.newPlot(plotId, data, layout, { responsive: true });

        })
        .catch((err) => console.log(err))


}

module.exports = sentReceivedSevenDayAverages;

