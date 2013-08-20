/// <reference path="jquery-1.8.2.js" />
/// <reference path="jquery.signalR-2.0.0-rtm1-130820-b159.js" />

$(function () {
    var common = (function () {
        var messages = $("#Messages");

        return {
            writeEvent: function (line) {
                messages.append("<li style='color:blue;'>" + line + "</li>");
            },
            writeError: function (line) {
                messages.append("<li style='color:red;'>" + line + "</li>");
            },
            writeLine: function (line) {
                messages.append("<li>" + line + "</li>");
            },
            printState: function (state) {
                return ["connecting", "connected", "reconnecting", state, "disconnected"][state];
            },
        }
    })();

    $.get("http://localhost:8080/Account/Login")
    .done(function (response) {
        common.writeLine("login.get.done");
        var requestVerificationToken = "__RequestVerificationToken=" + $("input[name='__RequestVerificationToken']", $(response)).val();
        var data = requestVerificationToken + "&UserName=user&Password=password&RememberMe=false";
        $.post("http://localhost:8080/Account/Login", data)
            .done(function (response) {
                common.writeLine("login.post.done");
                var requestVerificationToken = "__RequestVerificationToken=" + $("input[name='__RequestVerificationToken']", $(response)).val();

                startSignalR();
            })
            .fail(function (error) {
                common.writeError("login.post.fail " + error);
            });
    })
    .fail(function (error) {
        common.writeError("login.get.fail " + error);
    });

    function startSignalR() {
        var connection = $.connection("http://localhost:8080/echo");
        connection.logging = true;

        connection.connectionSlow(function () {
            common.writeEvent("connectionSlow");
        });

        connection.disconnected(function () {
            common.writeEvent("disconnected");
        });

        connection.error(function (error) {
            common.writeError("error: " + error);
        });

        connection.reconnected(function () {
            common.writeEvent("reconnected");
        });

        connection.reconnecting(function () {
            common.writeEvent("reconnecting");
        });

        connection.starting(function () {
            common.writeEvent("starting");
        });

        connection.received(function (data) {
            common.writeLine("received: " + data);
        });

        connection.stateChanged(function (change) {
            common.writeEvent("stateChanged: " + common.printState(change.oldState) + " => " + common.printState(change.newState));
        });

        connection.transportConnectTimeout = 30;
        connection.start({ transport: "longPolling" })
            .done(function () {
                common.writeLine("start.done");
                connection.send("sending to AuthorizeEchoConnection");
            })
            .fail(function (error) {
                common.writeError("start.fail " + error);
            });
    }    
});

