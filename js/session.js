 let Session = function(){

    var loginURL = 'http://10.132.146.0:5000/api/auth/login';
    var refreshURL = 'http://10.132.146.0:5000/api/auth/refresh';
    var logoutURL = 'http://10.132.146.0:5000/api/auth/logout';
    
    var addHeaders = function (req, headers) {
        var cReq = JSON.parse(JSON.stringify(req));
        var cHeaders = JSON.parse(JSON.stringify(headers));
        for (var p in cHeaders) {
            cReq.headers[p] = cHeaders[p];
        }
        return cReq;
    };

    var headers = {};
    var timeout;

    var login = function (key, secret) {
        send(Client.POST(loginURL, {'Content-Type': 'application/json'}, {'key': key, 'secret': secret}))
            .then(function (response){
                return response.json();
            }).then(function (json){
                headers['Authorization'] = 'Bearer ' + json.data;
                timeout = setTimeout(refresh, json["expires-in"]*1000-10000);
            });
    };

    var refresh = function(){
        send(Gizmo.POST(refreshURL))
            .then(function (response){
                return response.json();
            }).then(function (json){
                headers['Authorization'] = 'Bearer ' + json.data;
                timeout = setTimeout(refresh, json["expires-in"]*1000-10000);
            });
    }

    var logout = function () {
        clearTimeout(timeout);
        send(Gizmo.POST(logoutURL));
        headers = {};
    };

    var send = function(req){
        return Gizmo.fetch(addHeaders(req, headers));
    };

    return {
        login: login,
        logout: logout,
        send: send,
    };
 }();