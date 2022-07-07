var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");
const _ = require("lodash");

function animatedPolarPlot(dataMonthlyPerConversation, allFriends, plotId) {

    //console.log(dataMonthlyPerConversation)

    // TODO: this should be put into a separate helper file
    let shortenFriend = (friend) => {
        //find index where number starts, all friends have the following form: "friend" + "i" where i is a number
        let numberStart = friend.search(/\d+/)
        return "F" + friend.substring(numberStart, friend.length)
    }

    // TODO: this could also be done in a separate helper file
    let listOfConversations = []
    for (let i = 0; i < allFriends.length; i++) {

        allFriends[i] = allFriends[i].map((friend) => shortenFriend(friend))

        listOfConversations.push("Chat with: <br>" + allFriends[i][0]);
        if (allFriends[i].length === 1) {
            listOfConversations[i] += "  "
        }
        for (let j = 1; j < allFriends[i].length; j++) {
            if (allFriends[i][j] !== "donor") {

                if (j > 7) {
                    listOfConversations[i] += ", ..."
                    break;
                }

                if (j % 4 === 0) {
                    listOfConversations[i] += ", <br>" + allFriends[i][j]
                } else {
                    listOfConversations[i] += ", " + allFriends[i][j]
                }
                if (j === allFriends[i].length - 1) {
                    listOfConversations[i] += "  "
                }
            }
        }
    }


    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");



    let layout = {
        height: 550,
        hovermode: true,
        showlegend: true,
        legend: {
            bgcolor: "#13223C",
            font: {color: "white"},
            x: 0.9,
            y: 1.2,
        },
        polar: {
            bgcolor: "rgba(255, 255, 255, 0)",
            radialaxis: {
                showline: false,
                showgrid: false,
                gridwidth: 0.1,
                //griddash: 'dash', // it seems griddash might only work with a newer plotly.js version?
                gridcolor: "#f5f5f5",
                showticklabels: false,
                ticks: "",
                fixedrange: true
            },
            angularaxis: {
                color: "white",
                layer: "below traces",
                showgrid: false,
                gridcolor: "#f5f5f5",
                gridwidth: 0.1,
                griddash: 'dash',
                fixedrange: true
            }
        },
        images: [
            {
                source: backGroundImages["polarBackground"],
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
        ],
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
                                frame: {duration: 300, redraw: true}
                            }
                        ],
                        label: "Start"
                    },
                    {
                        method: 'animate',
                        args: [[null], {
                            mode: 'immediate',
                            transition: {duration: 0},
                            frame: {duration: 0, redraw: true}
                        }],
                        label: 'Pause'
                    }
                ]
            }
        ]
    }

    // only needed to start the animation when the plot is loaded
    let startAnimation = (groupOrFrames, mode) => {

        Plotly.animate(plotId, groupOrFrames, {
            transition: {
                duration: 300,
                easing: 'linear'
            },
            frame: {
                duration: 300,
                redraw: true,
            },
            mode: mode
        });

    }


    let findGlobalMax = (data) => {
        let max = 0;
        for (let i = 0; i < data.length; i++) {
            data[i].forEach((obj) => {
                let total = obj.receivedCount + obj.sentCount
                if (total > max) {
                    max = total
                }
            })
        }
        return Math.log(max);
    }


    // things needed for animation:
    let frames = []
    let sliderSteps = []
    let initialR = []
    let name;



    // determine max for the range of the axis
    let max = findGlobalMax(dataMonthlyPerConversation)
    max = max + 0.25 * max // for some distance between placement of donor at the max value


    sortGraphDataPoints(dataMonthlyPerConversation, false, false)
        .then(sortedData => {

            // add conversation property to each object, so that later all data can be handled flattened
            for (let i = 0; i < sortedData.length; i++) {
                sortedData[i].forEach(obj => {
                    obj["conversation"] = listOfConversations[i]
                })
            }


            // group by year and month for animation over that time
            let groupedData = _.groupBy(sortedData.flat(), (obj) => {
                return obj.year + "-" + obj.month
            })


            //let traceOfRReceived = []
            //let traceOfThetaReceived = []
            let traceOfRTotal = []
            let traceOfThetaTotal = []

            // create a frame and slideStep for each year-month
            for (const [key, value] of Object.entries(groupedData)) {

                // key is year-month -> that is what will be displayed on the timeline
                name = key;


                //let rValuesSent = []
                let rValuesTotal = []
                let thetaValues = []



                //let rValuesReceivedCount = []


                // get the data for each conversation in value -> value are all the data objects for this year-month
                let helper;
                listOfConversations.forEach((conv) => {
                    helper = value.find(obj => obj.conversation === conv)
                    if (helper !== undefined) {
                        //rValuesSent.push(Math.sqrt(helper.sentCount))
                        //rValuesReceivedCount.push(Math.sqrt(helper.receivedCount))
                        rValuesTotal.push(Math.log(helper.receivedCount + helper.sentCount))

                        // only add to trace if it wasnt undefined
                        //traceOfRReceived.push(Math.sqrt(helper.receivedCount))
                        //traceOfThetaReceived.push(conv)
                        traceOfRTotal.push(Math.log(helper.receivedCount + helper.sentCount))
                        traceOfThetaTotal.push(conv)


                    } else {
                        //rValuesSent.push(0)
                        //rValuesReceivedCount.push(0)
                        rValuesTotal.push(0)
                    }
                    thetaValues.push(conv)
                })


                frames.push({
                    name: name,
                    data: [
                        /*
                        {
                            name: "Sent",
                            r: rValues,
                            theta: thetaValues,
                        },

                         */
                        {
                            name: "Chat Closeness",
                            //r: rValuesReceivedCount,
                            r: rValuesTotal,
                            theta: thetaValues,
                        },
                        {},
                        {
                            name: "traces of Received",
                            //r: [...traceOfRReceived],
                            //theta: [...traceOfThetaReceived]
                            r: [...traceOfRTotal],
                            theta: [...traceOfThetaTotal]
                        }
                    ],
                })

                sliderSteps.push({
                    method: 'animate',
                    label: name,
                    args: [[name], {
                        mode: "immediate",
                        transition: {duration: 300},
                        frame: {duration: 300, redraw: true}
                    }]
                })

            }


            //console.log("FRAMES:", frames)
            //console.log("SliderSteps:", sliderSteps)


            listOfConversations.forEach(() => initialR.push(0))

            /*
            const traceSentInitial = {
                name: "Sent",
                type: "scatterpolar",
                mode: "markers",
                r: initialR,
                theta: listOfConversations,
                marker: {
                    color: 'white',
                    size: 18,
                },
                line: {
                    color: 'white',
                }
            }

            const traceReceivedInitial = {
                name: "Chat Closeness",
                type: "scatterpolar",
                mode: "markers",
                r: initialR,
                theta: listOfConversations,
                marker: {
                    color: 'white',
                    size: 18,
                },
                line: {
                    color: 'white',
                },
                //visible: "legendonly"
            }

             */

            const traceTotalInitial = {
                name: "Chat Closeness",
                type: "scatterpolar",
                mode: "markers",
                r: initialR,
                theta: listOfConversations,
                marker: {
                    color: 'white',
                    size: 18,
                },
                line: {
                    color: 'white',
                },
                //visible: "legendonly"
            }



            //let traces = [traceSentInitial, traceReceivedInitial]
            //let traces = [traceReceivedInitial]
            let traces = [traceTotalInitial]

            traces.push({
                name: "Donor/You",
                type: "scatterpolar",
                mode: "markers",
                r: [max],
                theta: [listOfConversations[0]],
                marker: {
                    color: 'yellow',
                    size: 32,
                    opacity: 0.9
                },
            })




/*
            // add traces with low opacity for all months to create faded out way of marker
            let traceOfRSent = []
            let traceOfThetaSent = []
            let traceOfRReceived = []
            let traceOfThetaReceived = []
            frames.forEach((frame) => {

                for (let i = 0; i < frame.data[0].r.length; i++) {

                    // dont push if r value is 0
                    if (frame.data[0].r[i] > 0) {
                        traceOfRSent.push(frame.data[0].r[i])
                        traceOfThetaSent.push(frame.data[0].theta[i])
                    }
                }

                for (let i = 0; i < frame.data[1].r.length; i++) {

                    // dont push if r value is 0
                    if (frame.data[1].r[i] > 0) {
                        traceOfRReceived.push(frame.data[1].r[i])
                        traceOfThetaReceived.push(frame.data[1].theta[i])
                    }
                }

            })
            */

            /*
            traces.push(
                {
                    name: "traces of Sent",
                    type: "scatterpolar",
                    mode: "markers",
                    r: traceOfRSent,
                    theta: traceOfThetaSent,
                    marker: {
                        color: 'white',
                        size: 10,
                        opacity: 0.1
                    },
                }
            )

             */

            traces.push(
                {
                    name: "traces of Received",
                    type: "scatterpolar",
                    mode: "markers",
                    r: initialR,
                    theta: listOfConversations,
                    marker: {
                        color: 'white',
                        size: 10,
                        opacity: 0.1
                    },
                    showlegend: false
                    //visible: "legendonly"
                }
            )



            layout.polar.radialaxis.range = [max, 0]

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

            //console.log("initial traces: ", traces)


            plotContainer.html("");
            Plotly.newPlot(plotId, {data: traces, layout: layout, frames: frames},).then(() => {
                startAnimation(null, 'afterall')
            });


        })


}

module.exports = animatedPolarPlot;

