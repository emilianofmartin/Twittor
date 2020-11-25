async function cacheName(url) {
    let cName = CACHE_DYNAMIC_NAME;
    for(var i=0;i<APP_SHELL.length;i++)
        if(url.includes(APP_SHELL[i]))
            cName = CACHE_STATIC_NAME;

    for(var i=0;i<APP_SHELL_INMUTABLE.length;i++)
        if(url.includes(APP_SHELL_INMUTABLE[i]))
            cName = CACHE_INMUTABLE_NAME;

    return cName;
}

//Guardar en el cach dinámico
function updateCache(req, rsp) {
    if(rsp.ok) {
        const cName = await cacheName(req.url);
        console.log("cName", cName);
        return caches.open(cName).then(cache => {
            cache.put(req, rsp.clone());

            if(cName === CACHE_DYNAMIC_NAME)
                clearCache(cName, CACHE_DYNAMIC_LIMIT);  //Limpiamos el dinámico
            return rsp.clone();
        })
    }
    else
        return rsp;
}

function clearCache(cacheName, items) {
    caches.open(cacheName)
        .then(cache => {
            return cache.keys()
                .then(keys => {
                    if(keys.length > items) {
                        //Tengo que borrar archivos...
                        cache.delete(keys[0])   //Borramos el primer elemento
                            .then(clearCache(cacheName, items));
                    }
                });
        });
}