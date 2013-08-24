/// <reference path="jquery.signalR-2.0.0-rc1.js" />
/// <reference path="common.js" />

function startSignalR() {
    var activeTransport = getQueryVariable('transport') || 'auto';

    var connection = $.connection("http://localhost:8080/echo");
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
        writeLine("received: " + data);
    });

    connection.stateChanged(function (change) {
        writeEvent("stateChanged: " + printState(change.oldState) + " => " + printState(change.newState));
    });

    connection.start({ transport: activeTransport })
        .done(function () {
            writeLine("start.done");
            connection.send("sending to AuthorizeEchoConnection");
        })
        .fail(function (error) {
            writeError("start.fail " + error);
        });
}
