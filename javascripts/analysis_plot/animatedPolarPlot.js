var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");
const _ = require("lodash");

function animatedPolarPlot(dataMonthlyPerConversation, listOfConversations, plotId) {

    // TODO: put this in math helper .js file
    let zScoreLimit = 2
    let calcZScores = (dataMonthlyPerConv) => {

        let maxScore = 0;
        let minScore = 0;

        const flattened = dataMonthlyPerConv.flat();
        const n = flattened.length

        // sums of sentCount and receivedCount
        const sums = flattened.map((obj) => obj.sentCount + obj.receivedCount)

        const mean = sums.reduce((a, b) => a + b) / n
        const stdDeviation = Math.sqrt(sums.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a+ b) / n)

        let zScore
        for (let i = 0; i < flattened.length; i++) {
            zScore = (sums[i] - mean) / stdDeviation
            // colorscale needs a specific range -> zScores bigger than zScoreLimit and -zScoreLimit will be set to zScoreLimit or -zScoreLimit accordingly
            if (zScore > zScoreLimit) {
                zScore = zScoreLimit;
            } else if (zScore < -zScoreLimit) {
                zScore = -zScoreLimit
            }

            if (zScore > maxScore) {
                maxScore = zScore
            } else if (zScore < minScore) {
                minScore = zScore
            }
            flattened[i]["zScore"] = zScore
        }
        return [minScore, maxScore]
    }


    let minAndMax = calcZScores(dataMonthlyPerConversation)
    let globalMin = minAndMax[0]
    let globalMax = minAndMax[1]


    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const legendDonor = plotContainer.attr("data-legend-donor");
    const legendOthers = plotContainer.attr("data-legend-others");
    const closer = plotContainer.attr("data-description-closer");
    const average = plotContainer.attr("data-description-average");
    const lessClose = plotContainer.attr("data-description-lessClose");
    const yearMonth = plotContainer.attr("data-description-yearMonth");


    let layout = {
        height: 550,
        hovermode: false,
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
                color: "#C3C3C3",
                showline: false,
                showgrid: true,
                gridwidth: 0.1,
                //griddash: 'dash', // it seems griddash might only work with a newer plotly.js version?
                gridcolor: "#60BDFF",
                showticklabels: true,
                ticks: "",
                //tick0: 0,
                //dtick: 2,
                tickmode: "array", // If "array", the placement of the ticks is set via `tickvals` and the tick text is `ticktext`.
                tickvals: [-2, 0, 2],
                ticktext: [lessClose, average, closer],
                tickfont: {
                    size: 12,
                },
                fixedrange: true
            },
            angularaxis: {
                rotation: 15,
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


    // things needed for animation:
    let frames = []
    let sliderSteps = []
    let initialR = []
    let name;



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

            let zeroBools = {}
            listOfConversations.forEach((conv) => zeroBools[conv.toString()] = false)

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
                        //rValuesTotal.push(Math.log(helper.receivedCount + helper.sentCount))
                        rValuesTotal.push(helper.zScore)


                        // only add to trace if it wasnt undefined
                        //traceOfRReceived.push(Math.sqrt(helper.receivedCount))
                        //traceOfThetaReceived.push(conv)
                        //traceOfRTotal.push(Math.log(helper.receivedCount + helper.sentCount))
                        traceOfRTotal.push(helper.zScore)
                        traceOfThetaTotal.push(conv)


                    } else {
                        //rValuesSent.push(0)
                        //rValuesReceivedCount.push(0)
                        //rValuesTotal.push(0)
                        rValuesTotal.push(-zScoreLimit)

                        if (!zeroBools[conv.toString()]) {
                            traceOfRTotal.push(-zScoreLimit)
                            traceOfThetaTotal.push(conv)
                            zeroBools[conv.toString()] = true;
                        }

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
                            name: legendOthers,
                            //r: rValuesReceivedCount,
                            r: rValuesTotal,
                            theta: thetaValues,
                        },
                        {},
                        {
                            name: "traces of " + legendOthers,
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
                name: legendOthers,
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
                name: legendDonor,
                type: "scatterpolar",
                mode: "markers",
                r: [zScoreLimit + zScoreLimit * 0.5],
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
                    name: "traces of " + legendOthers,
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



            //layout.polar.radialaxis.range = [max, 0]
            layout.polar.radialaxis.range = [zScoreLimit + zScoreLimit * 0.5, -zScoreLimit]


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

            //console.log("initial traces: ", traces)


            plotContainer.html("");
            Plotly.newPlot(plotId, {data: traces, layout: layout, frames: frames},).then(() => {
                startAnimation(null, 'afterall')
            });


        })


}

module.exports = animatedPolarPlot;

