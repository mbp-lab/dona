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
            bgcolor: "#13223C",
            font: {color: "white"},
            x: 1.01,
            y: 1.16,
        },
        xaxis: {
            title: "Datum", //xAxis,
            tickangle: 45,
            tickformat: '%d-%m-%Y',
            color: "white"
        },
        yaxis: {
            title: "Uhrzeit", //yAxis,
            fixedrange: true,
            range: ['2022-05-21 00:00:00', '2022-05-21 23:59:59'],
            tickformat: '%H:%M',
            nticks: 12,
            color: "white"
        },
        images: [
            {
                source: backGroundImages["activityHoursBackground"],
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
    };

    let listOfConversations = []
    listOfConversations.push("Overall/Everything")
    for (let i = 0; i < dataSent.length; i++) {
        listOfConversations.push("Conversation with " + conversationsFriends[i].filter((participant) => participant !== "donor"))
    }


    let makeTraces = () => {

        let allDataOptionsSent = [dataSent.flat(), ...dataSent]
        let allDataOptionsReceived = [dataReceived.flat(), ...dataReceived]

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

            // add menu for this conversation
            layout["updatemenus"][0]["buttons"].push({
                method: 'restyle',
                args: ['visible', visibilityBooleans],
                label: listOfConversations[i]
            })

            let dataToShowSent = allDataOptionsSent[i]
            let dataToShowReceived = allDataOptionsReceived[i]

            // sort
            let sortedDataSent = sortGraphDataPointsSync(dataToShowSent)
            let sortedDataReceived = sortGraphDataPointsSync(dataToShowReceived)

            // get correct format
            let plotInputDataSent = formInputDataForDailyActivityPlot(sortedDataSent)
            let plotInputDataReceived = formInputDataForDailyActivityPlot(sortedDataReceived)

            const traceSent = {
                x: plotInputDataSent.xAxis,
                y: plotInputDataSent.yAxis,
                type: 'scatter',
                mode: 'markers',
                name: sent,
                marker: {
                    size: 18,
                    //color: "00d2ff",
                    color: "white",
                    symbol: "square"
                },
                visible: i === 0
            };

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
                type: 'scatter',
                mode: 'markers',
                name: received,
                marker: {
                    size: 14,
                    symbol: "square"
                },
                visible: visibleReceived()
            }

            traces.push(traceSent, traceReceived)

        }
        return traces;
    }

    let resultTraces = makeTraces();

    // determine initial range for plot to show (last month)
    let oneMonthInMilliseconds = 2.628e+9
    let oneMonthBeforeLastDate = new Date(resultTraces[0].x[resultTraces[0].x.length - 1]).getTime() - oneMonthInMilliseconds
    let dateOneMonthBefore = new Date(oneMonthBeforeLastDate)
    let startRange = ""
    let year = dateOneMonthBefore.getFullYear()
    let month = dateOneMonthBefore.getMonth() + 1 // first month is 0...
    let date = dateOneMonthBefore.getDate()
    if (month < 10) {
        month = "0" + month
    }
    if (date < 10) {
        date = "0" + date
    }
    startRange += year + "-" + month + "-" + date

    layout.xaxis.range = [startRange, resultTraces[0].x[resultTraces[0].x.length - 1]]

    layout.xaxis.rangeselector = {
        x: -0.1,
        y: 1.16,
        buttons: [
            {
                count: 1,
                label: '1m',
                step: 'month',
                stepmode: 'todate',
                active: true
            },
            {
                count: 6,
                label: '6m',
                step: 'month',
                stepmode: 'todate',
            },
        ]
    }

    layout.xaxis.rangeslider = {}
    layout.height = 700

    plotContainer.html("");
    Plotly.newPlot(plotId, resultTraces, layout, {responsive: true});



}

module.exports = dailyActivityTimes;
