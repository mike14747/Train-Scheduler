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
var key = "";
var start = "";
var cur = "";

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
$("#delete_train").on("click", function (event) {
    event.preventDefault()
    $("#deleteTrainModal").modal("hide");
    key = $("#delete_key").val();
    database.ref().child(key).remove();
});

$("#update_train").on("click", function () {
    event.preventDefault();
    trainName = $("#edit_train_name").val().trim();
    destination = $("#edit_destination").val().trim();
    firstTime = $("#edit_arrival_time").val().trim();
    key = $("#edit_key").val();
    // form validation
    if (trainName == "") {
        nameErrors = true;
        $("#new_name_error").text("Train Name field cannot be left blank.");
    } else {
        nameErrors = false;
        $("#new_name_error").text("");
    }
    if (destination == "") {
        destErrors = true;
        $("#new_dest_error").text("Destination field cannot be left blank.");
    } else {
        destErrors = false;
        $("#new_dest_error").text("");
    }
    if (firstTime == "" || !firstTime.match(regExp)) {
        timeErrors = true;
        $("#new_time_error").text("Next Arrival Time must be in military time using the hh:mm format.");
    } else {
        timeErrors = false;
        $("#new_time_error").text("");
    }
    if (!nameErrors && !destErrors && !timeErrors) {
        $("#editTrainModal").modal("hide");
        var updatedTrain = {
            trainName: trainName,
            destination: destination,
            firstTime: firstTime
        };
        database.ref().child(key).update(updatedTrain);
    }
});

// format the times and calculate the next arrival time and minutes away
function formatTime(start, freq) {
    startFormatted = moment(start, "HH:mm").format("HH:mm");
    now = moment();
    start = moment(startFormatted, "HH:mm");
    cur = moment(now, "HH:mm");
    result = cur.diff(start, 'minutes');
    if (result > 0) {
        minutesAway = freq - (result % freq);
        nextArrival = cur.add(minutesAway, 'm').format("hh:mm A");
    } else {
        minutesAway = start.diff(cur, 'minutes');
        nextArrival = start.format("hh:mm A");
    }
    return [nextArrival, minutesAway];
}

// send the train name and key to the delete modal for confirmation
function deleteModal(key, name) {
    $("#train_delete").text(name);
    $("#delete_name").attr("value", name);
    $("#delete_key").attr("value", key);
    $("#deleteTrainModal").modal("show");
    return;
}

// populate the current data to be edited in the modal
function editModal(key, name, dest, first) {
    $("#edit_train_name").text(name);
    $("#edit_train_name").attr("value", name);
    $("#edit_destination").text(dest);
    $("#edit_destination").attr("value", dest);
    $("#edit_arrival_time").text(name);
    $("#edit_arrival_time").attr("value", first);
    $("#edit_key").attr("value", key);
    $("#editTrainModal").modal("show");
    return;
}

// load the train schedule on the first visit to the page or when the logged in state changes
function loadTrainSchedule() {
    $("#trainTable").empty();
    database.ref().orderByChild("trainName").on("child_added", function (childSnapshot) {
        newRow = $("<tr id='" + childSnapshot.key + "'>");
        newRow.append($("<td>").text(childSnapshot.child("trainName").val()));
        newRow.append($("<td>").text(childSnapshot.child("destination").val()));
        newRow.append($("<td>").text(childSnapshot.child("frequency").val()));
        timeResult = formatTime(childSnapshot.child("firstTime").val(), childSnapshot.child("frequency").val());
        newRow.append($("<td>").text(timeResult[0]));
        newRow.append($("<td>").text(timeResult[1]));
        newRow.append($("<td class='align-middle justify-content-center align-items-center display_none deleteBtn del_td'><a onclick=\"editModal('" + childSnapshot.key + "', '" + childSnapshot.child('trainName').val() + "', '" + childSnapshot.child('destination').val() + "', '" + childSnapshot.child("firstTime").val() + "')\"><i class='far fa-2x fa-edit'></i></a><a onclick=\"deleteModal('" + childSnapshot.key + "', '" + childSnapshot.child('trainName').val() + "')\"><i class='far fa-2x fa-trash-alt del_icon'></i></a></td>"));
        $("#trainTable").append(newRow);
        if (loggedIn) {
            $(".deleteBtn").show();
        }
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
    $("#" + childSnapshot.key + "").append($("<td class='align-middle justify-content-center align-items-center display_none deleteBtn del_td'><a onclick=\"editModal('" + childSnapshot.key + "', '" + childSnapshot.child('trainName').val() + "', '" + childSnapshot.child('destination').val() + "', '" + childSnapshot.child("firstTime").val() + "')\"><i class='far fa-2x fa-edit'></i></a><a onclick=\"deleteModal('" + childSnapshot.key + "', '" + childSnapshot.child('trainName').val() + "')\"><i class='far fa-2x fa-trash-alt del_icon'></i></a></td>"));
    if (loggedIn) {
        $(".deleteBtn").show();
    }
});

// remove items when they've been deleted
database.ref().on("child_removed", function (childSnapshot) {
    $("#" + childSnapshot.key + "").remove();
});

$("#submit_train").on("click", function (event) {
    event.preventDefault();

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