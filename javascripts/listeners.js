const facebookZipFileHandler = require('./parsing/facebook/facebookZipFileHandler');
const whatsappTxtFileHandler = require('./parsing/whatsapp/whatsappTxtFileHandler');



const transformJson = require('./transformJson');
const progressBar = require('./progressBar')
const renderTable = require('./showResultsInTable');
const renderUserIDMapping = require('./showUserIdMapping')
const hammerJs = require('hammerjs');
const messageService = require('./messageService');


function addListeners() {
    $("#btn-fb-download-finished").on("click", function (e) {
        e.preventDefault();
        $(".enable-after-fb-download").attr("disabled", false);
        $(".enable-after-fb-download").removeClass("disabled");
    })

    $("#viewRawJson").on("click", function (e) {
        //Open a new tab and dumb the json into it
        e.preventDefault();
        var newTab = window.open();
        newTab.document.open();
        newTab.document.write($("#inputJson").val());
        newTab.document.close();
    });

    if ($("#carousel-deidentified-preview").length) {
        var hammer = new hammerJs(document.querySelector("#carousel-deidentified-preview"));
        hammer.on('swipeleft', function () {
            $("#carousel-deidentified-preview").carousel('next');
        });
        hammer.on('swiperight', function () {
            $("#carousel-deidentified-preview").carousel('prev');
        });

        $("#carousel-deidentified-preview").on("slide.bs.carousel", function (e) {
            var $e = $(e.relatedTarget);
            var idx = $e.index();
            var itemsPerSlide = 3;
            var totalItems = $(".carousel-item").length;

            if (idx >= totalItems - (itemsPerSlide - 1)) {
                var it = itemsPerSlide - (totalItems - idx);
                for (var i = 0; i < it; i++) {
                    // append slides to end
                    if (e.direction == "left") {
                        $(".carousel-item")
                            .eq(i)
                            .appendTo(".carousel-inner");
                    } else {
                        $(".carousel-item")
                            .eq(0)
                            .appendTo($(this).find(".carousel-inner"));
                    }
                }
            }
        });
    }

    $("#offline-consent-donor-id-txt").on("change keyup paste", function () {
        const currentText = $("#offline-consent-donor-id-txt").val();
        if (currentText) {
            $("#submit-donor-id-btn").show();
            $("#use-online-consent-btn").hide();
        }
        else {
            $("#submit-donor-id-btn").hide();
            $("#use-online-consent-btn").show();
        }
    })

    $('.has-animation').each(function (index) {
        $(this).delay($(this).data('delay')).queue(function () {
            $(this).addClass('animate-in');
        });
    });

    setUpFileHandler();

    handleUnsupportedBrowsers();
}

function handleUnsupportedBrowsers() {
    const userAgent = window.navigator.userAgent;
    // check if user is using IE as we know the site does not look correct
    // code taken from https://stackoverflow.com/questions/19999388/check-if-user-is-using-ie
    if (userAgent.indexOf("MSIE") > -1 || userAgent.match(/Trident.*rv\:11\./)) {
        $("#unsupported-browser-warning").removeClass("d-none");
    }
}

function setUpFileHandler() {
    const i18nSupport= $("#i18n-support");
    let donaForMEDonation = {
        "donor_id": i18nSupport.data('donor'),
        "conversations": []
    };

    $(".donation-file-selector>input[type='file']").on("click", function(evt) {
        const requiresAlias = evt.currentTarget.getAttribute('data-requires-alias');
        const dataSourceName = evt.currentTarget.id;
        if (requiresAlias && !$(`#${dataSourceName}AliasInput`).val()) {
            messageService.showError(i18nSupport.data('error-no-alias'));
            evt.preventDefault();
        }
    });

    $(".donation-file-selector>input[type='file']").on("change", function (evt) {
        const dataSource = evt.currentTarget.id;
        const donorId = $("#donor_id").val();

        progressBar.start();

        var handler;

        if (dataSource == "WhatsApp") {
            const alias = $("#WhatsAppAliasInput").val();
            handler = whatsappTxtFileHandler(evt.target.files, alias);
            //$("#WhatsAppAliasInput").val('Test')
        } else {
            handler = facebookZipFileHandler(evt.target.files);
        }

        handler
            .then((deIdentifiedJson) => {
                renderTable(deIdentifiedJson.deIdentifiedJsonContents);
                renderUserIDMapping(deIdentifiedJson.participantNameToRandomIds, i18nSupport.data('system'), i18nSupport.data('donor'))
                return transformJson(deIdentifiedJson.deIdentifiedJsonContents, donorId, dataSource);
            })
            .then((transformedJson) => {
                // if there are already conversations of the chosen dataSource, then first filter the old ones out
                donaForMEDonation.conversations = donaForMEDonation.conversations.filter((conv) => conv["donation_data_source_type"] !== dataSource)
                donaForMEDonation.conversations = donaForMEDonation.conversations.concat(transformedJson.conversations);

                $("#inputJson").attr('value', JSON.stringify(donaForMEDonation));
                $(".show-on-anonymisation-success").removeClass('d-none');
            
                $("#" + dataSource + "Checkmark").removeClass('d-none');

                messageService.showSuccess(i18nSupport.data("anonymisation-successful"));

                progressBar.stop();
            })
            .catch(error => {
                console.log(error);
    
                messageService.showError(i18nSupport.data("error") + " " + error);
                progressBar.stop();
            });
        
    });
}

module.exports = addListeners