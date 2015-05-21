var badgeCanvas;
var badge;

$( document ).ready(function() {

/* 	var percents = [<% _.each(timeframeCitizenship, function(country) { %>["<%= country.code %>","<%= country.percentage %>"],<% }); %>]; */

	countries = ["AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BY","BZ","CA","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FM","FR","GA","GB","GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY","HK","HN","HR","HT","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MR","MT","MU","MV","MW","MX","MY","MZ","NA","NE","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PG","PH","PK","PL","PS","PT","PW","PY","QA","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV","SY","SZ","TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UK","US","UY","UZ","VA","VC","VE","VN","VU","WS","XK","YE","ZA","ZM","ZW"];
	
	var percents = [];
	var percent = 0;
	while (percent < 100) {
		var newsegment = Math.floor(Math.random() * 25) + 1;
		if (percent + newsegment > 100) {
			newsegment = 100 - percent;
			}
		var newcountry = countries[Math.floor(Math.random()*countries.length)]; 
		percents.push([newcountry,newsegment]);
		percent = percent + newsegment;
		}
	
	console.log(percents);

	
	// set canvas to css heights
	$('#badge').attr('width', parseInt($('#badge').css('width')));
	$('#badge').attr('height', parseInt($('#badge').css('height')));

	badgeCanvas = $("#badge").get(0);
	badge = badgeCanvas.getContext("2d");

	// circle centre and radius
	var x0 = $('#badge').attr('width')/2;
	var y0 = $('#badge').attr('height')/2;
	var r = Math.min($('#badge').attr('height')/2,$('#badge').attr('width')/2);

	var circlepointer = 0;

	$.each(percents, function() {
		var country = this[0];
		var value = this[1];
		var degrees = 360*(value/100);
		drawSegment(badge,x0,y0,r,circlepointer,country,degrees);
		circlepointer = circlepointer + degrees;
		console.log(country);
		});
		
	setTimeout(function() {
		var png = badgeCanvas.toDataURL();
		console.log(png);
		$('#badge_image').attr('src',png) }, 1000);
		
	});
	
function drawSegment(badge,x0,y0,r,circlepointer,country,degrees) {
	var img = new Image();
	img.onload = function() {
		var flagscaledheight = badge.canvas.clientHeight;
		var flagscaledwidth = flagscaledheight*(img.width/img.height);
		var flagmargin = (flagscaledwidth - badge.canvas.clientWidth) / 2;
		var svgCanvas = document.createElement("canvas");
	    if (flagscaledwidth === 0) {
	      return;
	    }
		svgCanvas.height = flagscaledheight;
		svgCanvas.width = flagscaledwidth;
		var svgCtx = svgCanvas.getContext("2d");
		svgCtx.drawImage(img, -flagmargin, 0, flagscaledwidth, flagscaledheight);
		var pattern = badge.createPattern(svgCanvas, 'repeat');
		badge.fillStyle = pattern;
		badge.beginPath();
		badge.moveTo(x0, y0);
		var xy = circleCoords(x0,y0,r,circlepointer);
		badge.lineTo(xy[0],xy[1]);
		for (i = 0; i < degrees; i=i+20) {
			xy = circleCoords(x0,y0,r,circlepointer+i);
			badge.lineTo(xy[0],xy[1]);
			}
		xy = circleCoords(x0,y0,r,circlepointer+degrees);
		badge.lineTo(xy[0],xy[1]);
		badge.closePath();
		badge.lineWidth=1;
/*
		badge.strokeStyle="#888";
		badge.stroke();
*/
		badge.fill();
		console.log(country);
	  	};
	img.src = '../flags/iso/'+country+'.svg';
	}
	
function circleCoords(x0,y0,r,theta) {
	var x = x0 + r * Math.cos(theta * Math.PI / 180);
	var y = y0 + r * Math.sin(theta * Math.PI / 180);
	return [x,y];
	}