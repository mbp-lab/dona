var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");
const _ = require("lodash");
const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");

function animatedHorizontalBarChart(sentReceivedPerConversation, conversationsFriends, plotId) {

    let allFriends = [...new Set(conversationsFriends.flat())]

    // if I want to give this a conversation selector/updatemenu with frames: give frames different names for each conversation so they dont collide! so name: conversationI + counter and label: year-month ?

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


    let shortenFriend = (friend) => {
        //find index where number starts, all friends have the following form: "friend" + "i" where i is a number
        let numberStart = friend.search(/\d+/)
        return "F" + friend.substring(numberStart, friend.length)
    }


    let listOfConversations = []
    for (let i = 0; i < conversationsFriends.length; i++) {

        conversationsFriends[i] = conversationsFriends[i].map((friend) => shortenFriend(friend))

        listOfConversations.push("Chat with: <br>" + conversationsFriends[i][0]);
        if (conversationsFriends[i].length === 1) {
            listOfConversations[i] += "  "
        }
        for (let j = 1; j < conversationsFriends[i].length; j++) {
            if (conversationsFriends[i][j] !== "donor") {

                if (j > 7) {
                    listOfConversations[i] += ", ..."
                    break;
                }

                if (j % 4 === 0) {
                    listOfConversations[i] += ", <br>" + conversationsFriends[i][j]
                } else {
                    listOfConversations[i] += ", " + conversationsFriends[i][j]
                }
                if (j === conversationsFriends[i].length - 1) {
                    listOfConversations[i] += "  "
                }
            }
        }
    }


    let frames = []
    let sliderSteps = []
    let name;
    let xSent = []
    let ySent = []
    let xReceived = []
    let yReceived = []
    let initialX = []

    let conversationSentObj = {}
    let conversationReceivedObj = {}


    listOfConversations.forEach((conv) => {
        conversationSentObj[conv] = 0
        conversationReceivedObj[conv] = 0
        initialX.push(0)
    })

    let flattenedSentReceived = sentReceivedPerConversation.map((array, i) => {
        array.forEach(obj => {
            obj["conversation"] = listOfConversations[i]
            return obj;
        })
        return array;
    })


    sortGraphDataPoints(flattenedSentReceived.flat(), false, false)
        .then(sortedData => {
            return _.groupBy(sortedData, (obj) => {
                return obj.year + "-" + obj.month
            })
        })
        .then(groupedData => {


            for (const [key, value] of Object.entries(groupedData)) {


                value.forEach((sentReceivedObj) => {
                    conversationSentObj[sentReceivedObj.conversation] = conversationSentObj[sentReceivedObj.conversation] + sentReceivedObj.sentCount
                    conversationReceivedObj[sentReceivedObj.conversation] = conversationReceivedObj[sentReceivedObj.conversation] + sentReceivedObj.receivedCount
                })

                name = key

                xSent = []
                ySent = []
                for (const [key, value] of Object.entries(conversationSentObj)) {
                    xSent.push(value)
                    ySent.push(key)
                }

                xReceived = []
                yReceived = []
                for (const [key, value] of Object.entries(conversationReceivedObj)) {
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
                                //color: "#60BDFF"
                            },
                            width: _.fill(Array(listOfConversations.length), 0.8)
                        },
                        {
                            name: "Received words",
                            x: xReceived,
                            y: yReceived,
                            marker: {
                                //color: "#FF8800",
                            },
                            width: _.fill(Array(listOfConversations.length), 0.3)
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


            // find max for range, so that bars dont get cut off
            let maxForRange = Math.max(...Object.values(conversationSentObj))
            let maxReceived = Math.max(...Object.values(conversationReceivedObj))
            if (maxForRange < maxReceived) {
                maxForRange = maxReceived
            }

            layout["xaxis"] = {
                range: [0, maxForRange],
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


            plotContainer.html("");
            Plotly.newPlot(plotId, [
                {
                    name: "Sent words",
                    x: initialX,
                    y: listOfConversations,
                    type: "bar",
                    orientation: 'h',
                    marker: {
                        //color: "#60BDFF",
                    },
                    width: _.fill(Array(listOfConversations.length), 0.8)
                },
                {
                    name: "Received words",
                    x: initialX,
                    y: listOfConversations,
                    type: "bar",
                    orientation: 'h',
                    marker: {
                        //color: "#FF8800",
                    },
                    width: _.fill(Array(listOfConversations.length), 0.3)
                }
            ], layout, {responsive: true}).then(() => {
                Plotly.addFrames(plotId, frames)

                startAnimation(null, 'afterall')
            });

        })



}

module.exports = animatedHorizontalBarChart;

