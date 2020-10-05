alert("Before new WebAssembly.Memory");
var memory = new WebAssembly.Memory({initial:10, maximum:100});
alert("After new WebAssembly.Memory");

alert("Before new SharedArrayBuffer");
var sab = new SharedArrayBuffer(1024);
alert("After new SharedArrayBuffer");