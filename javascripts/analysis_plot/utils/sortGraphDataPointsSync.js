function sortGraphDataPointsSync(graphDataPoints, hasDate, hasHourAndMinute) {

        return graphDataPoints.sort(function (current, next) {
            return new Date(current.epochSeconds * 1000) - new Date(next.epochSeconds * 1000)
        });

};


module.exports = sortGraphDataPointsSync;