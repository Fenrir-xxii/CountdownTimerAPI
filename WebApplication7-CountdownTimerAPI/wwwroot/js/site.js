// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

//const uri = 'api/timers/list';
//let countdownsArr = [];
const token = JSON.parse(localStorage.getItem("token"));
console.log("token", token);
var eventDuration = 0;
var interval = 1000;
var intervalId;     // variable to clearInterval()
var audio = document.getElementById("track");
var countdownList = [];
var favList = [];
let selectedDateTime;
/*window.onload = loadData();*/

var countdownModel = { startTime: "--:--", eventTime: "--:--", durationPlan: "0s", durationPerformed: "0s" };
var favModel = { eventTime: "--:--", title: "" };
const table = document.getElementById('record-table-body');

//fillTable();
//FillFavorites();




checkAuth();
getRecordItems();
getFavoriteItems();

//var countdownModel = { startTime: "--:--", eventTime: "--:--", durationPlan: "0s", durationPerformed: "0s" };
//var favModel = { time: "--:--", title: "" };
function getRecordItems() {
    fetch('api/timers/records', {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(data => _displayRecordItems(data))
        .catch(error => console.error('Unable to get record items.', error));
}
function getFavoriteItems() {
    fetch('api/timers/fav', {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(data => _displayFavoriteItems(data))
        .catch(error => console.error('Unable to get fav items.', error));
}
function _displayRecordItems(data) {
    const tBody = document.getElementById('record-table-body');
    tBody.innerHTML = '';

    data.forEach(item => {

        let row = tBody.insertRow();

        let startTime = row.insertCell(0);
        startTime.innerHTML = item.startTime;
        let eventTime = row.insertCell(1);
        eventTime.innerHTML = item.endTime;
        let durationPlan = row.insertCell(2);
        durationPlan.innerHTML = item.durationPlanned;
        let durationPerformed = row.insertCell(3);
        durationPerformed.innerHTML = item.durationPerformed;
    });
    console.log("display record data", data);
    countdownList = data;
}
function _displayFavoriteItems(data) {
    const ul = document.getElementById('fav-list');
    ul.innerHTML = '';

    data.forEach(fav => {
        var button = document.createElement("button");
        button.textContent = fav.time + ' "' + fav.title + '"';
        button.classList.add("fav-btn-list");
        var li = document.createElement("li");
        li.appendChild(button);
        ul.appendChild(li);
        button.addEventListener('click', () => {
            var favTime = moment(fav.time, "HH:mm");
            var formatted = setDateTime(favTime);
            console.log("favTime", favTime);
            jQuery('#datetimepicker').datetimepicker('setOptions', { value: formatted });
            selectedDateTime = formatted;
            $('#selected-date-time').text(formatted);
            var dt = moment(formatted, "DD.MM.YYYY HH:mm");
            var time = dt.format('HH:mm');
            console.log("time", time);
            favModel.time = time;
        });
        button.addEventListener('dblclick', () => {
            var favTime = moment(fav.time, "HH:mm");
            var formatted = setDateTime(favTime);
            console.log("favTime", favTime);
            jQuery('#datetimepicker').datetimepicker('setOptions', { value: formatted });
            selectedDateTime = formatted;
            $('#selected-date-time').text(formatted);
            var dt = moment(formatted, "DD.MM.YYYY HH:mm");
            var time = dt.format('HH:mm');
            console.log("time", time);
            favModel.time = time;
            $('#start-btn').click();
        });
    });
    console.log("display fav data", data);
    favList = data;
}

$('#start-btn').on("click", function () {
    clearInterval(intervalId);
    //console.log("cleared from click");

    console.log("selectedDateTime", selectedDateTime);
    var endTime = moment(selectedDateTime, "DD.MM.YYYY HH:mm");
    console.log("endTime", endTime);
    if (!endTime.isValid()) {
        console.log("DATE NOT VALID");
    }

    var currentTime = moment(new Date());
    console.log("currentTime", currentTime);

    var timerDuration = moment.duration(endTime.diff(currentTime));   // difference between finish & start
    // var hours = timerDuration.asHours();
    var seconds = timerDuration.asSeconds();

    eventDuration = moment.duration(seconds, 'seconds');

    countdownModel.startTime = currentTime.format('YYYY-MM-DD HH:mm:ss');
    countdownModel.eventTime = endTime.format('YYYY-MM-DD HH:mm:ss');
    countdownModel.durationPlan = eventDuration.days() + ' d : ' + eventDuration.hours() + ' h : ' + eventDuration.minutes() + ' m : ' + eventDuration.seconds() + ' s';
    console.log("countdownModel", countdownModel);

    intervalId = window.setInterval(function () {
        console.log('Start setInterval func')
        // Time Out check
        if (eventDuration.asSeconds() <= 0) {
            clearInterval(intervalId);
            console.log("cleared from func timeStart");
            audio.play();
            $('#timer').text('--:--');
            countdownModel.durationPerformed = countdownModel.durationPlan;
            addCountdownToList();
            var millisecondsToWait = 1200;  // length of audio
            setTimeout(function () {
                window.location.reload(true); //#skip the cache and reload the page from the server
            }, millisecondsToWait);
        }

        //Otherwise
        eventDuration = moment.duration(eventDuration.asSeconds() - 1, 'seconds');
        $('#timer').text(eventDuration.days() + ' d : ' + eventDuration.hours() + ' h : ' + eventDuration.minutes() + ' m : ' + eventDuration.seconds() + ' s');

    }, interval);
});

$('#stop-btn').on("click", function () {
    clearInterval(intervalId);
    audio.play();
    let abortedDuration = eventDuration.days() + ' d : ' + eventDuration.hours() + ' h : ' + eventDuration.minutes() + ' m : ' + eventDuration.seconds() + ' s';
    countdownModel.durationPerformed = abortedDuration;
    addCountdownToList();
    eventDuration = 0;
    $('#timer').text("--:--");
    table.innerHTML = "";
    //loadData();
    //fillTable();
});

$('#favorite-btn').on("click", function () {
    if (selectedDateTime !== undefined) {
        //check if time unique
        if (favList.filter(f => f.eventTime == favModel.eventTime).length == 0) {
            //add title
            Swal.fire({
                title: "Title",
                input: 'text',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Save',
                confirmButtonColor: '#3c4cc8'
            }).then((result) => {
                if (result.isConfirmed) {
                    favModel.title = result.value;
                    saveFavorite();
                    console.log("unique time");
                }
            })
        }
        else {
            console.log("NOT unique time");
        }
    }
});

function addCountdownToList() {
    countdownList.push(countdownModel);
    try {
        fetch('api/timers/add-countdown', {
            method: "post",
            headers: new Headers({
                'Authorization': `Bearer ${token}`,
                'Content-Type': "application/json"
            }),
            mode: 'cors',
            body: JSON.stringify({
                StartTime: countdownModel.startTime,
                EndTime: countdownModel.eventTime,
                DurationPlanned: countdownModel.durationPlan,
                DurationPerformed: countdownModel.durationPerformed
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("data", data);
            });
    } catch (error) {
        console.error(error);
        return false;
    }
    

    /* saveData();*/
    //fetch
}
jQuery('#datetimepicker').datetimepicker({
    format: 'd.m.Y H:i',
    // format: 'Y.m.d H:i',
    // inline: true,
    lang: 'en',
    theme: 'dark',
    onChangeDateTime: function (dp, $input) {
        selectedDateTime = $input.val();
        $('#selected-date-time').text($input.val());
        console.log("trigger change!!!");
        console.log("input", $input.val());
        console.log("dp", dp);
        var dt = moment($input.val(), "DD.MM.YYYY HH:mm");
        var time = dt.format('HH:mm');
        console.log("time", time);
        favModel.eventTime = time;
    }
});

$('#history-btn').on("click", function () {
    let history = $('#history-div');
    let state = history.css("display");
    if (state == "none") {
        history.show();
    } else {
        history.hide();
    }
});
function setDateTime(time) {
    let dateTime = moment(time, "HH:mm");
    let dateNow = moment();
    if (moment.duration(dateTime.diff(dateNow)) <= 0) {
        dateTime.add(1, 'days');  // set timer for next day
    }
    console.log("dateTime", dateTime);
    return dateTime.format('DD.MM.YYYY HH:mm');;
}

function checkAuth() {
    fetch('api/auth/check', {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(data => {
            console.log("data", data);
            if (data.success) {
                document.getElementById("user-login").innerHTML = "Logout";
                console.log("user-name .a", document.getElementById("user-name"));
                document.getElementById("user-name").innerHTML = data.userName;
            } else {
                document.getElementById("user-login").innerHTML = "Login";
            }
        });
}
