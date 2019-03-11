"use strict";

var trainName = "";
var destination = "";
var firstTime = "";
var frequency = 0;
var nameErrors = "false";
var destErrors = "false";
var timeErrors = "false";
var freqErrors = "false";
var regExp = /^(\d{2}):(\d{2})?$/;
var newRow = "";
var adjResult = 0;
var minutesAway = 0;
var startFormatted = "";
var result = 0;
var now = "";
var nextArrival = "";
var timeResult = [];
var loggedIn = false;

var config = {
    apiKey: "AIzaSyBtaD5bZyS3bWM6-ezy4YZJuXUZt4FStgg",
    authDomain: "train-scheduler-4d084.firebaseapp.com",
    databaseURL: "https://train-scheduler-4d084.firebaseio.com",
    projectId: "train-scheduler-4d084",
    storageBucket: "train-scheduler-4d084.appspot.com",
    messagingSenderId: "723549032334"
};
firebase.initializeApp(config);
var database = firebase.database();

// remove the train by its key
function removeTrain(key) {
    database.ref().child(key).remove();
}

// format the time and return it in the formats/values needed for the Next Arrival and Minutes Away columns
function formatTime(start, freq) {
    // take the timespamp of when it was entered and determine the timestamp of the first time it will run after creation
    now = moment();
    startFormatted = moment(start, "hh:mm");
    result = now.diff(startFormatted, "minutes");
    if (result > 0) {
        adjResult = result;
    } else {
        adjResult += 1440;
    }
    minutesAway = freq - (adjResult % freq);
    nextArrival = moment().add(minutesAway, 'm').format("hh:mm A");
    return [nextArrival, minutesAway];
}

function loadTrainSchedule() {
    database.ref().orderByChild("trainName").on("child_added", function (childSnapshot) {
        newRow = $("<tr id='" + childSnapshot.key + "'>");
        newRow.append($("<td>").text(childSnapshot.child("trainName").val()));
        newRow.append($("<td>").text(childSnapshot.child("destination").val()));
        newRow.append($("<td>").text(childSnapshot.child("frequency").val()));
        timeResult = formatTime(childSnapshot.child("firstTime").val(), childSnapshot.child("frequency").val());
        newRow.append($("<td>").text(timeResult[0]));
        newRow.append($("<td>").text(timeResult[1]));
        if (loggedIn) {
        newRow.append($("<td class='align-middle display_none deleteBtn'><button class='mr-1 mb-1 testBtn' onclick=\"removeTrain('" + childSnapshot.key + "')\">X</button></td>"));
        } else {
            newRow.append($("<td class='align-middle deleteBtn'><button class='mr-1 mb-1 testBtn' onclick=\"removeTrain('" + childSnapshot.key + "')\">X</button></td>"));
        }
        
        $("#trainTable").append(newRow);
    }, function (errorObject) {
        console.log("There is an error: " + errorObject.code);
    });
    return;
}

// update items that have been changed
database.ref().orderByChild("trainName").on("child_changed", function (childSnapshot) {
    $("#" + childSnapshot.key + "").empty();
    $("#" + childSnapshot.key + "").append($("<td>").text(childSnapshot.child("trainName").val()));
    $("#" + childSnapshot.key + "").append($("<td>").text(childSnapshot.child("destination").val()));
    $("#" + childSnapshot.key + "").append($("<td>").text(childSnapshot.child("frequency").val()));
    timeResult = formatTime(childSnapshot.child("firstTime").val(), childSnapshot.child("frequency").val());
    $("#" + childSnapshot.key + "").append($("<td>" + timeResult[0] + "</td>"));
    $("#" + childSnapshot.key + "").append($("<td>" + timeResult[1] + "</td>"));
    $("#" + childSnapshot.key + "").append($("<td class='align-middle display_none deleteBtn'><button class='mr-1 mb-1' onclick=\"removeTrain('" + childSnapshot.key + "')\">X</button></td>"));
});

// remove items when they've been deleted
database.ref().on("child_removed", function (childSnapshot) {
    $("#" + childSnapshot.key + "").remove();
});

$("#submit_train").on("click", function () {
    event.preventDefault()

    trainName = $("#train_name").val().trim();
    destination = $("#destination").val().trim();
    firstTime = $("#first_time").val().trim();
    frequency = parseInt($("#frequency").val().trim());

    // form validation
    if (trainName == "") {
        nameErrors = true;
        $("#name_error").text("Train Name field cannot be left blank.");
    } else {
        nameErrors = false;
        $("#name_error").text("");
    }
    if (destination == "") {
        destErrors = true;
        $("#dest_error").text("Destination field cannot be left blank.");
    } else {
        destErrors = false;
        $("#dest_error").text("");
    }
    if (firstTime == "" || !firstTime.match(regExp)) {
        timeErrors = true;
        $("#time_error").text("First Train Time must be in military time using the hh:mm format.");
    } else {
        timeErrors = false;
        $("#time_error").text("");
    }
    if (!Number.isInteger(frequency) || frequency < 1) {
        freqErrors = true;
        $("#freq_error").text("Frequency must be an integer greater than 0.");
    } else {
        freqErrors = false;
        $("#freq_error").text("");
    }

    // if there are no validation errors, process the form
    if (!nameErrors && !destErrors && !timeErrors && !freqErrors) {
        var postData = {
            trainName: trainName,
            destination: destination,
            firstTime: firstTime,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        };

        database.ref().push().set(postData);
        document.getElementById("add_train").reset();

        $("#train_submitted").removeClass("display_none");
        setTimeout(function () { $("#train_submitted").addClass("display_none"); }, 3000);
    }
});