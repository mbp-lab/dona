var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForDailyActivityPlot = require("./utils/formInputDataForDailyActivityPlot");
const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");
const _ = require("lodash");


function dayPartsActivityPlot(dataSent, dataReceived, conversationsFriends, plotId) {

    const FIRST = "00:00-06:00"
    const SECOND = "06:00-12:00"
    const THIRD = "12:00-18:00"
    const FOURTH = "18:00-00:00"

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
        yaxis: {
            automargin: true,
            color: "black",
        },
        hovermode: 'closest',
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



    let shorterLength = dataSent.length
    if (dataReceived.length < shorterLength) {
        shorterLength = dataReceived.length
    }

    let dataSentOverall = dataSent.flat()
    let dataReceivedOverall = dataReceived.flat()


    // make sure its sorted (maybe not necessary)
    let sortedDataSent = sortGraphDataPointsSync(dataSentOverall)
    let sortedDataReceived = sortGraphDataPointsSync(dataReceivedOverall)

    let groupedSentData = _.groupBy(sortedDataSent, (obj) => {
        return obj.year + "-" + obj.month
    })

    let groupedReceivedData = _.groupBy(sortedDataReceived, (obj) => {
        return obj.year + "-" + obj.month
    })


    // gets mean for each day part of the given data (many days)
    let meansForDayParts = (data) => {
        // maybe make actual objects out of each day part...
        let dayParts = {
            FIRST: 0,
            SECOND: 0,
            THIRD: 0,
            FOURTH: 0,
        }




        let dayCounter = 0
        let dateBefore = 0

        data.forEach((obj) => {
            let dateObj = new Date(obj.epochSeconds * 1000)

            let date = dateObj.getDate()
            if (date !== dateBefore) {
                dayCounter++;
                dateBefore = date;
            }

            let hour = dateObj.getHours()
            if (hour >= 0 && hour <= 5) {
                dayParts.FIRST += obj.wordCount
            } else if (hour >= 6 && hour <= 11) {
                dayParts.SECOND += obj.wordCount
            } else if (hour >= 12 && hour <= 17) {
                dayParts.THIRD += obj.wordCount
            } else if (hour >= 18 && hour <= 23) {
                dayParts.FOURTH += obj.wordCount
            }
        })

        let dayPartsMeans = []
        Object.keys(dayParts).map((key) => {
            dayPartsMeans.push(dayParts[key] / dayCounter) // TODO: Use day counter to divide? Or use 30 days in general?
        })

        return dayPartsMeans
    }

    // find globalMax on the way, so that range can be set accordingly later
    let globalMax = 0;

    let monthlySentMeans = {}

    // key is year-month, values are the objects for that month, with epoch seconds and wordcount
    for (const [key, value] of Object.entries(groupedSentData)) {

        if (monthlySentMeans[key] === undefined) {
            monthlySentMeans[key] = []
        }
        let means = meansForDayParts(value)

        console.log("MEANS:", means)

        means.forEach((mean) => {
            if (mean > globalMax) {
                globalMax = mean;
            }
        })
        monthlySentMeans[key] = means

    }

    let monthlyReceivedMeans = {}
    for (const [key, value] of Object.entries(groupedReceivedData)) {

        if (monthlyReceivedMeans[key] === undefined) {
            monthlyReceivedMeans[key] = []
        }
        let means = meansForDayParts(value)
        means.forEach((mean) => {
            if (mean > globalMax) {
                globalMax = mean;
            }
        })
        monthlyReceivedMeans[key] = means

    }


    // now create frames and slidersteps
    let frames = []
    let sliderSteps = []


    for (const [key, value] of Object.entries(monthlySentMeans)) {

        let name = key
        let x = [FIRST, SECOND, THIRD, FOURTH]

        let ySent = value

        let yReceived = monthlyReceivedMeans[key]
        if (yReceived === undefined) {
            yReceived = [0,0,0,0]
        }

        frames.push({
            name: name,
            data: [
                {
                    name: "Mean sent words",
                    x: x,
                    y: ySent,
                    marker: {
                        //color: "#60BDFF"
                    },
                    width: _.fill(Array(4), 0.8)
                },
                {
                    name: "Mean received words",
                    x: x,
                    y: yReceived,
                    marker: {
                        //color: "#FF8800",
                    },
                    width: _.fill(Array(4), 0.3)
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

    console.log("FRAMES:", frames)
    console.log("SliderSteps:", sliderSteps)

    console.log("globalMax:", globalMax)

    layout["yaxis"] = {
        range: [0, globalMax],
        color: "black"
    }

    layout["sliders"] = [{
        pad: {l: 130, t: 95},
        currentvalue: {
            visible: true,
            prefix: 'Year-Month:',
            xanchor: 'right',
            font: {size: 20, color: 'black'}
        },
        steps: sliderSteps
    }]


    let x = [FIRST, SECOND, THIRD, FOURTH]
    let initialY = [0,0,0,0]


    plotContainer.html("");
    Plotly.newPlot(plotId, [
        {
            name: "Mean sent words",
            x: x,
            y: initialY,
            type: "bar",
            marker: {
                //color: "#60BDFF"
            },
            width: _.fill(Array(4), 0.8)
        },
        {
            name: "Mean received words",
            x: x,
            y: initialY,
            type: "bar",
            marker: {
                //color: "#FF8800",
            },
            width: _.fill(Array(4), 0.5)
        }
    ], layout, {responsive: true}).then(() => {
        Plotly.addFrames(plotId, frames)

        startAnimation(null, 'afterall')
    });







}

module.exports = dayPartsActivityPlot;

