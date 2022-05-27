function formInputDataForMessagesPlot(sortedGraphDataPoints, hasDate) {
    let x;
    if (hasDate) {
        x = sortedGraphDataPoints.map(point => {
            return point.date + "-" + point.month + "-" + point.year;
        });
    } else {
        x = sortedGraphDataPoints.map(point => {
            return point.month + "-" + point.year;
        });
    }
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