/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-20b4bb42'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "globalErrorHandler.js",
    "revision": "60e94935a236320f4db0df4e37cc5771"
  }, {
    "url": "assets/webworkerAll-CULWdmzv.js",
    "revision": null
  }, {
    "url": "assets/vuetify-BtOQ7hfg.js",
    "revision": null
  }, {
    "url": "assets/vue-DIpFd0TI.js",
    "revision": null
  }, {
    "url": "assets/purify.es-CaN5i-uU.js",
    "revision": null
  }, {
    "url": "assets/index-Dh9Bgg5O.css",
    "revision": null
  }, {
    "url": "assets/index-CpjVmZwI.js",
    "revision": null
  }, {
    "url": "assets/index-C5yCPC5r.js",
    "revision": null
  }, {
    "url": "assets/canvasUtils-MMWHsit6.js",
    "revision": null
  }, {
    "url": "assets/browserAll-CHZWb_NG.js",
    "revision": null
  }, {
    "url": "assets/apexcharts.ssr.esm-fe46cd2d-CHmRg-9z.js",
    "revision": null
  }, {
    "url": "assets/WebGPURenderer-YCeGCI9j.js",
    "revision": null
  }, {
    "url": "assets/WebGLRenderer-OyLPNpkF.js",
    "revision": null
  }, {
    "url": "assets/VTabs-ghMYOMTu.css",
    "revision": null
  }, {
    "url": "assets/VTabs-DJKyuka8.js",
    "revision": null
  }, {
    "url": "assets/VPagination-DvaogFUV.js",
    "revision": null
  }, {
    "url": "assets/VPagination-C9yYbVlV.css",
    "revision": null
  }, {
    "url": "assets/VForm-CGbsCNcj.js",
    "revision": null
  }, {
    "url": "assets/VEmptyState-Czjd3oZw.js",
    "revision": null
  }, {
    "url": "assets/VEmptyState-BcXjAkcU.css",
    "revision": null
  }, {
    "url": "assets/VDataTable-sRGjr3lW.css",
    "revision": null
  }, {
    "url": "assets/VDataTable-JNdXuEb9.js",
    "revision": null
  }, {
    "url": "assets/VContainer-ku9EbwM-.css",
    "revision": null
  }, {
    "url": "assets/VContainer-B-mtXH4q.js",
    "revision": null
  }, {
    "url": "assets/TransferStats-DwejXZnn.js",
    "revision": null
  }, {
    "url": "assets/TorrentDetail-BlIx63G5.js",
    "revision": null
  }, {
    "url": "assets/TorrentDetail-BTwfMvKq.css",
    "revision": null
  }, {
    "url": "assets/TorrentCreator-BjybI3dM.js",
    "revision": null
  }, {
    "url": "assets/TagFormDialog-C71sZ6kP.js",
    "revision": null
  }, {
    "url": "assets/StringCard-DskpwScg.js",
    "revision": null
  }, {
    "url": "assets/StatSection-B7wyKIqq.js",
    "revision": null
  }, {
    "url": "assets/SpeedGraph-Bsg_Tk-l.js",
    "revision": null
  }, {
    "url": "assets/Settings-QHm75rRW.css",
    "revision": null
  }, {
    "url": "assets/Settings-MwCjMcIQ.js",
    "revision": null
  }, {
    "url": "assets/SearchEngine-Dg-Hzi1N.js",
    "revision": null
  }, {
    "url": "assets/SearchEngine-C1hgwpQI.css",
    "revision": null
  }, {
    "url": "assets/RssArticles-BPPiWnC4.js",
    "revision": null
  }, {
    "url": "assets/RssArticles-7bJkoHs3.css",
    "revision": null
  }, {
    "url": "assets/RenderTargetSystem-Cbn2MPIq.js",
    "revision": null
  }, {
    "url": "assets/PerformanceStats-CIjlHyPv.js",
    "revision": null
  }, {
    "url": "assets/PasswordField-SmzDpmqL.css",
    "revision": null
  }, {
    "url": "assets/PasswordField-BCc8rrKx.js",
    "revision": null
  }, {
    "url": "assets/MagnetHandler-_6MmRPmB.js",
    "revision": null
  }, {
    "url": "assets/Logs-DlNZh329.js",
    "revision": null
  }, {
    "url": "assets/Login-Cz7QbEDt.js",
    "revision": null
  }, {
    "url": "assets/FreeSpace-BAY8qido.js",
    "revision": null
  }, {
    "url": "assets/Filters-D48FgPMA.css",
    "revision": null
  }, {
    "url": "assets/Filters-Cd8BmU8u.js",
    "revision": null
  }, {
    "url": "assets/Filter-Cm3GdB5P.js",
    "revision": null
  }, {
    "url": "assets/DataCard-DVf-GAaV.js",
    "revision": null
  }, {
    "url": "assets/Dashboard-DecfHgYG.js",
    "revision": null
  }, {
    "url": "assets/Dashboard-B1Evs4sj.css",
    "revision": null
  }, {
    "url": "assets/CurrentSpeed-jL5Gd5FT.js",
    "revision": null
  }, {
    "url": "assets/CookiesManager-Vqs7mrm0.js",
    "revision": null
  }, {
    "url": "assets/CookiesManager-BPPQt1X9.css",
    "revision": null
  }, {
    "url": "assets/ConnectionStats-Cf-_iPyM.js",
    "revision": null
  }, {
    "url": "assets/ColoredChip-BNyooCV2.js",
    "revision": null
  }, {
    "url": "assets/CanvasRenderer-Bu_tCX5j.js",
    "revision": null
  }, {
    "url": "assets/CanvasPool-CSBYh2Kw.js",
    "revision": null
  }, {
    "url": "assets/BulkRenameFilesDialog-CKEu44go.css",
    "revision": null
  }, {
    "url": "assets/BulkRenameFilesDialog-BDXsPExH.js",
    "revision": null
  }, {
    "url": "assets/BufferResource-XiuD34Fk.js",
    "revision": null
  }, {
    "url": "apple-touch-icon-180x180.png",
    "revision": "cacc6f4609794fb1f1bde42960b59418"
  }, {
    "url": "favicon.ico",
    "revision": "1140897d6251401072f533ed0e0f4a5e"
  }, {
    "url": "icon.svg",
    "revision": "1a5efa1aa226aa0533605b7e84667ecd"
  }, {
    "url": "maskable-icon-512x512.png",
    "revision": "2b7d90fd1a9fb5049d9359c2e9688cd6"
  }, {
    "url": "pwa-192x192.png",
    "revision": "f2af0a2a8e4eb4aac03d16c9ba2b6aa4"
  }, {
    "url": "pwa-512x512.png",
    "revision": "3615418f733820b3d9d1c3abba95695f"
  }, {
    "url": "pwa-64x64.png",
    "revision": "56b554ec88b38805b709dbf46fa55416"
  }, {
    "url": "robots.txt",
    "revision": "f71d20196d4caf35b6a670db8c70b03d"
  }, {
    "url": "manifest.webmanifest",
    "revision": "982b7edd23b35f3e26d0b9c45671e859"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(({
    request
  }) => request.mode === "navigate", new workbox.NetworkOnly(), 'GET');
  workbox.registerRoute(({
    request
  }) => request.destination === "font", new workbox.CacheFirst({
    "cacheName": "font-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [200]
    })]
  }), 'GET');

}));
