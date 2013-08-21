/// <reference path="jquery.signalR-2.0.0-rc1.js" />

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

function startSignalR() {
    var connection = $.connection.hub;
    connection.url = "http://localhost:8080/signalr";
    var authorizeEchoHub = $.connection.authorizeEchoHub;
    connection.logging = true;

    connection.connectionSlow(function () {
        writeEvent("connectionSlow");
    });

    connection.disconnected(function () {
        writeEvent("disconnected");
    });

    connection.error(function (error) {
        var innerError = error;
        var message = "";
        while (innerError) {
            message += " Message=" + innerError.message + " Stack=" + innerError.stack;
            innerError = innerError.source
        }
        writeError("Error: " + message);
    });

    connection.reconnected(function () {
        writeEvent("reconnected");
    });

    connection.reconnecting(function () {
        writeEvent("reconnecting");
    });

    connection.starting(function () {
        writeEvent("starting");
    });

    connection.received(function (data) {
        writeLine("received: " + connection.json.stringify(data));
    });

    connection.stateChanged(function (change) {
        writeEvent("stateChanged: " + printState(change.oldState) + " => " + printState(change.newState));
    });

    authorizeEchoHub.client.hubReceived = function (data) {
        writeLine("hubReceived: " + data);
    }

    connection.start({ transport: "longPolling" })
        .done(function () {
            writeLine("start.done");
            authorizeEchoHub.server.echo("sending to AuthorizeEchoHub");
        })
        .fail(function (error) {
            writeError("start.fail " + error);
        });
}
