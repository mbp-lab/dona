function sortGraphDataPointsSync(graphDataPoints) {
    return graphDataPoints.sort(function (current, next) {
        return current.epochSeconds - next.epochSeconds
    });
}


// export { sortGraphDataPointsSync };
module.exports = sortGraphDataPointsSync;