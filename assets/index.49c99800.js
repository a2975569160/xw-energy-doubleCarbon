var H={exports:{}},se=function(e,r){return function(){for(var n=new Array(arguments.length),s=0;s<n.length;s++)n[s]=arguments[s];return e.apply(r,n)}},Ee=se,w=Object.prototype.toString;function I(t){return Array.isArray(t)}function F(t){return typeof t=="undefined"}function Se(t){return t!==null&&!F(t)&&t.constructor!==null&&!F(t.constructor)&&typeof t.constructor.isBuffer=="function"&&t.constructor.isBuffer(t)}function ie(t){return w.call(t)==="[object ArrayBuffer]"}function Ce(t){return w.call(t)==="[object FormData]"}function Re(t){var e;return typeof ArrayBuffer!="undefined"&&ArrayBuffer.isView?e=ArrayBuffer.isView(t):e=t&&t.buffer&&ie(t.buffer),e}function Oe(t){return typeof t=="string"}function xe(t){return typeof t=="number"}function oe(t){return t!==null&&typeof t=="object"}function N(t){if(w.call(t)!=="[object Object]")return!1;var e=Object.getPrototypeOf(t);return e===null||e===Object.prototype}function Ae(t){return w.call(t)==="[object Date]"}function $e(t){return w.call(t)==="[object File]"}function Ne(t){return w.call(t)==="[object Blob]"}function ue(t){return w.call(t)==="[object Function]"}function ge(t){return oe(t)&&ue(t.pipe)}function Pe(t){return w.call(t)==="[object URLSearchParams]"}function Te(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function Ue(){return typeof navigator!="undefined"&&(navigator.product==="ReactNative"||navigator.product==="NativeScript"||navigator.product==="NS")?!1:typeof window!="undefined"&&typeof document!="undefined"}function M(t,e){if(!(t===null||typeof t=="undefined"))if(typeof t!="object"&&(t=[t]),I(t))for(var r=0,a=t.length;r<a;r++)e.call(null,t[r],r,t);else for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.call(null,t[n],n,t)}function k(){var t={};function e(n,s){N(t[s])&&N(n)?t[s]=k(t[s],n):N(n)?t[s]=k({},n):I(n)?t[s]=n.slice():t[s]=n}for(var r=0,a=arguments.length;r<a;r++)M(arguments[r],e);return t}function je(t,e,r){return M(e,function(n,s){r&&typeof n=="function"?t[s]=Ee(n,r):t[s]=n}),t}function Be(t){return t.charCodeAt(0)===65279&&(t=t.slice(1)),t}var h={isArray:I,isArrayBuffer:ie,isBuffer:Se,isFormData:Ce,isArrayBufferView:Re,isString:Oe,isNumber:xe,isObject:oe,isPlainObject:N,isUndefined:F,isDate:Ae,isFile:$e,isBlob:Ne,isFunction:ue,isStream:ge,isURLSearchParams:Pe,isStandardBrowserEnv:Ue,forEach:M,merge:k,extend:je,trim:Te,stripBOM:Be},C=h;function K(t){return encodeURIComponent(t).replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var fe=function(e,r,a){if(!r)return e;var n;if(a)n=a(r);else if(C.isURLSearchParams(r))n=r.toString();else{var s=[];C.forEach(r,function(f,m){f===null||typeof f=="undefined"||(C.isArray(f)?m=m+"[]":f=[f],C.forEach(f,function(l){C.isDate(l)?l=l.toISOString():C.isObject(l)&&(l=JSON.stringify(l)),s.push(K(m)+"="+K(l))}))}),n=s.join("&")}if(n){var o=e.indexOf("#");o!==-1&&(e=e.slice(0,o)),e+=(e.indexOf("?")===-1?"?":"&")+n}return e},Le=h;function P(){this.handlers=[]}P.prototype.use=function(e,r,a){return this.handlers.push({fulfilled:e,rejected:r,synchronous:a?a.synchronous:!1,runWhen:a?a.runWhen:null}),this.handlers.length-1};P.prototype.eject=function(e){this.handlers[e]&&(this.handlers[e]=null)};P.prototype.forEach=function(e){Le.forEach(this.handlers,function(a){a!==null&&e(a)})};var qe=P,De=h,_e=function(e,r){De.forEach(e,function(n,s){s!==r&&s.toUpperCase()===r.toUpperCase()&&(e[r]=n,delete e[s])})},le=function(e,r,a,n,s){return e.config=r,a&&(e.code=a),e.request=n,e.response=s,e.isAxiosError=!0,e.toJSON=function(){return{message:this.message,name:this.name,description:this.description,number:this.number,fileName:this.fileName,lineNumber:this.lineNumber,columnNumber:this.columnNumber,stack:this.stack,config:this.config,code:this.code,status:this.response&&this.response.status?this.response.status:null}},e},ce={silentJSONParsing:!0,forcedJSONParsing:!0,clarifyTimeoutError:!1},Fe=le,de=function(e,r,a,n,s){var o=new Error(e);return Fe(o,r,a,n,s)},ke=de,He=function(e,r,a){var n=a.config.validateStatus;!a.status||!n||n(a.status)?e(a):r(ke("Request failed with status code "+a.status,a.config,null,a.request,a))},A=h,Ie=A.isStandardBrowserEnv()?function(){return{write:function(r,a,n,s,o,u){var f=[];f.push(r+"="+encodeURIComponent(a)),A.isNumber(n)&&f.push("expires="+new Date(n).toGMTString()),A.isString(s)&&f.push("path="+s),A.isString(o)&&f.push("domain="+o),u===!0&&f.push("secure"),document.cookie=f.join("; ")},read:function(r){var a=document.cookie.match(new RegExp("(^|;\\s*)("+r+")=([^;]*)"));return a?decodeURIComponent(a[3]):null},remove:function(r){this.write(r,"",Date.now()-864e5)}}}():function(){return{write:function(){},read:function(){return null},remove:function(){}}}(),Me=function(e){return/^([a-z][a-z\d+\-.]*:)?\/\//i.test(e)},Je=function(e,r){return r?e.replace(/\/+$/,"")+"/"+r.replace(/^\/+/,""):e},ze=Me,Ve=Je,We=function(e,r){return e&&!ze(r)?Ve(e,r):r},L=h,Xe=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"],Ke=function(e){var r={},a,n,s;return e&&L.forEach(e.split(`
`),function(u){if(s=u.indexOf(":"),a=L.trim(u.substr(0,s)).toLowerCase(),n=L.trim(u.substr(s+1)),a){if(r[a]&&Xe.indexOf(a)>=0)return;a==="set-cookie"?r[a]=(r[a]?r[a]:[]).concat([n]):r[a]=r[a]?r[a]+", "+n:n}}),r},G=h,Ge=G.isStandardBrowserEnv()?function(){var e=/(msie|trident)/i.test(navigator.userAgent),r=document.createElement("a"),a;function n(s){var o=s;return e&&(r.setAttribute("href",o),o=r.href),r.setAttribute("href",o),{href:r.href,protocol:r.protocol?r.protocol.replace(/:$/,""):"",host:r.host,search:r.search?r.search.replace(/^\?/,""):"",hash:r.hash?r.hash.replace(/^#/,""):"",hostname:r.hostname,port:r.port,pathname:r.pathname.charAt(0)==="/"?r.pathname:"/"+r.pathname}}return a=n(window.location.href),function(o){var u=G.isString(o)?n(o):o;return u.protocol===a.protocol&&u.host===a.host}}():function(){return function(){return!0}}();function J(t){this.message=t}J.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")};J.prototype.__CANCEL__=!0;var T=J,$=h,Ye=He,Qe=Ie,Ze=fe,er=We,rr=Ke,tr=Ge,q=de,nr=ce,ar=T,Y=function(e){return new Promise(function(a,n){var s=e.data,o=e.headers,u=e.responseType,f;function m(){e.cancelToken&&e.cancelToken.unsubscribe(f),e.signal&&e.signal.removeEventListener("abort",f)}$.isFormData(s)&&delete o["Content-Type"];var i=new XMLHttpRequest;if(e.auth){var l=e.auth.username||"",b=e.auth.password?unescape(encodeURIComponent(e.auth.password)):"";o.Authorization="Basic "+btoa(l+":"+b)}var d=er(e.baseURL,e.url);i.open(e.method.toUpperCase(),Ze(d,e.params,e.paramsSerializer),!0),i.timeout=e.timeout;function W(){if(!!i){var v="getAllResponseHeaders"in i?rr(i.getAllResponseHeaders()):null,S=!u||u==="text"||u==="json"?i.responseText:i.response,E={data:S,status:i.status,statusText:i.statusText,headers:v,config:e,request:i};Ye(function(B){a(B),m()},function(B){n(B),m()},E),i=null}}if("onloadend"in i?i.onloadend=W:i.onreadystatechange=function(){!i||i.readyState!==4||i.status===0&&!(i.responseURL&&i.responseURL.indexOf("file:")===0)||setTimeout(W)},i.onabort=function(){!i||(n(q("Request aborted",e,"ECONNABORTED",i)),i=null)},i.onerror=function(){n(q("Network Error",e,null,i)),i=null},i.ontimeout=function(){var S=e.timeout?"timeout of "+e.timeout+"ms exceeded":"timeout exceeded",E=e.transitional||nr;e.timeoutErrorMessage&&(S=e.timeoutErrorMessage),n(q(S,e,E.clarifyTimeoutError?"ETIMEDOUT":"ECONNABORTED",i)),i=null},$.isStandardBrowserEnv()){var X=(e.withCredentials||tr(d))&&e.xsrfCookieName?Qe.read(e.xsrfCookieName):void 0;X&&(o[e.xsrfHeaderName]=X)}"setRequestHeader"in i&&$.forEach(o,function(S,E){typeof s=="undefined"&&E.toLowerCase()==="content-type"?delete o[E]:i.setRequestHeader(E,S)}),$.isUndefined(e.withCredentials)||(i.withCredentials=!!e.withCredentials),u&&u!=="json"&&(i.responseType=e.responseType),typeof e.onDownloadProgress=="function"&&i.addEventListener("progress",e.onDownloadProgress),typeof e.onUploadProgress=="function"&&i.upload&&i.upload.addEventListener("progress",e.onUploadProgress),(e.cancelToken||e.signal)&&(f=function(v){!i||(n(!v||v&&v.type?new ar("canceled"):v),i.abort(),i=null)},e.cancelToken&&e.cancelToken.subscribe(f),e.signal&&(e.signal.aborted?f():e.signal.addEventListener("abort",f))),s||(s=null),i.send(s)})},c=h,Q=_e,sr=le,ir=ce,or={"Content-Type":"application/x-www-form-urlencoded"};function Z(t,e){!c.isUndefined(t)&&c.isUndefined(t["Content-Type"])&&(t["Content-Type"]=e)}function ur(){var t;return(typeof XMLHttpRequest!="undefined"||typeof process!="undefined"&&Object.prototype.toString.call(process)==="[object process]")&&(t=Y),t}function fr(t,e,r){if(c.isString(t))try{return(e||JSON.parse)(t),c.trim(t)}catch(a){if(a.name!=="SyntaxError")throw a}return(r||JSON.stringify)(t)}var U={transitional:ir,adapter:ur(),transformRequest:[function(e,r){return Q(r,"Accept"),Q(r,"Content-Type"),c.isFormData(e)||c.isArrayBuffer(e)||c.isBuffer(e)||c.isStream(e)||c.isFile(e)||c.isBlob(e)?e:c.isArrayBufferView(e)?e.buffer:c.isURLSearchParams(e)?(Z(r,"application/x-www-form-urlencoded;charset=utf-8"),e.toString()):c.isObject(e)||r&&r["Content-Type"]==="application/json"?(Z(r,"application/json"),fr(e)):e}],transformResponse:[function(e){var r=this.transitional||U.transitional,a=r&&r.silentJSONParsing,n=r&&r.forcedJSONParsing,s=!a&&this.responseType==="json";if(s||n&&c.isString(e)&&e.length)try{return JSON.parse(e)}catch(o){if(s)throw o.name==="SyntaxError"?sr(o,this,"E_JSON_PARSE"):o}return e}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,maxBodyLength:-1,validateStatus:function(e){return e>=200&&e<300},headers:{common:{Accept:"application/json, text/plain, */*"}}};c.forEach(["delete","get","head"],function(e){U.headers[e]={}});c.forEach(["post","put","patch"],function(e){U.headers[e]=c.merge(or)});var z=U,lr=h,cr=z,dr=function(e,r,a){var n=this||cr;return lr.forEach(a,function(o){e=o.call(n,e,r)}),e},he=function(e){return!!(e&&e.__CANCEL__)},ee=h,D=dr,hr=he,pr=z,mr=T;function _(t){if(t.cancelToken&&t.cancelToken.throwIfRequested(),t.signal&&t.signal.aborted)throw new mr("canceled")}var vr=function(e){_(e),e.headers=e.headers||{},e.data=D.call(e,e.data,e.headers,e.transformRequest),e.headers=ee.merge(e.headers.common||{},e.headers[e.method]||{},e.headers),ee.forEach(["delete","get","head","post","put","patch","common"],function(n){delete e.headers[n]});var r=e.adapter||pr.adapter;return r(e).then(function(n){return _(e),n.data=D.call(e,n.data,n.headers,e.transformResponse),n},function(n){return hr(n)||(_(e),n&&n.response&&(n.response.data=D.call(e,n.response.data,n.response.headers,e.transformResponse))),Promise.reject(n)})},p=h,pe=function(e,r){r=r||{};var a={};function n(i,l){return p.isPlainObject(i)&&p.isPlainObject(l)?p.merge(i,l):p.isPlainObject(l)?p.merge({},l):p.isArray(l)?l.slice():l}function s(i){if(p.isUndefined(r[i])){if(!p.isUndefined(e[i]))return n(void 0,e[i])}else return n(e[i],r[i])}function o(i){if(!p.isUndefined(r[i]))return n(void 0,r[i])}function u(i){if(p.isUndefined(r[i])){if(!p.isUndefined(e[i]))return n(void 0,e[i])}else return n(void 0,r[i])}function f(i){if(i in r)return n(e[i],r[i]);if(i in e)return n(void 0,e[i])}var m={url:o,method:o,data:o,baseURL:u,transformRequest:u,transformResponse:u,paramsSerializer:u,timeout:u,timeoutMessage:u,withCredentials:u,adapter:u,responseType:u,xsrfCookieName:u,xsrfHeaderName:u,onUploadProgress:u,onDownloadProgress:u,decompress:u,maxContentLength:u,maxBodyLength:u,transport:u,httpAgent:u,httpsAgent:u,cancelToken:u,socketPath:u,responseEncoding:u,validateStatus:f};return p.forEach(Object.keys(e).concat(Object.keys(r)),function(l){var b=m[l]||s,d=b(l);p.isUndefined(d)&&b!==f||(a[l]=d)}),a},me={version:"0.26.1"},br=me.version,V={};["object","boolean","number","function","string","symbol"].forEach(function(t,e){V[t]=function(a){return typeof a===t||"a"+(e<1?"n ":" ")+t}});var re={};V.transitional=function(e,r,a){function n(s,o){return"[Axios v"+br+"] Transitional option '"+s+"'"+o+(a?". "+a:"")}return function(s,o,u){if(e===!1)throw new Error(n(o," has been removed"+(r?" in "+r:"")));return r&&!re[o]&&(re[o]=!0,console.warn(n(o," has been deprecated since v"+r+" and will be removed in the near future"))),e?e(s,o,u):!0}};function yr(t,e,r){if(typeof t!="object")throw new TypeError("options must be an object");for(var a=Object.keys(t),n=a.length;n-- >0;){var s=a[n],o=e[s];if(o){var u=t[s],f=u===void 0||o(u,s,t);if(f!==!0)throw new TypeError("option "+s+" must be "+f);continue}if(r!==!0)throw Error("Unknown option "+s)}}var wr={assertOptions:yr,validators:V},ve=h,Er=fe,te=qe,ne=vr,j=pe,be=wr,R=be.validators;function x(t){this.defaults=t,this.interceptors={request:new te,response:new te}}x.prototype.request=function(e,r){typeof e=="string"?(r=r||{},r.url=e):r=e||{},r=j(this.defaults,r),r.method?r.method=r.method.toLowerCase():this.defaults.method?r.method=this.defaults.method.toLowerCase():r.method="get";var a=r.transitional;a!==void 0&&be.assertOptions(a,{silentJSONParsing:R.transitional(R.boolean),forcedJSONParsing:R.transitional(R.boolean),clarifyTimeoutError:R.transitional(R.boolean)},!1);var n=[],s=!0;this.interceptors.request.forEach(function(d){typeof d.runWhen=="function"&&d.runWhen(r)===!1||(s=s&&d.synchronous,n.unshift(d.fulfilled,d.rejected))});var o=[];this.interceptors.response.forEach(function(d){o.push(d.fulfilled,d.rejected)});var u;if(!s){var f=[ne,void 0];for(Array.prototype.unshift.apply(f,n),f=f.concat(o),u=Promise.resolve(r);f.length;)u=u.then(f.shift(),f.shift());return u}for(var m=r;n.length;){var i=n.shift(),l=n.shift();try{m=i(m)}catch(b){l(b);break}}try{u=ne(m)}catch(b){return Promise.reject(b)}for(;o.length;)u=u.then(o.shift(),o.shift());return u};x.prototype.getUri=function(e){return e=j(this.defaults,e),Er(e.url,e.params,e.paramsSerializer).replace(/^\?/,"")};ve.forEach(["delete","get","head","options"],function(e){x.prototype[e]=function(r,a){return this.request(j(a||{},{method:e,url:r,data:(a||{}).data}))}});ve.forEach(["post","put","patch"],function(e){x.prototype[e]=function(r,a,n){return this.request(j(n||{},{method:e,url:r,data:a}))}});var Sr=x,Cr=T;function O(t){if(typeof t!="function")throw new TypeError("executor must be a function.");var e;this.promise=new Promise(function(n){e=n});var r=this;this.promise.then(function(a){if(!!r._listeners){var n,s=r._listeners.length;for(n=0;n<s;n++)r._listeners[n](a);r._listeners=null}}),this.promise.then=function(a){var n,s=new Promise(function(o){r.subscribe(o),n=o}).then(a);return s.cancel=function(){r.unsubscribe(n)},s},t(function(n){r.reason||(r.reason=new Cr(n),e(r.reason))})}O.prototype.throwIfRequested=function(){if(this.reason)throw this.reason};O.prototype.subscribe=function(e){if(this.reason){e(this.reason);return}this._listeners?this._listeners.push(e):this._listeners=[e]};O.prototype.unsubscribe=function(e){if(!!this._listeners){var r=this._listeners.indexOf(e);r!==-1&&this._listeners.splice(r,1)}};O.source=function(){var e,r=new O(function(n){e=n});return{token:r,cancel:e}};var Rr=O,Or=function(e){return function(a){return e.apply(null,a)}},xr=h,Ar=function(e){return xr.isObject(e)&&e.isAxiosError===!0},ae=h,$r=se,g=Sr,Nr=pe,gr=z;function ye(t){var e=new g(t),r=$r(g.prototype.request,e);return ae.extend(r,g.prototype,e),ae.extend(r,e),r.create=function(n){return ye(Nr(t,n))},r}var y=ye(gr);y.Axios=g;y.Cancel=T;y.CancelToken=Rr;y.isCancel=he;y.VERSION=me.version;y.all=function(e){return Promise.all(e)};y.spread=Or;y.isAxiosError=Ar;H.exports=y;H.exports.default=y;var Pr=H.exports;function Tr(t){const e=Pr.create(t);return e.interceptors.request.use(r=>r,r=>Promise.reject(r)),e.interceptors.response.use(r=>r.data,r=>{var a,n,s;return(s=window.$notification)==null||s.error({content:"\u9519\u8BEF",meta:(n=(a=r==null?void 0:r.response)==null?void 0:a.data)==null?void 0:n.data,duration:3e3}),Promise.reject(r)}),e}const{defaultServer:Ur}=window.app.config.globalProperties.$config,jr=Tr({baseURL:Ur});export{jr as r};
