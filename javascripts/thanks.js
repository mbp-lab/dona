var responseTime = require('./analysis_plot/responseTime');
var sentReceived = require('./analysis_plot/sentReceived');


$(document).ready(function () {
  Object.keys(allData).forEach(function (dataSourceType) {
    const graphData = allData[dataSourceType];
    sentReceived(graphData.sentReceived, `${dataSourceType}MessagesOverTime`);
    responseTime(graphData.responseTimes, `${dataSourceType}ResponseTimePlot`);
  })
});