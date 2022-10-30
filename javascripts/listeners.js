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

    $(".viewRawJson").on("click", function (e) {
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
    let earlierSuccess = false
    const i18nSupport= $("#i18n-support");
    let donaForMEDonation = {
        "donor_id": i18nSupport.data('donor'),
        "conversations": []
    };
    let currentFiles = []
    let possibleEarliestDate = 0
    let possibleLatestDate = 0

    $(".donation-file-selector>input[type='file']").on("click", function(evt) {
        //const requiresAlias = evt.currentTarget.getAttribute('data-requires-alias');
        const requiresAlias = false; // TODO: clean up
        const dataSourceName = evt.currentTarget.id;
        if (requiresAlias && !$(`#${dataSourceName}AliasInput`).val()) {
            messageService.showError(i18nSupport.data('error-no-alias'), dataSourceName);
            evt.preventDefault();
        }
    });

    let onFileInputChange = (dataSource, files) => {

        if (files.length < 1) {
            messageService.hide(dataSource)
            $(".show-on-anonymisation-success" + "-" + dataSource).addClass('d-none');
            $(".show-on-anonymisation-success").addClass('d-none');
            return;
        }

        const donorId = $("#donor_id").val();

        messageService.hide(dataSource)
        progressBar.start(dataSource);

        $(".show-on-anonymisation-success" + "-" + dataSource).addClass('d-none');
        $(".show-on-anonymisation-success").addClass('d-none');

        var handler;

        if (dataSource == "WhatsApp") {
            for (let i = 0; i < files.length; i++) {
                currentFiles.push(files[i])
            }
            handler = whatsappTxtFileHandler(currentFiles);

        } else {
            handler = facebookZipFileHandler(files);
        }


        handler
            .then((deIdentifiedJson) => {
                const fileList = $("#" + dataSource + "FileList")
                fileList.empty()
                let dataSourceClass = "listItemRemove" + dataSource

                let fileName
                /*
                for (let i = 0; i < evt.target.files.length; i++) {
                    fileName = evt.target.files[i].name
                    fileList.append('<li class="list-group-item">' + fileName + '</li>')
                }

                 */
                console.log("files", files)
                console.log("currentFiles", currentFiles)
                console.log(fileList)
                let filesForList = []
                if (dataSource === "WhatsApp") {
                    filesForList = currentFiles
                } else {
                    filesForList = files
                }
                for (let i = 0; i < filesForList.length; i++) {
                    fileName = filesForList[i].name
                    fileList.append('<li class="list-group-item">' + fileName + '<button class="btn badge badge-secondary float-right ' + dataSourceClass +'" id="' + fileName + '">' + i18nSupport.data("remove") + '</button> </li>')
                }

                // remove method for facebook (there is always only one facebook zip file)
                $(".listItemRemove" + dataSource).click(function (evt) {
                    if (dataSource === "Facebook") {
                        let inputObj = JSON.parse($("#inputJson")[0].value)
                        let inputObjConv = inputObj.conversations
                        let filteredConv = inputObjConv.filter((conv) => conv["donation_data_source_type"] !== dataSource)
                        inputObj.conversations = filteredConv
                        $("#inputJson").attr('value', JSON.stringify(inputObj));
                        fileList.empty()
                        $(".show-on-anonymisation-success" + "-" + dataSource).addClass('d-none');
                        messageService.hide(dataSource)
                        if (inputObj.conversations.length < 1) {
                            $(".show-on-anonymisation-success").addClass('d-none');
                        }
                    } else if (dataSource === "WhatsApp") {
                        donaForMEDonation.conversations = donaForMEDonation.conversations.filter((conv) => conv["donation_data_source_type"] !== dataSource)
                        fileList.empty()
                        let tmpCurrentFiles = currentFiles
                        currentFiles = []
                        onFileInputChange(dataSource, Array.from(tmpCurrentFiles).filter((file) => file.name !== evt.target.id))
                    }
                })

                // this needs to be done with all data ( maybe in next .then???) TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                renderTable(deIdentifiedJson.deIdentifiedJsonContents, dataSource);
                renderUserIDMapping(deIdentifiedJson.participantNameToRandomIds, i18nSupport.data('system'), i18nSupport.data('donor'), dataSource)
                return transformJson(deIdentifiedJson.deIdentifiedJsonContents, donorId, dataSource);
            })
            .then((transformedJson) => {
                // if there are already conversations of the chosen dataSource, then first filter the old ones out
                donaForMEDonation.conversations = donaForMEDonation.conversations.filter((conv) => conv["donation_data_source_type"] !== dataSource)

                let earliestDate = transformedJson.result[0].earliestDate
                let latestDate = transformedJson.result[0].latestDate

                transformedJson.result.forEach((res) => {
                    donaForMEDonation.conversations = donaForMEDonation.conversations.concat(res.conversation);
                    if (res.earliestDate < earliestDate) {
                        earliestDate = res.earliestDate
                    } else if (res.latestDate > latestDate) {
                        latestDate = res.latestDate
                    }
                })

                possibleEarliestDate = earliestDate
                possibleLatestDate = latestDate
                let earliestDateObj = new Date(earliestDate);
                let earliestDateString = earliestDateObj.toISOString().substring(0, 10)
                let latestDateObj = new Date(latestDate)
                let latestDateString = latestDateObj.toISOString().substring(0, 10)

                document.getElementById("startDate-" + dataSource).value = earliestDateString;
                document.getElementById("endDate-" + dataSource).value = latestDateString;

                $("#inputJson").attr('value', JSON.stringify(donaForMEDonation));
                $(".show-on-anonymisation-success" + "-" + dataSource).removeClass('d-none');
                $(".show-on-anonymisation-success").removeClass('d-none');

                $("#" + dataSource + "Checkmark").removeClass('d-none');

                messageService.showSuccess(i18nSupport.data("anonymisation-successful") + " " + i18nSupport.data("info-preview-data-body1"), dataSource);

                earlierSuccess = true;
                progressBar.stop(dataSource);
            })
            .catch(error => {
                console.log(error);

                if (earlierSuccess) {
                    $(".show-on-anonymisation-success" + "-" + dataSource).removeClass('d-none');
                    $(".show-on-anonymisation-success").removeClass('d-none');
                }
                messageService.showError(i18nSupport.data("error") + " " + error, dataSource);
                progressBar.stop(dataSource);
            });

    }

    $(".donation-file-selector>input[type='file']").on("change", (evt) => {
        const dataSource = evt.currentTarget.id;
        const files = evt.target.files
        onFileInputChange(dataSource, files)
    })

    $(".date-selection").on("change", (evt) => {
        const dataSource = evt.currentTarget.id.substring(evt.currentTarget.id.indexOf('-') + 1, evt.currentTarget.id.length);
        let startDate = document.getElementById("startDate-" + dataSource).value
        let endDate = document.getElementById("endDate-" + dataSource).value
        console.log("startdate:", startDate)

        let startDateMs = new Date(startDate).getTime()
        let endDateMs = new Date(endDate).getTime()

        messageService.hideErrorShowSuccess(dataSource)
        if (startDate === "") {
            messageService.showError("please select a start date.. ToDo", dataSource);
            $(".show-on-anonymisation-success").addClass('d-none');
            return;
        }
        else if (startDateMs > possibleLatestDate || endDateMs < possibleEarliestDate || startDateMs >= endDateMs) {
            messageService.showError("The dates dont make sense... ToDo", dataSource);
            $(".show-on-anonymisation-success").addClass('d-none');
            return;
        }

        let inputObj = JSON.parse($("#inputJson")[0].value)
        let inputObjConv = inputObj.conversations
        let dataSourceConv = inputObjConv.filter((conv) => conv["donation_data_source_type"] === dataSource)
        dataSourceConv.forEach(conv => {
            conv.messages = conv.messages.filter((message) =>
                message.timestamp_ms >= startDateMs && message.timestamp_ms <= endDateMs)
        })
        inputObj.conversations = inputObjConv.filter((conv) => conv["donation_data_source_type"] !== dataSource)
            .concat(dataSourceConv)


        messageService.hideErrorShowSuccess(dataSource)
        let allConvEmpty = true
        inputObj.conversations.forEach((conv) => {
            if (conv.messages.length !== 0) {
                allConvEmpty = false
                return
            }
        })
        if (allConvEmpty) {
            messageService.showError("All Conv are empty ToDo", dataSource);
            $(".show-on-anonymisation-success").addClass('d-none');
            return;
        }


        $("#inputJson").attr('value', JSON.stringify(inputObj));
    })

}

module.exports = addListeners