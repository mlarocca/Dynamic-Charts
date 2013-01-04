function full_simulation(startTime, r, w, h){
	"use strict";
    
    startTime = startTime === undefined ? "00:00" : startTime;
    
    r = r === undefined ? 50 : r;
    w = w === undefined ? 640 : w;
    h = h === undefined ? 480 : h;
    
    var MARGIN = 10;
    var tw = DynamicChart.TimeWheelChart(40, startTime, r, w, h, "30;", 2)
                         .setPosition(MARGIN, MARGIN)
                         .setBarsFillColor("cornflowerblue", 0).setBarsFillColor("hotpink", 1)
                         .setLabelColor("blue", 0).setLabelColor("#EF69B4", 1)
                         .setShifitingDataMode(10)
                         .setOuterBorder("black", 1)
                         .setTitle("Aggregates per minute", undefined, "midnightblue")
                         .setInnerBorder("grey", 1, "1 2")
                         .setInnerBackgroundColor("#E4E5FF")
                         .setOuterBackgroundColor("#FAF5B0")
                         .setTimeWheelForeColor("firebrick")
                         .addLegend(["Males", "Females"], 130, 45, 20, 20);                         
                         //.setLocalScaling();
    var sb = DynamicChart.SlidingBarChart(50, w, 250, "25 60 35 10;", 2)
                         .setPosition(w + 2 * MARGIN , 170)
                         .setBarsFillColor("cornflowerblue")
                         .setBarsFillColor("hotpink", 1)
                         .setInnerBackgroundColor("lightgrey")
                         .setInnerBackgroundHighlightColor("gold")
                         .setTicksBetweenHighlights(10)
                         .setOuterBorder("black", 1)
                         .setOuterBackgroundColor("#FAF5B0")                         
                         .setTitle("Real time values updated every second", 20, "midnightblue")
                         .setVerticalAxe(true, "Tweets/sec", 5, 2, "red")
                         .setHorizontalAxe(false, "Time (sec.)", 25, 2, "#5B48FF", 8);                         
                         
    var bb = DynamicChart.BasicBarChart(w, h * 0.75, "25 55 25 5;", 2)
                         .setPosition(MARGIN, h + 2* MARGIN)
                         .setBarsFillColor("cornflowerblue")
                         .setBarsFillColor("hotpink", 1)
                         .setOuterBorder("black", 1)
                         .setInnerBorder("grey", 1, "1 2")
                         .setInnerBackgroundColor("#E4E5FF")
                         .setOuterBackgroundColor("#FAF5B0")  
                         .setTitle("Aggregates per minute", 20, "midnightblue")                         
                         .setVerticalAxe(true, "Tweets/sec", 5, 2, "red")
                         .setHorizontalAxe(false, "Time ->", 20, 2, "#5B48FF");                      
    var fbw = DynamicChart.FixedWidthBarChart(30, undefined, w, h * 0.75, "25 5 25 25;", 2)
                         .setVerticalAxe(false, "Tweets/sec", 5, 2, "red")
                         .setHorizontalAxe(false, "Time (sec.)", 20, 2, "#5B48FF", 8, "#5B48FF", 8)
                         .setPosition(w + 2 * MARGIN, h + 2 * MARGIN)
                         .setBarsFillColor("cornflowerblue")
                         .setBarsFillColor("hotpink", 1)
                         .setInnerBackgroundColor("#E4E5FF")
                         .setOuterBackgroundColor("#FAF5B0")                         
                         .setOuterBorder("black", 1)
                         .setInnerBorder("grey", 1, "1 2")
                         .setTitle("Aggregates per minute", 20, "midnightblue")
                         .setShifitingDataMode(20)
                         .setLocalScaling();

                        
    var males = [], females = [], dt = 200, t = dt;
    
	var timer = setInterval(function(){
                            var x = parseInt(Math.floor(Math.random()*(101*Math.log(t))), 10); 
                            var y = parseInt(Math.floor(Math.random()*(101*Math.log(t))), 10);
                            males.push(y);
                            females.push(x);
                            sb.appendData([[y, x]]);
                            if (t % 2000 === 0 && t > 0){
                                var y_s = males.sum();
                                var x_s = females.sum();
                                
                                males.length = 0;
                                females.length = 0;
                                tw.appendData([[y_s, x_s]]);   
                                if (t/dt < 500){
                                   bb.appendData([[y_s, x_s]]);  
                                }
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