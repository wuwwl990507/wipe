var cas = document.getElementById('cas');
var context = cas.getContext("2d");
var _w = cas.width,_h = cas.height,t = 0;
var radius = 30;  //涂抹的半径
var posX = 0;
var posY = 0;
var isMouseDown = false;  //表示鼠标的状态，是否按下，默认为未按下false，按下true
// device 保存设备类型，如果是移动端则为true，PC端为false
var device = (/android | webos | iPhone | ipad | ipod | blackberry | iemobile | opera mini/i.test(navigator.userAgent.toLowerCase()));
console.log(navigator.userAgent);
console.log(device);
var clickEvtName = device ? "touchstart" : "mousedown";
var moveEvtName = device ? "touchmove" : "mousemove";
var endEvtName = device ? "touchend" : "mouseup";

// 使用当函数代替画点和画线
function drawT(context,x1,y1,x2,y2){
	if (arguments.length === 3) {
		// 调用的是画点功能
		context.save();
		context.beginPath();
		context.arc(x1,y1,radius,0,2*Math.PI);
		context.fillStyle = "red";
		context.fill();
		context.restore();
	} else if (arguments.length === 5) {
		// 调用的是画线功能
		context.save();
		context.lineCap = "round";
		context.lineWidth = radius*2;
		context.beginPath();
		context.moveTo(x1,y1);
		context.lineTo(x2,y2);
		context.stroke();
		context.restore();
	} else {
		return false;
	}
}

// 生成画布上的遮罩，默认为颜色#666
function drawMask(context){
	context.fillStyle = "#666";
	context.fillRect(0,0,_w,_h);
	context.globalCompositeOperation = "destination-out";
}

// 在canvas画布上监听自定义事件"mousedown"，调用drawPoint函数
cas.addEventListener(clickEvtName,function(evt){
	isMouseDown = true;
	var event = evt || window.event;
	// 获取鼠标在视口的坐标，传递参数到drawPoint
	posX = device ? event.touches[0].clientX : event.clientX;
	posY = device ? event.touches[0].clientY : event.clientY;
	drawT(context,posX,posY);
},false);

// 增加监听"mousemove",调用drawPoint函数
cas.addEventListener(moveEvtName,function(evt){
	// 判断，当isMouseDown为true是，才能执行下面的操作
	if (!isMouseDown) {
		return false;
	} else {
		var event = evt || window.event;
		event.preventDefault();
		var x2 = device ? event.touches[0].clientX : event.clientX;
		var y2 = device ? event.touches[0].clientY : event.clientY;
		drawT(context,posX,posY,x2,y2);
		// 每次的就是点变成下次划线的开始点
		posX = x2;
		posY = y2;
	}
},false);
cas.addEventListener(endEvtName,function(){
	// 还原isMouseDown 为false
	isMouseDown = false;
	if (getTransparencyPercent(context) > 50) {
		alert("超过了50%的面积");
		clearRect(context);
	}
},false);

function clearRect(context){
	context.clearRect(0,0,_w,_h);
}
function getTransparencyPercent(context){
	var imgData = context.getImageData(0,0,_w,_h);
	for (var i = 0; i < imgData.data.length; i+=4) {
		var a = imgData.data[i + 3];
		if (a === 0) {
			t++;
		}
	}
	var percent = t/(_w * _h) * 100;
	console.log("透明点的个数：" + t);
	console.log("占总面积" + Math.round(percent) + "%");
	// return ((t / (_w * _h) )*100).toFixed(2);  //截取小数点两位
	return Math.round(percent);
}
window.onload = function(){
	drawMask(context);
};