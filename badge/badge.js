var percents = [["US",60.61],["DE",4.55],["GB",28.79],["PT",1.52],["HK",1.52],["NL",1.52],["IE",1.52]];
/* var percents = [["US",60.61]]; */

$(document).ready(function(){
	$('span.percents').html(percents);
	drawChart();
	});
	
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