var sortGraphDataPoints = require('./utils/sortGraphDataPointsTimeWise');
const formInputDataForMessagesPlot = require("./utils/formInputDataForMessagesPlot");
const sortGraphDataPointsSync = require("./utils/sortGraphDataPointsSync");
const formInputDataForWordsPlotSync = require("./utils/formInputDataForWordsPlotSync");


function sentReceivedDailyPerConversation(dataOverall, dataPerConversation, plotId, conversationsFriends) {

    const plotContainer = $(`#${plotId}`)
    plotContainer.removeClass('d-none');
    const xAxis = plotContainer.attr("data-x-axis");
    const yAxis = plotContainer.attr("data-y-axis");
    const sent = plotContainer.attr("data-sent-trace-name");
    const received = plotContainer.attr("data-received-trace-name");

    const layout = {
        hovermode: "closest",
        xaxis: {
            tickangle: 45,
            tickformat: '%d-%m-%Y',
            color: "white",
            showgrid: false,
        },
        yaxis: {
            title: "Words",
            color: "white",
            showgrid: false
        },
        legend: {
            bgcolor: "#13223C",
            font: {color: "white"},
            x: 1.01,
            y: 1.16,
        },
        images: [
            {
                source: backGroundImages["horizontalBarChartBackground"],
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

    let getMeanData = (y) => {
        let sum = 0;
        y.forEach((entry) => sum += entry)
        let mean = sum / y.length
        return y.map((entry) => mean)
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
        for (let i = 0; i < allDataOptions.length; i++) {

            //make visibility true/false array for this button option
            let visibilityBooleans = []
            let numberTracesEach = 2
            for (let j = 0; j < allDataOptions.length * numberTracesEach; j++) {
                if (j >= numberTracesEach * i && j < numberTracesEach * (i + 1)) {
                    visibilityBooleans.push(true)
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

            let dataToShow = allDataOptions[i]

            // sort data
            let sortedData = sortGraphDataPointsSync(dataToShow, true, false);

            // format data to needed format
            let plotInputData = formInputDataForWordsPlotSync(sortedData, true)


            const sentMessagesTrace = {
                x: plotInputData.xAxis,
                y: plotInputData.yAxisSentMessages,
                mode: 'lines+markers',
                name: "sent words",
                marker: {size: 4, color: "white"},
                visible: i === 0,
            };

            /* meanTrace?
                                    const meanSentMessagesTrace = {
                                        x: plotInputData.xAxis,
                                        y: getMeanData(plotInputData.yAxisSentMessages),
                                        mode: 'lines',
                                        //name: "mean of sent messages", // internationalize !
                                        //visible: 'legendonly',
                                        visible: i === 0,
                                    };

             */


            const receivedMessagesTrace = {
                x: plotInputData.xAxis,
                y: plotInputData.yAxisReceivedMessages,
                mode: 'lines+markers',
                name: "received words",
                marker: {size: 4, color: "orange"},
                visible: i === 0,
            };

            /* meanTrace?
                                    const meanReceivedMessagesTrace = {
                                        x: plotInputData.xAxis,
                                        y: getMeanData(plotInputData.yAxisReceivedMessages),
                                        mode: 'lines',
                                        //name: "mean of received words",
                                        //visible: 'legendonly',
                                        visible: i === 0,
                                    };

             */


            traces.push(sentMessagesTrace, receivedMessagesTrace)//, meanSentMessagesTrace, meanReceivedMessagesTrace)

        }
        return traces

    }


    let resultTraces = makeTraces()

    layout.xaxis.range = [resultTraces[0].x[0], resultTraces[0].x[resultTraces[0].x.length - 1]]

    /*
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

     */

    layout.xaxis.rangeslider = {}
    layout.height = 700

    plotContainer.html("");
    Plotly.newPlot(plotId, resultTraces, layout, {responsive: true});



}

module.exports = sentReceivedDailyPerConversation;

