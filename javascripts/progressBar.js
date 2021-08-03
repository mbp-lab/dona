function start() {
    $("#donationprogress").removeClass('d-none');
    $(".donation-file-selector").addClass('disabled');
    $(".donation-file-selector").prop('disabled', true);
}

function stop() {
    $("#donationprogress").addClass('d-none');
    $(".donation-file-selector").removeClass('disabled');
    $(".donation-file-selector").prop('disabled', false);
}

module.exports.start = start;
module.exports.stop = stop;