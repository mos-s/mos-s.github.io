(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{115:function(i,t,e){"use strict";e.d(t,"a",(function(){return o}));var s=e(24),r=e(30),n=e(32);n.a.CreateSphere=function(i){for(var t=i.segments||32,e=i.diameterX||i.diameter||1,r=i.diameterY||i.diameter||1,o=i.diameterZ||i.diameter||1,a=i.arc&&(i.arc<=0||i.arc>1)?1:i.arc||1,h=i.slice&&i.slice<=0?1:i.slice||1,u=0===i.sideOrientation?0:i.sideOrientation||n.a.DEFAULTSIDE,d=!!i.dedupTopBottomIndices,p=new s.e(e/2,r/2,o/2),m=2+t,f=2*m,v=[],c=[],g=[],l=[],b=0;b<=m;b++){for(var _=b/m,x=_*Math.PI*h,w=0;w<=f;w++){var y=w/f,z=y*Math.PI*2*a,C=s.a.RotationZ(-x),H=s.a.RotationY(z),X=s.e.TransformCoordinates(s.e.Up(),C),F=s.e.TransformCoordinates(X,H),T=F.multiply(p),Z=F.divide(p).normalize();c.push(T.x,T.y,T.z),g.push(Z.x,Z.y,Z.z),l.push(y,_)}if(b>0)for(var M=c.length/3,R=M-2*(f+1);R+f+2<M;R++)d?(b>1&&(v.push(R),v.push(R+1),v.push(R+f+1)),(b<m||h<1)&&(v.push(R+f+1),v.push(R+1),v.push(R+f+2))):(v.push(R),v.push(R+1),v.push(R+f+1),v.push(R+f+1),v.push(R+1),v.push(R+f+2))}n.a._ComputeSides(u,c,v,g,l,i.frontUVs,i.backUVs);var G=new n.a;return G.indices=v,G.positions=c,G.normals=g,G.uvs=l,G},r.a.CreateSphere=function(i,t,e,s,r,n){var a={segments:t,diameterX:e,diameterY:e,diameterZ:e,sideOrientation:n,updatable:r};return o.CreateSphere(i,a,s)};var o=function(){function i(){}return i.CreateSphere=function(i,t,e){void 0===e&&(e=null);var s=new r.a(i,e);return t.sideOrientation=r.a._GetDefaultSideOrientation(t.sideOrientation),s._originalBuilderSideOrientation=t.sideOrientation,n.a.CreateSphere(t).applyToMesh(s,t.updatable),s},i}()},139:function(i,t,e){"use strict";e.d(t,"a",(function(){return v}));var s=e(24),r=e(26),n=e(30),o=e(32),a=e(3),h=e(28);n.a._GroundMeshParser=function(i,t){return u.Parse(i,t)};var u=function(i){function t(t,e){var s=i.call(this,t,e)||this;return s.generateOctree=!1,s}return Object(a.c)(t,i),t.prototype.getClassName=function(){return"GroundMesh"},Object.defineProperty(t.prototype,"subdivisions",{get:function(){return Math.min(this._subdivisionsX,this._subdivisionsY)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"subdivisionsX",{get:function(){return this._subdivisionsX},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"subdivisionsY",{get:function(){return this._subdivisionsY},enumerable:!1,configurable:!0}),t.prototype.optimize=function(i,t){void 0===t&&(t=32),this._subdivisionsX=i,this._subdivisionsY=i,this.subdivide(i);this.createOrUpdateSubmeshesOctree&&this.createOrUpdateSubmeshesOctree(t)},t.prototype.getHeightAtCoordinates=function(i,t){var e=this.getWorldMatrix(),r=s.c.Matrix[5];e.invertToRef(r);var n=s.c.Vector3[8];if(s.e.TransformCoordinatesFromFloatsToRef(i,0,t,r,n),i=n.x,t=n.z,i<this._minX||i>this._maxX||t<this._minZ||t>this._maxZ)return this.position.y;this._heightQuads&&0!=this._heightQuads.length||(this._initHeightQuads(),this._computeHeightQuads());var o=this._getFacetAt(i,t),a=-(o.x*i+o.z*t+o.w)/o.y;return s.e.TransformCoordinatesFromFloatsToRef(0,a,0,e,n),n.y},t.prototype.getNormalAtCoordinates=function(i,t){var e=new s.e(0,1,0);return this.getNormalAtCoordinatesToRef(i,t,e),e},t.prototype.getNormalAtCoordinatesToRef=function(i,t,e){var r=this.getWorldMatrix(),n=s.c.Matrix[5];r.invertToRef(n);var o=s.c.Vector3[8];if(s.e.TransformCoordinatesFromFloatsToRef(i,0,t,n,o),i=o.x,t=o.z,i<this._minX||i>this._maxX||t<this._minZ||t>this._maxZ)return this;this._heightQuads&&0!=this._heightQuads.length||(this._initHeightQuads(),this._computeHeightQuads());var a=this._getFacetAt(i,t);return s.e.TransformNormalFromFloatsToRef(a.x,a.y,a.z,r,e),this},t.prototype.updateCoordinateHeights=function(){return this._heightQuads&&0!=this._heightQuads.length||this._initHeightQuads(),this._computeHeightQuads(),this},t.prototype._getFacetAt=function(i,t){var e=Math.floor((i+this._maxX)*this._subdivisionsX/this._width),s=Math.floor(-(t+this._maxZ)*this._subdivisionsY/this._height+this._subdivisionsY),r=this._heightQuads[s*this._subdivisionsX+e];return t<r.slope.x*i+r.slope.y?r.facet1:r.facet2},t.prototype._initHeightQuads=function(){var i=this._subdivisionsX,t=this._subdivisionsY;this._heightQuads=new Array;for(var e=0;e<t;e++)for(var r=0;r<i;r++){var n={slope:s.d.Zero(),facet1:new s.f(0,0,0,0),facet2:new s.f(0,0,0,0)};this._heightQuads[e*i+r]=n}return this},t.prototype._computeHeightQuads=function(){var i=this.getVerticesData(h.b.PositionKind);if(!i)return this;for(var t=s.c.Vector3[3],e=s.c.Vector3[2],r=s.c.Vector3[1],n=s.c.Vector3[0],o=s.c.Vector3[4],a=s.c.Vector3[5],u=s.c.Vector3[6],d=s.c.Vector3[7],p=s.c.Vector3[8],m=0,f=0,v=0,c=0,g=0,l=0,b=0,_=this._subdivisionsX,x=this._subdivisionsY,w=0;w<x;w++)for(var y=0;y<_;y++){m=3*y,f=w*(_+1)*3,v=(w+1)*(_+1)*3,t.x=i[f+m],t.y=i[f+m+1],t.z=i[f+m+2],e.x=i[f+m+3],e.y=i[f+m+4],e.z=i[f+m+5],r.x=i[v+m],r.y=i[v+m+1],r.z=i[v+m+2],n.x=i[v+m+3],n.y=i[v+m+4],n.z=i[v+m+5],c=(n.z-t.z)/(n.x-t.x),g=t.z-c*t.x,e.subtractToRef(t,o),r.subtractToRef(t,a),n.subtractToRef(t,u),s.e.CrossToRef(u,a,d),s.e.CrossToRef(o,u,p),d.normalize(),p.normalize(),l=-(d.x*t.x+d.y*t.y+d.z*t.z),b=-(p.x*e.x+p.y*e.y+p.z*e.z);var z=this._heightQuads[w*_+y];z.slope.copyFromFloats(c,g),z.facet1.copyFromFloats(d.x,d.y,d.z,l),z.facet2.copyFromFloats(p.x,p.y,p.z,b)}return this},t.prototype.serialize=function(t){i.prototype.serialize.call(this,t),t.subdivisionsX=this._subdivisionsX,t.subdivisionsY=this._subdivisionsY,t.minX=this._minX,t.maxX=this._maxX,t.minZ=this._minZ,t.maxZ=this._maxZ,t.width=this._width,t.height=this._height},t.Parse=function(i,e){var s=new t(i.name,e);return s._subdivisionsX=i.subdivisionsX||1,s._subdivisionsY=i.subdivisionsY||1,s._minX=i.minX,s._maxX=i.maxX,s._minZ=i.minZ,s._maxZ=i.maxZ,s._width=i.width,s._height=i.height,s},t}(n.a),d=e(27),p=e(6),m=e(36),f=e(12);o.a.CreateGround=function(i){var t,e,r=[],n=[],a=[],h=[],u=i.width||1,d=i.height||1,p=i.subdivisionsX||i.subdivisions||1,m=i.subdivisionsY||i.subdivisions||1;for(t=0;t<=m;t++)for(e=0;e<=p;e++){var f=new s.e(e*u/p-u/2,0,(m-t)*d/m-d/2),v=new s.e(0,1,0);n.push(f.x,f.y,f.z),a.push(v.x,v.y,v.z),h.push(e/p,1-t/m)}for(t=0;t<m;t++)for(e=0;e<p;e++)r.push(e+1+(t+1)*(p+1)),r.push(e+1+t*(p+1)),r.push(e+t*(p+1)),r.push(e+(t+1)*(p+1)),r.push(e+1+(t+1)*(p+1)),r.push(e+t*(p+1));var c=new o.a;return c.indices=r,c.positions=n,c.normals=a,c.uvs=h,c},o.a.CreateTiledGround=function(i){var t,e,r,n,a=void 0!==i.xmin&&null!==i.xmin?i.xmin:-1,h=void 0!==i.zmin&&null!==i.zmin?i.zmin:-1,u=void 0!==i.xmax&&null!==i.xmax?i.xmax:1,d=void 0!==i.zmax&&null!==i.zmax?i.zmax:1,p=i.subdivisions||{w:1,h:1},m=i.precision||{w:1,h:1},f=new Array,v=new Array,c=new Array,g=new Array;p.h=p.h<1?1:p.h,p.w=p.w<1?1:p.w,m.w=m.w<1?1:m.w,m.h=m.h<1?1:m.h;var l=(u-a)/p.w,b=(d-h)/p.h;function _(i,r,n,o){var a=v.length/3,h=m.w+1;for(t=0;t<m.h;t++)for(e=0;e<m.w;e++){var u=[a+e+t*h,a+(e+1)+t*h,a+(e+1)+(t+1)*h,a+e+(t+1)*h];f.push(u[1]),f.push(u[2]),f.push(u[3]),f.push(u[0]),f.push(u[1]),f.push(u[3])}var d=s.e.Zero(),p=new s.e(0,1,0);for(t=0;t<=m.h;t++)for(d.z=t*(o-r)/m.h+r,e=0;e<=m.w;e++)d.x=e*(n-i)/m.w+i,d.y=0,v.push(d.x,d.y,d.z),c.push(p.x,p.y,p.z),g.push(e/m.w,t/m.h)}for(r=0;r<p.h;r++)for(n=0;n<p.w;n++)_(a+n*l,h+r*b,a+(n+1)*l,h+(r+1)*b);var x=new o.a;return x.indices=f,x.positions=v,x.normals=c,x.uvs=g,x},o.a.CreateGroundFromHeightMap=function(i){var t,e,n=[],a=[],h=[],u=[],d=i.colorFilter||new r.a(.3,.59,.11),p=i.alphaFilter||0,f=!1;if(i.minHeight>i.maxHeight){f=!0;var v=i.maxHeight;i.maxHeight=i.minHeight,i.minHeight=v}for(t=0;t<=i.subdivisions;t++)for(e=0;e<=i.subdivisions;e++){var c=new s.e(e*i.width/i.subdivisions-i.width/2,0,(i.subdivisions-t)*i.height/i.subdivisions-i.height/2),g=4*(((c.x+i.width/2)/i.width*(i.bufferWidth-1)|0)+((1-(c.z+i.height/2)/i.height)*(i.bufferHeight-1)|0)*i.bufferWidth),l=i.buffer[g]/255,b=i.buffer[g+1]/255,_=i.buffer[g+2]/255,x=i.buffer[g+3]/255;f&&(l=1-l,b=1-b,_=1-_);var w=l*d.r+b*d.g+_*d.b;c.y=x>=p?i.minHeight+(i.maxHeight-i.minHeight)*w:i.minHeight-m.a,a.push(c.x,c.y,c.z),h.push(0,0,0),u.push(e/i.subdivisions,1-t/i.subdivisions)}for(t=0;t<i.subdivisions;t++)for(e=0;e<i.subdivisions;e++){var y=e+1+(t+1)*(i.subdivisions+1),z=e+1+t*(i.subdivisions+1),C=e+t*(i.subdivisions+1),H=e+(t+1)*(i.subdivisions+1),X=a[3*y+1]>=i.minHeight,F=a[3*z+1]>=i.minHeight,T=a[3*C+1]>=i.minHeight;X&&F&&T&&(n.push(y),n.push(z),n.push(C)),a[3*H+1]>=i.minHeight&&X&&T&&(n.push(H),n.push(y),n.push(C))}o.a.ComputeNormals(a,n,h);var Z=new o.a;return Z.indices=n,Z.positions=a,Z.normals=h,Z.uvs=u,Z},n.a.CreateGround=function(i,t,e,s,r,n){var o={width:t,height:e,subdivisions:s,updatable:n};return v.CreateGround(i,o,r)},n.a.CreateTiledGround=function(i,t,e,s,r,n,o,a,h){var u={xmin:t,zmin:e,xmax:s,zmax:r,subdivisions:n,precision:o,updatable:h};return v.CreateTiledGround(i,u,a)},n.a.CreateGroundFromHeightMap=function(i,t,e,s,r,n,o,a,h,u,d){var p={width:e,height:s,subdivisions:r,minHeight:n,maxHeight:o,updatable:h,onReady:u,alphaFilter:d};return v.CreateGroundFromHeightMap(i,t,p,a)};var v=function(){function i(){}return i.CreateGround=function(i,t,e){var s=new u(i,e);return s._setReady(!1),s._subdivisionsX=t.subdivisionsX||t.subdivisions||1,s._subdivisionsY=t.subdivisionsY||t.subdivisions||1,s._width=t.width||1,s._height=t.height||1,s._maxX=s._width/2,s._maxZ=s._height/2,s._minX=-s._maxX,s._minZ=-s._maxZ,o.a.CreateGround(t).applyToMesh(s,t.updatable),s._setReady(!0),s},i.CreateTiledGround=function(i,t,e){void 0===e&&(e=null);var s=new n.a(i,e);return o.a.CreateTiledGround(t).applyToMesh(s,t.updatable),s},i.CreateGroundFromHeightMap=function(i,t,e,s){void 0===s&&(s=null);var n=e.width||10,a=e.height||10,h=e.subdivisions||1,m=e.minHeight||0,v=e.maxHeight||1,c=e.colorFilter||new r.a(.3,.59,.11),g=e.alphaFilter||0,l=e.updatable,b=e.onReady;s=s||p.a.LastCreatedScene;var _=new u(i,s);_._subdivisionsX=h,_._subdivisionsY=h,_._width=n,_._height=a,_._maxX=_._width/2,_._maxZ=_._height/2,_._minX=-_._maxX,_._minZ=-_._maxZ,_._setReady(!1);return d.b.LoadImage(t,(function(i){var t=i.width,e=i.height,r=f.a.CreateCanvas(t,e).getContext("2d");if(!r)throw new Error("Unable to get 2d context for CreateGroundFromHeightMap");if(!s.isDisposed){r.drawImage(i,0,0);var u=r.getImageData(0,0,t,e).data;o.a.CreateGroundFromHeightMap({width:n,height:a,subdivisions:h,minHeight:m,maxHeight:v,colorFilter:c,buffer:u,bufferWidth:t,bufferHeight:e,alphaFilter:g}).applyToMesh(_,l),b&&b(_),_._setReady(!0)}}),(function(){}),s.offlineProvider),_},i}()}}]);
//# sourceMappingURL=1.babylonBundle.js.map