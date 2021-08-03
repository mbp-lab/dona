function formInputDataForMessagesPlot(sortedGraphDataPoints) {
    const x = sortedGraphDataPoints.map(point => {
        return point.month + "-" + point.year;
    });
    const ySentMessages = sortedGraphDataPoints.map(point => point.sentCount);
    const yReceivedMessages = sortedGraphDataPoints.map(point => point.receivedCount);
    return new Promise((resolve) => {
       const plotInputData = {
        xAxis: x,
        yAxisSentMessages: ySentMessages,
        yAxisReceivedMessages: yReceivedMessages
       }
       resolve(plotInputData);
    });
};


module.exports = formInputDataForMessagesPlot;