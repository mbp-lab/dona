var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForDailyActivityPlot = require("./utils/formInputDataForDailyActivityPlot");
const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");


function dailyActivityTimes(dataSent, dataReceived, conversationsFriends, plotId) {

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");


    let layout = {
        hovermode: "closest",
        autosize: true,
        height: 700,
        legend: {
            //bgcolor: "#13223C",
            //font: {color: "white"},
            x: 1.01,
            y: 1.16,
        },
        xaxis: {
            title: "Datum", //xAxis,
            tickangle: 45,
            tickformat: '%d-%m-%Y',
            //color: "white",
            showgrid: true,
            //gridcolor: "grey"
        },
        yaxis: {
            title: "Uhrzeit", //yAxis,
            fixedrange: true,
            // 2022-05-21 is hard coded, because it doesn't work as nicely with just hour:minute
            range: ['2022-05-21 00:00:00', '2022-05-21 23:59:59'],
            tickformat: '%H:%M',
            nticks: 12,
            //color: "white",
            showgrid: true,
            //gridcolor: "grey"
        },
    };

    let listOfConversations = []
    listOfConversations.push("Overall/Everything")
    for (let i = 0; i < dataSent.length; i++) {
        listOfConversations.push("Conversation with " + conversationsFriends[i].filter((participant) => participant !== "donor"))
    }

    let zScoreLimit = 1.39

    // TODO: put this in math helper .js file
    let transformToZScores = (wordCounts) => {
        let result = []

        const n = wordCounts.length
        if (wordCounts.length > 0) {
            const mean = wordCounts.reduce((a, b) => a + b) / n
            const stdDeviation = Math.sqrt(wordCounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)

            let zScore
            for (let i = 0; i < wordCounts.length; i++) {
                zScore = (wordCounts[i] - mean) / stdDeviation
                // colorscale needs a specific range -> zScores bigger than 4 and -4 will be set to 4 or -4 accordingly
                if (zScore > zScoreLimit) {
                    zScore = zScoreLimit;
                } else if (zScore < -zScoreLimit) {
                    zScore = -zScoreLimit
                }
                result.push(zScore)
            }
        }



        return result;
    }


    let makeTraces = () => {

        let allDataOptionsSent = [dataSent.flat(), ...dataSent]
        //let allDataOptionsReceived = [dataReceived.flat(), ...dataReceived]

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


        let traces = []
        for (let i = 0; i < allDataOptionsSent.length; i++) {

            //make visibility true/false array for this button option
            let visibilityBooleans = []
            for (let j = 0; j < allDataOptionsSent.length; j++) {
                if (j === i) {
                    visibilityBooleans.push(true)
                } else {
                    visibilityBooleans.push(false)
                }
            }
            /* // this can be used if there are more than one trace per updatemenu - instead of the method above
            let numberTracesEach = 2
            for (let j = 0; j < allDataOptionsSent.length * numberTracesEach; j++) {
                if (j >= numberTracesEach * i && j < numberTracesEach * (i + 1)) {
                    visibilityBooleans.push(true)
                    visibilityBooleans.push("legendonly")
                    j++;
                } else {
                    visibilityBooleans.push(false)
                }
            }

             */

            // add menu for this conversation
            layout["updatemenus"][0]["buttons"].push({
                method: 'restyle',
                args: ['visible', visibilityBooleans],
                label: listOfConversations[i]
            })

            let dataToShowSent = allDataOptionsSent[i]
            //let dataToShowReceived = allDataOptionsReceived[i]

            // sort
            //let sortedDataSent = sortGraphDataPointsSync(dataToShowSent)
            //let sortedDataReceived = sortGraphDataPointsSync(dataToShowReceived)

            // get correct format
            let plotInputDataSent = formInputDataForDailyActivityPlot(dataToShowSent)
            //let plotInputDataReceived = formInputDataForDailyActivityPlot(sortedDataReceived)

            const traceSent = {
                x: plotInputDataSent.xAxis,
                y: plotInputDataSent.yAxis,
                type: 'scattergl',
                mode: 'markers',
                name: sent,
                marker: {
                    size: 18,
                    autocolorscale: false,
                    cmin: -zScoreLimit,
                    cmax: zScoreLimit,
                    color: transformToZScores(plotInputDataSent.wordCount),
                    colorscale: [ // colorscale need to be those ten values.. then they get stretched to cmin, cmax
                        ['0.0', '#f7fbff'],
                        ['0.111111111111', '#deebf7'],
                        ['0.222222222222', '#c6dbef'],
                        ['0.333333333333', '#9ecae1'],
                        ['0.444444444444', '#6baed6'],
                        ['0.555555555556', '#6baed6'],
                        ['0.666666666667', '#4292c6'],
                        ['0.777777777778', '#2171b5'],
                        ['0.888888888889', '#08519c'],
                        ['1.0', '#08306b']
                    ],
                    symbol: "square",
                    colorbar: {
                        tickvals: [-zScoreLimit, 0 , zScoreLimit],
                        ticktext: ["Less than average", "Average", "More than average"]
                    }
                },
                visible: i === 0
            };


            // this is all for received traces, not using it right now
            /*
            // determine if received trace should be visible: legendonly or false
            let visibleReceived = () => {
                if (i === 0) {
                    return "legendonly"
                } else {
                    return false
                }
            }

            const traceReceived = {
                x: plotInputDataReceived.xAxis,
                y: plotInputDataReceived.yAxis,
                type: 'scattergl',
                mode: 'markers',
                name: received,
                marker: {
                    size: 14,
                    color: transformToZScores(plotInputDataReceived.wordCount),
                    autocolorscale: false,
                    cmin: -zScoreLimit,
                    cmax: zScoreLimit,
                    colorscale: [ // colorscale need to be those ten values.. then they get stretched to cmin, cmax
                        ['0.0', '#2c7fb8'],
                        ['0.111111111111', '#2db4cd'],
                        ['0.222222222222', '#39d7c8'],
                        ['0.333333333333', '#48ddaa'],
                        ['0.444444444444', '#59e391'],
                        ['0.555555555556', '#69e87d'],
                        ['0.666666666667', '#85ed7a'],
                        ['0.777777777778', '#aff18c'],
                        ['0.888888888889', '#d2f59e'],
                        ['1.0', '#edf8b1']
                    ],
                    symbol: "square",
                    colorbar: {}
                },
                visible: visibleReceived()
            }

            traces.push(traceSent, traceReceived)

             */
            traces.push(traceSent)

        }
        return traces;
    }

    let resultTraces = makeTraces();


    layout.height = 550

    plotContainer.html("");
    Plotly.newPlot(plotId, resultTraces, layout, {responsive: true});



}

module.exports = dailyActivityTimes;

