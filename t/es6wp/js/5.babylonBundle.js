(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{20:function(e,n,t){"use strict";t.r(n),t.d(n,"DefaultSceneWithTexture",(function(){return w}));var r=t(37),a=t(74),o=t(24),i=t(54),u=t(115),c=t(139),l=t(55),f=t(31),s=t.p+"9b31293ea96c8dfa518b45622da82a13.jpg",h=function(e,n,t,r){return new(t||(t=Promise))((function(a,o){function i(e){try{c(r.next(e))}catch(e){o(e)}}function u(e){try{c(r.throw(e))}catch(e){o(e)}}function c(e){var n;e.done?a(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(i,u)}c((r=r.apply(e,n||[])).next())}))},p=function(e,n){var t,r,a,o,i={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function u(o){return function(u){return function(o){if(t)throw new TypeError("Generator is already executing.");for(;i;)try{if(t=1,r&&(a=2&o[0]?r.return:o[0]?r.throw||((a=r.return)&&a.call(r),0):r.next)&&!(a=a.call(r,o[1])).done)return a;switch(r=0,a&&(o=[2&o[0],a.value]),o[0]){case 0:case 1:a=o;break;case 4:return i.label++,{value:o[1],done:!1};case 5:i.label++,r=o[1],o=[0];continue;case 7:o=i.ops.pop(),i.trys.pop();continue;default:if(!(a=i.trys,(a=a.length>0&&a[a.length-1])||6!==o[0]&&2!==o[0])){i=0;continue}if(3===o[0]&&(!a||o[1]>a[0]&&o[1]<a[3])){i.label=o[1];break}if(6===o[0]&&i.label<a[1]){i.label=a[1],a=o;break}if(a&&i.label<a[2]){i.label=a[2],i.ops.push(o);break}a[2]&&i.ops.pop(),i.trys.pop();continue}o=n.call(e,i)}catch(e){o=[6,e],r=0}finally{t=a=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,u])}}},w=function(){var e=this;this.createScene=function(n,t){return h(e,void 0,void 0,(function(){var e,h,w,d;return p(this,(function(p){return e=new r.a(n),(h=new a.a("my first camera",0,Math.PI/3,10,new o.e(0,0,0),e)).setTarget(o.e.Zero()),h.attachControl(t,!0),new i.a("light",new o.e(0,1,0),e).intensity=.7,u.a.CreateSphere("sphere",{diameter:2,segments:32},e).position.y=1,w=c.a.CreateGround("ground",{width:6,height:6},e),(d=new l.a("ground material",e)).diffuseTexture=new f.a(s,e),w.material=d,[2,e]}))}))}};n.default=new w}}]);
//# sourceMappingURL=5.babylonBundle.js.map