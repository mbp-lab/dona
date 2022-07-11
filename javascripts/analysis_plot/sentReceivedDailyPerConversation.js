var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForMessagesPlot = require("./utils/formInputDataForMessagesPlot");
const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");
const formInputDataForWordsPlotSync = require("./utils/formInputDataForWordsPlotSync");


function sentReceivedDailyPerConversation(dataOverall, dataPerConversation, plotId, conversationsFriends, slidingWindowMean) {

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");

    const layout = {
        hovermode: "x",
        xaxis: {
            tickangle: 45,
            tickformat: '%d-%m-%Y',
            showgrid: true,
            automargin: true,
        },
        yaxis: {
            title: "Words",
            showgrid: true,
        },
        legend: {
            x: -0.1,
            y: 1.1,
        }
    };




    let getXDayMeanData = (y, days) => {
        let sum, mean;
        resultArray = []

        for (let i = 0; i < y.length; i++) {
            if (i + days <= y.length) {
                let sliced = y.slice(i, i + days)
                sum = 0
                sliced.forEach((entry) => sum += entry)
                mean = sum / sliced.length
                resultArray.push(mean)
            } else {
                return resultArray
            }
        }

        return resultArray
    }

    let listOfConversations = []
    listOfConversations.push("Overall/Everything")
    for (let i = 0; i < dataPerConversation.length; i++) {
        listOfConversations.push("Conversation with " + conversationsFriends[i].filter((participant) => participant !== "donor"))
    }


    let makeTraces = () => {

        // combine all options (overall data and every single conversation)
        let allDataOptions = [dataOverall, ...dataPerConversation]

        // initialize updatemenus
        layout["updatemenus"] = [
            {
                active: 0,
                buttons: [],
                pad: {'r': 10, 't': 10},
                x: -0.1,
                xanchor: 'left',
                y: 1.25,
                yanchor: 'top'
            }
        ]


        let traces = []
        for (let i = 0; i < allDataOptions.length; i++) {

            //make visibility true/false array for this button option
            let visibilityBooleans = []

            for (let j = 0; j < allDataOptions.length; j++) {
                // add two trues or falses for overall path as there are two traces, else always add true or false
                if (j === 0) {
                    if (i === 0) {
                        visibilityBooleans.push(true, true)
                    } else {
                        visibilityBooleans.push(false, false)
                    }
                } else if (j === i) {
                    visibilityBooleans.push(true)
                } else {
                    visibilityBooleans.push(false)
                }
            }

            /*
            let numberTracesEach = 2
            for (let j = 0; j < allDataOptions.length * numberTracesEach; j++) {
                if (j >= numberTracesEach * i && j < numberTracesEach * (i + 1)) {
                    visibilityBooleans.push(true)
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

            let dataToShow = allDataOptions[i]

            // sort data
            //let sortedData = sortGraphDataPointsSync(dataToShow, true, false);

            // format data to needed format
            let plotInputData = formInputDataForWordsPlotSync(dataToShow, true)

            // if this is supposed to be a sliding window mean plot then change y to the mean values
            if (slidingWindowMean) {
                plotInputData.yAxisSentMessages = getXDayMeanData(plotInputData.yAxisSentMessages, 30)
                plotInputData.yAxisReceivedMessages = getXDayMeanData(plotInputData.yAxisReceivedMessages, 30)
            }


            const sentMessagesTrace = {
                x: plotInputData.xAxis,
                y: plotInputData.yAxisSentMessages,
                mode: 'lines+markers',
                name: "sent words",
                marker: {size: 4}, //, color: "white"},
                visible: i === 0,
            };


            const receivedMessagesTrace = {
                x: plotInputData.xAxis,
                y: plotInputData.yAxisReceivedMessages,
                mode: 'lines+markers',
                name: "received words",
                marker: {size: 4}, //, color: "orange"},
                visible: i === 0,
            };


            // if this is for the overall trace, then received should be added, else no received (because of ethics)
            if (i === 0) {
                traces.push(sentMessagesTrace, receivedMessagesTrace)
            } else {
                traces.push(sentMessagesTrace)
            }

        }
        return traces

    }


    let resultTraces = makeTraces()

    layout.xaxis.range = [resultTraces[0].x[0], resultTraces[0].x[resultTraces[0].x.length - 1]]


    layout.xaxis.rangeslider = {}
    layout.height = 700

    plotContainer.html("");
    Plotly.newPlot(plotId, resultTraces, layout, {responsive: true});


}

module.exports = sentReceivedDailyPerConversation;

