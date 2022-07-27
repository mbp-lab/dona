function ZScoreCalcPolarPlot(data, zScoreLimitArg) {

    let flattened = data.flat();

    // sums of sentCount and receivedCount
    const sums = flattened.map((obj) => obj.sentCount + obj.receivedCount)

    const mean = Plotly.d3.mean(sums)
    const stdDeviation = Plotly.d3.deviation(sums)

    let zScore
    for (let i = 0; i < sums.length; i++) {
        zScore = (sums[i] - mean) / stdDeviation
        // colorscale needs a specific range -> zScores bigger than zScoreLimit and -zScoreLimit will be set to zScoreLimit or -zScoreLimit accordingly
        if (zScore > zScoreLimitArg) {
            zScore = zScoreLimitArg;
        } else if (zScore < -zScoreLimitArg) {
            zScore = -zScoreLimitArg
        }

        flattened[i]["zScore"] = zScore
    }
}


module.exports = ZScoreCalcPolarPlot;