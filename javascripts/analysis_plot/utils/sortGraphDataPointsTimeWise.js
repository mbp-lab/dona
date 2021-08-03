function sortGraphDataPointsTimeWise(graphDataPoints) {
    return new Promise((resolve) => {
        const sorted = graphDataPoints.sort(function (current, next) {
            return new Date(current.year, current.month, 1) - new Date(next.year, next.month, 1)
        });
        resolve(sorted);
    });
};


module.exports = sortGraphDataPointsTimeWise;