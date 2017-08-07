let HyperItem = function(){

    let list = function(ctx, name){
        if (!ctx || !ctx[name]){
            return [];
        }
        return ctx[name];
    }
    
    let properties = function(item){
        return list(item, 'properties');
    };

    let links = function(item){
        return list(item, 'links');
    };

    let actions = function(item){
        return list(item, 'actions');
    };

    let errors = function(item){
        return list(item, 'errors');
    };

    let items = function(item){
        return list(item, 'items');
    };

    let parameters = function(ctx){
        return list(ctx, 'parameters');
    };

    let values = function(parameters){
        let ps = parameters || [];
        let vs = {};
        for (let i = 0; i < ps.length; i++) {
            let p = ps[i];
            vs[p.name] = p.value || null;
        }
        return vs;
    };

    let isSimpleAction = function(action){
        let ps = parameters(action);
        for (let i=0; i < ps.length; i++){
            let p = ps[i];
            if (p.type != 'hidden'){
                return false;
            }
        }
        return true;
    };

    let isComplexAction = function(action){
        return !isSimpleAction(action);
    };

    let isSimpleLink = function(link){
        if (link.href){
            return true;
        }
        let ps = parameters(link);
        for (let i=0; i < ps.length; i++){
            let p = ps[i];
            if (p.type != 'hidden'){
                return false;
            }
        }
        return true;
    };

    let isComplexLink = function(link){
        return !isSimpleLink(link);
    };

    let fieldEquals = function(name, value){
        return function(ctx){
            return ctx[name] === value;
        }
    };

    let byID = function(value){
        return fieldEquals('id', value);
    };

    let byType = function(value){
        return fieldEquals('type', value);
    }

    let byName = function(value){
        return fieldEquals('name', value);
    };

    let byRel = function(value){
        return fieldEquals('rel', value);
    };

    let byContext = function(value){
        return fieldEquals('context', value);
    };

    return {
        properties: properties,
        links: links,
        actions: actions,
        items: items,
        errors: errors,
      
        parameters: parameters,
        values: values,

        isSimpleAction: isSimpleAction,
        isComplexAction: isComplexAction,
        isSimpleLink: isSimpleLink,
        isComplexLink: isComplexLink,

        byID: byID,
        byType: byType,
        byName: byName,
        byRel: byRel,
        byContext: byContext,
    };
}();