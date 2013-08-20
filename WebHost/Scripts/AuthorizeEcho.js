/// <reference path="jquery.signalR-2.0.0-rc1.js" />

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

    var connection = $.connection("/echo");
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

    connection.start({ transport: "longPolling" })
        .done(function () {
            common.writeLine("start.done");
            connection.send("sending to AuthorizeEchoConnection");
        })
        .fail(function (error) {
            common.writeError("start.fail " + error);
        });
});