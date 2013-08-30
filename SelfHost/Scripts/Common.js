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
    var seconds = currentTime.getSeconds();
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return month + '/' + day + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
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
            var tokenInResponseContent = $("input[name='__RequestVerificationToken']", $(content));
            if (tokenInResponseContent) {
                var requestVerificationToken = tokenInResponseContent.val();
                var tokenInFormInput = $("input[name=__RequestVerificationToken]");
                tokenInFormInput.val(requestVerificationToken);
            }

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
            var tokenInResponseContent = $("input[name='__RequestVerificationToken']", $(content)).val();
            if (tokenInResponseContent) {
                var tokenInFormInput = $("input[name='__RequestVerificationToken']");
                tokenInFormInput.val(tokenInResponseContent);
            }
            
            var domContent = $(content);
            var loginError = $(".validation-summary-errors", domContent).text();
            if (!loginError) {
                loginError = $("ul#errors", domContent).text();
            }

            if (loginError) {
                writeError(loginError);
                return;
            }

            navigateTo("AuthorizeEchoConnection.html");
        },
        error: function (error) {
            writeError("login.post.fail " + error);
        }
    });
}

function postLogoutForm() {
    $.ajax({
        url: "http://localhost:8080/Account/LogOff",
        type: "POST",
        data: $("#logoutForm").serialize(),
        xhrFields: { withCredentials: true },
        success: function (content) {
            writeLine("logout.post.done");
            navigateTo("index.html");
        },
        error: function (error) {
            writeError("logout.post.fail " + error);

            $.ajax({
                url: "http://localhost:8080/Account/Logout",
                type: "POST",
                data: $("#logoutForm").serialize(),
                xhrFields: { withCredentials: true },
                success: function (content) {
                    writeLine("logout.post.done");
                    navigateTo("index.html");
                },
                error: function (error) {
                    writeError("logout.post.fail " + error);
                }
            });
        }
    });
}

function setTokenInForm() {
    var tokenInRequestQuery = getQueryVariable("__RequestVerificationToken");
    var tokenInFormInput = $("input[name='__RequestVerificationToken']");
    if (tokenInRequestQuery && tokenInFormInput) {
        tokenInFormInput.val(tokenInRequestQuery);
    }
}

function navigateTo(url) {
    var queryString = "";
    var tokenInFormInput = $("input[name='__RequestVerificationToken']");
    if (tokenInFormInput) {
        queryString = "?__RequestVerificationToken=" + tokenInFormInput.val();
    }
    window.location.href = url + queryString;
}