//require dynamic_chart.js
/*
function test_bars(){
	"use strict";
	var b = DynamicChart.BasicBarChart(800, 250, 2).setPosition(700, 100).setLocalScaling();
    
	var t = setInterval(function(){var x = parseInt(Math.floor(Math.random()*(101)), 10); b.appendData([[x, x/2]]);}, 1000);

    return b;
}

function test_FW_bars(w, h){
	"use strict";

    w = w === undefined ? 1024 : w;
    h = h === undefined ? 400 : h;
    
	var fwb = DynamicChart.FixedWidthBarChart(40, 10, w, h, 2).setPosition(10, 100).setFillColor("orange");
	var t = setInterval(function(){
                            var x = parseInt(Math.floor(Math.random()*(101)), 10); 
                            var y = parseInt(Math.floor(Math.random()*(201)), 10);
                            fwb.appendData([[x, y]]);}, 1000);
    return fwb;
}

function test_sliding_bars(w, h){
	"use strict";

    w = w === undefined ? 1024 : w;
    h = h === undefined ? 200 : h;
    
	var sb = DynamicChart.SlidingBarChart(40, w, h, 2).setPosition(10, 100).setFillColor("green").setFillColor("yellow", 1);
	var t = setInterval(function(){
                            var x = parseInt(Math.floor(Math.random()*(101)), 10); 
                            var y = parseInt(Math.floor(Math.random()*(201)), 10);
                            sb.appendData([[x, y]]);}, 1000);                    
    return sb;
}


function test_wheel(startTime, r, w, h){
	"use strict";
    
    startTime = startTime === undefined ? "12:20" : startTime;
    
    r = r === undefined ? 200 : r;
    w = w === undefined ? 800 : w;
    h = h === undefined ? 600 : h;
    
	var tw = DynamicChart.TimeWheelChart(50, startTime, r, w, h, 2).setPosition(10, 100).setFillColor("orange");
	var t = setInterval(function(){
                            var x = parseInt(Math.floor(Math.random()*(101)), 10); 
                            var y = parseInt(Math.floor(Math.random()*(201)), 10);
                            tw.appendData([[x, y]]);}, 1000);
    return tw;
}

function test(){
	"use strict";
	var b = DynamicChart.BasicBarChart(800, 250, 2).setPosition(700, 100).setLocalScaling();
	var w = DynamicChart.TimeWheelChart(50, 10, undefined, 640, 480).setPosition(10, 100).setFillColor("orange").setLabelColor("black").setStrokeColor("red");
	var t = setInterval(function(){var x = parseInt(Math.floor(Math.random()*(101)), 10); b.appendData([[x, Math.random()]]); w.appendData([x]);}, 1500);
	
	function restart(){w.clearData(); b.clearData();}
	return restart;
}
*/
function simulation(startTime, r, w, h){
	"use strict";
    
    startTime = startTime === undefined ? "12:20" : startTime;
    
    r = r === undefined ? 150 : r;
    w = w === undefined ? 1024 : w;
    h = h === undefined ? 600 : h;
    var tw = DynamicChart.TimeWheelChart(40, startTime, r, w, h, 2).setPosition(0, 0)
                         .setFillColor("cornflowerblue", 0).setFillColor("hotpink", 1)
                         .setWheelCenter(512, 300)
                         .setShifitingDataMode(10)
                         .setTitle("Aggregates per minute")
                         .addLegend(["Males", "Females"], 130, 45, 20, 20);                         
                         //.setLocalScaling();
    var sb = DynamicChart.SlidingBarChart(50, w, 150, 2)
                         .setPosition(0, h)
                         .setFillColor("cornflowerblue")
                         .setFillColor("hotpink", 1)
                         .setBackgroundHighlightColor("gold")
                         .setTicksBetweenHighlights(10)
                         .setTitle("Real time values updated every second", 18);                         

    
    var males = [], females = [], t = 0 , dt = 200;
    
	var timer = setInterval(function(){
                            var x = parseInt(Math.floor(Math.random()*(101*Math.log(t))), 10); 
                            var y = parseInt(Math.floor(Math.random()*(101*Math.log(t))), 10);
                            males.push(y);
                            females.push(x);
                            sb.appendData([[y, x]]);
                            if (t % 2000 === 0){
                                var y_s = males.sum();
                                var x_s = females.sum();
                                males.length = 0;
                                females.length = 0;
                                tw.appendData([[y_s, x_s]]);                               
                            }    
                            t += dt;  
                        }, dt); 
                            
    function stop(){
            clearInterval(timer);
        } 
    return stop;
}

var simulation_stop = simulation();