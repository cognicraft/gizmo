let Gizmo = function () {

    let parse = function (raw) {
        let req = {
            headers: {},
        };
        let lines = raw.split('\n');

        // parse request line
        let line = lines.shift().trim();
        let parts = line.split(' ');
        let method = parts.shift().trim().toUpperCase();
        let url = parts.shift().trim();
        req.method = method;
        req.url = url;

        // parse headers
        while (lines.length > 0) {
            line = lines.shift().trim();
            if (line == "") {
                break; // headers are complete
            }
            parts = line.split(':');
            let fieldName = parts.shift().trim();
            let fieldValue = parts.shift().trim();
            req.headers[fieldName] = fieldValue;
        }

        // parse body
        if (lines.length > 0) {
            let body = "";
            while (lines.length > 0) {
                body = body + lines.shift() + '\n';
            }
            req.body = body;
        }
        return req
    };

    let request = function(method, url, headers, body){
        let req = {
            method: method,
            url: url,
            headers: headers || {}
        };
        switch (typeof body){
            case 'object':
                req.body = JSON.stringify(body);
                break;
        }
        return req;
    }

    let Client = function(){
        riot.observable(this);
        this.headers = {
            "Accept": "application/vnd.hyper-item+json"
        };
        this.authenticator = new Authenticator(this); 
    };

    Client.prototype.setHeader = function(key, value){
        this.headers[key] = value;
        this.trigger('header-set', key, value);
    };

    Client.prototype.getHeader = function(key){
        return this.headers[key];
    };

    Client.prototype.deleteHeader = function(key){
        let value = this.headers[key];
        delete this.headers[key];
        this.trigger('header-deleted', key, value);
    }

    Client.prototype.fetch = function(req){

        for (let key in this.headers) {
            if (this.headers.hasOwnProperty(key)) {
                if (!req.headers[key]){
                    req.headers[key] = this.headers[key];
                }
            }
        }

        this.trigger('fetch', req);

        let init = {
            method: req.method,
            headers: new Headers(req.headers),
            mode: 'cors',
            cache: 'default'
        };
        if (req.body && !((req.method === "HEAD" || req.method === "GET"))) {
            init.body = req.body
        }
        let request = new Request(req.url, init)
        return fetch(request);
    }

    Client.prototype.GET = function(url, headers){
        return this.fetch(request('GET', url, headers));
    };

    Client.prototype.PUT = function(url, headers, body){
        return this.fetch(request('PUT', url, headers, body));
    };

    Client.prototype.POST = function(url, headers, body){
        return this.fetch(request('POST', url, headers, body));
    };

    Client.prototype.PATCH = function(url, headers, body){
        return this.fetch(request('PATCH', url, headers, body));
    };

    Client.prototype.DELETE = function(url, headers){
        return this.fetch(request('DELETE', url, headers));
    };

    Client.prototype.submit = function(action, parameters){
        let req = request(action.method, action.href, {'Content-Type': action.encoding}, parameters);
        return this.fetch(req);
    };

    let Authenticator = function(client){
        riot.observable(this);
        this.client = client;
        this.timeout = null;
        this.url = null;
        this.connected = false;
        this.connectionStore = new Store(localStorage, 'gizmo:connections');
        this.sessionStore = new Store(sessionStorage, 'gizmo:sessions');
    };

    Authenticator.prototype.update = function(json){
        this.client.setHeader('Authorization', 'Bearer ' + json.data);
        this.timeout = setTimeout(this.refresh.bind(this), json['expires-in']*1000-10000);
        this.connected = true;
        json['id'] = 'current';

        let exp = new Date();
        exp.setSeconds(exp.getSeconds() + json['expires-in']);
        json['c-exp'] = exp.toISOString();
        json['c-url'] = this.url;

        this.sessionStore.save(json);
    };

    Authenticator.prototype.lastConnection = function(){
        let con = this.connectionStore.load('last');
        return con;
    };

    Authenticator.prototype.login = function(key, secret){
        this.connectionStore.save({'id': 'last', 'url': this.url});
        let self = this;
        let url = this.url + 'login';
        this.client.POST(url, {'Content-Type': 'application/json'}, {'key': key, 'secret': secret})
            .then(function (response){
                return response.json();
            }).then(function (json){
                self.update(json);
                self.trigger('logged-in');
            }).catch(function(){
                self.connected = false;
            }); 
    };

    Authenticator.prototype.refresh = function(){
        let self = this;
        let url = this.url + 'refresh';
        this.client.POST(url) 
            .then(function (response){
                return response.json();
            }).then(function (json){
                self.update(json);
                self.trigger('refreshed');
            }).catch(function(){
                self.connected = false;
            }); 
    };

    Authenticator.prototype.logout = function(){
        clearTimeout(this.timeout);
        let url = this.url + 'logout';
        this.client.POST(url);
        this.client.deleteHeader('Authorization');
        this.connected = false;
        this.sessionStore.delete('current');
        this.trigger('logged-out');
    };

    Authenticator.prototype.restore = function(){
        let s = this.sessionStore.load('current');
        if (!s){
            // nothing to restore
            return
        }
        let exp = s['c-exp'];
        let now = new Date().toISOString();
        if (exp<now){
            // token has expired
            this.client.deleteHeader('Authorization');
            this.connected = false;
            this.sessionStore.delete('current');
            return
        } 
        // token can be reused
        this.client.setHeader('Authorization', 'Bearer ' + s.data);
        this.configure({url:s['c-url']});
        this.refresh();
    };

    Authenticator.prototype.isConnected = function(){
        return this.connected;
    };

    Authenticator.prototype.configure = function(opts){
        this.url = opts.url;
    };

    Authenticator.prototype.isConfigured = function(){
        return (this.url)?true:false;
    };

    let client = new Client();
    client.authenticator.restore();
    return client;
    
}();