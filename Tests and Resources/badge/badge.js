/* var percents = [["US",60.61],["DE",4.55],["GB",28.79],["PT",1.52],["HK",1.52],["NL",1.52],["IE",1.52]]; */
/* var percents = [["US",60.61]]; */
/* var percents = [["US",77.69],["DE",2.48],["GB",15.70],["Unknown",0.83],["PT",0.83],["HK",0.83],["NL",0.83],["IE",0.83]]; */
var percents = [["US",77.69],["IE",4.07],["JP",3.25],["CR",3.25],["SE",2.44],["GB",14.36],["CZ",1.90],["Unknown",0.81],["HK",0.54],["IT",0.27],["CA",0.27],["NL",0.27],["AU",0.27],["DE",0.27],["DK",0.27]];

$(document).ready(function(){
	$('span.percents').html(percents);
	drawCanvas();
	drawChart();
	});
	
function drawCanvas() {	
	// set canvas to css heights
	$('#badge2').attr('width', parseInt($('#badge2').css('width')));
	$('#badge2').attr('height', parseInt($('#badge2').css('height')));
	
	var badge = $("#badge2").get(0).getContext("2d");	
	
	// circle centre and radius
	var x0 = $('#badge2').attr('width')/2;
	var y0 = $('#badge2').attr('height')/2;
	var r = Math.min($('#badge2').attr('height')/2,$('#badge2').attr('width')/2);

	var circlepointer = 0;
	
	$.each(percents, function() {
		var country = this[0];
		var value = this[1];
		var degrees = 360*(value/100);
		drawSegment(badge,x0,y0,r,circlepointer,country,degrees);
		circlepointer = circlepointer + degrees;
		});
	}
	
function drawSegment(badge,x0,y0,r,circlepointer,country,degrees) {
	var img = new Image();
	img.onload = function() {
		var svgCanvas = document.createElement("canvas");
    	svgCanvas.width = 200;
    	svgCanvas.height = 200;
    	var svgCtx = svgCanvas.getContext("2d");
    	svgCtx.drawImage(this, 0, 0, 200, 200);
    	var pattern = badge.createPattern(svgCanvas, 'repeat');
    	badge.fillStyle = pattern;

		badge.beginPath();
		badge.moveTo(x0, y0);
		var xy = circleCoords(x0,y0,r,circlepointer);
		badge.lineTo(xy[0],xy[1]);
		for (i = 0; i < degrees; i=i+30) {
			xy = circleCoords(x0,y0,r,circlepointer+i);
			badge.lineTo(xy[0],xy[1]);
			}
		xy = circleCoords(x0,y0,r,circlepointer+degrees);
		badge.lineTo(xy[0],xy[1]);
		badge.closePath();
		badge.fill();
      	};	
    img.src = '../flags/iso/'+country+'.svg';
	}	
	
function circleCoords(x0,y0,r,theta) {
	var x = x0 + r * Math.cos(theta * Math.PI / 180);
	var y = y0 + r * Math.sin(theta * Math.PI / 180);
	return [x,y];	
	}
	
function drawChart() {
	// set canvas to css heights
	$('#badge1').attr('width', parseInt($('#badge1').css('width')));
	$('#badge1').attr('height', parseInt($('#badge1').css('height')));
	var ctx = $("#badge1").get(0).getContext("2d");	
	var data = [];
	Chart.defaults.global.animation = false;
	$.each(percents, function() {
		data.push({value: this[1], color: getRandomColor(), label: this[0]});
		});
	var badge = new Chart(ctx).Pie(data);	
	}
	
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    	}
    return color;
	}