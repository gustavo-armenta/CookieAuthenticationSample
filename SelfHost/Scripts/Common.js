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

function updateLoginForm() {
    $.ajax({
        url: "http://localhost:8080/Account/Login",
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

function postLoginForm() {
    $.ajax({
        url: "http://localhost:8080/Account/Login",
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
