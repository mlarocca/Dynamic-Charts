//require dynamic_chart.js

function test_bars(){
	"use strict";
	var b = DynamicChart.BasicBarChart(800, 250, "", 2).setPosition(700, 100).setLocalScaling();
    
	var t = setInterval(function(){var x = parseInt(Math.floor(Math.random()*(101)), 10); b.appendData([[x, x/2]]);}, 1000);

    return b;
}

function test_FW_bars(w, h){
	"use strict";

    w = w === undefined ? 1024 : w;
    h = h === undefined ? 400 : h;
    
	var fwb = DynamicChart.FixedWidthBarChart(40, 10, w, h, "", 2).setPosition(10, 100).setBarsFillColor("orange");
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
    
	var sb = DynamicChart.SlidingBarChart(40, w, h, "", 2).setPosition(10, 100).setBarsFillColor("green").setBarsFillColor("yellow", 1);
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
    
	var tw = DynamicChart.TimeWheelChart(50, startTime, r, w, h, "", 2).setPosition(10, 100).setBarsFillColor("orange");
	var t = setInterval(function(){
                            var x = parseInt(Math.floor(Math.random()*(10001)), 10); 
                            var y = parseInt(Math.floor(Math.random()*(20001)), 10);
                            tw.appendData([[x, y]]);}, 1000);
    return tw;
}

function test(){
	"use strict";
	var b = DynamicChart.BasicBarChart(800, 250, "", 2).setPosition(700, 100).setLocalScaling();
	var w = DynamicChart.TimeWheelChart(50, 10, undefined, 640, 480, "").setPosition(10, 100).setBarsFillColor("orange").setLabelColor("black").setStrokeColor("red");
	var t = setInterval(function(){var x = parseInt(Math.floor(Math.random()*(101)), 10); b.appendData([[x, Math.random()]]); w.appendData([x]);}, 1500);
	
	function restart(){w.clearData(); b.clearData();}
	return restart;
}

function simulation(startTime, r, w, h){
	"use strict";
    
    startTime = startTime === undefined ? "12:20" : startTime;
    
    r = r === undefined ? 150 : r;
    w = w === undefined ? 1024 : w;
    h = h === undefined ? 600 : h;
    var tw = DynamicChart.TimeWheelChart(40, startTime, r, w, h, "30 100 10 100;", 2).setPosition(10, 5)
                         .setBarsFillColor("cornflowerblue", 0).setBarsFillColor("hotpink", 1)
                         .setOuterBackgroundColor("lavenderblush")                       
                         .setInnerBorder("#E50000", 2, "3 2 3 1")
                         .setOuterBorder("black", 1)
                         //.setWheelCenter(512, 300)
                         .setShifitingDataMode(10)
                         .setAbbreviatedLabel(0)
                         .setTitle("Aggregates per minute", 25, "#DD0000")
                         .addLegend(["Males", "Females"], 130, 45, 20, 20);                         
                         //.setLocalScaling();
    var sb = DynamicChart.SlidingBarChart(50, w, 200, "25 60 35 1;", 2)
                         .setPosition(10, h + 10)
                         .setBarsFillColor("cornflowerblue")
                         .setBarsFillColor("hotpink", 1)
                         .setInnerBackgroundColor("lightgrey")
                         .setInnerBackgroundHighlightColor("gold")
                         .setOuterBackgroundColor("antiquewhite")
                         .setOuterBorder("black", 1)
                         .setTicksBetweenHighlights(10)
                         .setTitle("Real time values updated every second", 18, "firebrick")
                         .setVerticalAxe(true, "Tweets/sec", 5, 2, "red")
                         .setHorizontalAxe(false, "Time (sec.)", 20, 2, "#5B48FF");

    
    var males = [], females = [], dt = 200, t = dt;
    
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