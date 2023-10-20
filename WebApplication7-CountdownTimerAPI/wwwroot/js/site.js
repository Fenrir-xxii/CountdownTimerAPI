// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

const token = JSON.parse(localStorage.getItem("token"));
console.log("token", token);
var eventDuration = 0;
var initEventDuration = 0;
var interval = 1000;
var intervalId;     // variable to clearInterval()
var audio = document.getElementById("track");
var countdownList = [];
var favList = [];
var eventList = [];
let selectedDateTime;

var countdownModel = { startTime: "--:--", endTime: "--:--", durationPlanned: "0s", durationPerformed: "0s" };
var favModel = { time: "--:--", title: "" };
var eventModel = { eventDate: "--:--", title: "" };
const table = document.getElementById('record-table-body');
const eventTable = document.getElementById('events-table-body');

checkAuth();
getRecordItems();
getFavoriteItems();
getCalendarEventsItems();

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
function getCalendarEventsItems() {
    fetch('api/timers/events', {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(response => response.json())
        .then(data => {
            _displayCalendarEventsItems(data);
            _displayCalendarEventsCards(data);
        })
        .catch(error => console.error('Unable to get events items.', error));
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
        insertListItem(fav);
    });
    console.log("display fav data", data);
    favList = data;
}
function _displayCalendarEventsItems(data) {
    eventTable.innerHTML = '';

    data.forEach(item => {
        insertEventTableRow(item);
    });
    console.log("display event data", data);
    eventList = data;
}
function _displayCalendarEventsCards(data) {
    $('.carousel-inner').html('');

    data.forEach(item => {
        displayEventCard(item);
    });
    console.log("display event data", data);
    eventList = data;
    displayCarouselIndicators();
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
function insertEventTableRow(record) {
    let row = eventTable.insertRow();

    let title = row.insertCell(0);
    title.innerHTML = record.title;
    let eventDate = row.insertCell(1);
    //let evDate = Date.parse(record.eventDate);
    let evDate = new Date(record.eventDate);
    console.log("evDate", evDate);
    eventDate.innerHTML = evDate.toLocaleDateString('uk-UA');
    let daysToCome = row.insertCell(2);
    daysToCome.innerHTML = getDaysToEvent(record.eventDate); 
}
function displayEventCard(item) {
    let eventContainer = $('.carousel-inner');
    let evDate = new Date(item.eventDate).toLocaleDateString('uk-UA');
    let daysToGo = getDaysToEvent(item.eventDate); 
    let html = `<div class="carousel-item">
                    <div class="card text-dark my-color mb-3 my-card text-center">
                        <div class="card-header">${evDate}</div>
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                        </div>
                        <div class="card-footer">
                            <p class="card-text">${daysToGo} days to go</p>
                        </div>
                    </div>
                </div>`;
    eventContainer.append(html);
    setActiveSlide(); // set 1st slide active
}
function setActiveSlide() {
    let firstCard = $('.carousel-inner').children().first();
    console.log("activeSlide firstCard", firstCard);
    if (firstCard.hasClass('active')) {
        return;
    } else {
        firstCard.addClass('active');
    }
}
function displayCarouselIndicators() {
    let indicatorList = $('.carousel-indicators');
    indicatorList.html('');
    for (let [index] of eventList.entries()) {
        let listItem = "";
        if (index == 0) {
            listItem = `<li data-bs-target="#vertical-carousel" data-bs-slide-to="${index}" class="active"></li>`;
        } else {
            listItem = `<li data-bs-target="#vertical-carousel" data-bs-slide-to="${index}"></li>`;
        }
        indicatorList.append(listItem);
    }
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
function getDaysToEvent(date) {
    const today = new Date();
    const eventDay = new Date(date);
    const diffTime = Math.abs(eventDay - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log(diffTime + " milliseconds");
    console.log(diffDays + " days");

    return diffDays;
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
    initEventDuration = moment.duration(seconds, 'seconds');

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
    let aborted = moment.duration(initEventDuration - eventDuration);
    console.log("aborted", aborted);
    let abortedDuration = aborted.days() + ' d : ' + aborted.hours() + ' h : ' + aborted.minutes() + ' m : ' + aborted.seconds() + ' s';
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
$('#calendar-event-btn').on("click", function () {
    console.log("event button click");
    let datepicker;

    Swal.fire({
        title: 'Please enter event date',
        input: 'text',
        //html: `<input type="text" id="title" class="swal2-input" placeholder="Title">
        //       <input type="text" id="datepicker" value="${new Date().toISOString()}">`,
        inputValue: new Date().toISOString(),
        stopKeydownPropagation: false,
        preConfirm: () => {
            if (datepicker.getDate() < new Date(new Date().setHours(0, 0, 0, 0))) {
                Swal.showValidationMessage(`The event date can't be in the past`);
            }
            return datepicker.getDate()
        },
        didOpen: () => {
            datepicker = new Pikaday({ field: Swal.getInput() });
            //datepicker = new Pikaday({ field: Swal.getPopup().querySelector('#datepicker').value }); ;
            setTimeout(() => datepicker.show(), 400); // show calendar after showing animation
        },
        didClose: () => {
            datepicker.destroy();
        },
    }).then((result) => {
        console.log(result.value);
        eventModel.eventDate = result.value;
        Swal.fire({
            title: "Title",
            input: 'text',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#3c4cc8'
        }).then((result) => {
            if (result.isConfirmed) {
                eventModel.title = result.value;
                saveCalendarEvent();
            }
        })
    })
})
$('#show-events-btn').on("click", function () {
    var display = $('#event-container').css("display");
    console.log("display now", display);
    
    if (display == "none") {
        $('#event-container').css("display", "block");
        $('#show-events-btn').html("Hide");
        console.log("display block");
    } else {
        $('#event-container').css("display", "none");
        $('#show-events-btn').html("Show");
        console.log("display none");
    }
})


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
                    console.log("addCountdownSuccess");
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
function saveCalendarEvent() {
    // add to list
    eventList.push(eventModel);
    try {
        fetch('api/timers/add-event', {
            method: "post",
            headers: new Headers({
                'Authorization': `Bearer ${token}`,
                'Content-Type': "application/json"
            }),
            mode: 'cors',
            body: JSON.stringify({
                Title: eventModel.title,
                EventDate: eventModel.eventDate
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("data", data);
                if (data.success) {
                    insertEventTableRow(eventModel);
                    displayEventCard(eventModel);
                    displayCarouselIndicators();
                    eventModel = { eventDate: "--:--", title: "" };
                    
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
