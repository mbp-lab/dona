var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
var formInputDataForMessagesPlot = require('./utils/formInputDataForMessagesPlot');

function sentReceived(data, plotId) {

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");
    const layout = {
      legend: {
        x: -.1,
        y: 1.2
      },
      xaxis: {
        title: xAxis,
        tickangle: 45
      },
      yaxis: {
        title: yAxis
      },
    };

    sortGraphDataPoints(data)
      .then((sortedDataPoints) => {
        return formInputDataForMessagesPlot(sortedDataPoints);
      })
      .then((plotInputData) => {
        const sentMessagesTrace = {
          x: plotInputData.xAxis,
          y: plotInputData.yAxisSentMessages,
          mode: 'lines+markers',
          name: sent,
          marker: { size: 12 }
        };

        const receivedMessagesTrace = {
          x: plotInputData.xAxis,
          y: plotInputData.yAxisReceivedMessages,
          mode: 'lines+markers',
          name: received,
          marker: { size: 12 }
        };

        const data = [sentMessagesTrace, receivedMessagesTrace];
        plotContainer.html("");
        Plotly.newPlot(plotId, data, layout, { responsive: true });

      })
      .catch((err) => console.log(err));
}

module.exports = sentReceived;