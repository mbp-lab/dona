const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");
const _ = require("lodash");


function responseTimeBarChart(responseTimes, plotId) {

    const FIRST = "< 1 min"
    const SECOND = "1-2 min"
    const THIRD = "3-5 min"
    const FOURTH = "6-15 min"
    const FIFTH = "16-30 min"
    const SIXTH = "31-60 min"
    const SEVENTH = "> 60 min"

    const ONEMINUTEINMS = 60000;
    const TWOINMS = 2 * ONEMINUTEINMS;
    const THREEINMS = 3 * ONEMINUTEINMS;
    const FIVEINMS = 5 * ONEMINUTEINMS;
    const SIXINMS = 6 * ONEMINUTEINMS;
    const FIFTEENINMS = 15 * ONEMINUTEINMS;
    const SIXTEENINMS = 16 * ONEMINUTEINMS;
    const THIRTYINMS = 30 * ONEMINUTEINMS;
    const THIRTYONEINMS = 31 * ONEMINUTEINMS;
    const SIXTYINMS = 60 * ONEMINUTEINMS;

    let inRange = (timeInMS) => {

        if (timeInMS < ONEMINUTEINMS)
            return 0
        else if (timeInMS < THREEINMS)
            return 1
        else if (timeInMS < SIXINMS)
            return 2
        else if (timeInMS < SIXTEENINMS)
            return 3
        else if (timeInMS < THIRTYONEINMS)
            return 4
        else if (timeInMS <= SIXTYINMS)
            return 5
        else
            return 6

    }


    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");

    let layout = {
        height: 600,
        showlegend: true,
        barmode: 'overlay',
        legend: {
            x: -.1,
            y: 1.2
        },
        hovermode: 'x',
    }


    let groupedByIsDonor = _.groupBy(responseTimes, (responseTime) => {
        return responseTime.isDonor;
    })


    let countObjectDonor = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    }

    let countObjectFriends = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    }


    let time;
    groupedByIsDonor.true.forEach((responseTime) => {
        time = responseTime.timeInMs
        countObjectDonor[inRange(time)] += 1;
    })

    groupedByIsDonor.false.forEach((responseTime) => {
        time = responseTime.timeInMs
        countObjectFriends[inRange(time)] += 1;
    })

    let nResponsesDonor = groupedByIsDonor.true.length
    let nResponsesFriends = groupedByIsDonor.false.length

    let yDonor = _.fill(Array(Object.keys(countObjectDonor).length), 0)
    let yFriends = _.fill(Array(Object.keys(countObjectFriends).length), 0)

    for (const [key, value] of Object.entries(countObjectDonor)) {
        yDonor[key] = value / nResponsesDonor
    }

    for (const [key, value] of Object.entries(countObjectFriends)) {
        yFriends[key] = value / nResponsesFriends
    }


    let max = Math.max(...yFriends.concat(yDonor))


    layout["yaxis"] = {
        range: [0, max],
        color: "black",
        tickformat: "p",
        hoverformat: ".2%"
    }


    let x = [FIRST, SECOND, THIRD, FOURTH, FIFTH, SIXTH, SEVENTH]


    plotContainer.html("");
    Plotly.newPlot(plotId, [
        {
            name: "Donor Response Times",
            x: x,
            y: yDonor,
            type: "bar",
            marker: {
                //color: "#60BDFF"
            },
            width: _.fill(Array(x.length), 0.8)
        },
        {
            name: "Friends Response Times",
            x: x,
            y: yFriends,
            type: "bar",
            marker: {
                //color: "#FF8800",
            },
            width: _.fill(Array(x.length), 0.5)
        }
    ], layout, {responsive: true})


}

module.exports = responseTimeBarChart;

