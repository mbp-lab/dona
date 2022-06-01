var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");

function polarPlot(data, allFriendsData, plotId) {

    //console.log(data);

    let allFriends = [...new Set(allFriendsData.flat())]
    //let indexDonor = allFriends.indexOf("donor")
    //allFriends.splice(indexDonor, 1)
    //console.log(allFriends)

    let sentFromDonor = data.filter(obj => obj.from === "donor")
    let sentToDonor = data.filter(obj => obj.from !== "donor")

    console.log(sentFromDonor)
    //console.log(sentToDonor)


    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");




    let layout = {
        //paper_bgcolor: "#141852",
        hovermode: true,
        showlegend: true,
        polar: {
            //hole: 0.1,
            bgcolor: "rgba(255, 255, 255, 0",
            radialaxis: {
                showline: false,
                showgrid: false,
                gridwidth: 0.1,
                griddash: 'dash', // it seems griddash might only work with a newer plotly.js version?
                gridcolor: "#f5f5f5",
                showticklabels: false,
                ticks: "",
                //tick0: 0,
                //nticks: 2,
                //color: 'yellow',
                range: [5000, 0]
            },
            angularaxis: {
                color: "white",
                layer: "below traces",
                showgrid: false,
                gridcolor: "#f5f5f5",
                gridwidth: 0.1,
                griddash: 'dash',
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
        ]
    }


    sortGraphDataPoints(sentFromDonor, false, false)
        .then(sortedData => {
            // for full points: last month
            let lastYear = sortedData[sortedData.length -1].year
            let lastMonth = sortedData[sortedData.length -1].month

            console.log("LastYear: " + lastYear + ", lastMonth: " + lastMonth)
            return formInputDataForPolarPlot(sortedData, allFriends, lastYear, lastMonth)
        })
        .then((plotInputData) => {
            const traceAverages = {
                type: "scatterpolar",
                mode: "markers",
                r: plotInputData.r,
                theta: plotInputData.theta,
                marker: {
                    color: '#f5f5f5',
                    size: 10,
                    opacity: 0.55
                },
                line: {
                    color: 'white',
                }
            }

            const traceLastMonth = {
                type: "scatterpolar",
                mode: "markers",
                r: plotInputData.rExcludedMonth,
                theta: plotInputData.thetaExcludedMonth,
                marker: {
                    color: 'white',
                    size: 14,
                },
                line: {
                    color: 'white',
                }
            }

            let traces = [traceAverages, traceLastMonth]

            let max;
            let allRDataFlat = plotInputData.rExcludedMonth.concat(plotInputData.r)
            console.log(allRDataFlat)
            max = Math.max(...allRDataFlat)
            max = max + 0.2*max
            console.log("MAX: " + max)


            traces.push({
                type: "scatterpolar",
                mode: "markers",
                r: [max],
                theta: [allFriends[0]],
                marker: {
                    color: 'yellow',
                    size: 25,
                    opacity: 0.9
                },
            })

            layout.polar.radialaxis.range = [max,0]


            plotContainer.html("");
            Plotly.newPlot(plotId, traces, layout, { responsive: true });


        })




    /*
        let traces = [];
        let rLastMonth = []
        let rAverages = []
        let theta = []
        allFriends.forEach((friend) => {
            theta.push(friend)
            rLastMonth.push(Math.floor(Math.random() * (4000 - 100 + 1) + 100))
            rAverages.push(Math.floor(Math.random() * (4000 - 100 + 1) + 100))
        })


        allFriends.forEach((friend) => {
            traces.push({
                type: "scatterpolar",
                mode: "lines+markers",
                r: [Math.floor(Math.random() * (4000 - 100 + 1) + 100)],
                theta: [friend],
                marker: {
                    color: 'white',
                    size: 14,
                },
                line: {
                    color: 'white',
                }
            })
        })

        allFriends.forEach((friend) => {
            traces.push({
                type: "scatterpolar",
                mode: "lines+markers",
                r: [Math.floor(Math.random() * (4000 - 100 + 1) + 100)],
                theta: [friend],
                marker: {
                    color: '#f5f5f5',
                    size: 10,
                    opacity: 0.55
                },
                line: {
                    color: 'white',
                }
            })
        })

         */

    /*
    traces.push({
        type: "scatterpolar",
        mode: "markers",
        r: rLastMonth,
        theta: theta,
        marker: {
            color: 'white',
            size: 14,
        },
        line: {
            color: 'white',
        }
    })

    traces.push({
        type: "scatterpolar",
        mode: "markers",
        r: rAverages,
        theta: theta,
        marker: {
            color: '#f5f5f5',
            size: 10,
            opacity: 0.55
        },
        line: {
            color: 'white',
        }
    })

     */

    /*
    traces.push({
        type: "scatterpolar",
        mode: "markers",
        r: [5000],
        theta: [allFriends[0]],
        marker: {
            color: 'yellow',
            size: 25,
            opacity: 0.9
        },
    })


    plotContainer.html("");
    Plotly.newPlot(plotId, traces, layout, { responsive: true });

     */


}

module.exports = polarPlot;

