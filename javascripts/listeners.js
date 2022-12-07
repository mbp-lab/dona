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

    $("#submit-de-identified").on("click", function (e) {
        $(".selectorsAndInputs").addClass('disabled');
        $('.selectorsAndInputs').attr('disabled','disabled');

        $(".accordion").addClass('d-none');
        $("#anonymizationTextHeadlines").addClass('d-none');
        $("#backAndForwardButtons").addClass('d-none');
        $("#spinner-submit-div").removeClass('d-none');
        $("#spinner-submit-div").removeClass('d-none');

        //$('#submit-de-identified').prop('disabled', true);

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
    let currentError = false
    const i18nSupport= $("#i18n-support");
    let donaForMEDonation = {
        "donor_id": i18nSupport.data('donor'),
        "conversations": []
    };
    //let currentFiles = [] // this would be for file removing functionality
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
            $('#submit-de-identified').prop('disabled', true);
            return;
        }

        const donorId = $("#donor_id").val();

        messageService.hide(dataSource)
        progressBar.start(dataSource);

        $(".show-on-anonymisation-success" + "-" + dataSource).addClass('d-none');
        $('#submit-de-identified').prop('disabled', true);

        let handler;

        if (dataSource == "WhatsApp") {
            /*
            for (let i = 0; i < files.length; i++) {
                currentFiles.push(files[i])
            }
             */
            handler = whatsappTxtFileHandler(files);

        } else {
            handler = facebookZipFileHandler(files);
        }


        handler
            .then((deIdentifiedJson) => {
                const fileList = $("#" + dataSource + "FileList")
                fileList.empty()

                let fileName

                /* this is also for file removing functionality, the next for loop would then go through the filesForList
                let filesForList = []
                if (dataSource === "WhatsApp") {
                    filesForList = currentFiles
                } else {
                    filesForList = files
                }
                 */
                //let dataSourceClass = "listItemRemove" + dataSource

                for (let i = 0; i < files.length; i++) {
                    fileName = files[i].name
                    // li item with remove button:
                    //fileList.append('<li class="list-group-item">' + fileName + '<button class="btn badge badge-secondary float-right ' + dataSourceClass +'" id="' + fileName + '">' + i18nSupport.data("remove") + '</button> </li>')
                    // li item without remove button
                    fileList.append('<li class="list-group-item">' + fileName + ' </li>')
                }

                // remove methods:
                /*
                // remove method for facebook (there is always only one facebook zip file)
                $(".listItemRemove" + dataSource).click(function (evt) {
                    donaForMEDonation.conversations = donaForMEDonation.conversations.filter((conv) => conv["donation_data_source_type"] !== dataSource)
                    if (dataSource === "Facebook") {
                        let inputObj = JSON.parse($("#inputJson")[0].value)
                        let inputObjConv = inputObj.conversations
                        let filteredConv = inputObjConv.filter((conv) => conv["donation_data_source_type"] !== dataSource)
                        inputObj.conversations = filteredConv
                        $("#inputJson").attr('value', JSON.stringify(inputObj));
                        fileList.empty()
                        $(".show-on-anonymisation-success" + "-" + dataSource).addClass('d-none');
                        messageService.hide(dataSource)
                        console.log("before if", inputObj.conversations)
                        if (inputObj.conversations.length < 1) {
                            console.log(inputObj.conversations)
                            $(".show-on-anonymisation-success").addClass('d-none');
                        }
                    } else if (dataSource === "WhatsApp") {
                        fileList.empty()
                        let tmpCurrentFiles = currentFiles
                        currentFiles = []
                        let newCurrentFiles = Array.from(tmpCurrentFiles).filter((file) => file.name !== evt.target.id)
                        if (newCurrentFiles.length === 0) {
                            console.log("new current files are zero")
                            let inputObj = JSON.parse($("#inputJson")[0].value)
                            let inputObjConv = inputObj.conversations
                            let filteredConv = inputObjConv.filter((conv) => conv["donation_data_source_type"] !== dataSource)
                            inputObj.conversations = filteredConv
                            $("#inputJson").attr('value', JSON.stringify(inputObj));
                            messageService.hide(dataSource)
                            $(".show-on-anonymisation-success" + "-" + dataSource).addClass('d-none');
                            if (filteredConv.length !== 0) {
                                $(".show-on-anonymisation-success").removeClass('d-none');
                            } else {
                                $(".show-on-anonymisation-success").addClass('d-none');
                            }
                        } else {
                            onFileInputChange(dataSource, newCurrentFiles)
                        }
                    }
                })

                 */

                // create data preview and user id mapping
                renderTable(deIdentifiedJson.deIdentifiedJsonContents, dataSource);
                renderUserIDMapping(deIdentifiedJson.participantNameToRandomIds, i18nSupport.data('system'), i18nSupport.data('donor'), i18nSupport.data('friend-initial'), dataSource)
                return transformJson(deIdentifiedJson.deIdentifiedJsonContents, donorId, dataSource);
            })
            .then((transformedJson) => {

                console.log("donaForMEDonation:", donaForMEDonation)

                // if there are already conversations of the chosen dataSource, then first filter the old ones out
                donaForMEDonation.conversations = donaForMEDonation.conversations.filter((conv) => conv["donation_data_source_type"] !== dataSource)

                // get earliest and latest date of all conversations
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
                document.getElementById("startDate-" + dataSource).min = earliestDateString;
                document.getElementById("startDate-" + dataSource).max = latestDateString;
                document.getElementById("endDate-" + dataSource).value = latestDateString;
                document.getElementById("endDate-" + dataSource).min = earliestDateString;
                document.getElementById("endDate-" + dataSource).max = latestDateString;

                // all anonymized data is to be kept separate from the data that is actually donated
                // because of dynamic time span selection
                $("#allAnonymizedData").attr('value', JSON.stringify(donaForMEDonation));

                // only set the new conversations of the current dataSource in the inputJson

                console.log("value of inputJson:", $("#inputJson")[0].value)
                // if inputJson is empty then set all the data, but else (if there already is data saved there)
                // then don't overwrite everything, as there is already data filtered for a time span saved there
                let inputJson = $("#inputJson")
                if (inputJson[0].value === "") {
                    inputJson.attr('value', JSON.stringify(donaForMEDonation));
                } else {
                    let inputObjFiltered = JSON.parse(inputJson[0].value)
                    let inputObjConvFiltered = inputObjFiltered.conversations

                    // filter the conversations to only get the dataSource that is concerned
                    let dataSourceConv = donaForMEDonation.conversations.filter((conv) => conv["donation_data_source_type"] === dataSource)
                    // create the new conversations value and set it in the inputJson
                    inputObjFiltered.conversations = inputObjConvFiltered.filter((conv) => conv["donation_data_source_type"] !== dataSource)
                        .concat(dataSourceConv)
                    inputJson.attr('value', JSON.stringify(inputObjFiltered));
                }



                // show success messages
                $(".show-on-anonymisation-success" + "-" + dataSource).removeClass('d-none');
                if (!currentError) {
                    $('#submit-de-identified').prop('disabled', false);
                }

                $("#" + dataSource + "Checkmark").removeClass('d-none');

                messageService.showSuccess(i18nSupport.data("anonymisation-successful") + " " + i18nSupport.data("info-preview-data-body1"), dataSource);

                earlierSuccess = true;
                progressBar.stop(dataSource);

                /*
                // check if number of whatsApp files is in the limits
                let whatsAppConv = donaForMEDonation.conversations.filter((conv) => conv["donation_data_source_type"] === "WhatsApp")
                console.log("whatsAppConv:", whatsAppConv)
                if (whatsAppConv.length !== 0 && (whatsAppConv.length < 3 || whatsAppConv.length > 7)) {
                        console.log("Hello")
                        messageService.showError("You need to choose between 3 and 7 chat files... ToDo", "WhatsApp");
                        $(".show-on-anonymisation-success").addClass('d-none');
                        $(".show-on-anonymisation-success" + "-" + dataSource).addClass('d-none');
                }

                 */

            })
            .catch(error => {
                console.log(error);

                if (earlierSuccess) {
                    $(".show-on-anonymisation-success" + "-" + dataSource).removeClass('d-none');
                    $('#submit-de-identified').prop('disabled', false);
                }
                messageService.showError(i18nSupport.data("error") + " " + error, dataSource);
                progressBar.stop(dataSource);
            });
    }

    // when new files are selected, handle it
    $(".donation-file-selector>input[type='file']").on("change", (evt) => {
        const dataSource = evt.currentTarget.id;
        const files = evt.target.files
        onFileInputChange(dataSource, files)
    })

    // filtering the selected data according to the dates that the user selects
    $(".date-selection").on("input", (evt) => {
        let dataSource = evt.currentTarget.id.substring(evt.currentTarget.id.indexOf('-') + 1, evt.currentTarget.id.length);

        let startDate = document.getElementById("startDate-" + dataSource).value
        let endDate = document.getElementById("endDate-" + dataSource).value

        console.log("dataSource:", dataSource)
        console.log("startdate:", startDate)
        console.log("enddate:", endDate)


        // start and end date to ms
        let startDateMs = new Date(startDate).getTime()
        let endDateMs = new Date(endDate).getTime()
        endDateMs = endDateMs + 86340000 // standard is at 00:00, add 23:59h so that the whole day of the end day is regarded

        // remove all current notifications
        messageService.hideErrorShowSuccess(dataSource)

        // in case the date is not selected at all - error
        if (startDate === "") {
            messageService.showError(i18nSupport.data("error-dates-no-sense"), dataSource);
            $('#submit-de-identified').prop('disabled', true);
            currentError = true;
            return;
        } // in case the dates don't make sense - error
        else if (startDateMs > possibleLatestDate || endDateMs < possibleEarliestDate || startDateMs >= endDateMs) {
            messageService.showError(i18nSupport.data("error-dates-no-sense"), dataSource);
            $('#submit-de-identified').prop('disabled', true);
            currentError = true;
            return;
        } // in this case at least x months of data have to be selected
        else if (possibleLatestDate - possibleEarliestDate >= 1.577e+10) { // ToDo: Put this in config! 6 months in ms
            console.log("data has more than 6 MONTHS ")
            if (Math.abs(possibleEarliestDate - endDateMs) < (1.577e+10 - 8.64e+7)
                || Math.abs(startDateMs - possibleLatestDate) < (1.577e+10 - 8.64e+7)
                || Math.abs(startDateMs - endDateMs) < (1.577e+10 - 8.64e+7)
            ) {
                messageService.showError(i18nSupport.data("error-not-enough-months"), dataSource);
                $('#submit-de-identified').prop('disabled', true);
                currentError = true;
                return;
            }
        }

        // get the selected data that was already anonymized from the inputJson
        let inputObjAllData = JSON.parse($("#allAnonymizedData")[0].value)
        let inputObjConvAllData = inputObjAllData.conversations
        let inputObjFiltered = JSON.parse($("#inputJson")[0].value)
        let inputObjConvFiltered = inputObjFiltered.conversations
        // filter the conversations to only get the dataSource that is concerned
        let dataSourceConv = inputObjConvAllData.filter((conv) => conv["donation_data_source_type"] === dataSource)
        // filter the messages
        console.log("startDateMs:", startDateMs)
        console.log("endDateMs:", endDateMs)
        dataSourceConv.forEach(conv => {
            conv.messages = conv.messages.filter((message) =>
                message.timestamp_ms >= startDateMs && message.timestamp_ms <= endDateMs)
        })
        // create the new conversations object
        inputObjFiltered.conversations = inputObjConvFiltered.filter((conv) => conv["donation_data_source_type"] !== dataSource)
            .concat(dataSourceConv)


        // show success
        messageService.hideErrorShowSuccess(dataSource)
        currentError = false;

        // check if there is at least one message in the timespan that was selected
        let allConvEmpty = true
        inputObjFiltered.conversations.forEach((conv) => {
            if (conv.messages.length !== 0) {
                allConvEmpty = false
                return
            }
        })
        if (allConvEmpty) {
            messageService.showError(i18nSupport.data("error-no-messages-time-period"), dataSource);
            $('#submit-de-identified').prop('disabled', true);
            currentError = true
            return;
        } else {
            // show success
            messageService.hideErrorShowSuccess(dataSource)
            $(".show-on-anonymisation-success").removeClass('d-none');
            $('#submit-de-identified').prop('disabled', false);
            currentError = false
        }

        // assign the filtered data to the inputJson
        $("#inputJson").attr('value', JSON.stringify(inputObjFiltered));
    })


}

module.exports = addListeners