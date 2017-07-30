var names = [
    "Gary Smith",
    "Steve Jones",
    "Bill Carroll",
    "Janet Jacobs",
    "Pamela Jane",
    "Peter Parker",
    "Steve Rogers",
    "Wayne Brady",
    "Gillford Jones"
];

var estimateTiles = [
    "Lanscaping Install",
    "Hardscape Install",
    "Mowing",
    "Grating"
];

var pcmTitles = [
    "One shot",
    "Monthly Service"
];

var colors = [
    "blue", "green", "orange", "red", "purple"
];

function getSchedule(){
    return {
        "eventers": getEventers(),
        "columnHeader": 'Worker'
    };
};

function getEvents(isLandscping){
    var events = [];
    var hour = 0;
    while(hour < 23){
        let offset = Math.round(Math.random() * 3) + 1;
        let end = hour + offset;
        let evt = getEvent(hour, end, getTitle(isLandscping), getColor());
        if(evt.start.date() !== evt.end.date()) break;
        events.push(evt);
        offset = Math.floor(Math.random() + Math.random());
        hour = end + offset;
    }
    return events;
};

function getEvent(start, end, title, color){
    return {
        "start": moment().hour(start),
        "end": moment().hour(end),
        "title": title,
        "viewingUrl": '',
        "backgroundColor": color,
    };
};

function getTitle(isLandscping){
    let arr = isLandscping ? estimateTiles : pcmTitles;
    let i = Math.round(Math.random() * (arr.length-1));
    return arr[i];
};

function getEventers(){
    let eventers = [];
    for(var i = 0; i < names.length; i++){
        eventers.push(getEventer(i));
    }
    return eventers;
};

function getEventer(index){
    let isLandscping = index > 4;
    return {
        "name": names[index],
        "group": isLandscping ? 'Landscaping' : 'PCM',
        "events": getEvents(isLandscping),
        "forceFocus": false,
        "hover": false
    };
};

function getColor(){
    let i = Math.round(Math.random() * (colors.length-1));
    return colors[i];
};