/// <reference path="jquery.signalR-2.0.0.js" />
/// <reference path="common.js" />

function startSignalR(baseUrl) {
    var activeTransport = getQueryVariable('transport') || 'auto';

    var connection = $.connection((baseUrl || "") + "/echo");
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
            writeLine("transport=" + connection.transport.name);
            connection.send("sending to AuthorizeEchoConnection");
        })
        .fail(function (error) {
            writeError("start.fail " + error);
        });
}
