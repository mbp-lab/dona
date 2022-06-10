var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");
const _ = require("lodash");

function animatedHorizontalBarChart(data, allFriendsData, sentReceivedWordsMonthlyTotal, plotId) {

    console.log(data);
    console.log(sentReceivedWordsMonthlyTotal)

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
    //let sentToDonor = data.filter(obj => obj.from !== "donor")

    console.log(sentFromDonor)
    //console.log(sentToDonor)

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");

    let layout = {
        yaxis: {
            color: "white"
        },
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
    let name;
    let x = []
    let y = []
    let initialX = []

    let friendsSentObj = {}

    allFriends.forEach((friend) => {
        friendsSentObj[friend] = 0
        initialX.push(0)
    })


    sortGraphDataPoints(sentFromDonor, false, false)
        .then(sortedData => {
            let groupedByYearAndMonth = _.groupBy(sortedData, (obj) => {
                return obj.year + "-" + obj.month
            })

            for (const [key, value] of Object.entries(groupedByYearAndMonth)) {

                value.forEach((fromToSent) => {
                    friendsSentObj[fromToSent.to] = friendsSentObj[fromToSent.to] + fromToSent.sentCount
                })

                name = key

                x = []
                y = []
                for (const [key, value] of Object.entries(friendsSentObj)) {
                    x.push(value)
                    y.push(key)
                }

                frames.push({
                    name: name,
                    data: [
                        {
                            x: x,
                            y: y,
                            marker: {
                                color: "white",
                                //color: "00d2ff"
                            }
                        }],
                })

            }
            console.log(frames)

            layout["xaxis"] = {
                range: [0, Math.max(...Object.values(friendsSentObj))],
                color: "white"
            }


            plotContainer.html("");
            Plotly.newPlot(plotId, [{
                x: initialX,
                y: allFriends,
                type: "bar",
                orientation: 'h',
                marker: {
                    color: "00d2ff",
                }
            }], layout, {responsive: true}).then(() => {
                Plotly.addFrames(plotId, frames)

                startAnimation(null, 'afterall')
            });

        })


}

module.exports = animatedHorizontalBarChart;

