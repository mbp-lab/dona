function sortSliderStepsAndFrames(sliderSteps, frames) {
    // sort sliderSteps and frames to make sure the order is okay:
    let sortedSliderSteps = sliderSteps.sort((a, b) => {
        let aSplitted = a.label.split("-")
        let bSplitted = b.label.split("-")
        let aYear = parseInt(aSplitted[0])
        let aMonth = parseInt(aSplitted[1])
        let bYear = parseInt(bSplitted[0])
        let bMonth = parseInt(bSplitted[1])

        if (aYear > bYear) {
            return 1;
        } else if (aYear < bYear) {
            return -1;
        } else if (aMonth > bMonth) {
            return 1;
        } else if (aMonth < bMonth) {
            return -1;
        } else {
            return 0;
        }

    })

    let sortedFrames = frames.sort((a, b) => {
        let aSplitted = a.name.split("-")
        let bSplitted = b.name.split("-")
        let aYear = parseInt(aSplitted[0])
        let aMonth = parseInt(aSplitted[1])
        let bYear = parseInt(bSplitted[0])
        let bMonth = parseInt(bSplitted[1])

        if (aYear > bYear) {
            return 1;
        } else if (aYear < bYear) {
            return -1;
        } else if (aMonth > bMonth) {
            return 1;
        } else if (aMonth < bMonth) {
            return -1;
        } else {
            return 0;
        }

    })

    return {
        frames: sortedFrames,
        sliderSteps: sortedSliderSteps
    }
}


module.exports = sortSliderStepsAndFrames;