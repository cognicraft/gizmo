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
    };

    Client.prototype.fetch = function(req){
        
        for (let key in this.headers) {
            if (this.headers.hasOwnProperty(key)) {
                if (!req.headers[key]){
                    req.headers[key] = this.headers[key];
                }
            }
        }

        this.trigger('before-fetch', req);

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

    return new Client();
    
}();