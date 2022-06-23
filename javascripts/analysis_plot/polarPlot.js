var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");

function polarPlot(data, dataMonthlyPerConversation, allFriendsData, plotId) {


    let allFriends = [...new Set(allFriendsData.flat())]

    let sentFromDonor = data.filter(obj => obj.from === "donor")
    let sentToDonor = data.filter(obj => obj.from !== "donor")



    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");




    let layout = {
        //paper_bgcolor: "#141852",
        hovermode: false,
        showlegend: true,
        legend: {
            bgcolor: "#13223C",
            font: {color: "white"},
            x: 0.9,
            y: 1.2,
        },
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
                //tickformat: '>'
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



    let findLastYearMonth = (sortedData) => {
        let lastYear = 0;
        let lastMonth = 0;
        for (let i = 0; i < sortedData.length; i++) {
            let curData = sortedData[i]
            if (lastYear < curData[curData.length - 1].year) {
                lastYear = curData[curData.length - 1].year
            }
        }

        for (let i = 0; i < sortedData.length; i++) {
            let curData = sortedData[i]
            if (lastMonth < curData[curData.length - 1].month && lastYear === curData[curData.length - 1].year) {
                lastMonth = curData[curData.length - 1].month
            }
        }


        return [lastYear, lastMonth];
    }


    sortGraphDataPoints(dataMonthlyPerConversation, false, false)
        .then(sortedData => {

            let lastYearAndMonth = findLastYearMonth(sortedData)
            let lastYear = lastYearAndMonth[0]
            let lastMonth = lastYearAndMonth[1]

            return formInputDataForPolarPlot(sortedData, allFriendsData, lastYear, lastMonth, 12)
        })
        .then(plotInputData => {

            const traceAverages = {
                name: "Sent Averages",
                type: "scatterpolar",
                mode: "markers",
                r: plotInputData.r,
                theta: plotInputData.theta,
                marker: {
                    color: '#f5f5f5',
                    size: 14,
                    opacity: 0.55
                },
                line: {
                    color: 'white',
                }
            }

            const traceLastMonth = {
                name: "Sent Last Month",
                type: "scatterpolar",
                mode: "markers",
                r: plotInputData.rExcludedMonth,
                theta: plotInputData.thetaExcludedMonth,
                marker: {
                    color: 'white',
                    size: 18,
                },
                line: {
                    color: 'white',
                }
            }

            let traces = [traceAverages, traceLastMonth]

            let max;
            let allRDataFlat = plotInputData.rExcludedMonth.concat(plotInputData.r)
            //console.log(allRDataFlat)
            max = Math.max(...allRDataFlat)
            max = max + 0.25*max // for some distance to the circle for the donor
            //console.log("MAX: " + max)


            traces.push({
                name: "Donor/Spender",
                type: "scatterpolar",
                mode: "markers",
                r: [max],
                theta: [plotInputData.theta[0]],
                marker: {
                    color: 'yellow',
                    size: 32,
                    opacity: 0.9
                },
            })

            layout.polar.radialaxis.range = [max,0]


            plotContainer.html("");
            Plotly.newPlot(plotId, traces, layout, { responsive: true });


        })



/*
    sortGraphDataPoints(sentFromDonor, false, false)
        .then(sortedData => {
            // for full points: last month
            let lastYear = sortedData[sortedData.length -1].year
            let lastMonth = sortedData[sortedData.length -1].month

            //console.log("LastYear: " + lastYear + ", lastMonth: " + lastMonth)
            return formInputDataForPolarPlot(sortedData, allFriends, lastYear, lastMonth)
        })
        .then((plotInputData) => {
            const traceAverages = {
                name: "Sent Averages",
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
                name: "Sent Last Month",
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
            //console.log(allRDataFlat)
            max = Math.max(...allRDataFlat)
            max = max + 0.2*max
            //console.log("MAX: " + max)


            traces.push({
                name: "Donor/Spender",
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



 */



}

module.exports = polarPlot;

