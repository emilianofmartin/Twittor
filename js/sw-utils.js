function cacheName(url) {
    let cName = "";
    const shell = APP_SHELL.forEach(u => {
        if(url.includes(u))
            cName = CACHE_STATIC_NAME;
    });

    const inmutable = APP_SHELL_INMUTABLE.forEach(u => {
        if(url.includes(u))
        cName = CACHE_INMUTABLE_NAME;
    });

    Promise.all(shell, inmutable).then(() => {
        if(cName === "")
            cName = CACHE_DYNAMIC_NAME;
        return cName;
    });
}

//Guardar en el cach dinámico
function updateDynamicCache(cacheName, req, rsp) {
    if(rsp.ok) {
        return caches.open(cacheName).then(cache => {
            cache.put(req, rsp.clone());
            clearCache(cName, cacheName);  //Limpiamos el dinámico
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