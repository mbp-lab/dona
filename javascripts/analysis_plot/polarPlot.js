var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForPolarPlot = require("./utils/formInputDataForPolarPlot");
const _ = require("lodash");

function polarPlot(dataMonthlyPerConversation, allFriendsData, plotId, yearSelectorId) {

    //console.log(dataMonthlyPerConversation)


    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");


    // TODO: put this in math helper .js file
    let transformToZScores = (convData) => {

        let allSentCounts = convData.flat().map((obj) => obj.sentCount)

        // get standard deviation
        const n = allSentCounts.length
        const mean = allSentCounts.reduce((a, b) => a + b) / n
        const stdDeviation = Math.sqrt(allSentCounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)

        for (let i = 0; i < convData.length; i++) {
            convData[i].forEach((obj) => {
                obj["zScore"] = (obj.sentCount - mean) / stdDeviation
            })
        }
    }


    let layout = {
        //paper_bgcolor: "#141852",
        hovermode: true,
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


    let findGlobalMax = (data) => {
        let max = 0;
        for (let i = 0; i < data.length; i++) {
            data[i].forEach((obj) => {
                if (obj.sentCount > max) {
                    max = obj.sentCount
                }
            })
        }
        return Math.sqrt(max);
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

    let assignOptions = (yearsAndMonths, yearSelector) => {

        for (let i = 0; i < yearsAndMonths.length; i++) {
            let currentOption = document.createElement('option');
            currentOption.text = yearsAndMonths[i];
            currentOption.value = yearsAndMonths[i];
            yearSelector.appendChild(currentOption);
        }
    }

    // initialize updatemenus
    layout["updatemenus"] = [{
        active: 0,
        buttons: [],
        pad: {'r': 10, 't': 10},
        x: 0.05,
        xanchor: 'left',
        y: 1.25,
        yanchor: 'top'
    }]

    // need this to assing options for selectors to make sense
    let sortedDataGlobal = []

    // get selector
    let yearSelector = document.querySelector(yearSelectorId)

    let max = findGlobalMax(dataMonthlyPerConversation)
    max = max + 0.25 * max // for some distance between placement of donor at the max value


    sortGraphDataPoints(dataMonthlyPerConversation, false, false)
        .then(sortedData => {

            // this will be used in the update method for the selector
            sortedDataGlobal = sortedData

            //console.log(sortedData.flat())
            // do update menu stuff
            let groupedData = _.groupBy(sortedData.flat(), (obj) => {
                return obj.year + "-" + obj.month
            })

            // selector handling
            //let monthSelector = document.querySelector(monthSelectorId)
            assignOptions(Object.keys(groupedData), yearSelector)
            yearSelector.addEventListener('change', updateConversation, false)


            /*
            console.log("sortedData before:", sortedData)
            console.log("HERE ARE THE ZScores:")
            transformToZScores(sortedData)
            console.log(sortedData)
            */

            let lastYearAndMonth = findLastYearMonth(sortedData)
            let lastYear = lastYearAndMonth[0]
            let lastMonth = lastYearAndMonth[1]

            // set initial selector value
            yearSelector.value = lastYear + "-" + lastMonth

            return formInputDataForPolarPlot(sortedData, allFriendsData, lastYear, lastMonth, 6)
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


            layout.polar.radialaxis.range = [max, 0]


            plotContainer.html("");
            Plotly.newPlot(plotId, traces, layout, {responsive: true});


        })




    //assignOptions(yearsAndMonths, yearSelector, monthSelector)

    let updateConversation = () => {

        let yearMonth = yearSelector.value
        let split = yearMonth.split("-")
        let year = parseInt(split[0])
        let month = parseInt(split[1])
        //console.log(split)

        formInputDataForPolarPlot(sortedDataGlobal, allFriendsData, year, month, 6)
            .then((dataForMenu) => {

                let r = dataForMenu.r
                let rExcludedMonth = dataForMenu.rExcludedMonth


                Plotly.update(plotId, {
                    'r': [
                        r,
                        rExcludedMonth,
                        [max]
                    ]
                })
            })

    }




}

module.exports = polarPlot;

