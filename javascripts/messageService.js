let messageService = {
    "showError": function (message, id) {
        $("#success").addClass('d-none');
        $("#error").removeClass('d-none');
        $("#error").html(message);
    },
    "showSuccess": function (message) {
        $("#error").addClass('d-none');
        $("#success").removeClass('d-none');
        $("#success").html(message);
    },
   "hide": function() {
     $("#error").addClass('d-none');
     $("#success").addClass('d-none');
   }
}

module.exports = messageService