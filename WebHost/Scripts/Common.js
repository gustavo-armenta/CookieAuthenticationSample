/// <reference path="jquery-1.8.2.js" />

function writeEvent(line) {
    var messages = $("#Messages");
    messages.append("<li style='color:blue;'>" + line + "</li>");
}

function writeError(line) {
    var messages = $("#Messages");
    messages.append("<li style='color:red;'>" + line + "</li>");
}

function writeLine(line) {
    var messages = $("#Messages");
    messages.append("<li style='color:black;'>" + line + "</li>");
}

function printState(state) {
    var messages = $("#Messages");
    return ["connecting", "connected", "reconnecting", state, "disconnected"][state];
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1),
        vars = query.split("&"),
        pair;
    for (var i = 0; i < vars.length; i++) {
        pair = vars[i].split("=");
        if (pair[0] == variable) {
            return unescape(pair[1]);
        }
    }
}

function login() {
    $.get("http://localhost:8080/Account/Login")
        .done(function (response) {
            writeLine("login.get.done");
            var requestVerificationToken = "__RequestVerificationToken=" + $("input[name='__RequestVerificationToken']", $(response)).val();
            var data = requestVerificationToken + "&UserName=user&Password=password&RememberMe=false";
            $.post("http://localhost:8080/Account/Login", data)
                .done(function (response) {
                    writeLine("login.post.done");
                    var requestVerificationToken = "__RequestVerificationToken=" + $("input[name='__RequestVerificationToken']", $(response)).val();
                })
                .fail(function (error) {
                    writeError("login.post.fail " + error);
                });
        })
        .fail(function (error) {
            writeError("login.get.fail " + error);
        });
}
