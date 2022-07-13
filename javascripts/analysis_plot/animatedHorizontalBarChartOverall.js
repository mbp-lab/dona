var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");
const _ = require("lodash");
const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");

function animatedHorizontalBarChart(sentReceivedPerConversation, listOfConversations, plotId) {

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
    let sentCount = 0
    let receivedCount = 0


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
                    sentCount += sentReceivedObj.sentCount
                    receivedCount += sentReceivedObj.receivedCount
                })

                name = key



                frames.push({
                    name: name,
                    data: [
                        {
                            name: "Sent words",
                            x: [sentCount],
                            y: ["Sent"],
                            marker: {
                                //color: "#60BDFF"
                            },
                        },

                        {
                            name: "Received words",
                            x: [receivedCount],
                            y: ["Received"],
                            marker: {
                                //color: "#FF8800",
                            },
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
            let maxForRange = sentCount

            if (maxForRange < receivedCount) {
                maxForRange = receivedCount
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
                    x: [0],
                    y: ["Sent"],
                    type: "bar",
                    orientation: 'h',
                },

                {
                    name: "Received words",
                    x: [0],
                    y: ["Received"],
                    type: "bar",
                    orientation: 'h',
                }


            ], layout, {responsive: true}).then(() => {
                Plotly.addFrames(plotId, frames)

                startAnimation(null, 'afterall')
            });

        })



}

module.exports = animatedHorizontalBarChart;

