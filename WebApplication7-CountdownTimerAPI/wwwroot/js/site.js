// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

const token = JSON.parse(localStorage.getItem("token"));
console.log("token", token);
var eventDuration = 0;
var interval = 1000;
var intervalId;     // variable to clearInterval()
var audio = document.getElementById("track");
var countdownList = [];
var favList = [];
let selectedDateTime;

var countdownModel = { startTime: "--:--", endTime: "--:--", durationPlanned: "0s", durationPerformed: "0s" };
var favModel = { time: "--:--", title: "" };
const table = document.getElementById('record-table-body');

checkAuth();
getRecordItems();
getFavoriteItems();

function getRecordItems() {
    fetch('api/timers/records', {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(response =>  response.json())
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
    //console.log("display REC data", data);
    table.innerHTML = '';

    data.forEach(item => {
        insertTableRow(item);
    });
    console.log("display record data", data);
    countdownList = data;
}
function _displayFavoriteItems(data) {
    const ul = document.getElementById('fav-list');
    ul.innerHTML = '';

    data.forEach(fav => {
        //var button = document.createElement("button");
        //button.textContent = fav.time + ' "' + fav.title + '"';
        //button.classList.add("fav-btn-list");
        //var li = document.createElement("li");
        //li.appendChild(button);
        //ul.appendChild(li);
        //button.addEventListener('click', () => {
        //    var favTime = moment(fav.time, "HH:mm");
        //    var formatted = setDateTime(favTime);
        //    console.log("favTime", favTime);
        //    jQuery('#datetimepicker').datetimepicker('setOptions', { value: formatted });
        //    selectedDateTime = formatted;
        //    $('#selected-date-time').text(formatted);
        //    var dt = moment(formatted, "DD.MM.YYYY HH:mm");
        //    var time = dt.format('HH:mm');
        //    console.log("time", time);
        //    favModel.time = time;
        //});
        //button.addEventListener('dblclick', () => {
        //    var favTime = moment(fav.time, "HH:mm");
        //    var formatted = setDateTime(favTime);
        //    console.log("favTime", favTime);
        //    jQuery('#datetimepicker').datetimepicker('setOptions', { value: formatted });
        //    selectedDateTime = formatted;
        //    $('#selected-date-time').text(formatted);
        //    var dt = moment(formatted, "DD.MM.YYYY HH:mm");
        //    var time = dt.format('HH:mm');
        //    console.log("time", time);
        //    favModel.time = time;
        //    $('#start-btn').click();
        //});
        insertListItem(fav);
    });
    console.log("display fav data", data);
    favList = data;
}
function insertTableRow(record) {
    let row = table.insertRow();

    let startTime = row.insertCell(0);
    startTime.innerHTML = record.startTime;
    let endTime = row.insertCell(1);
    endTime.innerHTML = record.endTime;
    let durationPlanned = row.insertCell(2);
    durationPlanned.innerHTML = record.durationPlanned;
    let durationPerformed = row.insertCell(3);
    durationPerformed.innerHTML = record.durationPerformed;
}
function insertListItem(item) {
    const ul = document.getElementById('fav-list');
    var button = document.createElement("button");
    button.textContent = item.time + ' "' + item.title + '"';
    button.classList.add("fav-btn-list");
    var delButton = document.createElement("button");
    delButton.classList.add("del-button");
    delButton.setAttribute("data-id", item.id);
    var li = document.createElement("li");
    li.appendChild(button);
    li.appendChild(delButton);
    ul.appendChild(li);
    button.addEventListener('click', () => {
        var favTime = moment(item.time, "HH:mm");
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
        var favTime = moment(item.time, "HH:mm");
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
    delButton.addEventListener('click', () => {
        /*console.log("DELETE");*/
        var id = event.target.getAttribute("data-id");
        console.log("DELETE #", id);
        //Swal.fire(`test + ${id}`);
        Swal.fire({
            title: 'Do you want to delete timer?',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Delete',
            denyButtonText: `Keep`,
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                fetch(`api/timers/del-fav/${id}`, {
                    method: "post",
                    headers: new Headers({
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': "application/json"
                    }),
                    mode: 'cors'
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            getFavoriteItems();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Something went wrong!',
                            })
                        }
                    })
            }
        })


        
    });
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
    countdownModel.endTime = endTime.format('YYYY-MM-DD HH:mm:ss');
    countdownModel.durationPlanned = eventDuration.days() + ' d : ' + eventDuration.hours() + ' h : ' + eventDuration.minutes() + ' m : ' + eventDuration.seconds() + ' s';
    console.log("countdownModel", countdownModel);

    intervalId = window.setInterval(function () {
        console.log('Start setInterval func')
        // Time Out check
        if (eventDuration.asSeconds() <= 0) {
            clearInterval(intervalId);
            console.log("cleared from func timeStart");
            audio.play();
            $('#timer').text('--:--');
            countdownModel.durationPerformed = countdownModel.durationPlanned;
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
    /*insertTableRow(countdownModel);*/
    eventDuration = 0;
    $('#timer').text("--:--");
});

$('#favorite-btn').on("click", function () {
    if (selectedDateTime !== undefined) {
        //check if time unique
        console.log("FavList", favList);
        if (favList.filter(f => f.time == favModel.time).length == 0) {
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
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Such exact time already exists',
            })
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
                EndTime: countdownModel.endTime,
                DurationPlanned: countdownModel.durationPlanned,
                DurationPerformed: countdownModel.durationPerformed
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("data", data);
                if (data.success) {
                    //insertTableRow(countdownModel);
                    getRecordItems();
                }
            });
    } catch (error) {
        console.error(error);
        return false;
    }
    

    /* saveData();*/
    //fetch
}
function saveFavorite() {
    // add to list
    favList.push(favModel);
    try {
        fetch('api/timers/add-favorite', {
            method: "post",
            headers: new Headers({
                'Authorization': `Bearer ${token}`,
                'Content-Type': "application/json"
            }),
            mode: 'cors',
            body: JSON.stringify({
                Title: favModel.title,
                Time: favModel.time
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("data", data);
                if (data.success) {
                    insertListItem(favModel);
                    favModel = { time: "--:--", title: "" };
                }
            });
    } catch (error) {
        console.error(error);
        return false;
    }
    
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
        favModel.time = time;
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
