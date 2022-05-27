function formInputDataForDailyActivityPlot(sortedGraphDataPoints) {
    let x;

    x = sortedGraphDataPoints.map(point => {
        //return point.date + "-" + point.month + "-" + point.year;
        let year = point.year
        let month = point.month
        let date = point.date
        if (month < 10) {
            month = "0" + month
        }
        if (date < 10) {
            date = "0" + date
        }
        return year + "-" + month + "-" + date
    });


    const yTimes = sortedGraphDataPoints.map(point => {
        return '2022-05-21 ' + point.hour + ":" + point.minute + ":00"
    });


    return new Promise((resolve) => {
        const plotInputData = {
            xAxis: x,
            yAxis: yTimes
        }
        resolve(plotInputData);
    });
};


module.exports = formInputDataForDailyActivityPlot;