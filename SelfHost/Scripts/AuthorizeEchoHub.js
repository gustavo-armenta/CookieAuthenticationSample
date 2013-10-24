/// <reference path="jquery.signalR-2.0.0.js" />
/// <reference path="common.js" />

function startSignalR(baseUrl) {
    var activeTransport = getQueryVariable('transport') || 'auto';

    var connection = $.connection.hub;
    connection.url = (baseUrl || "") + "/signalr";
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

    connection.start({ transport: activeTransport })
        .done(function () {
            writeLine("start.done");
            writeLine("transport=" + connection.transport.name);
            authorizeEchoHub.server.echo("sending to AuthorizeEchoHub");
        })
        .fail(function (error) {
            writeError("start.fail " + error);
        });
}
