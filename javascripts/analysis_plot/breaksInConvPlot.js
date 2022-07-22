const formInputDataForBreaksInConvPlot = require("./utils/formInputDataForBreaksInConvPlot");


function breaksInConvPlot(wordsPerConv, listOfConversations, plotId) {

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
            tickformat: '%m-%Y',
            showgrid: true,
            automargin: true,
        },
        yaxis: {
            title: "Longest Period with no Response in Days",
            showgrid: true,
        },
        legend: {
            x: -0.1,
            y: 1.15,
        }
    };



    let makeTraces = () => {

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
        for (let i = 0; i < wordsPerConv.length; i++) {

            //make visibility true/false array for this button option
            let visibilityBooleans = []

            for (let j = 0; j < wordsPerConv.length; j++) {
                if (j === i) {
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


            let plotInputData = formInputDataForBreaksInConvPlot(wordsPerConv[i])


            traces.push({
                x: plotInputData.x,
                y: plotInputData.y,
                mode: 'lines+markers',
                name: "no contact",
                marker: {size: 12},
                visible: i === 0,
            })

        }

        return traces;
    }


    let resultTraces = makeTraces()

    layout.yaxis.range = [0, 32]

    plotContainer.html("");
    Plotly.newPlot(plotId, resultTraces, layout, {responsive: true});

}

module.exports = breaksInConvPlot;

