/// <reference path="jquery-1.8.2.js" />

function writeEvent(line) {
    var messages = $("#Messages");
    messages.append("<li style='color:blue;'>" + getTimeString() + ' ' + line + "</li>");
}

function writeError(line) {
    var messages = $("#Messages");
    messages.append("<li style='color:red;'>" + getTimeString() + ' ' + line + "</li>");
}

function writeLine(line) {
    var messages = $("#Messages");
    messages.append("<li style='color:black;'>" + getTimeString() + ' ' + line + "</li>");
}

function printState(state) {
    var messages = $("#Messages");
    return ["connecting", "connected", "reconnecting", state, "disconnected"][state];
}

function getTimeString() {
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    return month + '/' + day + '/' + year + ' ' + hours + ':' + minutes;
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

function updateLoginForm(baseUrl) {
    $.ajax({
        url: (baseUrl || "") + "/Account/Login",
        type: "GET",
        xhrFields: { withCredentials: true },        
        success: function (content) {
            writeLine("login.get.done");
            var requestVerificationToken = $("input[name='__RequestVerificationToken']", $(content)).val();
            var requestVerificationTokenField = $("[name=__RequestVerificationToken]");
            requestVerificationTokenField.val(requestVerificationToken);

            $("#loginButton").removeAttr('disabled');
        },
        error: function (error) {
            writeError("login.get.fail " + error);
        }
    });
}

function postLoginForm(baseUrl) {
    $.ajax({
        url: (baseUrl || "") + "/Account/Login",
        type: "POST",
        data: $("#loginForm").serialize(),
        xhrFields: { withCredentials: true },
        success: function (content) {
            writeLine("login.post.done");
            var requestVerificationToken = $("input[name='__RequestVerificationToken']", $(content)).val();

            var loginPage = $("#loginPage");
            var contentPage = $("#contentPage");

            loginPage.hide();
            contentPage.show();
        },
        error: function (error) {
            writeError("login.post.fail " + error);
        }
    });
}
