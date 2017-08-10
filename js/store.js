let Store = function(storage, urn){
    this.storage = storage;
    this.urn = urn;
};

Store.prototype.save = function(entity){
    this.storage.setItem(this._idToKey(entity.id), JSON.stringify(entity));
};

Store.prototype.delete = function(id){
    this.storage.removeItem(this._idToKey(id));
};

Store.prototype.ids = function(){
    let res = [];
    for (let i = 0, len = this.storage.length; i < len; ++i ) {
        let key = this.storage.key(i);
        if (this._managesKey(key)){
            let id = this._idFromKey(key);
            res.push(id);
        }
    }
};

Store.prototype.load = function(id){
    let raw = this.storage.getItem(this._idToKey(id));
    return JSON.parse(raw);
};

Store.prototype.loadAll = function(){
    let res = [];
    let ids = this.ids();
    for (let i = 0; i < ids.length; i++ ) {
        let id = ids[i];
        res.push(this.load(id));
    }
    return res;
};

Store.prototype._managesKey = function(key){
    return key.startsWith(this.urn+':');
};

Store.prototype._idToKey = function(id){
    if (!id){
        throw 'not a valid id: '+id;
    }
    return this.urn+':'+id;
};

Store.prototype._idFromKey = function(key){
    if (!this._managesKey(key)){
        throw 'cannot extract id from specified key: '+key;
    }
    return key.substring(this.urn.length);
}


function uuidV4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}