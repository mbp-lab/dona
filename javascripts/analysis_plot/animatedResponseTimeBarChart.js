const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");
const _ = require("lodash");


function animatedResponseTimeBarChart(responseTimes, plotId) {

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
    const legendDonor = plotContainer.attr("data-legend-donor");
    const legendFriends = plotContainer.attr("data-legend-friends");
    const yearMonth = plotContainer.attr("data-description-yearMonth");

    let layout = {
        height: 600,
        showlegend: true,
        barmode: 'overlay',
        hovermode: 'x',
        legend: {
            x: -.1,
            y: 1.2
        },
        xaxis: {
            title: xAxis
        },
        updatemenus: [
            {
                x: 0,
                y: 0,
                yanchor: 'top',
                xanchor: 'left',
                showactive: false,
                direction: 'left',
                type: 'buttons',
                pad: {t: 127, r: 10},
                buttons: [
                    {
                        method: "animate",
                        args: [
                            null,
                            {
                                mode: 'immediate',
                                fromcurrent: true,
                                transition: {duration: 300, easing: 'linear'},
                                frame: {duration: 300, redraw: false}
                            }
                        ],
                        label: "Start"
                    },
                    {
                        method: 'animate',
                        args: [[null], {
                            mode: 'immediate',
                            transition: {duration: 0},
                            frame: {duration: 0, redraw: false}
                        }],
                        label: 'Pause'
                    }
                ]
            }
        ]
    }

    let startAnimation = (groupOrFrames, mode) => {

        Plotly.animate(plotId, groupOrFrames, {
            transition: {
                duration: 300,
                easing: 'linear'
            },
            frame: {
                duration: 300,
                redraw: false,
            },
            mode: mode
        });

    }

    responseTimes.map((obj) => {
        let dateObj = new Date(obj.epochMs)
        //return point.date + "-" + point.month + "-" + point.year;
        let year = dateObj.getFullYear()
        let month = dateObj.getMonth() + 1

        if (month < 10) {
            month = "0" + month
        }
        obj["yearMonth"] = year + "-" + month
    })

    let groupedByYearMonth = _.groupBy(responseTimes, (obj) => obj.yearMonth)


    let frames = []
    let sliderSteps = []
    let x = [FIRST, SECOND, THIRD, FOURTH, FIFTH, SIXTH, SEVENTH]
    let globalMax = 0;

    for (const [key, value] of Object.entries(groupedByYearMonth)) {

        let name = key

        let groupedByIsDonor = _.groupBy(value, (responseTime) => {
            return responseTime.isDonor;
        })

        if (groupedByIsDonor.false === undefined) {
            groupedByIsDonor.false = []
        }
        if (groupedByIsDonor.true === undefined) {
            groupedByIsDonor.true = []
        }


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

        // see if global max needs to be adjusted
        let max = Math.max(...yFriends.concat(yDonor))
        if (max > globalMax) {
            globalMax = max
        }

        frames.push({
            name: name,
            data: [
                {
                    name: legendDonor,
                    x: x,
                    y: yDonor,
                    width: _.fill(Array(x.length), 0.8)
                },
                {
                    name: legendFriends,
                    x: x,
                    y: yFriends,
                    width: _.fill(Array(x.length), 0.5)
                }
            ],
        })

        sliderSteps.push({
            method: 'animate',
            label: name,
            args: [[name], {
                mode: "immediate",
                transition: {duration: 300},
                frame: {duration: 300, redraw: false}
            }]
        })


    }




    layout["yaxis"] = {
        range: [0, globalMax],
        color: "black",
        tickformat: "p",
        hoverformat: ".2%",
        title: yAxis,
    }

    layout["sliders"] = [{
        pad: {l: 130, t: 95},
        currentvalue: {
            visible: true,
            prefix: yearMonth,
            xanchor: 'right',
            font: {size: 20, color: 'black'}
        },
        steps: sliderSteps
    }]



    plotContainer.html("");
    Plotly.newPlot(plotId, [
        {
            name: legendDonor,
            x: x,
            y: _.fill(Array(x.length), 0),
            type: "bar",
            width: _.fill(Array(x.length), 0.8)
        },
        {
            name: legendFriends,
            x: x,
            y: _.fill(Array(x.length), 0),
            type: "bar",
            width: _.fill(Array(x.length), 0.5)
        }
    ], layout, {responsive: true}).then(() => {
        Plotly.addFrames(plotId, frames)

        startAnimation(null, 'afterall')
    });


}

module.exports = animatedResponseTimeBarChart;

