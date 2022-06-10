var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");
const _ = require("lodash");

function animatedHorizontalBarChart(data, allFriendsData, sentReceivedWordsMonthlyTotal, plotId) {

    //console.log(data);
    //console.log(sentReceivedWordsMonthlyTotal)

    // find maximum for range of plot
    let sumSent = 0
    let findMaximum = () => {
        return sentReceivedWordsMonthlyTotal.reduce((total, currValue) => {
            return total + currValue.sentCount
        }, sumSent)
    }

    let maxRange = findMaximum();

    let allFriends = [...new Set(allFriendsData.flat())]
    //let indexDonor = allFriends.indexOf("donor")
    //allFriends.splice(indexDonor, 1)
    //console.log(allFriends)

    let sentFromDonor = data.filter(obj => obj.from === "donor")
    let sentToDonor = data.filter(obj => obj.from !== "donor")

    //console.log("SENT FROM DONOR:")
    //console.log(sentFromDonor)

    //console.log("SENT TO DONOR:")
    //console.log(sentToDonor)

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");

    let layout = {
        height: 600,
        howlegend: true,
        barmode: 'overlay',
        legend: {
            bgcolor: "#13223C",
            font: {color: "white"},
            x: 1.01,
            y: 1.16,
        },
        yaxis: {
            color: "white"
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
        ],
        images: [
            {
                source: backGroundImages["horizontalBarChartBackground"],
                xref: "paper",
                yref: "paper",
                x: 0.5,
                y: 0.5,
                sizex: 1.5,
                sizey: 1.5,
                xanchor: "center",
                yanchor: "middle",
                sizing: "fill",
                opacity: 1,
                layer: "below"
            }
        ]
    }


    // Stop the animation by animating to an empty set of frames:
    let stopAnimation = () => {
        Plotly.animate(plotId, [], {mode: 'next'});
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


    let frames = []
    let sliderSteps = []
    let name;
    let xSent = []
    let ySent = []
    let xReceived = []
    let yReceived = []
    let initialX = []

    let friendsSentObj = {}
    let friendsReceivedObj = {}

    allFriends.forEach((friend) => {
        friendsSentObj[friend] = 0
        friendsReceivedObj[friend] = 0
        initialX.push(0)
    })

    sortGraphDataPoints(data, false, false)
        .then(sortedData => {
            return _.groupBy(sortedData, (obj) => {
                return obj.year + "-" + obj.month
            })
        })
        .then(groupedData => {

            for (const [key, value] of Object.entries(groupedData)) {

                value.forEach((fromToSent) => {
                    if (fromToSent.from === "donor" && fromToSent.to !== "donor") {
                        friendsSentObj[fromToSent.to] = friendsSentObj[fromToSent.to] + fromToSent.sentCount
                    } else if (fromToSent.from !== "donor" && fromToSent.to === "donor") {
                        friendsReceivedObj[fromToSent.from] = friendsReceivedObj[fromToSent.from] + fromToSent.sentCount
                    }
                })

                name = key

                xSent = []
                ySent = []
                for (const [key, value] of Object.entries(friendsSentObj)) {
                    xSent.push(value)
                    ySent.push(key)
                }

                xReceived = []
                yReceived = []
                for (const [key, value] of Object.entries(friendsReceivedObj)) {
                    xReceived.push(value)
                    yReceived.push(key)
                }

                frames.push({
                    name: name,
                    data: [
                        {
                            name: "Sent words",
                            x: xSent,
                            y: ySent,
                            marker: {
                                color: "white",
                                //color: "00d2ff"
                            },
                            width: _.fill(Array(allFriends.length), 0.8)
                        },
                        {
                            name: "Received words",
                            x: xReceived,
                            y: yReceived,
                            marker: {
                                color: "orange",
                            },
                            width: _.fill(Array(allFriends.length), 0.3)
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


            layout["xaxis"] = {
                range: [0, Math.max(...Object.values(friendsSentObj))],
                color: "white"
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


            plotContainer.html("");
            Plotly.newPlot(plotId, [
                {
                    name: "Sent words",
                    x: initialX,
                    y: allFriends,
                    type: "bar",
                    orientation: 'h',
                    marker: {
                        color: "white",
                    },
                    width: _.fill(Array(allFriends.length), 0.8)
                },
                {
                    name: "Received words",
                    x: initialX,
                    y: allFriends,
                    type: "bar",
                    orientation: 'h',
                    marker: {
                        color: "orange",
                    },
                    width: _.fill(Array(allFriends.length), 0.3)
                }
            ], layout, {responsive: true}).then(() => {
                Plotly.addFrames(plotId, frames)

                startAnimation(null, 'afterall')
            });

        })


}

module.exports = animatedHorizontalBarChart;

