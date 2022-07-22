const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");
const _ = require("lodash");


function dayPartsActivityOverallPlot(dataSent, dataReceived, plotId) {

    const FIRST = "00:00-06:00"
    const SECOND = "06:00-12:00"
    const THIRD = "12:00-18:00"
    const FOURTH = "18:00-00:00"

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");

    let layout = {
        height: 600,
        showlegend: true,
        barmode: 'overlay',
        legend: {
            x: -.1,
            y: 1.2
        },
        yaxis: {
            automargin: true,
            color: "black",
            title: yAxis
        },
        xaxis: {
            title: xAxis
        },
        hovermode: 'x',
    }



    let dataSentOverall = dataSent.flat()
    let dataReceivedOverall = dataReceived.flat()



    // gets mean for each day part of the given data (many days)
    let meansForDayParts = (data) => {
        // maybe make actual objects out of each day part...
        let dayParts = {
            FIRST: 0,
            SECOND: 0,
            THIRD: 0,
            FOURTH: 0,
        }

        let dayCounter = 0
        let dateBefore = 0

        data.forEach((obj) => {
            let dateObj = new Date(obj.epochSeconds * 1000)

            let date = dateObj.getDate()
            if (date !== dateBefore) {
                dayCounter++;
                dateBefore = date;
            }

            let hour = dateObj.getHours()
            if (hour >= 0 && hour <= 5) {
                dayParts.FIRST += obj.wordCount
            } else if (hour >= 6 && hour <= 11) {
                dayParts.SECOND += obj.wordCount
            } else if (hour >= 12 && hour <= 17) {
                dayParts.THIRD += obj.wordCount
            } else if (hour >= 18 && hour <= 23) {
                dayParts.FOURTH += obj.wordCount
            }
        })


        let dayPartsMeans = []
        let dayPartsMeansInPercent = []
        let totalOfMeans = 0
        Object.keys(dayParts).map((key) => {
            dayPartsMeans.push(dayParts[key] / dayCounter)
            totalOfMeans += dayParts[key] / dayCounter
        })

        for (let i = 0; i < dayPartsMeans.length; i++) {
            dayPartsMeansInPercent.push(dayPartsMeans[i] / totalOfMeans)
        }

        return dayPartsMeansInPercent
    }


    let yValuesSent = meansForDayParts(dataSentOverall)
    let yValuesReceived = meansForDayParts(dataReceivedOverall)
    // find globalMax on the way, so that range can be set accordingly later
    let globalMax = Math.max(...yValuesReceived.concat(yValuesSent))

    layout["yaxis"] = {
        range: [0, globalMax],
        color: "black",
        tickformat: "p",
        hoverformat: ".2%",
        title: yAxis
    }


    let x = [FIRST, SECOND, THIRD, FOURTH]


    plotContainer.html("");
    Plotly.newPlot(plotId, [
        {
            name: sent,
            x: x,
            y: yValuesSent,
            type: "bar",
            width: _.fill(Array(4), 0.8)
        },
        {
            name: received,
            x: x,
            y: yValuesReceived,
            type: "bar",
            width: _.fill(Array(4), 0.5)
        }
    ], layout, {responsive: true})







}

module.exports = dayPartsActivityOverallPlot;

