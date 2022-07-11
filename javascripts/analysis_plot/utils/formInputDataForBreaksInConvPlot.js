const _ = require("lodash");

function formInputDataForBreaksInConvPlot(responseTimes) {

    if (responseTimes.length === 0) {
        return {
            x: [],
            y: []
        }
    }

    const getDays = (year, month) => {
        return new Date(year, (month+1), 0).getDate();
    };

    responseTimes = responseTimes.sort(function (current, next) {
        return current.epochMs - next.epochMs
    });

    // group data my year and month
    let groupedYearMonth = _.groupBy(responseTimes, (point) => {
        let dateObj = new Date(point.epochMs)
        //return point.date + "-" + point.month + "-" + point.year;
        let year = dateObj.getFullYear()
        let month = dateObj.getMonth() + 1

        if (month < 10) {
            month = "0" + month
        }
        point["yearMonth"] = year + "-" + month + "-01"
        return year + "-" + month + "-01"
    })


    let yearMonthsMaxValues = {}

    let firstDate = new Date(responseTimes[0].epochMs)
    let lastDate = new Date(responseTimes[responseTimes.length - 1].epochMs);

    let loopYearMonth = new Date(firstDate.getFullYear(), firstDate.getMonth())
    let lastYearMonth = new Date(lastDate.getFullYear(), lastDate.getMonth())

    while (loopYearMonth <= lastYearMonth) {
        // generate key:
        let year = loopYearMonth.getFullYear()
        let month = loopYearMonth.getMonth() + 1

        if (month < 10) {
            month = "0" + month
        }
        let key = year + "-" + month + "-01" // the day is only for making plotly js accept this as a date

        // if there was no message in this month, then there was no contact for the whole month, else get max break in days
        if (groupedYearMonth[key] === undefined) {
            yearMonthsMaxValues[key] = getDays(loopYearMonth.getFullYear(), loopYearMonth.getMonth())
        } else {
            yearMonthsMaxValues[key] = Math.max(...groupedYearMonth[key].map(val => Math.floor(val.timeInMs / (1000 * 60 * 60 * 24))))
        }

        let loopDate = loopYearMonth.setMonth(loopYearMonth.getMonth() + 1);
        loopYearMonth = new Date(loopDate);
    }

    let x = []
    let y = []
    for (const [key, value] of Object.entries(yearMonthsMaxValues)) {
        x.push(key)
        y.push(value)
    }

    return {
        x: x,
        y : y
    }
};


module.exports = formInputDataForBreaksInConvPlot;