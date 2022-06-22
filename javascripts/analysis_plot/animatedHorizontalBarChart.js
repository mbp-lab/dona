var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");
const _ = require("lodash");
const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");

function animatedHorizontalBarChart(sentReceivedPerConversation, dataPerFriend, dataPerConversation, conversationsFriends, plotId) {

    let allFriends = [...new Set(conversationsFriends.flat())]

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
            x: 1.01,
            y: 1.16,
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

    /*
    let allTraces = []
    let groupedFrames = [];
    let groupedSliderSteps = []
    let allXAxisSettings = []
    let allSliderSettings = []


    let makeTraces = () => {

        //reset these variables
        allTraces = []
        groupedFrames = [];
        groupedSliderSteps = []

        let allDataOptions = [dataPerFriend, ...dataPerConversation]

        layout["updatemenus"].push({
            type: 'dropdown',
            direction: "down",
            active: 0,
            buttons: [],
            pad: {'r': 10, 't': 10},
            x: 0.05,
            xanchor: 'left',
            y: 1.25,
            yanchor: 'top'
        })

        for (let i = 0; i < allDataOptions.length; i++) {

            // make visibility booleans for updatemenus
            let visibilityBooleans = []
            for (let j = 0; j < allDataOptions.length; j++) {
                if (i === 0 && j === 0) {
                    visibilityBooleans.push(true, true)
                } else if (i !== 0 && j === 0) {
                    visibilityBooleans.push(false, false)
                } else if (j === i) {
                    visibilityBooleans.push(true)
                } else {
                    visibilityBooleans.push(false)
                }
            }


            let dataToShow = allDataOptions[i]

            let sortedData = sortGraphDataPointsSync(dataToShow)

            let groupedData = _.groupBy(sortedData, (obj) => {
                return obj.year + "-" + obj.month
            })

            // helper object to keep track of who sent how many words
            let friendsSentObj = {}
            let friendsReceivedObj = {}

            // helper variables
            let frames = []
            let sliderSteps = []
            let name;
            let xSent = []
            let ySent = []
            let xReceived = []
            let yReceived = []
            let initialX = []


            // prepare friendsObjects
            let friends = []
            if (i === 0) {
                friends = allFriends;
            } else {
                friends = conversationsFriends[i - 1]
                friends.push("donor")
            }


            friends.forEach((friend) => {
                friendsSentObj[friend] = 0
                friendsReceivedObj[friend] = 0
                initialX.push(0)
            })

            // create frames
            for (const [key, value] of Object.entries(groupedData)) {

                if (i === 0) {
                    value.forEach((fromToSent) => {
                        if (fromToSent.from === "donor" && fromToSent.to !== "donor") {
                            friendsSentObj[fromToSent.to] = friendsSentObj[fromToSent.to] + fromToSent.sentCount
                        } else if (fromToSent.from !== "donor" && fromToSent.to === "donor") {
                            friendsReceivedObj[fromToSent.from] = friendsReceivedObj[fromToSent.from] + fromToSent.sentCount
                        }
                    })
                } else {
                    value.forEach((fromToSent) => {
                        friendsSentObj[fromToSent.from] = friendsSentObj[fromToSent.from] + fromToSent.sentCount
                    })
                }

                // set the name for this frame
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

                // add frame to frames
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

                // add sliderstep for this frame
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

            console.log(i, initialX)
            // add traces to allTraces
            if (i === 0) {
                allTraces.push({
                        name: "Sent words",
                        x: initialX,
                        y: friends,
                        type: "bar",
                        orientation: 'h',
                        marker: {
                            color: "white",
                        },
                        width: _.fill(Array(friends.length), 0.8)
                    },
                    {
                        name: "Received words",
                        x: initialX,
                        y: friends,
                        type: "bar",
                        orientation: 'h',
                        marker: {
                            color: "orange",
                        },
                        width: _.fill(Array(friends.length), 0.3)
                    })
            } else {
                allTraces.push({
                    name: "Sent words",
                    x: initialX,
                    y: friends,
                    type: "bar",
                    orientation: 'h',
                    marker: {
                        color: "white",
                    },
                    width: _.fill(Array(friends.length), 0.8),
                    visible: false,
                })
            }

            // add frames to groupedFrames
            groupedFrames.push(frames)

            // add sliderSteps to groupedSliderSteps
            groupedSliderSteps.push(sliderSteps)


            // set range
            allXAxisSettings.push({
                range: [0, Math.max(...Object.values(friendsSentObj))],
                color: "white"
            })

            // add slider for this data
            allSliderSettings.push([{
                pad: {l: 130, t: 95},
                currentvalue: {
                    visible: true,
                    prefix: 'Year-Month:',
                    xanchor: 'right',
                    font: {size: 20, color: 'black'}
                },
                steps: sliderSteps
            }])


            // add menu for this conversation
            layout["updatemenus"][1]["buttons"].push({
                method: 'update',
                args: [
                    {'visible': visibilityBooleans},
                    {
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
                                            frames, // THIS HERE IS WHAT IS IMPORTANT
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
                        "xaxis": {
                            range: [0, Math.max(...Object.values(friendsSentObj))],
                            color: "white"
                        },
                        "sliders": [{
                            method: "animate",
                            pad: {l: 130, t: 95},
                            currentvalue: {
                                visible: true,
                                prefix: 'Year-Month:',
                                xanchor: 'right',
                                font: {size: 20, color: 'black'}
                            },
                            steps: sliderSteps
                        }]
                    }
                ],
                label: listOfConversations[i]
            })

        }

    }


    makeTraces();

    console.log("ALL TRACES: ", allTraces)
    console.log("All FRAMES:", groupedFrames)
    console.log("ALL SLIDERSTEPS:", groupedSliderSteps)

    // set range
    layout["xaxis"] = allXAxisSettings[0]

    // add slider for this data
    layout["sliders"] = allSliderSettings[0]
    console.log("sliders:", layout["sliders"])

    //layout["updatemenus"][0]["buttons"][0].args[0] = groupedFrames[0]
    //layout["sliders"][0].steps = groupedFrames[0]
    console.log("slider after change", layout["sliders"])


    plotContainer.html("");
    Plotly.newPlot(
        plotId,
        allTraces,
        layout,
        {responsive: true}
    )
        .then(() => {
            Plotly.addFrames(plotId, groupedFrames.flat())

            console.log("HERE is the buttons arg")
            console.log(layout["updatemenus"][0]["buttons"][0][0])
            layout["updatemenus"][0]["buttons"][0].args[0] = groupedFrames[0]
            console.log(layout["updatemenus"][0]["buttons"])

            startAnimation(groupedFrames[0], 'afterall')
        });

     */

    /*
    var myPlot = document.getElementById(plotId)

    myPlot.on('plotly_update', (event) => {
        console.log(event.data[0].visible)
        console.log(myPlot)
        console.log(myPlot._transitionData._frames)
        for (let i = 0; i < event.data[0].visible.length; i++){
            if (event.data[0].visible[i] && (i === 0 || i === 1)) {
                console.log("OVERALL")
                myPlot._transitionData._frames = groupedFrames[0]
                startAnimation(groupedFrames[0], 'afterall')
            } else if (event.data[0].visible[i] && i > 1) {
                console.log("adding frames...")
                myPlot._transitionData._frames = groupedFrames[i+1]
                startAnimation(groupedFrames[i+1], 'afterall')
            }
        }
    })

     */


    let listOfConversations = []
    for (let i = 0; i < conversationsFriends.length; i++) {
        listOfConversations.push("Chat with: <br>" + conversationsFriends[i][0]);
        if (conversationsFriends[i].length === 1) {
            listOfConversations[i] += "  "
        }
        for (let j = 1; j < conversationsFriends[i].length; j++) {
            if (conversationsFriends[i][j] !== "donor") {
                if (j % 2 === 0) {
                    listOfConversations[i] += ", <br>" + conversationsFriends[i][j]
                } else {
                    listOfConversations[i] += ", " + conversationsFriends[i][j]
                }
                if (j === conversationsFriends[i].length - 1) {
                    listOfConversations[i] += "  "
                }
                if (j > 5) {
                    listOfConversations[i] += ", ..."
                    break;
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
                                color: "#1A467B",
                                //color: "00d2ff"
                            },
                            width: _.fill(Array(listOfConversations.length), 0.8)
                        },
                        {
                            name: "Received words",
                            x: xReceived,
                            y: yReceived,
                            marker: {
                                color: "#FF8800",
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
                        color: "#1A467B",
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
                        color: "#FF8800",
                    },
                    width: _.fill(Array(listOfConversations.length), 0.3)
                }
            ], layout, {responsive: true}).then(() => {
                Plotly.addFrames(plotId, frames)

                startAnimation(null, 'afterall')
            });

        })

/*

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

    sortGraphDataPoints(dataPerFriend, false, false)
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


 */



}

module.exports = animatedHorizontalBarChart;

