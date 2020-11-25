//imports
importScripts('js/sw-utils.js');

const CACHE_STATIC_NAME     = 'static-v4';
const CACHE_DYNAMIC_NAME    = 'dynamic-v2';
const CACHE_INMUTABLE_NAME  = 'inmutable-v1';
const CACHE_DYNAMIC_LIMIT = 50;

const APP_SHELL = [
    //"/",
    "index.html",
    "css/style.css",
    "img/favicon.ico",
    "img/avatars/hulk.jpg",
    "img/avatars/ironman.jpg",
    "img/avatars/spiderman.jpg",
    "img/avatars/thor.jpg",
    "img/avatars/wolverine.jpg",
    "js/app.js",
    "js/sw-utils.js"
];

const APP_SHELL_INMUTABLE = [
    "https://fonts.googleapis.com/css?family=Quicksand:300,400",
    "https://fonts.googleapis.com/css?family=Lato:400,300",
    "https://use.fontawesome.com/releases/v5.3.1/css/all.css",
    "css/animate.css",
    "js/libs/jquery.js"
]

self.addEventListener('install', e => {
    const cacheStatic = caches.open(CACHE_STATIC_NAME).then(cache => 
        cache.addAll(APP_SHELL));
    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME).then(cache => 
        cache.addAll(APP_SHELL_INMUTABLE));

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener('activate', e => {  //Recién sucederá después de que 
                                          //ambas promesas de install terminen
    const cleansing = caches.keys().then(keys => {
        keys.forEach(key => {
            if(key !== CACHE_STATIC_NAME && key.includes('static-v'))
                return caches.delete(key);

            if(key !== CACHE_DYNAMIC_NAME && key.includes('dynamic-v'))
                return caches.delete(key);

            if(key !== CACHE_INMUTABLE_NAME && key.includes('inmutable-v'))
                return caches.delete(key);
        });        
    });

    e.waitUntil(cleansing);
});

self.addEventListener('fetch', e => {
    //Cache with network fallback
    const rsp = caches.match(e.request).then(rsp => {
        if(rsp)
            return rsp;
        
        return fetch(e.request).then(rsp => {
            return updateDynamicCache(CACHE_DYNAMIC_NAME, e.request, rsp);
        });
    });
    e.respondWith(rsp);
});
