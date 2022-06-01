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
        //plot_bgcolor: "#2e4482",
        autosize: true,
        height: 700,
        /*
        legend: {
            x: -.1,
            y: 1.2
        },

         */
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
                    size: 12,
                    color:"#fff767",
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
                    marker: {size: 4},
                    visible: 'legendonly'
                }

                layout.xaxis.range = [trace1.x[0], trace1.x[trace1.x.length - 1]]
                layout.xaxis.rangeselector = {
                    buttons: [
                        {
                            count: 1,
                            label: '1m',
                            step: 'month',
                            stepmode: 'backward'
                        },
                        {
                            count: 6,
                            label: '6m',
                            step: 'month',
                            stepmode: 'backward'
                        },
                        {
                            step: 'all',
                        },
                    ]
                }

                layout.xaxis.rangeslider = {}
                layout.height = 700

                const data = [trace1, trace2];
                plotContainer.html("");
                Plotly.newPlot(plotId, data, layout, {responsive: true});
                Plotly.relayout(plotId, {
                    "xaxis.range": [trace1.x[0], trace1.x[trace1.x.length - 1]]
                })

            })
    })
        .catch((err) => console.log(err))


}

module.exports = dailyActivityTimes;

