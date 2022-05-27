function sortGraphDataPointsTimeWise(graphDataPoints, hasDate, hasHourAndMinute) {

    return new Promise((resolve) => {
        const sorted = graphDataPoints.sort(function (current, next) {
            if (hasHourAndMinute) {
                return new Date(current.year, current.month, current.date, current.hour, current.minute) - new Date(next.year, next.month, next.date, next.hour, next.minute)
            } else if (hasDate) {
                return new Date(current.year, current.month, current.date) - new Date(next.year, next.month, next.date)
            } else {
                return new Date(current.year, current.month, 1) - new Date(next.year, next.month, 1)
            }
        });
        resolve(sorted);
    });
};


module.exports = sortGraphDataPointsTimeWise;