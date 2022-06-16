function sortGraphDataPointsSync(graphDataPoints, hasDate, hasHourAndMinute) {

        return graphDataPoints.sort(function (current, next) {
            if (hasHourAndMinute) {
                return new Date(current.year, current.month, current.date, current.hour, current.minute) - new Date(next.year, next.month, next.date, next.hour, next.minute)
            } else if (hasDate) {
                return new Date(current.year, current.month, current.date) - new Date(next.year, next.month, next.date)
            } else {
                return new Date(current.year, current.month, 1) - new Date(next.year, next.month, 1)
            }
        });

};


module.exports = sortGraphDataPointsSync;