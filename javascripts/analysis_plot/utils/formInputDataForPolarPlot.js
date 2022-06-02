function formInputDataForPolarPlot(sortedGraphDataPoints, allFriends, yearToExclude, monthToExclude) {

    let friends = []
    let averageValues = []
    let friendsExcludedMonth = []
    let valuesExcludedMonth = []

    let filteredData;
    let sumSent;

    console.log(allFriends)

    allFriends.forEach((friend) => {
        sumSent = 0;

        filteredData = sortedGraphDataPoints.filter((obj) => {
            return (obj.from === friend || obj.to === friend) && (obj.year !== yearToExclude && obj.month !== monthToExclude)
        })
        console.log("friend: " + friend)
        console.log(filteredData)

        friends.push(friend)

        if (filteredData.length === 0) {
            averageValues.push(0)
        } else {
            for (let i = 0; i < filteredData.length; i++) {
                sumSent += filteredData[i].sentCount
            }
            averageValues.push(sumSent/filteredData.length)
        }
    })

    allFriends.forEach((friend) => {
        filteredData = sortedGraphDataPoints.filter((obj) => {
            return (obj.from === friend || obj.to === friend) && (obj.year === yearToExclude && obj.month === monthToExclude)
        })

        console.log("friend: " + friend)
        console.log(filteredData)

        friendsExcludedMonth.push(friend)

        if (filteredData.length === 0) {
            valuesExcludedMonth.push(0)
        } else {
            valuesExcludedMonth.push(filteredData[0].sentCount)
        }

    })


    averageValues = averageValues.map((value) => Math.sqrt(value))
    valuesExcludedMonth = valuesExcludedMonth.map((value) => Math.sqrt(value))


    return new Promise((resolve) => {
        const plotInputData = {
            theta: friends,
            r: averageValues,
            rExcludedMonth: valuesExcludedMonth,
            thetaExcludedMonth: friendsExcludedMonth,
        }
        resolve(plotInputData);
    });
};


module.exports = formInputDataForPolarPlot;