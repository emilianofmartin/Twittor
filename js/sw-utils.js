function cacheName(url) {
    let cName = CACHE_DYNAMIC_NAME;
    const shell = APP_SHELL.forEach(u => {
        if(url.includes(u))
            cName = CACHE_STATIC_NAME;
    });

    const inmutable = APP_SHELL_INMUTABLE.forEach(u => {
        if(url.includes(u))
            cName = CACHE_INMUTABLE_NAME;
    });

    Promise.all(shell, inmutable)
        .then(() => {
            console.log('cName', cName);
            return cName;
        })
        .catch(err => {
            console.log(err);
            console.log('cName', cName);
            return cName;
        });
}

//Guardar en el cach dinámico
function updateCache(req, rsp) {
    if(rsp.ok) {
        const cName = cacheName(req.url);
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