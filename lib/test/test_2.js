function full_simulation(startTime, r, w, h){
	"use strict";
    
    startTime = startTime === undefined ? "00:00" : startTime;
    
    r = r === undefined ? 50 : r;
    w = w === undefined ? 640 : w;
    h = h === undefined ? 480 : h;
    
    var MARGIN = 50;
    var tw = DynamicChart.TimeWheelChart(40, startTime, r, w, h, 2)
                         .setPosition(0, 0)
                         .setFillColor("cornflowerblue", 0).setFillColor("hotpink", 1)
                         .setShifitingDataMode(10)
                         .setTitle("Aggregates per minute")
                         .addLegend(["Males", "Females"], 130, 45, 20, 20);                         
                         //.setLocalScaling();
    var sb = DynamicChart.SlidingBarChart(50, w, 150, 2)
                         .setPosition(w + MARGIN , 0)
                         .setFillColor("cornflowerblue")
                         .setFillColor("hotpink", 1)
                         .setBackgroundHighlightColor("gold")
                         .setTicksBetweenHighlights(10)
                         .setTitle("Real time values updated every second", 18);  
                         
    var bb = DynamicChart.BasicBarChart(w, h * 0.75, 2)
                         .setPosition(0, h)
                         .setFillColor("cornflowerblue")
                         .setFillColor("hotpink", 1);
    var fbw = DynamicChart.FixedWidthBarChart(30, undefined, w, h * 0.75, 2)
                         .setPosition(w + MARGIN, h)
                         .setFillColor("cornflowerblue")
                         .setFillColor("hotpink", 1)
                         .setShifitingDataMode(20)
                         .setLocalScaling(); 
                        
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
                                bb.appendData([[y_s, x_s]]);  
                                fbw.appendData([[y_s, x_s]]);  
                            }    
                            t += dt;  
                        }, dt); 
                            
    function stop(){
            clearInterval(timer);
        } 
    return stop;
}

var simulation_stop = full_simulation();