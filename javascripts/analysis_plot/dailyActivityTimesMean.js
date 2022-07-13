var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForDailyActivityPlot = require("./utils/formInputDataForDailyActivityPlot");

function dailyActivityTimesMean(dataSent, dataReceived, plotId) {

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");


    /*
    let listOfConversations = []
    for (let i = 0; i < dataSent.length; i++) {
        listOfConversations.push("Conversation " + i)
    }

     */

    let layout = {
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
        },
        yaxis: {
            title: "Uhrzeit", //yAxis,
            fixedrange: true,
            range: ['2022-05-21 00:00:00', '2022-05-21 23:59:59'],
            tickformat: '%H:%M',
            nticks: 12
        },
    };


    let getMeanOfDates = (dates) => {
        let transformed = dates.map((date) => new Date(date))
        let sum = transformed[0].getTime() // milliseconds
        for (let i = 1; i < transformed.length; i++) {
            sum += transformed[i].getTime()
        }

        let avg = sum/transformed.length
        let dateAvg = new Date(avg)
        let dateStringFormatted = "";
        dateStringFormatted += dateAvg.getFullYear() + "-"

        if (dateAvg.getMonth() + 1 < 10) {
            dateStringFormatted += "0" + (dateAvg.getMonth() + 1) + "-"
        } else {
            dateStringFormatted += (dateAvg.getMonth() + 1) + "-"
        }
        if (dateAvg.getDate() < 10) {
            dateStringFormatted += "0" + dateAvg.getDate() + " "
        } else {
            dateStringFormatted += dateAvg.getDate() + " "
        }

        dateStringFormatted += dateAvg.getHours() + ":" + dateAvg.getMinutes() + ":00"

        return dateStringFormatted
    }

    let getXDayMeanData = (y, days) => {
        resultArray = []
        let mean;

        for (let i = 0; i < y.length; i++) {
            let sliced = y.slice(i, i + days)
            mean = getMeanOfDates(sliced)
            resultArray.push(mean)
        }

        return resultArray
    }


    sortGraphDataPoints(dataSent.flat(), true, true)
        .then((sortedDataPoints) => {
            return formInputDataForDailyActivityPlot(sortedDataPoints);
        })
        .then((plotInputData) => {

            // AVERAGE TIMES
            let groupedData = {}

            plotInputData.yAxis.forEach((elem, index) => {
                if (!(plotInputData.xAxis[index] in groupedData)) {
                    groupedData[plotInputData.xAxis[index]] = []
                }
                groupedData[plotInputData.xAxis[index]].push(elem)

            })

            let averageTimes = {}

            Object.keys(groupedData).forEach((key) => {
                averageTimes[key] = getMeanOfDates(groupedData[key])
            })

            const trace1 = {
                x: Object.keys(averageTimes),
                y: getXDayMeanData(Object.values(averageTimes), 13),
                type: 'scatter',
                mode: 'lines+markers',
                name: "Sent mean time",
                marker: {size: 8}
            };

            return trace1;

        }).then((trace1) => {
        sortGraphDataPoints(dataReceived.flat(), true, true)
            .then((sortedDataPoints) => {
                return formInputDataForDailyActivityPlot(sortedDataPoints)
            })
            .then((plotInputData) => {

                // AVERAGE TIMES
                let groupedData = {}

                plotInputData.yAxis.forEach((elem, index) => {
                    if (!(plotInputData.xAxis[index] in groupedData)) {
                        groupedData[plotInputData.xAxis[index]] = []
                    }
                    groupedData[plotInputData.xAxis[index]].push(elem)

                })

                let averageTimes = {}

                Object.keys(groupedData).forEach((key) => {
                    averageTimes[key] = getMeanOfDates(groupedData[key])
                })

                const trace2 = {
                    x: Object.keys(averageTimes),
                    y: getXDayMeanData(Object.values(averageTimes), 13),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: "Received mean time",
                    marker: {size: 4},
                    visible: 'legendonly'
                };

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

module.exports = dailyActivityTimesMean;

