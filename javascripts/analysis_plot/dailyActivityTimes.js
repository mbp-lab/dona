var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForDailyActivityPlot = require("./utils/formInputDataForDailyActivityPlot");


function dailyActivityTimes(dataSent, dataReceived, plotId) {

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


    sortGraphDataPoints(dataSent.flat(), true, true)
        .then((sortedDataPoints) => {
            return formInputDataForDailyActivityPlot(sortedDataPoints);
        })
        .then((plotInputData) => {

            const trace1 = {
                x: plotInputData.xAxis,
                y: plotInputData.yAxis,
                type: 'scatter',
                mode: 'markers',
                name: sent,
                marker: {
                    size: 18,
                    //color: "00d2ff",
                    color: "white",
                    symbol: "square"
                }
            };

            return trace1;

        }).then((trace1) => {
        sortGraphDataPoints(dataReceived.flat(), true, true)
            .then((sortedDataPoints) => {
                return formInputDataForDailyActivityPlot(sortedDataPoints)
            })
            .then((plotInputData) => {
                const trace2 = {
                    x: plotInputData.xAxis,
                    y: plotInputData.yAxis,
                    type: 'scatter',
                    mode: 'markers',
                    name: received,
                    marker: {
                        size: 14,
                        symbol: "square"
                    },
                    visible: 'legendonly'
                }

                // determine initial range for plot to show (last month)
                let oneMonthInMilliseconds = 2.628e+9
                let oneMonthBeforeLastDate = new Date(trace1.x[trace1.x.length - 1]).getTime() - oneMonthInMilliseconds
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

                layout.xaxis.range = [startRange, trace1.x[trace1.x.length - 1]]

                layout.xaxis.rangeselector = {
                    buttons: [
                        {
                            count: 1,
                            label: '1m',
                            step: 'month',
                            stepmode: 'backward',
                            active: true
                        },
                        {
                            count: 6,
                            label: '6m',
                            step: 'month',
                            stepmode: 'backward',
                        },
                        {
                            step: 'all',
                            active: false,
                        },
                    ]
                }

                layout.xaxis.rangeslider = {}
                layout.height = 700

                const data = [trace1, trace2];
                plotContainer.html("");
                Plotly.newPlot(plotId, data, layout, {responsive: true});
                Plotly.relayout(plotId, {
                    "xaxis.range": [startRange, trace1.x[trace1.x.length - 1]]
                })

            })
    })
        .catch((err) => console.log(err))


}

module.exports = dailyActivityTimes;

