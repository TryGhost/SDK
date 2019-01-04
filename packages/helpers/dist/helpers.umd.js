!function(t,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports):"function"==typeof define&&define.amd?define(["exports"],r):r((t=t||self)["@tryghost/helpers"]={})}(this,function(t){"use strict";function r(t){return t!=t}function e(t,e,n){return e==e?function(t,r,e){for(var n=e-1,o=t.length;++n<o;)if(t[n]===r)return n;return-1}(t,e,n):function(t,r,e,n){for(var o=t.length,u=e+(n?1:-1);n?u--:++u<o;)if(r(t[u],u,t))return u;return-1}(t,r,n)}var n="object"==typeof global&&global&&global.Object===Object&&global,o="object"==typeof self&&self&&self.Object===Object&&self,u=n||o||Function("return this")(),i=u.Symbol,a=Object.prototype,f=a.hasOwnProperty,c=a.toString,l=i?i.toStringTag:void 0;var s=Object.prototype.toString;var v="[object Null]",p="[object Undefined]",h=i?i.toStringTag:void 0;function b(t){return null==t?void 0===t?p:v:h&&h in Object(t)?function(t){var r=f.call(t,l),e=t[l];try{t[l]=void 0;var n=!0}catch(t){}var o=c.call(t);return n&&(r?t[l]=e:delete t[l]),o}(t):function(t){return s.call(t)}(t)}function d(t){var r=typeof t;return null!=t&&("object"==r||"function"==r)}var y="[object AsyncFunction]",g="[object Function]",_="[object GeneratorFunction]",j="[object Proxy]";function O(t){if(!d(t))return!1;var r=b(t);return r==g||r==_||r==y||r==j}var m=9007199254740991;function w(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=m}function A(t){return null!=t&&w(t.length)&&!O(t)}var z=Array.isArray;function x(t){return null!=t&&"object"==typeof t}var S="[object String]";function P(t){return"string"==typeof t||!z(t)&&x(t)&&b(t)==S}var k="[object Symbol]";function E(t){return"symbol"==typeof t||x(t)&&b(t)==k}var $=NaN,M=/^\s+|\s+$/g,I=/^[-+]0x[0-9a-f]+$/i,F=/^0b[01]+$/i,T=/^0o[0-7]+$/i,D=parseInt;var B=1/0,R=1.7976931348623157e308;function C(t){return t?(t=function(t){if("number"==typeof t)return t;if(E(t))return $;if(d(t)){var r="function"==typeof t.valueOf?t.valueOf():t;t=d(r)?r+"":r}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(M,"");var e=F.test(t);return e||T.test(t)?D(t.slice(2),e?2:8):I.test(t)?$:+t}(t))===B||t===-B?(t<0?-1:1)*R:t==t?t:0:0===t?t:0}function U(t){var r=C(t),e=r%1;return r==r?e?r-e:r:0}function L(t,r){for(var e=-1,n=null==t?0:t.length,o=Array(n);++e<n;)o[e]=r(t[e],e,t);return o}function N(t,r){for(var e=-1,n=Array(t);++e<t;)n[e]=r(e);return n}var V="[object Arguments]";function W(t){return x(t)&&b(t)==V}var q=Object.prototype,G=q.hasOwnProperty,H=q.propertyIsEnumerable,J=W(function(){return arguments}())?W:function(t){return x(t)&&G.call(t,"callee")&&!H.call(t,"callee")};var K="object"==typeof t&&t&&!t.nodeType&&t,Q=K&&"object"==typeof module&&module&&!module.nodeType&&module,X=Q&&Q.exports===K?u.Buffer:void 0,Y=(X?X.isBuffer:void 0)||function(){return!1},Z=9007199254740991,tt=/^(?:0|[1-9]\d*)$/;function rt(t,r){var e=typeof t;return!!(r=null==r?Z:r)&&("number"==e||"symbol"!=e&&tt.test(t))&&t>-1&&t%1==0&&t<r}var et={};et["[object Float32Array]"]=et["[object Float64Array]"]=et["[object Int8Array]"]=et["[object Int16Array]"]=et["[object Int32Array]"]=et["[object Uint8Array]"]=et["[object Uint8ClampedArray]"]=et["[object Uint16Array]"]=et["[object Uint32Array]"]=!0,et["[object Arguments]"]=et["[object Array]"]=et["[object ArrayBuffer]"]=et["[object Boolean]"]=et["[object DataView]"]=et["[object Date]"]=et["[object Error]"]=et["[object Function]"]=et["[object Map]"]=et["[object Number]"]=et["[object Object]"]=et["[object RegExp]"]=et["[object Set]"]=et["[object String]"]=et["[object WeakMap]"]=!1;var nt,ot="object"==typeof t&&t&&!t.nodeType&&t,ut=ot&&"object"==typeof module&&module&&!module.nodeType&&module,it=ut&&ut.exports===ot&&n.process,at=function(){try{var t=ut&&ut.require&&ut.require("util").types;return t||it&&it.binding&&it.binding("util")}catch(t){}}(),ft=at&&at.isTypedArray,ct=ft?(nt=ft,function(t){return nt(t)}):function(t){return x(t)&&w(t.length)&&!!et[b(t)]},lt=Object.prototype.hasOwnProperty;var st=Object.prototype;var vt=function(t,r){return function(e){return t(r(e))}}(Object.keys,Object),pt=Object.prototype.hasOwnProperty;function ht(t){if(e=(r=t)&&r.constructor,r!==("function"==typeof e&&e.prototype||st))return vt(t);var r,e,n=[];for(var o in Object(t))pt.call(t,o)&&"constructor"!=o&&n.push(o);return n}function bt(t){return A(t)?function(t,r){var e=z(t),n=!e&&J(t),o=!e&&!n&&Y(t),u=!e&&!n&&!o&&ct(t),i=e||n||o||u,a=i?N(t.length,String):[],f=a.length;for(var c in t)!r&&!lt.call(t,c)||i&&("length"==c||o&&("offset"==c||"parent"==c)||u&&("buffer"==c||"byteLength"==c||"byteOffset"==c)||rt(c,f))||a.push(c);return a}(t):ht(t)}function dt(t){return null==t?[]:function(t,r){return L(r,function(r){return t[r]})}(t,bt(t))}var yt=Math.max;function gt(t,r,n,o){t=A(t)?t:dt(t),n=n&&!o?U(n):0;var u=t.length;return n<0&&(n=yt(u+n,0)),P(t)?n<=u&&t.indexOf(r,n)>-1:!!u&&e(t,r,n)>-1}function _t(t,r){return t===r||t!=t&&r!=r}function jt(t,r){for(var e=t.length;e--;)if(_t(t[e][0],r))return e;return-1}var Ot=Array.prototype.splice;function mt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}mt.prototype.clear=function(){this.__data__=[],this.size=0},mt.prototype.delete=function(t){var r=this.__data__,e=jt(r,t);return!(e<0||(e==r.length-1?r.pop():Ot.call(r,e,1),--this.size,0))},mt.prototype.get=function(t){var r=this.__data__,e=jt(r,t);return e<0?void 0:r[e][1]},mt.prototype.has=function(t){return jt(this.__data__,t)>-1},mt.prototype.set=function(t,r){var e=this.__data__,n=jt(e,t);return n<0?(++this.size,e.push([t,r])):e[n][1]=r,this};var wt,At=u["__core-js_shared__"],zt=(wt=/[^.]+$/.exec(At&&At.keys&&At.keys.IE_PROTO||""))?"Symbol(src)_1."+wt:"";var xt=Function.prototype.toString;function St(t){if(null!=t){try{return xt.call(t)}catch(t){}try{return t+""}catch(t){}}return""}var Pt=/^\[object .+?Constructor\]$/,kt=Function.prototype,Et=Object.prototype,$t=kt.toString,Mt=Et.hasOwnProperty,It=RegExp("^"+$t.call(Mt).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function Ft(t){return!(!d(t)||(r=t,zt&&zt in r))&&(O(t)?It:Pt).test(St(t));var r}function Tt(t,r){var e=function(t,r){return null==t?void 0:t[r]}(t,r);return Ft(e)?e:void 0}var Dt=Tt(u,"Map"),Bt=Tt(Object,"create");var Rt="__lodash_hash_undefined__",Ct=Object.prototype.hasOwnProperty;var Ut=Object.prototype.hasOwnProperty;var Lt="__lodash_hash_undefined__";function Nt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}function Vt(t,r){var e,n,o=t.__data__;return("string"==(n=typeof(e=r))||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==e:null===e)?o["string"==typeof r?"string":"hash"]:o.map}function Wt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}Nt.prototype.clear=function(){this.__data__=Bt?Bt(null):{},this.size=0},Nt.prototype.delete=function(t){var r=this.has(t)&&delete this.__data__[t];return this.size-=r?1:0,r},Nt.prototype.get=function(t){var r=this.__data__;if(Bt){var e=r[t];return e===Rt?void 0:e}return Ct.call(r,t)?r[t]:void 0},Nt.prototype.has=function(t){var r=this.__data__;return Bt?void 0!==r[t]:Ut.call(r,t)},Nt.prototype.set=function(t,r){var e=this.__data__;return this.size+=this.has(t)?0:1,e[t]=Bt&&void 0===r?Lt:r,this},Wt.prototype.clear=function(){this.size=0,this.__data__={hash:new Nt,map:new(Dt||mt),string:new Nt}},Wt.prototype.delete=function(t){var r=Vt(this,t).delete(t);return this.size-=r?1:0,r},Wt.prototype.get=function(t){return Vt(this,t).get(t)},Wt.prototype.has=function(t){return Vt(this,t).has(t)},Wt.prototype.set=function(t,r){var e=Vt(this,t),n=e.size;return e.set(t,r),this.size+=e.size==n?0:1,this};var qt=200;function Gt(t){var r=this.__data__=new mt(t);this.size=r.size}Gt.prototype.clear=function(){this.__data__=new mt,this.size=0},Gt.prototype.delete=function(t){var r=this.__data__,e=r.delete(t);return this.size=r.size,e},Gt.prototype.get=function(t){return this.__data__.get(t)},Gt.prototype.has=function(t){return this.__data__.has(t)},Gt.prototype.set=function(t,r){var e=this.__data__;if(e instanceof mt){var n=e.__data__;if(!Dt||n.length<qt-1)return n.push([t,r]),this.size=++e.size,this;e=this.__data__=new Wt(n)}return e.set(t,r),this.size=e.size,this};var Ht="__lodash_hash_undefined__";function Jt(t){var r=-1,e=null==t?0:t.length;for(this.__data__=new Wt;++r<e;)this.add(t[r])}function Kt(t,r){for(var e=-1,n=null==t?0:t.length;++e<n;)if(r(t[e],e,t))return!0;return!1}Jt.prototype.add=Jt.prototype.push=function(t){return this.__data__.set(t,Ht),this},Jt.prototype.has=function(t){return this.__data__.has(t)};var Qt=1,Xt=2;function Yt(t,r,e,n,o,u){var i=e&Qt,a=t.length,f=r.length;if(a!=f&&!(i&&f>a))return!1;var c=u.get(t);if(c&&u.get(r))return c==r;var l=-1,s=!0,v=e&Xt?new Jt:void 0;for(u.set(t,r),u.set(r,t);++l<a;){var p=t[l],h=r[l];if(n)var b=i?n(h,p,l,r,t,u):n(p,h,l,t,r,u);if(void 0!==b){if(b)continue;s=!1;break}if(v){if(!Kt(r,function(t,r){if(i=r,!v.has(i)&&(p===t||o(p,t,e,n,u)))return v.push(r);var i})){s=!1;break}}else if(p!==h&&!o(p,h,e,n,u)){s=!1;break}}return u.delete(t),u.delete(r),s}var Zt=u.Uint8Array;function tr(t){var r=-1,e=Array(t.size);return t.forEach(function(t,n){e[++r]=[n,t]}),e}function rr(t){var r=-1,e=Array(t.size);return t.forEach(function(t){e[++r]=t}),e}var er=1,nr=2,or="[object Boolean]",ur="[object Date]",ir="[object Error]",ar="[object Map]",fr="[object Number]",cr="[object RegExp]",lr="[object Set]",sr="[object String]",vr="[object Symbol]",pr="[object ArrayBuffer]",hr="[object DataView]",br=i?i.prototype:void 0,dr=br?br.valueOf:void 0;function yr(t,r){for(var e=-1,n=r.length,o=t.length;++e<n;)t[o+e]=r[e];return t}function gr(t,r){for(var e=-1,n=null==t?0:t.length,o=0,u=[];++e<n;){var i=t[e];r(i,e,t)&&(u[o++]=i)}return u}var _r=Object.prototype.propertyIsEnumerable,jr=Object.getOwnPropertySymbols,Or=jr?function(t){return null==t?[]:(t=Object(t),gr(jr(t),function(r){return _r.call(t,r)}))}:function(){return[]};function mr(t){return function(t,r,e){var n=r(t);return z(t)?n:yr(n,e(t))}(t,bt,Or)}var wr=1,Ar=Object.prototype.hasOwnProperty;var zr=Tt(u,"DataView"),xr=Tt(u,"Promise"),Sr=Tt(u,"Set"),Pr=Tt(u,"WeakMap"),kr=St(zr),Er=St(Dt),$r=St(xr),Mr=St(Sr),Ir=St(Pr),Fr=b;(zr&&"[object DataView]"!=Fr(new zr(new ArrayBuffer(1)))||Dt&&"[object Map]"!=Fr(new Dt)||xr&&"[object Promise]"!=Fr(xr.resolve())||Sr&&"[object Set]"!=Fr(new Sr)||Pr&&"[object WeakMap]"!=Fr(new Pr))&&(Fr=function(t){var r=b(t),e="[object Object]"==r?t.constructor:void 0,n=e?St(e):"";if(n)switch(n){case kr:return"[object DataView]";case Er:return"[object Map]";case $r:return"[object Promise]";case Mr:return"[object Set]";case Ir:return"[object WeakMap]"}return r});var Tr=Fr,Dr=1,Br="[object Arguments]",Rr="[object Array]",Cr="[object Object]",Ur=Object.prototype.hasOwnProperty;function Lr(t,r,e,n,o,u){var i=z(t),a=z(r),f=i?Rr:Tr(t),c=a?Rr:Tr(r),l=(f=f==Br?Cr:f)==Cr,s=(c=c==Br?Cr:c)==Cr,v=f==c;if(v&&Y(t)){if(!Y(r))return!1;i=!0,l=!1}if(v&&!l)return u||(u=new Gt),i||ct(t)?Yt(t,r,e,n,o,u):function(t,r,e,n,o,u,i){switch(e){case hr:if(t.byteLength!=r.byteLength||t.byteOffset!=r.byteOffset)return!1;t=t.buffer,r=r.buffer;case pr:return!(t.byteLength!=r.byteLength||!u(new Zt(t),new Zt(r)));case or:case ur:case fr:return _t(+t,+r);case ir:return t.name==r.name&&t.message==r.message;case cr:case sr:return t==r+"";case ar:var a=tr;case lr:var f=n&er;if(a||(a=rr),t.size!=r.size&&!f)return!1;var c=i.get(t);if(c)return c==r;n|=nr,i.set(t,r);var l=Yt(a(t),a(r),n,o,u,i);return i.delete(t),l;case vr:if(dr)return dr.call(t)==dr.call(r)}return!1}(t,r,f,e,n,o,u);if(!(e&Dr)){var p=l&&Ur.call(t,"__wrapped__"),h=s&&Ur.call(r,"__wrapped__");if(p||h){var b=p?t.value():t,d=h?r.value():r;return u||(u=new Gt),o(b,d,e,n,u)}}return!!v&&(u||(u=new Gt),function(t,r,e,n,o,u){var i=e&wr,a=mr(t),f=a.length;if(f!=mr(r).length&&!i)return!1;for(var c=f;c--;){var l=a[c];if(!(i?l in r:Ar.call(r,l)))return!1}var s=u.get(t);if(s&&u.get(r))return s==r;var v=!0;u.set(t,r),u.set(r,t);for(var p=i;++c<f;){var h=t[l=a[c]],b=r[l];if(n)var d=i?n(b,h,l,r,t,u):n(h,b,l,t,r,u);if(!(void 0===d?h===b||o(h,b,e,n,u):d)){v=!1;break}p||(p="constructor"==l)}if(v&&!p){var y=t.constructor,g=r.constructor;y!=g&&"constructor"in t&&"constructor"in r&&!("function"==typeof y&&y instanceof y&&"function"==typeof g&&g instanceof g)&&(v=!1)}return u.delete(t),u.delete(r),v}(t,r,e,n,o,u))}function Nr(t,r,e,n,o){return t===r||(null==t||null==r||!x(t)&&!x(r)?t!=t&&r!=r:Lr(t,r,e,n,Nr,o))}var Vr=1,Wr=2;function qr(t){return t==t&&!d(t)}function Gr(t,r){return function(e){return null!=e&&(e[t]===r&&(void 0!==r||t in Object(e)))}}function Hr(t){var r=function(t){for(var r=bt(t),e=r.length;e--;){var n=r[e],o=t[n];r[e]=[n,o,qr(o)]}return r}(t);return 1==r.length&&r[0][2]?Gr(r[0][0],r[0][1]):function(e){return e===t||function(t,r,e,n){var o=e.length,u=o,i=!n;if(null==t)return!u;for(t=Object(t);o--;){var a=e[o];if(i&&a[2]?a[1]!==t[a[0]]:!(a[0]in t))return!1}for(;++o<u;){var f=(a=e[o])[0],c=t[f],l=a[1];if(i&&a[2]){if(void 0===c&&!(f in t))return!1}else{var s=new Gt;if(n)var v=n(c,l,f,t,r,s);if(!(void 0===v?Nr(l,c,Vr|Wr,n,s):v))return!1}}return!0}(e,t,r)}}var Jr=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Kr=/^\w*$/;function Qr(t,r){if(z(t))return!1;var e=typeof t;return!("number"!=e&&"symbol"!=e&&"boolean"!=e&&null!=t&&!E(t))||(Kr.test(t)||!Jr.test(t)||null!=r&&t in Object(r))}var Xr="Expected a function";function Yr(t,r){if("function"!=typeof t||null!=r&&"function"!=typeof r)throw new TypeError(Xr);var e=function(){var n=arguments,o=r?r.apply(this,n):n[0],u=e.cache;if(u.has(o))return u.get(o);var i=t.apply(this,n);return e.cache=u.set(o,i)||u,i};return e.cache=new(Yr.Cache||Wt),e}Yr.Cache=Wt;var Zr=500;var te=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,re=/\\(\\)?/g,ee=function(t){var r=Yr(t,function(t){return e.size===Zr&&e.clear(),t}),e=r.cache;return r}(function(t){var r=[];return 46===t.charCodeAt(0)&&r.push(""),t.replace(te,function(t,e,n,o){r.push(n?o.replace(re,"$1"):e||t)}),r}),ne=1/0,oe=i?i.prototype:void 0,ue=oe?oe.toString:void 0;function ie(t){if("string"==typeof t)return t;if(z(t))return L(t,ie)+"";if(E(t))return ue?ue.call(t):"";var r=t+"";return"0"==r&&1/t==-ne?"-0":r}function ae(t){return null==t?"":ie(t)}function fe(t,r){return z(t)?t:Qr(t,r)?[t]:ee(ae(t))}var ce=1/0;function le(t){if("string"==typeof t||E(t))return t;var r=t+"";return"0"==r&&1/t==-ce?"-0":r}function se(t,r){for(var e=0,n=(r=fe(r,t)).length;null!=t&&e<n;)t=t[le(r[e++])];return e&&e==n?t:void 0}function ve(t,r){return null!=t&&r in Object(t)}function pe(t,r){return null!=t&&function(t,r,e){for(var n=-1,o=(r=fe(r,t)).length,u=!1;++n<o;){var i=le(r[n]);if(!(u=null!=t&&e(t,i)))break;t=t[i]}return u||++n!=o?u:!!(o=null==t?0:t.length)&&w(o)&&rt(i,o)&&(z(t)||J(t))}(t,r,ve)}var he=1,be=2;function de(t,r){return Qr(t)&&qr(r)?Gr(le(t),r):function(e){var n=function(t,r,e){var n=null==t?void 0:se(t,r);return void 0===n?e:n}(e,t);return void 0===n&&n===r?pe(e,t):Nr(r,n,he|be)}}function ye(t){return t}function ge(t){return function(r){return null==r?void 0:r[t]}}function _e(t){return Qr(t)?ge(le(t)):function(t){return function(r){return se(r,t)}}(t)}function je(t){return"function"==typeof t?t:null==t?ye:"object"==typeof t?z(t)?de(t[0],t[1]):Hr(t):_e(t)}var Oe,me=function(t,r,e){for(var n=-1,o=Object(t),u=e(t),i=u.length;i--;){var a=u[Oe?i:++n];if(!1===r(o[a],a,o))break}return t};var we=function(t,r){return function(e,n){if(null==e)return e;if(!A(e))return t(e,n);for(var o=e.length,u=r?o:-1,i=Object(e);(r?u--:++u<o)&&!1!==n(i[u],u,i););return e}}(function(t,r){return t&&me(t,r,bt)});function Ae(t,r){var e=-1,n=A(t)?Array(t.length):[];return we(t,function(t,o,u){n[++e]=r(t,o,u)}),n}function ze(t,r,e,n){var o=-1,u=null==t?0:t.length;for(n&&u&&(e=t[++o]);++o<u;)e=r(e,t[o],o,t);return e}function xe(t,r,e,n,o){return o(t,function(t,o,u){e=n?(n=!1,t):r(e,t,o,u)}),e}function Se(t,r,e){var n=t.length;return e=void 0===e?n:e,!r&&e>=n?t:function(t,r,e){var n=-1,o=t.length;r<0&&(r=-r>o?0:o+r),(e=e>o?o:e)<0&&(e+=o),o=r>e?0:e-r>>>0,r>>>=0;for(var u=Array(o);++n<o;)u[n]=t[n+r];return u}(t,r,e)}var Pe=RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");function ke(t){return Pe.test(t)}var Ee="[\\ud800-\\udfff]",$e="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",Me="\\ud83c[\\udffb-\\udfff]",Ie="[^\\ud800-\\udfff]",Fe="(?:\\ud83c[\\udde6-\\uddff]){2}",Te="[\\ud800-\\udbff][\\udc00-\\udfff]",De="(?:"+$e+"|"+Me+")"+"?",Be="[\\ufe0e\\ufe0f]?"+De+("(?:\\u200d(?:"+[Ie,Fe,Te].join("|")+")[\\ufe0e\\ufe0f]?"+De+")*"),Re="(?:"+[Ie+$e+"?",$e,Fe,Te,Ee].join("|")+")",Ce=RegExp(Me+"(?="+Me+")|"+Re+Be,"g");function Ue(t){return ke(t)?function(t){return t.match(Ce)||[]}(t):function(t){return t.split("")}(t)}var Le=/^\s+|\s+$/g;function Ne(t,r,n){if((t=ae(t))&&(n||void 0===r))return t.replace(Le,"");if(!t||!(r=ie(r)))return t;var o=Ue(t),u=Ue(r);return Se(o,function(t,r){for(var n=-1,o=t.length;++n<o&&e(r,t[n],0)>-1;);return n}(o,u),function(t,r){for(var n=t.length;n--&&e(r,t[n],0)>-1;);return n}(o,u)+1).join("")}const Ve=t=>t?function(t,r){return(z(t)?L:Ae)(t,je(r))}(t.split(","),Ne):["public"],We=(t,r,e)=>{O(r)&&(e=r,r=null);const n=z(t)?[]:{},o=z(r)?r:Ve(r),u=gt(o,"public");return function(t,r,e){var n=z(t)?ze:xe,o=arguments.length<3;return n(t,je(r),e,o,we)}(t,function(t,r,i){if(gt(o,"all")||r.visibility&&gt(o,r.visibility)||!r.visibility&&u){const o=e?e(r):r;z(t)?n.push(o):n[i]=o}return n},n)};var qe=Object.freeze({parse:Ve,filter:We});var Ge=i?i.isConcatSpreadable:void 0;function He(t){return z(t)||J(t)||!!(Ge&&t&&t[Ge])}function Je(t,r,e,n,o){var u=-1,i=t.length;for(e||(e=He),o||(o=[]);++u<i;){var a=t[u];r>0&&e(a)?r>1?Je(a,r-1,e,n,o):yr(o,a):n||(o[o.length]=a)}return o}function Ke(){var t=arguments.length;if(!t)return[];for(var r=Array(t-1),e=arguments[0],n=t;n--;)r[n-1]=arguments[n];return yr(z(e)?function(t,r){var e=-1,n=t.length;for(r||(r=Array(n));++e<n;)r[e]=t[e];return r}(e):[e],Je(r,1))}var Qe=4294967295;function Xe(t,r,e,n){var o=t.length;for((e=U(e))<0&&(e=-e>o?0:o+e),(n=void 0===n||n>o?o:U(n))<0&&(n+=o),n=e>n?0:function(t){return t?(r=U(t),e=0,n=Qe,r==r&&(void 0!==n&&(r=r<=n?r:n),void 0!==e&&(r=r>=e?r:e)),r):0;var r,e,n}(n);e<n;)t[e++]=r;return t}function Ye(t,r,e,n){var o=null==t?0:t.length;return o?(e&&"number"!=typeof e&&function(t,r,e){if(!d(e))return!1;var n=typeof r;return!!("number"==n?A(e)&&rt(r,e.length):"string"==n&&r in e)&&_t(e[r],t)}(t,r,e)&&(e=0,n=o),Xe(t,r,e,n)):[]}var Ze=ge("length"),tn="[\\ud800-\\udfff]",rn="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",en="\\ud83c[\\udffb-\\udfff]",nn="[^\\ud800-\\udfff]",on="(?:\\ud83c[\\udde6-\\uddff]){2}",un="[\\ud800-\\udbff][\\udc00-\\udfff]",an="(?:"+rn+"|"+en+")"+"?",fn="[\\ufe0e\\ufe0f]?"+an+("(?:\\u200d(?:"+[nn,on,un].join("|")+")[\\ufe0e\\ufe0f]?"+an+")*"),cn="(?:"+[nn+rn+"?",rn,on,un,tn].join("|")+")",ln=RegExp(en+"(?="+en+")|"+cn+fn,"g");function sn(t){return ke(t)?function(t){for(var r=ln.lastIndex=0;ln.test(t);)++r;return r}(t):Ze(t)}var vn="[object Map]",pn="[object Set]";function hn(t){if(null==t)return 0;if(A(t))return P(t)?sn(t):t.length;var r=Tr(t);return r==vn||r==pn?t.size:ht(t).length}var bn=Math.max;var dn=function(){try{var t=Tt(Object,"defineProperty");return t({},"",{}),t}catch(t){}}(),yn=dn?function(t,r){return dn(t,"toString",{configurable:!0,enumerable:!1,value:(e=r,function(){return e}),writable:!0});var e}:ye,gn=800,_n=16,jn=Date.now;var On=function(t){var r=0,e=0;return function(){var n=jn(),o=_n-(n-e);if(e=n,o>0){if(++r>=gn)return arguments[0]}else r=0;return t.apply(void 0,arguments)}}(yn);var mn=Math.max;var wn=function(t,r){return On(function(t,r,e){return r=bn(void 0===r?t.length-1:r,0),function(){for(var n=arguments,o=-1,u=bn(n.length-r,0),i=Array(u);++o<u;)i[o]=n[r+o];o=-1;for(var a=Array(r+1);++o<r;)a[o]=n[o];return a[r]=e(i),function(t,r,e){switch(e.length){case 0:return t.call(r);case 1:return t.call(r,e[0]);case 2:return t.call(r,e[0],e[1]);case 3:return t.call(r,e[0],e[1],e[2])}return t.apply(r,e)}(t,this,a)}}(t,r,ye),t+"")}(function(t){if(!t||!t.length)return[];var r=0;return t=gr(t,function(t){if(x(e=t)&&A(e))return r=mn(t.length,r),!0;var e}),N(r,function(r){return L(t,ge(r))})});const An={visibility:qe};t.utils=An,t.tags=function(t,r={}){let e="",n=r.separator?r.separator:"",o=r.prefix?r.prefix:"",u=r.suffix?r.suffix:"",i=r.limit?parseInt(r.limit,10):void 0,a=r.from?parseInt(r.from,10):1,f=r.to?parseInt(r.to,10):void 0,c=Ve(r.visibility),l=r.fallback?z(r.fallback)?r.fallback:[r.fallback]:void 0,s=r.fn?r.fn:t=>t.name;var v;return t.tags&&t.tags.length&&(0===hn(e=We(t.tags,c,s))&&l&&(e=We(l,c,s)),a-=1,f=f||i+a||e.length,e=e.slice(a,f)),hn(e)>0&&(P(e[0])?(n=n||", ",e=o+e.join(n)+u):(n&&(e=wn(e,Ye(Array(e.length),n)),e=(v=e,null!=v&&v.length?Je(v,1):[]).slice(0,-1)),e=function(t){for(var r=-1,e=null==t?0:t.length,n=0,o=[];++r<e;){var u=t[r];u&&(o[n++]=u)}return o}(e=Ke(o,e,u)))),e},Object.defineProperty(t,"__esModule",{value:!0})});
