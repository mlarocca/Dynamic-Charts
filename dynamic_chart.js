//require d3.v2.js
//require chart_utils.js

if (!window.DynamicChart){
	/**
		Module DynamicChart
        
This module requires:
<ol>
    <li>{{#crossLinkModule "chart_utils.js"}}{{/crossLinkModule}}</li>
    <li>{{#crossLink "http://d3js.org/d3.v2.js"}}{{/crossLink}}</li>
</ol>
<br>
Exposes methods for creating different types of dynamic charts:
<ul>
    <li>BasicBarChart</li>
    <li>FixedWidthBarChart</li>
    <li>SlidingBarChart</li>
    <li>TimeWheelChart</li>
</ul>        
        @module DynamicChart
	*/
	var DynamicChart = (function (){
		"use strict";
		
        
        //      -----       CONSTANTS       --------
        /** 
            Maximum dimension of the input space, i.e. max number of subvalues for each single point
            @property MAX_SPACE_DIMENSION
            @for DynamicChart
            @type {Number}
            @final
            @private     
          */             
        var MAX_SPACE_DIMENSION = 10;
        /** 
            Default fill colors bor graphic elements;
            @property FILL_COLORS
            @for DynamicChart
            @type {Array}
            @final
            @private     
          */    
        var FILL_COLORS = ["blue", "red", "green", "orange", "purple", "cyan", "magenta", "yellow", "limegreen", "brown"];
        /** 
            Default size for chart's labels (in points);
            @property DEFAULT_LABEL_SIZE
            @for DynamicChart
            @type {Number}
            @final
            @private     
          */
        var DEFAULT_LABEL_SIZE = 12;
        /** 
            Default size for chart's title text (in points);
            @property DEFAULT_TITLE_SIZE
            @for DynamicChart
            @type {Number}
            @final
            @private     
          */        
        var DEFAULT_TITLE_SIZE = 22;
            /** 
                Default width for legend's item boxes (in pixel);
                @property LEGEND_ITEM_WIDTH
                @for DynamicChart
                @type {Number}
                @final
                @private     
              */               
        var LEGEND_ITEM_WIDTH = 25,
            /** 
                Default height for legend's item boxes (in pixel);
                @property LEGEND_ITEM_HEIGHT
                @for DynamicChart
                @type {Number}
                @final
                @private     
              */          
            LEGEND_ITEM_HEIGHT = 15,
            /** 
                Default margin for legends (in pixel);
                @property LEGEND_MARGIN
                @for DynamicChart
                @type {Number}
                @final
                @private     
              */              
            LEGEND_MARGIN = 5,
            /** 
                Default left margin for legend's items (in pixel);
                @property LEGEND_ITEM_LEFT
                @for DynamicChart
                @type {Number}
                @final
                @private     
              */               
            LEGEND_ITEM_LEFT = LEGEND_MARGIN,
            /** 
                Default font size for labels attached to legend's items (in pixel);
                @property LEGEND_ITEM_FONT_SIZE
                @for DynamicChart
                @type {Number}
                @final
                @private     
              */              
            LEGEND_ITEM_FONT_SIZE = 11;      
        //      -----       /CONSTANTS       --------
        
        
        //      -----       LEGEND       --------
        
        var legendPrototype = {
                            /** setPosition(left, top)
                                Sets the position of the legend in the page. Position is assumed to be absolute.
                                
                                @method setPosition
                                @for Legend
                                @chainable
                                @param {Number} left [Mandatory]
                                                      The horizontal position of the legend bounding box;
                                                      Only Integers and values that can be converted to integers are accepted.
                                @param {Number} top [Mandatory]
                                                    The vertical position of the legend bounding box;
                                                    Only Integers and values that can be converted to integers are accepted.
                                @return {Object}    This legend object, to allow for method chaining.
                                @throws     Never: if either argument is not valid, simply ignores the action.
                            */
			setPosition:	function(left, top){
								left = parseInt(left, 10);
								top = parseInt(top, 10);
								if (this.__divElement__ && !isNaN(left) && !isNaN(top)){
									this.__divElement__.attr("style", "position:absolute; left:" + left + "; top:"+top +";" );
								}	
                                return this;	//Method chaining support
							},	
                            
                        /** setWidth(width)
                            Sets the width of the legend bounding box.
                            
                            @method setWidth
                            @for Legend
                            @chainable
                            @param {Number} width   [Mandatory]
                                                    The new width of the legend;
                                                    Only positive integers and values that can be converted
                                                    to positive Integers are accepted.
                            @return {Object}    This legend object, to allow for method chaining.
                            @throws {Illegal Argument Exception} if the argument is not valid (see above). 
                        */                            
			setWidth: 	function(width){
							width = parseInt(width, 10);
							if (this.__svgElement__ && !isNaN(width) && width >= 0){
								this.__svgElement__.attr("width", width);
                                this.__divElement__.attr("width", width);
							}else{
                                throw "Illegal Argument: width";
                            }
							return this;	//Method chaining support
						},	
                        
                        /** setHeight(height)
                            Sets the height of the legend bounding box.
                            
                            @method setHeight
                            @for Legend
                            @chainable
                            @param {Number} height  [Mandatory]
                                                    The new height of the legend; 
                                                    Only positive Integers and values that can be converted
                                                    to positive integers are accepted.
                            @return {Object}    This legend object, to allow for method chaining.
                            @throws <ul>
                                        <li> Illegal Argument Exception, if the argument is not valid (see above). </li>
                                    </ul>    
                        */                             
			setHeight: function(height){
							height = parseInt(height, 10);
							if (this.__svgElement__ && !isNaN(height) && height >= 0){
								this.__svgElement__.attr("height", height);
							}else{
                                throw "Illegal Argument: height";
                            }
							return this;	//Method chaining support
						},	
                           
                        /** addItem(label, color)
                            Adds an item to the legend and then redraws it;
                            
                            @method addItem
                            @for Legend
                            @chainable
                            @param {String} labelText   [Mandatory]
                                                        The text of the label for this new item;
                            @param {String} labelColor  [Mandatory]
                                                        The color to be used to draw new item's label;
                            @param {String} fillColor   [Mandatory]
                                                        The color associated with this new item;                                            
                            @return {Object}    This legend object, to allow for method chaining;
                            @throws <ul>
                                        <li> Wrong Number of arguments Exception, if either argument is missing. </li>
                                    </ul>
                          */                        
            addItem:    function(labelText, labelColor, fillColor){
                            if (labelText === undefined || labelColor === undefined || fillColor === undefined){
                                throw "Wrong number of arguments: label and color are both mandatory";
                            }
                            this.__items__.push({labelText: labelText, labelColor: labelColor, fillColor: fillColor});
                            var n = this.__items__.length - 1;
                            this.__svgElement__.append("rect")
                                           .attr("stroke", "black")
                                           .attr("fill", fillColor)
                                           .attr("width", LEGEND_ITEM_WIDTH)
                                           .attr("height", LEGEND_ITEM_HEIGHT)
                                           .attr("x", LEGEND_ITEM_LEFT)
                                           .attr("y", LEGEND_MARGIN + n * (LEGEND_ITEM_HEIGHT + LEGEND_MARGIN));
                            this.__svgElement__.append("text")
                                           .text(labelText)
                                           .attr("fill", labelColor)
                                           .attr("x", LEGEND_ITEM_LEFT + LEGEND_ITEM_WIDTH + LEGEND_MARGIN)         //Aligns to the bottom of the rect
                                           .attr("y", n * (LEGEND_ITEM_HEIGHT + LEGEND_MARGIN) + LEGEND_ITEM_HEIGHT)
											.attr("font-family", "sans-serif")
											.attr("font-size", LEGEND_ITEM_FONT_SIZE)
                                            .attr("text-anchor", "left");                                         
                        }, 
                        /** removeItem(index)
                            @method removeItem
                            @for Legend
                            @chainable
                            @param {Number} index   [Mandatory] 
                                                    The index of the item to update; 
                                                    Only positive Integers and values that can be converted
                                                    to positive integers are accepted.
                            @return {Object}   This legend object, to allow for method chaining;                                
                            @throws <ul>
                                        <li>Illegal Argument Exception, if index is not in its valid range.</li>
                                    </ul>
                         */
            removeItem: function(index){
                            index = parseInt(index, 10);
                            if (isNaN(index) || index < 0 || index >= this.__items__.length){
                                throw "Illegal Argument: index";
                            }  
                            this.__items__.splice(index,1);
                            this.__svgElement__.selectAll("rect").data(this.__items__).exit().remove();
                            this.__svgElement__.selectAll("text").data(this.__items__).exit().remove();
                            this.__redrawLegend__();
                            return this;    //Method chaining support
                        },
                        
                        /** updateItem(index [, newLabelText, newLabelColor, newFillColor])
                            
                            Updates the attributes of an item of the legend and then redraws it;
                            
                            @method updateItem
                            @for Legend
                            @chainable
                            @param {Number} index   [Mandatory]
                                            The index of the item to update;
                            @param {String} [labelText]   [Optional]
                                                The new text for the label of the index-th item;
                                                If omitted or undefined won't be changed;
                            @param {String} [labelColor]  [Optional]
                                                The new color to be used to draw the index-th item's label;
                                                If omitted or undefined won't be changed;
                            @param {String} [fillColor]   [Optional]
                                                The new color associated with the index-th item;
                                                If omitted or undefined won't be changed;
                            @return {Object}    This legend object, to allow for method chaining;                                
                            @throws 
                                    - Illegal Argument Exception, if index is not in its valid range.
                         */
            updateItem: function(index, newLabelText, newLabelColor, newFillColor){
                            index = parseInt(index, 10);
                            if (isNaN(index) || index < 0 || index >= this.__items__.length){
                                throw "Illegal Argument: index";
                            }
                            var oldItem = this.__items__[index];
                            if (newLabelText !== undefined){
                                oldItem.labelText = newLabelText;
                            }
                            if (newLabelColor !== undefined){
                                oldItem.labelColor = newLabelColor;
                            }    
                            if (newFillColor !== undefined){
                                oldItem.fillColor = newFillColor;
                            }                            
                            this.__redrawLegend__();
                            
                            return this;    //Method chaining support
                        },
                        
                        /** destroy()
                            
                            Object's destructor: helps garbage collector freeing memory, and removes legend's DOM elements.
                            
                            Object's destructor: helps garbage collector freeing memory, and removes chart DOM elements.<br>
                            <br>
                            <b>WARNING</b>: calling destroy on an object will force any further reference 
                                            to its attributes / methods to throw exceptions.<br>
                            <br>
                            <b>NOTE</b>:   This function should be override by any class inheriting from this object.<br>
                                           In order to properly work, any overriding destroyer should:
                                            <ol>
                                                <li> Free any array specific to the object on which is called;</li>
                                                <li> Remove any event listener on chart objects;</li>
                                                <li> Call super object's destroy method.</li>
                                            </ol>
                            @method destroy
                            @for Legend
                            @return {null} to state that the object has been destroyed.
                          */                        
            destroy: 	function(){
                                
                                //Deletes all the elements from object's arrays
                                this.__items__.length = 0;
                                
                                //Removes DOM objects
                                this.__svgElement__.remove();
                                this.__divElement__.remove();

                                return null;
                            }
        };
        
        /**
            Legend for a chart;<br>
            Adds a div and an SVG element to the page to represent a chart's legend.
            @class Legend
            @private
          */
          //@for BasicBarChart 
        
        /** LegendFactory(width, height [, left, top, parent])
            
            Creates, upon request, a new Legend object and returns it;

            @method LegendFactory
            @for Legend
            @param {Number} [width]    [Mandatory]
                                    The desired width for the chart (<b>can't be changed later</b>)
                                    Can be any value that is or can be converted to a positive integer.
            @param {Number} [height]  [Mandatory]
                                    The desired height for the chart (<b>can't be changed later</b>)
                                    Can be any value that is or can be converted to a positive integer.
            @param {Number} [left]    [Optional]
                                    The horizontal position of the legend bounding box;
            @param {Number} [top]     [Optional]
                                    The vertical position of the legend bounding box;
            @param {Object} [parent= page's body element]   [Optional]
                                    The DOM element to which the diagram should be appended as a child
            @return {Object}    A new Legend object;
            @throws
                    -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                    -   Illegal Argument exception , if width or height aren't valid (numeric, positive) values 
                        (through setWidth or setHeight)
                    -   Illegal Argument exception, if dataDim is passed but it's invalid (not numeric or not positive)
                    -   Exception, if dataDim exceeds the maximum data dimension
                    -   Exception, if parent is passed but it is not a valid DOM element
        */
        function LegendFactory(width, height, left, top, parent){
            
            /** __init__(legend, width, height)
                [Private method, not visible from consumers]
                
                @method __init__
                @private
                
                @param {Object} legend  [Mandatory]
                                The legend object to be initialized;
                @param {Number} width   [Mandatory]
                                The width of the legend object;
                @param {Number} height  [Mandatory]
                                The height of the legend object;
                @return {undefined}
                @throws 
                            -   Illegal Argument exception , if width or height aren't valid (numeric, positive) values 
                                (through setWidth or setHeight)
              */
            function __init__(legend, width, height){
                legend.setWidth(width);
                legend.setHeight(height);
                legend.setPosition(left, top);
                legend.__svgElement__.append("rect")
                      .attr("stroke", "black")
                      .attr("width", width)
                      .attr("fill", "none")
                      .attr("height", height);            
            }
            
            var legend = Object.create(legendPrototype);
            
            /** __redrawLegend__()
                [Protected method, not visible outside this library]
                
                Update the drawings of this legend object;
                
                @method __redrawLegend__
                @protected
                @return {undefined}
                @throws 
                            -   Illegal Argument exception , if width or height aren't valid (numeric, positive) values 
                                (through setWidth or setHeight)
              */                                            
            Object.defineProperty(legend, "__redrawLegend__", {
                    value:	function(){
                    
                                this.__svgElement__.selectAll("rect").data(this.__items__)
                                               .attr("stroke", "black")
                                               .attr("fill", function(item){return item.fillColor;})
                                               .attr("width", LEGEND_ITEM_WIDTH)
                                               .attr("height", LEGEND_ITEM_HEIGHT)
                                               .attr("x", LEGEND_ITEM_LEFT)
                                               .attr("y", function(item, i){return LEGEND_MARGIN + i * (LEGEND_ITEM_HEIGHT + LEGEND_MARGIN);});
                                this.__svgElement__.selectAll("text").data(this.__items__)
                                               .text(function(item){return item.labelText;})
                                               .attr("fill", function(item){return item.labelColor;})
                                               .attr("x", LEGEND_ITEM_LEFT + LEGEND_ITEM_WIDTH + LEGEND_MARGIN)         //Aligns to the bottom of the rect
                                               .attr("y", function(item, i){return i * (LEGEND_ITEM_HEIGHT + LEGEND_MARGIN) + LEGEND_ITEM_HEIGHT;})
                                                .attr("font-family", "sans-serif")
                                                .attr("font-size", LEGEND_ITEM_FONT_SIZE)
                                                .attr("text-anchor", "left");  
                                
                                return;
                            },
                    writable: false,
                    enumerable: false,
                    configurable:false                 
            }); 


            if (width === undefined  || height === undefined){
                throw "Wrong number of arguments: width and height are mandatory";
            }
            if (parent === undefined){	//By default, added to the 
                parent = d3.select("body");
            }
            
            var div = parent.append("div");
            var svg = div.append("svg").attr("id", "chart_legend");
            
                                                    /** 
                                                        The div element that will be a container to the legend's svg element
                                                        @property __divElement__
                                                        @type {Object}
                                                        @readOnly
                                                        @protected
                                                      */            
            Object.defineProperty(legend, "__divElement__", {
                    value:	div,
                    writable: false,
                    enumerable: false,
                    configurable:false                                   
            });  
                                            /**
                                                The svg element for this Legend
                                                @property __svgElement__
                                                @type {Object}
                                                @readOnly
                                                @protected
                                                
                                              */             
            Object.defineProperty(legend, "__svgElement__", {
                    value:	svg,
                    writable: false,
                    enumerable: false,
                    configurable:false                                   
            });
                                          /** 
                                                Array of the items contained in the legend
                                                @property __items__
                                                @type {Array}
                                                @readOnly
                                                @protected                                                
                                            */
            Object.defineProperty(legend, "__items__", {
                    value:	[],
                    writable: false,
                    enumerable: false,
                    configurable:false
            });
            
            __init__(legend, width, height);
            
            Object.seal(legend);
            return legend;
        }

        
        //      -----       DYNAMIC CHARTS       --------
        
        /** 
            Base Chart Class: <b>BasicBarChart</b><br>
            Basic bar histogram chart.<br>
            Values are represented using vertical bars;<br>
            Each point or value can have up to 10 subcomponents, where each component can be 
            any non-nregative real number (i.e., each point can be in R_+^i, for 1 <= i <= 10).
            
            @class BasicBarChart
            @private
          */    
          //uses Legend

		var next_id = 0;
		var basicBarChartSharedPrototype = {
                            /** setPosition(left, top)
                                Sets the position of the chart in the page. Position is assumed to be absolute.
                                
                                @method setPosition
                                @chainable
                                @param {Number} left    [Mandatory]
                                                        The horizontal position of the chart bounding box;
                                @param {Number} top     [Mandatory]
                                                        The vertical position of the chart bounding box;
                                @return {Object}    This chart object, to allow for method chaining.
                                @throws     Never: if either argument is not valid, simply ignores the action.
                            */
			setPosition:	function(left, top){
								left = parseInt(left, 10);
								top = parseInt(top, 10);
								if (this.__divElement__ && !isNaN(left) && !isNaN(top)){
									this.__divElement__.attr("style", "position:absolute; left:" + left + "; top:"+top +";" );
								}	
                                return this;	//Method chaining support
							},	
                            
                        /** setWidth(width)
                            Sets the width of the chart bounding box.
                            
                            @method setWidth
                            @chainable
                            @param {Number} width   [Mandatory]
                                                    The new width of the chart;<br>
                                                    Only positive integers and values that can be converted
                                                    to positive Integers are accepted.
                            @return {Object}    This chart object, to allow for method chaining.
                            @throws {Illegal Argument Exception} if the argument is not valid (see above). 
                        */                          
			setWidth: 	function(width){
							width = parseInt(width, 10);
							if (this.__svgElement__ && !isNaN(width) && width >= 0){
								this.__svgElement__.attr("width", width);
                                this.__divElement__.attr("width", width);
							}else{
                                throw "Illegal Argument: width";
                            }
							return this;	//Method chaining support
						},	
                        
                        /** setHeight(height)
                            Sets the height of the chart bounding box.
                            
                            @method setHeight
                            @chainable
                            @param {Number} height  [Mandatory]
                                                    The new height of the chart; <br>
                                                    Only positive Integers and values that can be converted
                                                    to positive integers are accepted.
                            @return {Object}    This chart object, to allow for method chaining.
                            @throws <ul>
                                        <li> Illegal Argument Exception, if the argument is not valid (see above). </li>
                                    </ul>    
                        */                             
			setHeight: function(height){
							height = parseInt(height, 10);
							if (this.__svgElement__ && !isNaN(height) && height >= 0){
								this.__svgElement__.attr("height", height);
							}else{
                                throw "Illegal Argument: height";
                            }
							return this;	//Method chaining support
						},	

                        /** setTitle(title [, size, color, left, top])
                            Sets the title for the chart, including all its attributes.
                            
                            @method setTitle
                            @chainable
                            @param {String} title  [Mandatory]
                                                    The new title for the chart;
                            @param {Number} [size=DEFAULT TITLE SIZE]  [Optional]
                                                    The size of the new title;<br>
                                                    Only positive Integers and values that can be converted
                                                    to positive integers are accepted.                                                    
                            @param {String} [color=black]  [Optional]
                                                    The color of the new title;<br>
                            @param {Number} [left=centered]  [Optional]
                                                    The horizontal position of the title, relative to the chart; 
                                                    the text will be centered around this point<br>
                                                    Only positive Integers and values that can be converted
                                                    to positive integers are accepted.  
                            @param {Number} [top=0]  [Optional]
                                                    The vertical position of the title, relative to the chart;<br>
                                                    Only positive Integers and values that can be converted
                                                    to positive integers are accepted.                                                   
                            @return {Object}    This legend object, to allow for method chaining.
                            @throws <ul>
                                        <li> Illegal Argument Exception, if the argument is not valid (see above). </li>
                                    </ul>    
                        */                          
            setTitle:   function(title, size, color, left, top){    
                            var titleElement = this.__svgElement__.selectAll("text[type=title_element]");
                            
                            size = parseInt(size, 10);
                            if (!Object.isNumber(size)){
                                size = DEFAULT_TITLE_SIZE;
                            }
                            
                            left = parseInt(left, 10);
                            if (!Object.isNumber(left)){
                                left = this.__svgElement__.attr("width") / 2;
                            } 
                            
                            top = parseInt(top, 10);
                            if (!Object.isNumber(top)){
                                top = size;
                            }                             
                            
                            if (titleElement.empty()){
                                titleElement = this.__svgElement__.append("text")
                                                                  .attr("type", "title_element")
                                                                  .attr("text-anchor", "middle")
                                                                  .attr("font-family", "sans-serif");
                                                                  
                                                                  
                            }
                            titleElement.text(title)
                                        .attr("font-size", size)
                                        .attr("x", left)
                                        .attr("y", top)
                                        .attr("fill", color);
                            return this;	//Method chaining support            
                        },
                        
						/** addLegend:  function(labels, width, height [, left, top, parent])
                            
                            Insert new data into the chart, at runtime;
                            @method addLegend
                            @chainable
                            @param {Array} labels [Mandatory]
                                            An array containing exactly one label for each component of the data space.<br>
                                            A new legend object will be created and attached to the chart, and then
                                            for every subcomponent [label] a new item will be added to the legend.       
                            @return {Object} This chart object, to support method chaining;  
                            @throws 
                                    -   Illegal Argument Exception: if labels isn't an Array object.
                                    -   Invalid array size Exception:   if the number of elements in the array is different
                                                                        from the number of subcomponents of the data space
                                                                        (i.e. from the __dataDim__ attribute)
						  */  
            addLegend:  function(labels, width, height, left, top, parent){
                            if (this.hasOwnProperty("__legend__")){
                                if (!Object.isArray(labels)){
                                    throw "Illegal Argument: labels";
                                }
                                else if (labels.length !== this.__dataDim__){
                                    throw "Invalid array size: " + this.__dataDim__ + " labels needed";
                                }
                                if (this.__legend__ && this.__legend__.destroy){
                                    this.__legend__.destroy();
                                }
                                
                                if (parent === undefined){
                                    parent = this.__parent__;   //By default, they'll have the same parent;
                                }
                                
                                this.__legend__ = LegendFactory(width, height, left, top, parent);
                                
                                for (var i=0; i<labels.length; i++){
                                    this.__legend__.addItem(labels[i], this.getLabelColor(i), this.getFillColor(i));
                                }                                
                            }else{
                                //Looks for object's prototype
                                var proto = this.prototype ? this.prototype : this.__proto__;
                                if (proto && proto.addLegend){
                                    proto.addLegend(labels, width, height, left, top, parent);
                                }                                    
                            }             

                            return this;    //Method chaining supported
                        },  
 
						/** appendData(newDataArray)
                            Insert new data into the chart, at runtime;
                            
                            @method appendData
                            @chainable
                            @param {Array} newDataArray [Mandatory]
                                                    An array containing the next values that needs to be drawn in the chart;<br>
                                                    Each array element, in order to be added to the chart, must be compliant
                                                    with the data format defined by the function __formatData__ (which 
                                                    can itself be set at runtime, and by default accepts arrays of 
                                                    __dataDim__ integers, neglecting to render the negative ones).
                                                    
                            @return {Object} This chart object, to support method chaining;  
                            @throws 
                                    -   Illegal Argument Exception: if newDataArray isn't an Array object.
						  */                         
			appendData: function(newDataArray){
							/*for (var key in newData){
								this.data[key] = newData[key];
							}*/
                            
                            //Save the number to use it during drawing (for scaling)
                            var oldDataLength = Math.max(this.__dataDim__, this.__getDatasetLength__() * this.__dataDim__);
                    
                            //Checks how much data can be appended, and if any action is needed to do so
                            newDataArray = this.__canAppendData__(newDataArray);
                            
							var i, j, val;
							if (Object.isArray(newDataArray)){
								var n = newDataArray.length;
								for (i=0; i < n; i++){
									val = this.__formatValue__(newDataArray[i]);
									if (val !== null){
                                        for (j=0; j < this.__dataDim__; j++){
                                            this.__data__[j].push(val[j]);
                                            if (val[j] > this.__maxVals__[j]){
                                                this.__maxVals__[j] = val[j];
                                            }
                                        }
									}
								}	
							}else{
                                throw "Illegal Argument: newDataArray must be an Array";
                            }
	//						console.log(this.__data__);
                            
                            
                            var newDataLength = this.__getDatasetLength__() * this.__dataDim__;
                            
                            //The max is recomputed every time to retain the ability to switch on the fly between scaling locally and globally
                            var max_val;
                            
                            if (this.__scaleGlobally__){
                                max_val = ChartUtils.fillArray(this.__maxVals__.max(), this.__dataDim__);
                            }else{
                                max_val = this.__maxVals__;    //Values aren't going to be modified, so we can just copy the reference
                            }
                            
                            for (j = 0; j < this.__dataDim__; j++){  
                                //Set the old X scale until the new data is added
                                this.__xScale__.domain([0, oldDataLength]);
                                var dataSet = this.__selectData__(this.__data__, j);
                                
                                var labelsSet = this.__selectLabels__(this.__data__, j);
                                
                                this.__drawNewData__(dataSet, labelsSet, j, this.__xScale__, this.__yScale__[j]);
                                //Computes the new X and Y scale
                                this.__xScale__.domain([0, newDataLength]);
                                
                                this.__yScale__[j].domain([0, 	max_val[j]]);
                                this.__updateDrawing__(dataSet, labelsSet, j, this.__xScale__, this.__yScale__[j]);
                            }
							
							return this;	//Method chaining oriented
						},
                        
                        /** setFormatValueFunction(formaValueFunction)
                            
                            Change the data formatting function, allowing to pass a custom handler
                            to cope with JSON or other data formats.
                            
                            @method setFormatValueFunction
                            @chainable
                            @param {Function} formaValueFunction [Mandatory] 
                                                                 The new data formatting/parsing function;
                            @return {Object}    This object, to allow for method chaining;
                            @throws     
                                        - Illegal Argument Exception, if the argument passed isn't a valid function.
                          */                        
            setFormatValueFunction: function(formaValueFunction){
                                        if (formaValueFunction === undefined ||
                                            !Object.isFunction(formaValueFunction)){
                                                throw "Illegal Argument: formaValueFunction";
                                            }
                                        Object.defineProperty(this, "__formatValue__", {
                                            value: formaValueFunction,
                                            writable: true,
                                            enumerable: false,
                                            configurable:false
                                        });
                                        return this;    //Method chaining support
                                    },
                        /** clearData(n)
                        
                            Remove all the data, or part of it, from the chart;
                            
                            @method clearData
                            @chainable
                            @param {Number} [n] [Optional, For internal use only] 
                                        The number of elements to remove from the beginning of the data array,
                                        i.e. how many of the oldest values should be removed from the chart;
                            @return {Object}    This object, to allow for method chaining;
                            @throws     Illegal Argument Exception, if n is passed but it isn't valid, i.e. it isn't convertible to a positive int.
                          */
			clearData:	function(n){
                                var i, dataSet, labelsSet;
                                if (n !== undefined){
                                    //Only part of the chart should be cleared
                                    n = parseInt(n, 10);
                                    if (isNaN(n) || n <= 0 || n > this.__getDatasetLength__()){
                                        throw "Illegal Argument: n";
                                    }
                                }else{
                                    //The whole chart must be cleared
                                    n = this.__getDatasetLength__();
                                }    
                                    
                                for (i=0; i < this.__dataDim__; i++){

                                    dataSet = this.__selectData__(this.__data__, i, n);
                                    labelsSet = this.__selectLabels__(this.__data__, i, n);  
                                    this.__clearDrawing__(dataSet, labelsSet);
                                    this.__data__[i].splice(0, n);  //Removes the first n elements
                                    //Recomputes the max values
                                    this.__maxVals__[i] = this.__data__[i].max();
                                } 

                                this.__onClearData__(n);
	
								return this;	//Method chaining oriented
							},
							
                            /** toggleLabels([index, visible])
                                Toggles the visibility of labels in the chart
                            
                                @method toggleLabels
                                @chainable
                                @param {Number} [index=0] [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be affected;
								@param {Boolean} [visible] [Optional]
                                                If specified overwrites toggle behaviour and set
												the visibility to visible.
                                @return {Object}    This chart object, to allow for method chaining
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid.
							  */
			toggleLabels:	function(index, visible){
								if (!index){	//index === undefined || index === null
									index = 0;
								}	
								if (this.__labelsVisible__.length > index){
                                    if (visible !== undefined){
                                        this.__labelsVisible__[index] = visible ? true : false;
                                    }else{
                                        this.__labelsVisible__[index] = ! this.__labelsVisible__;
                                    }                                
								}else{
									throw "Invalid Index";
								}

								return this;	//Method chaining oriented
							},
                                    /** areLabelsVisible([index])
                                        
                                        Checks if labels for the index-th dimension are visible
                                    
                                        @method areLabelsVisible
                                        @param {Number} [index=0]   [Optional]
                                                        For multi-dimensional data spaces, specifies
                                                        which component is going to be affected;
                                        @return {Boolean}    The visibility of the label 
                                        @throws 
                                                    Invalid Index Exception:   if the index specified isn't valid.
                                      */                            
			areLabelsVisible:	function(index){
                                    if (!index){	//index === undefined || index === null
                                        index = 0;
                                    }	
                                    if (this.__labelsVisible__.length > index){
                                        return this.__labelsVisible__[index];                               
                                    }else{
                                        throw "Invalid Index";
                                    }
                                },
                                /** setGlobalScaling()
                                
                                    Sets scaling to global<br>
                                    <br>
                                    When data space has a dimension greater than 1 (i.e. when each data value has more than 1 component)
                                    these charts support either global scaling (relative to the whole dataset)
                                    or local scaling (relative to value of the same component) of each subcomponent.
                                    
                                    @method setGlobalScaling
                                    @chainable
                                    @return {Object}    This chart object, to allow for method chaining.
                                  */
            setGlobalScaling:   function(){
                                    if (this.hasOwnProperty("__scaleGlobally__")){
                                        this.__scaleGlobally__ = true;
                                    }else{
                                        //Looks for object's prototype
                                        var proto = this.prototype ? this.prototype : this.__proto__;
                                        if (proto && proto.setGlobalScaling){
                                            proto.setGlobalScaling();
                                        }                                    
                                    }  
                                    return this;	//Method chaining oriented
                                },
                                /** setLocalScaling()
                                
                                    Sets scaling to local<br>
                                    <br>
                                    When data space has a dimension greater than 1 (i.e. when each data value has more than 1 component)
                                    these charts support either global scaling (relative to the whole dataset)
                                    or local scaling (relative to value of the same component) of each subcomponent.
                                    @method setLocalScaling
                                    @chainable                                    
                                    @return {Object}    This chart object, to allow for method chaining.
                                  */                                
            setLocalScaling:    function(){
                                    if (this.hasOwnProperty("__scaleGlobally__")){
                                        this.__scaleGlobally__ = false;
                                    }else{
                                        //Looks for object's prototype
                                        var proto = this.prototype ? this.prototype : this.__proto__;
                                        if (proto && proto.setLocalScaling){
                                            proto.setLocalScaling();
                                        }
                                    }    
                                    return this;	//Method chaining oriented
                                },   

                            /** getFillColor([index])
                                
                                Gets the fill color used to draw the index-th component of the data space.
                                
                                @method getFillColor
                                @chainable
                                @param {Number} [index=0]   [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return {String|Object}    The selected fill color.
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid.
							  */                                
			getFillColor:	function(index){
								if (!index){	//index === undefined || index === null
									index = 0;
								}								
								if (this.__fillColors__.length > index){
									return this.__fillColors__[index];
								}else{
									throw "Invalid Index";
								}
							},		
                            /** getStrokeColor([index])
                                
                                Gets the stroke color used to draw the index-th component of the data space.
                                
                                @method getStrokeColor
                                @param {Number} [index=0]   [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return {String}    The selected stroke color.
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid.
							  */                                   
			getStrokeColor:	function(index){
								if (!index){	//index === undefined || index === null
									index = 0;
								}								
								if (this.__strokeColors__.length > index){
									return this.__strokeColors__[index];
								}else{
									throw "Invalid Index";
								}
							},	
                            /** getLabelColor([index])
                                
                                Gets the fill color used for the labels attached to the index-th component of the data space.
                                @method getLabelColor
                                @param {Number} [index=0] [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return {String}    The selected label color.
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid.
							  */                                
			getLabelColor:	function(index){
								if (!index){	//index === undefined || index === null
									index = 0;
								}								
								if (this.__labelColors__.length > index){
									return this.__labelColors__[index];
								}else{
									throw "Invalid Index";
								}
							},
                            /** getLabelsSize([index])
                                
                                Gets the size used for the labels attached to the index-th component of the data space.
                                
                                @method getLabelsSize
                                @param {Number} [index=0] [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return {Number}    The selected size.
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid.
							  */                               
			getLabelsSize:	function(index){
                                    if (!index){	//index === undefined || index === null
                                        index = 0;
                                    }	
                                    if (this.__labelsSize__.length > index){
                                        return this.__labelsSize__[index];                               
                                    }else{
                                        throw "Invalid  Index";
                                    }
                                },   
                            /** setFillColor(color, [index])
                                
                                Sets the fill color used to draw the index-th component of the data space.
                                
                                @method setFillColor
                                @chainable
                                @param {String|Object] color   [Mandatory]
                                                The new fill color for the selected component's;
                                @param {Number} [index=0] [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return {Object}    This chart object, to allow for method chaining.
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid;
							  */                                 
            setFillColor:	function(color, index){
								if (!index){	//index === undefined || index === null
									index = 0;
								}								
								if (this.__fillColors__.length > index){
									this.__fillColors__[index] = color;
								}else{
									throw "Invalid Index";
								}
								
                                if (this.__legend__){   //&& this.__legend__.updateItem 
                                                        //INVARIANT: __legend__ is either null or a valid legend [Since it's an inner class, we avoid defensive programming]
                                    this.__legend__.updateItem(index, undefined, undefined, color);
                                }
								return this;
							},
                            /** setStrokeColor(color, [index])
                                
                                Sets the stroke color used to draw the index-th component of the data space.
                            
                                @method setStrokeColor
                                @chainable
                                @param {String} color   [Mandatory]
                                                The new stroke color for the selected component's;
                                @param {Number} [index=0] [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return {Object}    This chart object, to allow for method chaining.
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid;
							  */                             
			setStrokeColor:	function(color, index){
								if (!index){	//index === undefined || index === null
									index = 0;
								}								
								if (this.__strokeColors__.length > index){
									this.__strokeColors__[index] = color;
								}else{
									throw "Invalid Index";
								}
								
								return this;
							},  
                            /** setLabelColor(color, [index])
                                
                                Sets the fill color used for the labels attached to the index-th component of the data space.
                            
                                @method setLabelColor
                                @chainable
                                @param {String} color   [Mandatory]
                                                The new color for the selected component's labels;
                                @param {Number} [index=0] [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return {Object}    This chart object, to allow for method chaining.
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid;
							  */                               
			setLabelColor:	function(color, index){
								if (!index){	//index === undefined || index === null
									index = 0;
								}								
								if (this.__labelColors__.length > index){
									this.__labelColors__[index] = color;
								}else{
									throw "Invalid Index";
								}
                                
                                if (this.__legend__){   //&& this.__legend__.updateItem 
                                                        //INVARIANT: __legend__ is either null or a valid legend [Since it's an inner class, we avoid defensive programming]
                                    this.__legend__.updateItem(index, undefined, color, undefined);
                                }                                
								
								return this;
							},
                            /** setLabelSize(size, [index])
                                
                                Sets the size used for the labels attached to the index-th component of the data space.
                            
                                @method setLabelSize
                                @chainable
                                @param {Number} size    [Mandatory]
                                                The new size for the selected component's labels;
                                                Must be a positive integer, or a value that can be converted
                                                to a positive integer;
                                @param {Number} [index=0] [Optional]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return {Object}    This chart object, to allow for method chaining.
                                @throws 
                                            - Invalid Index Exception:   if the index specified isn't valid;
                                            - Illegal Argument Exception:   if size isn't valid (see above). 
							  */                            
			setLabelSize:	function(size, index){
                                size = parseInt(size, 10);
                                if (isNaN(size) || size <= 0){
                                    throw "Illegal Argument: size";
                                }
								if (!index){	//index === undefined || index === null
									index = 0;
								}								
								if (this.__labelsSize__.length > index){
									this.__labelsSize__[index] = size;
								}else{
									throw "Invalid Index";
								}
								
								return this;
							} ,
                            /** setBarWidth()
                            
                                Sets the bars width property;
                                For this chart, bar width is computed at runtime according to the number of bars plotted,
                                so this property can't be set.<br>
                                <b>Unless overridden, any call to this method will cause an exception to be thrown</b><br>
                                This method is declared to improve the consistency of the interface.
                                     
                                @method setBarWidth
                                @throws Read only property Exception
                              */
            setBarWidth: 	function(/*barWidth*/){
                                throw "Read only property: barWidth";
                            },
                            /** getBarWidth([xScale])
                                
                                Gets the current bar width for this chart;
                                For this chart, bar width is computed at runtime according to the number of bars plotted;
                            
                                @method getBarWidth
                                @param {Object} [xScale=this.__xScale__]  [Optional]
                                                It is possible to pass a d3 scale object to get the bar width
                                                computed with respect to a different scale metric;<br>
                                                On default, the value is computed with respect to this chart's
                                                current metric.
                                @return {Number}    The value computed for the bar width under current object state.
                                @throws 
                                            - Illegal Argument Exception:   if an invalid xScale object is passed.
							  */                              
            getBarWidth: 	function(xScale){
                                
                                if (xScale === undefined){
                                    xScale = this.__xScale__;
                                }
                                
                                if (!xScale){
                                    throw "Illegal Argument: xScale";
                                }
                                return xScale(1) - xScale(0) - 1;
                            },
                            
                        /** destroy()
                            
                            Object's destructor: helps garbage collector freeing memory, and removes chart DOM elements.<br>
                            <br>
                            <b>WARNING</b>: calling destroy on an object will force any further reference 
                                            to its attributes / methods to throw exceptions.<br>
                            <br>
                            <b>NOTE</b>:   This function should be override by any class inheriting from this chart.<br>
                                           In order to properly work, any overriding destroyer should:
                                            <ol>
                                                <li> Free any array specific to the object on which is called;</li>
                                                <li> Remove any event listener on chart objects;</li>
                                                <li> Call super object's destroy method.</li>
                                            </ol>
                            @method destroy
                            @return {null} to state that the object has been destroyed.
                          */                        
            destroy: 	function(){
                                //Removes all the data from the chart;
                                this.clearData();
                                
                                //Deletes all the elements from object's arrays
                                this.__data__.length = 0;
                                this.__maxVals__.length = 0;
                                this.__yScale__.length = 0;
                                this.__strokeColors__.length = 0;
                                this.__fillColors__.length = 0;
                                this.__labelColors__.length = 0;
                                this.__labelsSize__.length = 0;
                                this.__labelsVisible__.length = 0;
                                
                                //Removes DOM objects
                                this.__svgElement__.remove();
                                this.__divElement__.remove();
                                
                                //Removes legend, if any
                                if (this.__legend__ && this.__legend__.destroy){
                                    this.__legend__.destroy();
                                }
                                return null;
                            }
                              
                        
		};
        
        //  ---------------------  PROTECTED METHODS    ---------------------------------------
          
         Object.defineProperty(basicBarChartSharedPrototype, "__getDatasetLength__", {
                                /** __getDatasetLength__()  
                                    
                                    Utility function to take account of the number of points currently added to the chart
                                    
                                    @method __getDatasetLength__
                                    @protected
                                    @return {Number}    How many points are stored in the dataset right now.
                                */
                        value: 	function(){
                            //INVARIANT: there will always be at least 1 element in __data__ array [assumed to avoid defensive programming]
                            return this.__data__[0].length;
						},
						writable: false,
						enumerable: false,
						configurable:false
					});	
                    
        Object.defineProperty(basicBarChartSharedPrototype, "__canAppendData__", {
                                /** __canAppendData__(newDataArray)  
                                 
                                    Checks that new data can be added to the chart (if the chart can represent only a limited number of points);<br>
                                    <br>
                                    <b>WARNING</b>: This function SHOULD be overriden in any class inheriting from the base class
                                    in order to handle differents needs
                                    
                                    @method __canAppendData__
                                    @protected

                                    @param {Array} newDataArray    [Mandatory]
                                                            The array of values that should be added;
                                    @return {Array}    The array of values that can still be added to the chart;<br>
                                                       If no other value can be added, return the empty list.                                              
                                */
                        value: 	function(newDataArray){
                            if (!Object.isArray(newDataArray)){
                                return [];
                            }
                            //else, if the bar width still has a valid value, returns the input value, otherwise the empty list
                            return this.__getDatasetLength__() === 0 || this.getBarWidth(this.__xScale__) > 0 ? newDataArray : [];
						},
						writable: false,
						enumerable: false,
						configurable:false
					});	   
                    
        Object.defineProperty(basicBarChartSharedPrototype, "__formatValue__", {
                                /** __formatValue__(value)
                                    
                                    Checks that the value passed corresponds to the data format allowed for the current chart;
                                    This function can be overriden in any class inheriting from the base class
                                    in order to handle differents data formats (i.e. Objects or JSON).
                                    
                                    @method __formatValue__
                                    @protected
                                    @param {Array|Object} value   [Mandatory]
                                                                    The value to be tested;
                                    @return {Array} <ul>
                                                        <li>An array with properly formatted values, each of whom 
                                                            converted to float <=> value is correctly validated</li>
                                                        <li>null <-> Otherwise</li>
                                                    </ul>
                                */
                        value: 	function(value){
                            if (Object.isArray(value)){
                                if (value.length !== this.__dataDim__){
                                    //Invalid data;
                                    return null;
                                }
                                for (var i=0; i < this.__dataDim__; i++){
                                    if (!Object.isNumber(value[i])){
                                        return null;
                                    }
                                }
                                //At this point we can assume the value is valid
                                return value.map(parseFloat);
                            }else if (Object.isNumber(value) && this.__dataDim__ === 1){
                                return [parseFloat(value)];
                            }else{
                                //Invalid value
                                return null;
                            }
						},
						writable: false,
						enumerable: false,
						configurable:false
					});	
               
		Object.defineProperty(basicBarChartSharedPrototype, "__selectData__", {
                                /** __selectData__(data, index [, n])
                                
                                    Returns the list of the svg elements used to represent data subcomponents
                                    with the required index.<br>
                                    I.e.:   if data space is 3-dimensional (i.e. every point has 3 components)
                                            __selectData__(data, 2) would select the svg elements representing
                                            the 2nd component of every point in data
                                            
                                    @method __selectData__
                                    @protected
                                    
                                    @param {Array} data [Mandatory]
                                                        The dataset on which selection should be applied
                                    @param {Number} index   [Mandatory]
                                                    The index of the required component<br>
                                                    <b>INVARIANT</b>:  to avoid defensive programming,
                                                                        it is assumed 0 <= index < this.__dataDim__
                                    @param {Number} [n] [Optional]
                                                    The maximum number of elements to return;
                                    @return {Object} The proper set of d3 elements.                    
                                  */
						value: 	function(data, index, n){
                                    if (n === undefined){
                                        return this.__svgElement__.selectAll("rect[index=data_"+index+"]").data(data[index]);
                                    }else{
                                        return this.__svgElement__.selectAll("rect[index=data_"+index+"]").data(data[index].slice(0, n));
                                    }
                                },
						writable: false,
						enumerable: false,
						configurable:false
					});
                    
		Object.defineProperty(basicBarChartSharedPrototype, "__selectLabels__", {
                                /** __selectLabels__(data, index [, n])
                                  
                                    Returns the list of the svg elements used to draw the labels of
                                    subcomponents of data with the required index.<br>
                                    I.e.:   if data space is 3-dimensional (i.e. every point has 3 components)
                                            __selectLabels__(data, 3) would select the svg elements representing
                                            the labels of the 3nd component of every point in data  
                                    
                                    @method __selectLabels__
                                    @protected
                                    

                                    @param {Array} data [Mandatory]
                                                    The dataset on which selection should be applied;
                                    @param {Number} index   [Mandatory]
                                                    The index of the required component;<br>
                                                    <b>INVARIANT</b>:  to avoid defensive programming,
                                                                        it is assumed 0 <= index < this.__dataDim__
                                    @param {Number} [n] [Optional]
                                                    The maximum number of elements to return;
                                    @return {Object}    The proper set of d3 elements.                    
                                  */      
						value: 	function(data, index, n){
                                    if (n === undefined){
                                        return this.__svgElement__.selectAll("text[index=data_"+index+"]").data(data[index]);
                                    }else{
                                        return this.__svgElement__.selectAll("text[index=data_"+index+"]").data(data[index].slice(0, n));
                                    }
                                },
						writable: false,
						enumerable: false,
						configurable:false
					});

                    
		Object.defineProperty(basicBarChartSharedPrototype, "__drawNewData__", {
                                /** __drawNewData__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                    
                                    Called by appendData() to draw the newly added points in dataSet, once for
                                    every data subcomponent.<br>
                                    <br>
                                    <b>WARNING</b>:    if you inherit from this class you might want to override both
                                                this method and __updateDrawing__ in order to obtain a custom chart.

                                                
                                    
                                    @method __drawNewData__
                                    @protected
                                    @param {Object} dataSet [Mandatory]
                                                    The set of svg elements created so far to represent the data;<br>
                                                    <b>WARNING</b>: this parameter should be generated by an appropriate
                                                                    call to __selectData__;
                                    @param {Object} labelsSet [Mandatory]
                                                        The set of svg elements created so far to represent the labels of the data;<br>
                                                        <b>WARNING</b>: this parameter should be generated by an appropriate
                                                                        call to __selectLabels__; 
                                    @param {Number} dataIndex   [Mandatory]
                                                                The index of the component of the data which is to be drawn;
                                    @param {Object} xScale  [Mandatory]
                                                    D3 scale object for X axis;
                                    @param {Object} yScale  [Mandatory]
                                                    D3 scale object for Y axis (specific to current component);
                                    @return {undefined}
                                  */
						value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
									var that = this;
									var height = parseInt(this.__svgElement__.attr("height"), 10);
									var barWidth =  this.getBarWidth(xScale);
                                    
									dataSet.enter().append("rect").attr("index", "data_" + dataIndex)
										.attr("x", function(d, i){return xScale(i * that.__dataDim__ + dataIndex);})
										.attr("y", height)	
										.attr("width", barWidth)
										.attr("height", 0)	
										.attr("fill", that.getFillColor(dataIndex))
                                        .attr("stroke", that.getStrokeColor(dataIndex))
										.attr("opacity", function(d){return that.__getBarOpacity__((0.0 + yScale(d)) / height);});
										
									
									if (that.areLabelsVisible(dataIndex)){
										labelsSet.enter().append("text").attr("index", "data_" + dataIndex)
											.text(function(d) {return d;})
											.attr("text-anchor", "middle")
											.attr("x", function(d, i){return xScale(i * that.__dataDim__ + dataIndex) + barWidth / 2;})
											.attr("y", height)
											.attr("font-family", "sans-serif")
											.attr("font-size", that.getLabelsSize(dataIndex))
											.attr("fill", that.getLabelColor(dataIndex))
                                            .attr("opacity", function(){  //Show the label only if it fits the bar
                                                                if (this.getComputedTextLength() <= barWidth){
                                                                    return 1;
                                                                }else{
                                                                    return 0;
                                                                }
                                                            });
									}else{
										labelsSet.remove();
									}
										
									return;     //(Pseudo)Private method, no need to return this
								},
						writable: false,
						enumerable: false,
						configurable:false
					});
                    
		Object.defineProperty(basicBarChartSharedPrototype, "__updateDrawing__", {
                                /** __updateDrawing__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                    
                                    Called by appendData() to update drawing of the points in dataSet, once for
                                    every data subcomponent.<br>
                                    After new data is inserted by __drawNewData__, appendData performs adjustments
                                    to accomodate for scale change or shift in the drawing due to time, and this
                                    function takes care of updating and fixing the chart representation.<br>
                                    <br>
                                    <b>WARNING</b>:    if you inherit from this class you might want to override both
                                                        this method and __drawNewData__ in order to obtain a custom chart.                                    
                                    @method __updateDrawing__
                                    @protected
                                    @param {Object} dataSet [Mandatory]
                                                    The set of svg elements created so far to represent the data;<br>
                                                    <b>WARNING</b>: this parameter should be generated by an appropriate
                                                                    call to __selectData__;
                                    @param {Object} labelsSet   [Mandatory]
                                                        The set of svg elements created so far to represent the labels of the data;<br>
                                                        <b>WARNING</b>:    this parameter should be generated by an appropriate
                                                                            call to __selectLabels__;    
                                    @param {Number} dataIndex   [Mandatory]
                                                        The index of the component of the data which is to be drawn;
                                    @param {Object} xScale  [Mandatory]
                                                            D3 scale object for X axis;
                                    @param {Object} yScale  [Mandatory]
                                                            D3 scale object for Y axis (specific to current component).
                                    @return {undefined}
                                  */					
                        value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                    var that = this;
                                    var height = parseInt(this.__svgElement__.attr("height"), 10);
                                    var barWidth = this.getBarWidth(xScale);							
                                    dataSet.transition()//.delay(250)
                                            .attr("x", function(d, i){return xScale(i * that.__dataDim__ + dataIndex);})
                                            .attr("y", function(d){return height - yScale(d);})
                                            .attr("width", barWidth)
                                            .attr("height", function(d){return yScale(d);})
                                            .attr("opacity", function(d){return that.__getBarOpacity__((0.0 + yScale(d)) / height);});									
                                    if (that.areLabelsVisible(dataIndex)){
                                        labelsSet.transition()//.delay(250)
                                                .text(function(d) {return d;})
                                                .attr("x", function(d, i){return xScale(i * that.__dataDim__ + dataIndex) + barWidth / 2;})
                                                .attr("y", function(d){return height - yScale(d) + 15 ;})
                                                .attr("opacity", function(){ //Show the label only if it fits the bar
                                                                    if (this.getComputedTextLength() <= barWidth){
                                                                        return 1;
                                                                    }else{
                                                                        return 0;
                                                                    }
                                                                });                                                
                                                
                                    }else{
                                        labelsSet.remove();
                                    }						
                                    return;     //(Pseudo)Private method, no need to return this
                                },
						writable: false,
						enumerable: false,
						configurable:false
					});				
                    
			Object.defineProperty(basicBarChartSharedPrototype, "__onClearData__", {
            
                                /** __onClearData__(n)
                                    
                                    Takes care of the remaining details related to the removal of part of the values from the chart,
                                    based on to the particular chart needs.<br>
                                    <br>
                                    <b>WARNING</b>:    Inherited objects MIGHT NEED to override this function.
                                    
                                    @method __onClearData__
                                    @protected
                                    @param {Number} [n]   [Mandatory]
                                                          Must be a positive Integer, or a value that
                                                          can be converted to a positive Integer;
                                                          Number of elements removed from the chart
                                    @return {undefined}
                                  */
                        value:	function(n){
                                    //Do nothing: for this object no special action required (but it's required to be in the class interface)
                                    return;     //(Pseudo)Private method, no need to return this
                                },
						writable: false,
						enumerable: false,
						configurable:false
					});		
                    
			Object.defineProperty(basicBarChartSharedPrototype, "__clearDrawing__", {            
                                /** __clearDrawing__(dataSet, labelsSet)
                                    
                                    Removes the svg objects related to the data cleared by the caller (clearData).
                                    
                                    @method __clearDrawing__
                                    @protected

                                    
                                    @param {Object} dataSet [Mandatory]
                                                            List of drawing objects (default: rects) representing data
                                    @param {Object} labelsSet   [Mandatory]
                                                                List of labels related to data removed
                                    @return {undefined}
                                  */
                        value:	function(dataSet, labelsSet){
                                    dataSet.remove();
                                    labelsSet.remove();	
                                    return;     //(Pseudo)Private method, no need to return this
                                },
						writable: false,
						enumerable: false,
						configurable:false
					});	   

                    
			Object.defineProperty(basicBarChartSharedPrototype, "__getBarOpacity__", {
                            /** __getBarOpacity__(val)
                                
                                 Computes and return the suggested value for the opacity of the bar
                                drawn to represent a certain value.
                                      
                                @method __getBarOpacity__
                                @protected
                                @param {Number} val [Mandatory]
                                            The value to be represented;<br>
                                            Accepts only normalized values (scaled between 0 and 1).<br>
                                            <b>INVARIANT</b>:  to avoid defensive programming,
                                                                it is assumed 0 <= val <=1                               
                                @return {Number}    The opacity to apply to the value representation in the chart.
                              */            
					value:	function(val){
								return 0.25 + val * 0.75;
							},
						writable: false,
						enumerable: false,
						configurable:false
					});	
                    
		Object.freeze(basicBarChartSharedPrototype);

        /** BasicBarChart(width, height [, dataDim, parent])
 
            @method BasicBarChart
            @chainable
            
            @param {Number} width [Mandatory]
                            The desired width for the chart (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} height [Mandatory]
                            The desired height for the chart (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} [dataDim=1] [Optional]
                            The dimension of the data space, i.e. the number of subvalues for each data entry<br>
                            Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
            @param {Object} [parent=body] [Optional]
                            The DOM element to which the diagram should be appended as a child
            @return {Object}    A new BasicBarChart object
            @throws
                                -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                -   Illegal Argument exception , if width or height aren't valid (numeric, positive) values 
                                    (through setWidth or setHeight)
                                -   Illegal Argument exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                -   Exception, if dataDim exceeds the maximum data dimension
                                -   Exception, if parent is passed but it is not a valid DOM element
          */
        function BasicBarChart(width, height, dataDim, parent){
                   

            /** __initChart__(width, height)
                
                Inits the chart DIV and SVG container, setting width and height, if they are passed as arguments;
                
                @method __initChart__
                @private
                
                @param chart:   [Mandatory]
                                The chart object that needs initialization;
                @param width:   [Optional]
                                The desired width for the chart;
                                If passed, MUST be a positive integer, or a value that
                                can be converted to a positive integer
                @param height:   [Optional]
                                The desired height for the chart;
                                If passed, MUST be a positive integer, or a value that
                                can be converted to a positive intege
                @return:    Nothing;
                @throws     
                            - Inconsitent Chart State Exception, if the internale state of the object is compromised;
                            - Illegal Argument Exception, through setWidth or setHeight, if one of the arguments is
                                not valid.
            */
            function __initChart__(chart, width, height){
                if (!chart.__svgElement__ || !chart.__divElement__){
                    throw "Inconsitent Chart State: null";
                }
                //else
                if (width !== undefined){
                    chart.setWidth(width);
                }
                if (height !== undefined){
                    chart.setHeight(height);
                }										
                return;     //(Pseudo)private method, no need to retun anything
            }  
            
            /** __initData__(basicCharObj [, dataDim])
                
                Performs all the settings related to the data handling area of the chart;
                
                @method __initData__
                @private
                @param {Object} basicCharObj [Mandatory]
                                             The chart object to init;
                @param {Number} [dataDim=1] [Optional]
                                The dimension of the data space, i.e. the number of subvalues
                                for each data entry;<br>
                                Can take any value that is or can be converted to an integer 
                                between 1 and MAX_SPACE_DIMENSION.
                @return {undefined}   
                @throws
                                    -   Illegal Argument exception, if dataDim is passed but it's 
                                        not valid (not numeric or not positive)
                                    -   Exception, if dataDim exceeds the maximum data dimension                             
               */
            function __initData__(basicCharObj, dataDim){
                if (dataDim === undefined){
                    dataDim = 1;   //1 by default
                }else{
                    dataDim = parseInt(dataDim, 10);
                    if (isNaN(dataDim) || dataDim <= 0){
                        throw "Illegal Argument: dataDim";
                    }else if (dataDim > MAX_SPACE_DIMENSION){
                        throw "Max number of subvalues for each point (" + MAX_SPACE_DIMENSION + ") exceeded";
                    }
                }            
                  
                                                     /** 
                                                         Dimension of the data space, 
                                                         i.e. number of subcomponents of each data "point"
                                                         @property __dataDim__
                                                         @type {Number}
                                                         @readOnly
                                                         @protected                                                         
                                                       */
                Object.defineProperty(basicBarChart, "__dataDim__", {
                                        value: dataDim,
                                        writable: false,
                                        enumerable: false,
                                        configurable: false
                                    });   
                                            
                                                    /** 
                                                        The array that will hold data, separately for each component
                                                        Initially every component's array is set to []
                                                         @property __data__
                                                         @type {Array}
                                                         @readOnly
                                                         @protected                                                          
                                                      */
                Object.defineProperty(basicBarChart, "__data__", {
                                        value: ChartUtils.fillArray(function(){return [];}, basicBarChart.__dataDim__),
                                        writable: false,
                                        enumerable: false,
                                        configurable: false
                                    });
                                                     /** 
                                                         Array of maximum values for each component
                                                         (used to compute the vertical scale)<br>
                                                         @property __maxVals__
                                                         @type {Number}
                                                         @readOnly
                                                         @protected                                                           
                                                         @default [0]*
                                                       */
                Object.defineProperty(basicBarChart, "__maxVals__", {
                                        value: ChartUtils.fillArray(0, basicBarChart.__dataDim__),
                                        writable: false,
                                        enumerable: false,
                                        configurable: false
                                    });      
                
                return;     //Private method, no need to return anything
            }
        

            if (width === undefined  || height === undefined){
                throw "Wrong number of arguments: width and height are mandatory";
            }
            if (parent === undefined){	//By default, added to page's body
                parent = d3.select("body");
            }
            
            
            
            var div = parent.append("div");
            var svg = div.append("svg").attr("id", "dynamic_chart_" + next_id); //NOTE: ++next_id needed after this
            next_id += 1;
            
            var basicBarChart = Object.create(basicBarChartSharedPrototype);
            
            __initData__(basicBarChart, dataDim);
            
            var __xScale__ = d3.scale.linear().range([0, width]);
            var __yScaleGenerator__ = function(){return d3.scale.linear().range([0, height]);};    

                                                /** 
                                                    The parent object to whom the chart is added
                                                    @property __parent__
                                                    @type {Object}
                                                    @readOnly
                                                    @protected
                                                  */
            Object.defineProperty(basicBarChart, "__parent__", {
                                    value: parent,
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });
            
                                                /**
                                                    The div element that will be a container to the chart's svg element
                                                    @property __divElement__
                                                    @type {Object}
                                                    @readOnly
                                                    @protected                                                    
                                                  */
            Object.defineProperty(basicBarChart, "__divElement__", {
                                    value: div,
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });
                                
                                                /**
                                                    The chart's svg element
                                                    @property __svgElement__
                                                    @type {Object}
                                                    @readOnly
                                                    @protected                                                      
                                                  */                                    
            Object.defineProperty(basicBarChart, "__svgElement__", {
                                    value: svg,
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });

                                                /**
                                                    Scale object for the horizontal axis of the chart 
                                                    (common to all data subcomponents)
                                                    @property __xScale__
                                                    @type {Object}
                                                    @readOnly
                                                    @protected                                                      
                                                  */                                    
            Object.defineProperty(basicBarChart, "__xScale__", {
                                    value: __xScale__,
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	

                                                /**
                                                    Scale objects for the vertical axis of the chart 
                                                    (array with one obj for each data subcomponents,
                                                     so that each component can be scaled independently)
                                                    @property __yScale__
                                                    @type {Array}
                                                    @readOnly
                                                    @protected
                                                  */                                       
            Object.defineProperty(basicBarChart, "__yScale__", {
                                    value: ChartUtils.fillArray(__yScaleGenerator__, basicBarChart.__dataDim__),
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });
                                                 /**
                                                    For data space with dimension gt 1, states
                                                    if the different components should scale locally or globally
                                                    @property __scaleGlobally__
                                                    @type {Boolean}
                                                    @protected
                                                    @default true
                                                   */
            Object.defineProperty(basicBarChart, "__scaleGlobally__", {
                                    value: true,  //By default, scales globally
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                }); 

                                                 /**
                                                    For each data subcomponent, stores the size to be used
                                                    for its label
                                                    @property __labelsSize__
                                                    @type {Number}
                                                    @readOnly
                                                    @protected
                                                    @default DEFAULT_LABEL_SIZE
                                                  */   
            Object.defineProperty(basicBarChart, "__labelsSize__", {
                                    value: ChartUtils.fillArray(DEFAULT_LABEL_SIZE, basicBarChart.__dataDim__),
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });		
                                                 /**
                                                    For each data subcomponent, states whether or not
                                                    its label is visible
                                                    @property __labelsVisible__
                                                    @type {Array}
                                                    @readOnly
                                                    @protected
                                                    @default [true]*
                                                  */                                      
            Object.defineProperty(basicBarChart, "__labelsVisible__", {
                                    value: ChartUtils.fillArray(true, basicBarChart.__dataDim__),    //All labels visible by default
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	
                                
                                                 /**
                                                    For each data subcomponent, stores the color to be used
                                                    to fill its drawing component
                                                    @property __labelsVisible__
                                                    @type {Array}
                                                    @readOnly
                                                    @protected
                                                  */                                      
            Object.defineProperty(basicBarChart, "__fillColors__", {
                                    value: FILL_COLORS.shallowCopy(basicBarChart.__dataDim__),  //Default values
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });

                                                 /**
                                                    For each data subcomponent, stores the color to be used
                                                    for the stroke of its drawing component
                                                    @property __strokeColors__
                                                    @type {Array}
                                                    @readOnly
                                                    @protected
                                                    @default ["black"]*
                                                  */                                       
            Object.defineProperty(basicBarChart, "__strokeColors__", {
                                    value: ChartUtils.fillArray("black", basicBarChart.__dataDim__),  //Default values: black
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	
                                                 /**
                                                    For each data subcomponent, stores the color to be used
                                                    to draw its labels
                                                    @property __labelColors__
                                                    @type {Array}
                                                    @readOnly
                                                    @protected
                                                    @default ["black"]*                                                    
                                                  */                                       
            Object.defineProperty(basicBarChart, "__labelColors__", {
                                    value: ChartUtils.fillArray("black", basicBarChart.__dataDim__),  //Default values: black
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	  

                                                 /**
                                                    Placeholder for a possible legend object, if the consumer
                                                    decides to add a legend to the chart;
                                                    @property __legend__
                                                    @type {Object}
                                                    @protected
                                                    @default null
                                                  */                                       
            Object.defineProperty(basicBarChart, "__legend__", {
                                    value: null,  //Default value: none
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });	  

            
            __initChart__(basicBarChart, width, height);
            Object.seal(basicBarChart);

            return basicBarChart;
        }
        
        /** 
            Advanced Chart: <b>FixedWidthBarChart</b><br>
            Inherits from BasicBarChart redefining the drawing methods.<br>
            As for its super class values are represented using vertical bars, and each point 
            can have up to 10 subcomponents, where each component can be any non-negative 
            real number (i.e., each point can be in R_+^i, for 1 <= i <= 10).<br>
            <br>
            For this chart the bar width is fixed (although can be set at run time)
            It is possible to choose between having only a fixed number of values accepted,
            or if a certain number of the oldest values should be removed when the
            chart is full.
            
            @class FixedWidthBarChart
            @private
            @extends BasicBarChart
          */
        /** FixedWidthBarChart(ticks, startingPoint, width, height [, dataDim, parent])
            
            FixedWidthBarChart (pseudo)Constructor
            
            @method FixedWidthBarChart
            @param {Number} ticks [Mandatory]
                            The number of values that can be drawn at the same time (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} startingPoint [Mandatory, but not used at the moment: inserted for future back-compatibility]<br>
                            The reference for the label of the first point.<br>
                            Should be an incrementable value;
            @param {Number} width [Mandatory]
                            The desired width for the chart (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} height [Mandatory]
                            The desired height for the chart (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} [dataDim=1] [Optional]
                            The dimension of the data space, i.e. the number of subvalues for each data entry<br>
                            Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
            @param {Object} [parent=body] [Optional]
                            The DOM element to which the diagram should be appended as a child
            @return:    A new FixedWidthBarChart object
            @throws
                                -   Illegal Argument Exception, if ticks isn't a positive integer
                                -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                -   Illegal Argument Exception, if width or height aren't valid (numeric, positive) values 
                                    (through setWidth or setHeight)
                                -   Illegal Argument Exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                -   Exception, if dataDim exceeds the maximum data dimension
                                -   Exception, if the ratio between chart's width and number of ticks is such
                                    that the computed bar height is smaller than 1 pixel
                                -   Exception, if parent is passed but it is not a valid DOM element
          */                
        function FixedWidthBarChart(ticks, startingPoint, width, height, dataDim, parent){
   
            ticks = parseInt(ticks, 10);
            if (isNaN(ticks) || ticks <= 0){
                throw "Illegal Argument: ticks";
            }
            
            var proto = BasicBarChart(width, height, dataDim, parent);
            var fixedWidthBarChart = Object.create(proto);   
              

                                                /** 
                                                    Number of different values that can be 
                                                    drawn at the same time in this chart
                                                    @property __ticks__
                                                    @type {Number}
                                                    @readOnly
                                                    @protected                                                  
                                                  */
            Object.defineProperty(fixedWidthBarChart, "__ticks__", {
                                    value: ticks,
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });
                                                    /** 
                                                        Tick length, in minutes
                                                        @property __tickLength__
                                                        @type {Number}
                                                        @protected
                                                        @default 1                                                          
                                                      */
            Object.defineProperty(fixedWidthBarChart, "__tickLength__", {
                                    value: 1,
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });	
                                                
                                                    /** 
                                                        When __ticks__ data points have already been plotted,
                                                        new plots would override previous ones.
                                                        Two solutions are made available:
                                                        1)  By default, new data is rejected, generating a full stack exception;
                                                        2)  A certain number of the oldest data points can be purged off the chart,
                                                            counter-clockwise rotating the data.
                                                            
                                                        @property __ticksToRemoveOnFullQueue__
                                                        @type {Number}
                                                        @protected
                                                        @default 0  
                                                      */
            Object.defineProperty(fixedWidthBarChart, "__ticksToRemoveOnFullQueue__", {
                                    value: 0,           //By default, no previous data is cleared: new data is simply rejected
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });	   
                                

            Object.defineProperty(fixedWidthBarChart, "setFixedDataLengthMode", {
                                            /** setFixedDataLengthMode()
                                            
                                                Sets fixed data length mode.<br>
                                                <br>
                                                When __ticks__ data points have already been plotted,
                                                new plots would override previous ones.<br>
                                                Two solutions are made available:
                                                <ol>
                                                    <li>  By default, new data is rejected, generating a full stack exception;</li>
                                                    <li>  A certain number of the oldest data points can be purged off the chart,
                                                        counter-clockwise rotating the data;</li>
                                                </ol>
                                                <br>    
                                                This function sets the first option.
                                                
                                                @method setFixedDataLengthMode
                                                @chainable
                                                @return {Object}    This chart object, to allow for methd chaining.
                                              */                
                                    value:  function(){                                        
                                                if (this.hasOwnProperty("__ticksToRemoveOnFullQueue__")){
                                                    this.__ticksToRemoveOnFullQueue__ = 0;
                                                }else{
                                                    //Looks for object's prototype
                                                    var proto = this.prototype ? this.prototype : this.__proto__;
                                                    if (proto && proto.setFixedDataLengthMode){
                                                        proto.setFixedDataLengthMode();
                                                    }
                                                }                                         
                                                return this;	//Method chaining oriented
                                            },           //No previous data is cleared: new data is simply rejected
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	                                      
                                

            Object.defineProperty(fixedWidthBarChart, "setShifitingDataMode", {
                                            /** setShifitingDataMode(ticksToRemove)
                                            
                                                Sets data shift mode.<br>
                                                <br>
                                                When __ticks__ data points have already been plotted,
                                                new plots would override previous ones.<br>
                                                Two solutions are made available:
                                                <ol>
                                                    <li>  By default, new data is rejected, generating a full stack exception;</li>
                                                    <li>  A certain number of the oldest data points can be purged off the chart,
                                                        counter-clockwise rotating the data;</li>
                                                </ol>
                                                <br>
                                                This function sets the second option.
                                                
                                                @method setShifitingDataMode
                                                @chainable
                                                @param {Number} ticksToRemove [Mandatory]
                                                                              How much data to remove on full chart;
                                                @return {Object}    This object, to allow for method chaining;
                                                @throws     Illegal Argument Exception, if the argument isn't valid (see above).
                                              */
                                    value:  function(ticksToRemove){
                                                ticksToRemove = parseInt(ticksToRemove, 10);
                                                if (isNaN(ticksToRemove) || ticksToRemove <= 0){
                                                    throw "Illegal Arguments: ticksToRemove";
                                                }
                                                if (this.hasOwnProperty("__ticksToRemoveOnFullQueue__")){
                                                    this.__ticksToRemoveOnFullQueue__ = ticksToRemove;
                                                }else{
                                                    //Looks for object's prototype
                                                    var proto = this.prototype ? this.prototype : this.__proto__;
                                                    if (proto && proto.setShifitingDataMode){
                                                        proto.setShifitingDataMode(ticksToRemove);
                                                    }
                                                }                                                      
                                                return this;	//Method chaining oriented
                                            },           //No previous data is cleared: new data is simply rejected
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });                                    

                                    
            Object.defineProperty(fixedWidthBarChart, "getBarWidth", {
                                            /** getBarWidth()
                                                
                                                Returns current bars' width.
                                                The overridden version takes a parameter, but this method
                                                doesn't need it because barWidth is fixed for this chart.
                                                @method getBarWidth
                                                @return {Number} the value set for __barWidth__.
                                                @override  BasicBarChart.getBarWidth
                                              */
                                    value: 	function(){
                                                return this.__barWidth__;   //Stroke tickness is 1 point per side
                                            },   
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });	                              

            Object.defineProperty(fixedWidthBarChart, "__canAppendData__", {
                                        /** __canAppendData__(newDataArray)
                                            
                                            <b>WARNING</b>: This function SHOULD be overriden in any class inheriting from the base class
                                                            in order to handle differents needs.<br>
                                            See base class for method signature and details.
                                             
                                            @method __canAppendData__ 
                                            @protected   
                                            @override  BasicBarChart.__canAppendData__
                                        */
                                value: 	function(newDataArray){
                                    if (!Object.isArray(newDataArray)){
                                        return [];
                                    }
                                    //else, checks if there is room for the new data
                                    var m = this.__getDatasetLength__(), 
                                        n = this.__ticks__ - m;
                                    
                                    if (newDataArray.length <= n){
                                        return newDataArray;
                                    }else if (this.__ticksToRemoveOnFullQueue__ === 0){
                                        if (n <= 0){
                                            //Can't add any more data
                                            return [];
                                        }else{
                                            //Can add at most n elements
                                            return newDataArray.splice(0, n);
                                        }
                                    }else{
                                        //Must delete __ticksToRemoveOnFullQueue__ elements from the data, and then can add the new ones 
                                        m =  Math.min(this.__ticksToRemoveOnFullQueue__, m);                                            
                                        this.clearData(m);
                                        
                                        //Will update as soon as it returns control to the caller (appendData)
                                        
                                        return this.__canAppendData__(newDataArray);  //reiterate the request
                                    }
                                    
                                },
                                writable: false,
                                enumerable: false,
                                configurable:false
                            });	      		

                    Object.defineProperty(fixedWidthBarChart, "__drawNewData__", {
                                        /** __drawNewData__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                            
                                                                                           
                                            <b>WARNING</b>:    if you inherit from this class you might want to override both
                                                               this method and __updateDrawing__ in order to obtain a custom chart.<br>
                                            See base class for method signature and details.

                                            @method __drawNewData__
                                            @protected
                                            @override   BasicBarChart.__drawNewData__
                                          */
                                value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                            var that = this;
                                            var height = parseInt(this.__svgElement__.attr("height"), 10);
                                            var barWidth =  this.getBarWidth(xScale);
                                            
                                            dataSet.enter().append("rect").attr("index", "data_" + dataIndex)
                                                .attr("x", function(d, i){return (i * that.__dataDim__ + dataIndex)*barWidth;})
                                                .attr("y", height)	
                                                .attr("width", barWidth)
                                                .attr("height", 0)	
                                                .attr("fill", that.getFillColor(dataIndex))
                                                .attr("stroke", that.getStrokeColor(dataIndex))
                                                .attr("opacity", function(d){return that.__getBarOpacity__((0.0 + yScale(d)) / height);});
                                                
                                            
                                            if (that.areLabelsVisible(dataIndex) && barWidth > that.getLabelsSize(dataIndex)){
                                                labelsSet.enter().append("text").attr("index", "data_" + dataIndex)
                                                    .text(function(d) {return d;})
                                                    .attr("text-anchor", "middle")
                                                    .attr("x", function(d, i){return (i * that.__dataDim__ + dataIndex + 0.5) * barWidth;})
                                                    .attr("y", height)
                                                    .attr("font-family", "sans-serif")
                                                    .attr("font-size", that.getLabelsSize(dataIndex))
                                                    .attr("fill", that.getLabelColor(dataIndex));	
                                            }else{
                                                labelsSet.remove();
                                            }
                                                
                                            return;     //(Pseudo)Private method, no need to return this
                                        },
                                writable: false,
                                enumerable: false,
                                configurable:false
                            });
                
                Object.defineProperty(fixedWidthBarChart, "__updateDrawing__", {
                                        /** __updateDrawing__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                            
                                            <b>WARNING</b>:    if you inherit from this class you might want to override both
                                                               this method and __drawNewData__ in order to obtain a custom chart.<br>
                                            See base class for method signature and details.
                                             
                                            @method  __updateDrawing__
                                            @protected
                                            @override  BasicBarChart.__updateDrawing__
                                          */					
                                value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                            var that = this;
                                            var height = parseInt(this.__svgElement__.attr("height"), 10);
                                            var barWidth = this.getBarWidth(xScale);							
                                            dataSet.transition()//.delay(250)
                                                    .attr("x", function(d, i){return (i * that.__dataDim__ + dataIndex)*barWidth;})
                                                    .attr("y", function(d){return height - yScale(d);})
                                                    .attr("width", barWidth)
                                                    .attr("height", function(d){return yScale(d);})
                                                    .attr("opacity", function(d){return that.__getBarOpacity__((0.0 + yScale(d)) / height);});									
                                            if (that.areLabelsVisible(dataIndex) && barWidth > that.getLabelsSize(dataIndex)){
                                                labelsSet.transition()//.delay(250)
                                                        .text(function(d) {return d;})
                                                        .attr("x", function(d, i){return (i * that.__dataDim__ + dataIndex + 0.5) * barWidth;})
                                                        .attr("y", function(d){return height - yScale(d) + that.getLabelsSize(dataIndex) ;});
                                                        
                                            }else{
                                                labelsSet.remove();
                                            }						
                                            return;     //(Pseudo)Private method, no need to return this
                                        },
                                writable: false,
                                enumerable: false,
                                configurable:false
                            });	      
                                
            /** __init__()

                Inits the chart by computing the allowed barWidth;
                            
                @method __init__
                @private
                @param {Object} chart   [Mandatory]
                                        The chart object that needs initialization;                   
                @param {Number} width   [Mandatory]
                                        Chart's width;
                @param {Number} height  [Mandatory]
                                        Chart's height;                                                            
                
                @return {undefined}
              */                                    
            function __init__(chart, width, height){
                var barWidth = width / (chart.__dataDim__ * chart.__ticks__);
                if (barWidth <= 0){
                    throw "Illegal Arguments combination: width too small to draw 'ticks' values";
                }
                                            /** 
                                                Chart's bars' width, in pixel <br>
                                                Can be changed at runtime
                                                @property __barWidth__
                                                @type {Number}
                                                @protected
                                                @default 8
                                                @override  FixedWidthBarChart.__barWidth__  
                                              */                                     
                Object.defineProperty(chart, "__barWidth__", {
                                            value: barWidth,
                                            writable: false,
                                            enumerable: false,
                                            configurable: false
                                        });	
                return ;
            }

            __init__(fixedWidthBarChart, width, height);
            Object.seal(fixedWidthBarChart);
            
            return fixedWidthBarChart;
        }

        /** 
            
            Advanced Chart: <b>SlidingBarChart</b><br>
            Inherits from FixedWidthBarChart redefining the drawing methods.<br>
            As for its super class values are represented using vertical bars, and each point 
            can have up to 10 subcomponents, where each component can be any non-negative 
            real number (i.e., each point can be in R_+^i, for 1 <= i <= 10).<br>
            <br>
            For this chart the bar width is fixed (although can be set at run time)
            It is possible to choose between having only a fixed number of values accepted,
            or if a certain number of the oldest values should be removed when the
            chart is full.<br>
            <br>
            Every __ticksBetweenHighlights__ values inserted (where __ticksBetweenHighlights__ can 
            be set at runtime, although it defaults to 10) the background of those values is highlighted, 
            to stress out time progression.       
            
            @class SlidingBarChart
            @private
            @extends FixedWidthBarChart
        */
        /** SlidingBarChart(ticks, width, height [, dataDim, parent])

            SlidingBarChart (pseudo)Constructor.
            
            @method SlidingBarChart
            @param {Number} ticks [Mandatory]
                            The number of values that can be drawn at the same time (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} width [Mandatory]
                            The desired width for the chart (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} height [Mandatory]
                            The desired height for the chart (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} [dataDim=1] [Optional]
                            The dimension of the data space, i.e. the number of subvalues for each data entry<br>
                            Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
            @param {Object} [parent=body] [Optional]
                            The DOM element to which the diagram should be appended as a child
            @return {Object}    A new SlidingBarChart object.
            @throws
                                -   Illegal Argument Exception, if ticks isn't a positive integer
                                -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                -   Illegal Argument Exception, if width or height aren't valid (numeric, positive) values 
                                    (through setWidth or setHeight)
                                -   Illegal Argument Exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                -   Exception, if dataDim exceeds the maximum data dimension
                                -   Exception, if the ratio between chart's width and number of ticks is such
                                    that the computed bar height is smaller than 1 pixel
                                -   Exception, if parent is passed but it is not a valid DOM element
          */                
        function SlidingBarChart (ticks, width, height, dataDim, parent){
   
            ticks = parseInt(ticks, 10);
            if (isNaN(ticks) || ticks <= 0){
                throw "Illegal Argument: ticks";
            }
  
                /** 
                    Default background color (not highlighted)
                    @property DEFAULT_BACKGROUND
                    @for SlidingBarChart
                    @type {String|Object}
                    @default = "lightgrey"
                    @final
                    @private     
                  */   
            var DEFAULT_BACKGROUND = "lightgrey";
                /** 
                    Default highlight color for background
                    @property DEFAULT_BACKGROUND_HIGHLIGHT
                    @for SlidingBarChart
                    @type {String|Object}
                    @default = "lightpink"
                    @final
                    @private     
                  */             
            var DEFAULT_BACKGROUND_HIGHLIGHT = "lightpink";
                /** 
                    Default size of axes' labels lext
                    @property AXES_LABEL_SIZE
                    @for SlidingBarChart
                    @type {Number}
                    @default = 14
                    @final
                    @private     
                  */             
            var AXES_LABEL_SIZE = 14;
                /** 
                    Default width of axes' labels
                    @property AXES_LABEL_WIDTH
                    @for SlidingBarChart
                    @type {Number}
                    @default = 50
                    @final
                    @private     
                  */            
            var AXES_LABEL_WIDTH = 50;
                /** 
                    Default margin for chart's axes
                    @property AXES_LABEL_MARGIN
                    @for SlidingBarChart
                    @type {Number}
                    @default = 5
                    @final
                    @private     
                  */             
            var AXES_LABEL_MARGIN = 5;
            
            var proto = FixedWidthBarChart(ticks, 0, width, height, dataDim, parent);	
            var slidingBarChart = Object.create(proto);   
                                             
                                                    /** 
                                                        Takes track of how much data has been actually inserted into
                                                        the chart from its creation (to synch the highlighted ticks).
                                                        
                                                        @property __dataCounter__
                                                        @type {Number}
                                                        @protected
                                                        @default 0                                                          
                                                      */
            Object.defineProperty(slidingBarChart, "__dataCounter__", {
                                value: 	0,
                                writable: true,
                                enumerable: false,
                                configurable:false
                            });
                            
                                                    /** 
                                                        Every __ticksBetweenHighlights__ ticks, the data is "higlighted"
                                                        by applying the selected highlight style to the background.
                                                        
                                                        @property __ticksBetweenHighlights__
                                                        @type {Number}
                                                        @protected
                                                        @default 10 
                                                      */
            Object.defineProperty(slidingBarChart, "__ticksBetweenHighlights__", {
                                value: 	10,
                                writable: true,
                                enumerable: false,
                                configurable:false
                            });  
                            
            Object.defineProperty(slidingBarChart, "getTicksBetweenHighlights", {
                                            /** getTicksBetweenHighlights()
                                            
                                                Returns the number of ticks between two consecutive highlights (one extreme inclusive)
                                                
                                                @method getTicksBetweenHighlights
                                                @return {Number}    The number of ticks between two consecutive highlights;
                                              */
                                    value:  function(){
                                                return this.__ticksBetweenHighlights__;                                                    
                                            },           //No previous data is cleared: new data is simply rejected
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });  
                                
            Object.defineProperty(slidingBarChart, "setTicksBetweenHighlights", {
                                            /** setTicksBetweenHighlights(ticks)
                                                
                                                Sets the number of ticks between two consecutive highlights (one extreme inclusive)
                                                
                                                @method setTicksBetweenHighlights
                                                @chainable
                                                @param {Number} ticks   [Mandatory]
                                                                        The number of ticks between two consecutive highlights;
                                                @return {Object}    This object, to allow for method chaining;
                                              */
                                    value:  function(ticks){
                                                
                                                if (this.hasOwnProperty("__ticksBetweenHighlights__")){
                                                    this.__ticksBetweenHighlights__ = ticks;
                                                }else{
                                                    //Looks for object's prototype
                                                    var proto = this.prototype ? this.prototype : this.__proto__;
                                                    if (proto && proto.setTicksBetweenHighlights){
                                                        proto.setTicksBetweenHighlights(ticks);
                                                    }
                                                }                                                      
                                                return this;	//Method chaining oriented
                                            },           //No previous data is cleared: new data is simply rejected
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });                                    

                                                    /** 
                                                        Color of the background bars
                                                        
                                                        @property __backgroundColor__
                                                        @type {String|Object}
                                                        @protected
                                                        @default DEFAULT_BACKGROUND                                                         
                                                      */
            Object.defineProperty(slidingBarChart, "__backgroundColor__", {
                                value: 	DEFAULT_BACKGROUND,
                                writable: true,
                                enumerable: false,
                                configurable:false
                            });

                            
                                                    /**
                                                        Color of the background bars when highlighted

                                                        @property __backgroundHighlightColor__
                                                        @type {String|Object}
                                                        @protected
                                                        @default DEFAULT_BACKGROUND_HIGHLIGHT    
                                                      */
            Object.defineProperty(slidingBarChart, "__backgroundHighlightColor__", {
                                value: 	DEFAULT_BACKGROUND_HIGHLIGHT,
                                writable: true,
                                enumerable: false,
                                configurable:false
                            });

            Object.defineProperty(slidingBarChart, "setBackgroundColor", {
                                            /** setBackgroundColor(bgColor)
                                            
                                                Changes the background color (not highlighted points)
                                                
                                                @method setBackgroundColor
                                                @chainable
                                                @param {String|Object} bgColor [Mandatory]
                                                                               The new color for background bars;
                                                @return {Object}    This object, to allow for method chaining.
                                              */
                                    value:  function(bgColor){
                                                
                                                if (this.hasOwnProperty("__backgroundColor__")){
                                                    this.__backgroundColor__ = bgColor;
                                                }else{
                                                    //Looks for object's prototype
                                                    var proto = this.prototype ? this.prototype : this.__proto__;
                                                    if (proto && proto.setBackgroundColor){
                                                        proto.setBackgroundColor(bgColor);
                                                    }
                                                }                                                      
                                                return this;	//Method chaining oriented
                                            },           //No previous data is cleared: new data is simply rejected
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });                                    

                                    
            Object.defineProperty(slidingBarChart, "getBackgroundColor", {
                                            /** getBackgroundColor()
                                            
                                                Returns current background bars' color
                                                
                                                @method getBackgroundColor
                                                @return {String|Object} the value set for __backgroundColor__
                                              */
                                    value: 	function(){
                                                return this.__backgroundColor__;
                                            },   
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });	    

            Object.defineProperty(slidingBarChart, "setBackgroundHighlightColor", {
                                            /** setBackgroundHighlightColor(bgHColor)
                                            
                                                Changes the background color for "highlighted" values
                                                
                                                @method setBackgroundHighlightColor
                                                @chainable
                                                @param {String|Object} bgHColor [Mandatory]
                                                                                The new color for highlighted background bars;
                                                @return {Object}    This object, to allow for method chaining.
                                              */
                                    value:  function(bgHColor){
                                                
                                                if (this.hasOwnProperty("__backgroundHighlightColor__")){
                                                    this.__backgroundHighlightColor__ = bgHColor;
                                                }else{
                                                    //Looks for object's prototype
                                                    var proto = this.prototype ? this.prototype : this.__proto__;
                                                    if (proto && proto.setBackgroundHighlightColor){
                                                        proto.setBackgroundHighlightColor(bgHColor);
                                                    }
                                                }                                                      
                                                return this;	//Method chaining oriented
                                            },           //No previous data is cleared: new data is simply rejected
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });                                    

                                    
            Object.defineProperty(slidingBarChart, "getBackgroundHighlightColor", {
                                            /** getBackgroundHighlightColor()
                                                
                                                Returns current color for background highlighted bars
                                                
                                                @method getBackgroundHighlightColor
                                                @return {String|Object} The value set for __backgroundHighlightColor__
                                              */
                                    value: 	function(){
                                                return this.__backgroundHighlightColor__;
                                            },   
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });	                                    

                                
            Object.defineProperty(slidingBarChart, "__canAppendData__", {
                                        /** __canAppendData__(newDataArray)
                                            
                                            <b>WARNING</b>: This function SHOULD be overriden in any class inheriting from the base class
                                                            in order to handle differents needs.<br>
                                            See base class for method signature and details.
                                             
                                            @method __canAppendData__ 
                                            @protected
                                            @override  FixedWidthBarChart.__canAppendData__
                                        */
                                value: 	function(newDataArray){
                                    if (!Object.isArray(newDataArray)){
                                        return [];
                                    }
                                    //else, checks if there is room for the new data
                                    var m = this.__getDatasetLength__(), 
                                        n = this.__ticks__ - m,
                                        k = newDataArray.length;

                                    //Checks that it isn't trying to add more data than it is allowed to...
                                    if (k > this.__ticks__){
                                        //... if it is so, discards the oldest surplus among the new data
                                        newDataArray.splice(0, k - this.__ticks__);
                                        k = this.__ticks__;
                                    }
                                    
                                    this.__dataCounter__ += k;
                                    
                                    if (k <= n){
                                        
                                        return newDataArray;
                                    }else{
                                        //Must delete the exceding elements from the data, and then can add the new ones 
                                        m =  Math.min(k, m);                                            
                                        this.clearData(m);
                                        
                                        //Will update as soon as it returns control to the caller (appendData)                                          
                                        return newDataArray;  //reiterate the request
                                    }
                                    
                                },
                                writable: false,
                                enumerable: false,
                                configurable:false
                            });	 
                            
                    Object.defineProperty(slidingBarChart, "__selectBackgroundBars__", {
                                            /** __selectBackgroundBars__([filter])

                                                Returns the list of the svg elements used to draw background; <br>
                                                Elements can be filtered using a custom filter passad as an optional
                                                parameter;
                                        
                                                @method __selectBackgroundBars__
                                                @protected
                                                @param {String|Object} filter  [Optional]
                                                                                A filter to be applied to the selection;
                                                @return {Object}    The proper set of d3 elements.                    
                                              */
                                    value: 	function(filter){
                                                if (filter === undefined){
                                                    return this.__svgElement__.selectAll("rect[type=back]");
                                                }else{
                                                    return this.__svgElement__.selectAll("rect[type=back]").filter(filter);
                                                }
                                            },
                                    writable: false,
                                    enumerable: false,
                                    configurable:false
                                });
                                
                    Object.defineProperty(slidingBarChart, "__updateBackground__", {
                                        /** __updateBackground__()
                                            
                                            
                                            Called by __drawNewData__() to redraw the background properly;<br>
                                            <br>
                                            <b>WARNING</b>:    if you inherit from this class you might want to override
                                                               this method as well as __drawNewData__ and __updateDrawing__ 
                                                               in order to obtain a custom chart.
                                            
                                            @method __updateBackground__
                                            @protected
                                            @return {undefined}
                                          */
                                value: 	function(){
                                            var counter = this.__dataCounter__,
                                                ticks = this.getTicksBetweenHighlights();
                                            var bgColor = this.getBackgroundColor(),
                                                bgHColor = this.getBackgroundHighlightColor();
                                            //Redraws all background bars with normal style 
                                            this.__selectBackgroundBars__()
                                                .attr("fill", bgColor);
                                             
                                            //Redraws only the highlighted ones with highlighted style 
                                            this.__selectBackgroundBars__(  function(){
                                                                                return counter > this.d_index && 
                                                                                       (counter - this.d_index) % ticks === 0; 
                                                                            })
                                                                        .attr("fill", bgHColor);
                                                                                                  
                                            return;     //(Pseudo)Private method, no need to return this
                                        },
                                writable: false,
                                enumerable: false,
                                configurable:false
                            });
                            
                    Object.defineProperty(slidingBarChart, "__updateAxes__", {
                                        /** __updateAxes__(yScale)
                                       
                                            Called by __updateDrawing__() to update the labels of the vertical axe
                                            when vertical scale changes;<br>
                                            <br>
                                            <b>WARNING</b>:     if you inherit from this class you might want to override
                                                                this method as well as __drawNewData__ and __updateDrawing__ 
                                                                in order to obtain a custom chart.
                                                      
                                            @method __updateAxes__
                                            @protected
                                            @chainable
                                            @param {Object} yScale  [Mandatory]
                                                                    D3 scale object for Y axis;
                                            @return {Object}    The current chart object, to allow for method chaining.
                                          */
                                value: 	function(yScale){
                                            var axeLabels, m;
                                            if (this.__scaleGlobally__ || this.__dataDim__ === 1){
                                                //If data is drawn with a global scaling, or there is only one subcomponent,
                                                //then Vertical axe CAN BE DRAWN
                                                m = this.__maxVals__.max();
                                                axeLabels = [m, m/2, 0];
                                            }else{
                                                //If data is drawn with local scaling for each component
                                                //then Vertical axe WOULD HAVE NO MEANING
                                                axeLabels = [];
                                            }
                                            
                                            var labels = this.__axeArea__.selectAll("text").data(axeLabels);
                                            var height = parseInt(this.__svgElement__.attr("height"), 10);
                                            
                                            labels.exit().remove();
                                            labels.enter().append("text")                                                        
                                                    .attr("font-family", "sans-serif")
                                                    .attr("font-size", AXES_LABEL_SIZE)
                                                    .attr("fill", "black");
                                            
                                            labels.text(function(d){return d;})
                                                  .attr("x", AXES_LABEL_MARGIN)
                                                  .attr("y", function(d){return Math.max(AXES_LABEL_SIZE, height - yScale(d));});
                                            
                                            return;     //(Pseudo)Private method, no need to return this
                                        },
                                writable: false,
                                enumerable: false,
                                configurable:false
                            });
                            
                    Object.defineProperty(slidingBarChart, "__drawNewData__", {
                                        /** __drawNewData__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                            
                                                                                           
                                            <b>WARNING</b>:    if you inherit from this class you might want to override both
                                                               this method and __updateDrawing__ in order to obtain a custom chart.<br>
                                            See base class for method signature and details.

                                            @method __drawNewData__
                                            @protected
                                            @override   FixedWidthBarChart.__drawNewData__
                                          */
                                value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                            var that = this;
                                            var height = parseInt(this.__svgElement__.attr("height"), 10);
                                            var barWidth =  this.getBarWidth(xScale);
                                            var initial_x = (this.__ticks__ - this.__getDatasetLength__()) * that.__dataDim__ * barWidth;

                                            if (dataIndex === 0){
                                                 //Executed only once, before drawing the first data component
                                                this.__updateBackground__(); 
                                            }
                                             
                                            //Adds value bars 
                                            dataSet.enter().append("rect")
                                                .attr("index", "data_" + dataIndex)
                                                .attr("x", function(d, i){return initial_x + (i * that.__dataDim__ + dataIndex) * barWidth + 1;})
                                                .attr("y", height)	
                                                .attr("width", barWidth - 3)
                                                .attr("height", 0)	
                                                .attr("fill", that.getFillColor(dataIndex))
                                                .attr("stroke", that.getStrokeColor(dataIndex))
                                                .attr("opacity", function(d){return that.__getBarOpacity__((0.0 + yScale(d)) / height);});
                                                
                                            
                                            if (that.areLabelsVisible(dataIndex) && barWidth > that.getLabelsSize(dataIndex)){
                                                labelsSet.enter().append("text").attr("index", "data_" + dataIndex)
                                                    .text(function(d) {return d;})
                                                    .attr("text-anchor", "middle")
                                                    .attr("x", function(d, i){return initial_x + (i * that.__dataDim__ + dataIndex + 0.5) * barWidth + 1;})
                                                    .attr("y", height)
                                                    .attr("font-family", "sans-serif")
                                                    .attr("font-size", that.getLabelsSize(dataIndex))
                                                    .attr("fill", that.getLabelColor(dataIndex));	
                                            }else{
                                                labelsSet.remove();
                                            }
                                                
                                            return;     //(Pseudo)Private method, no need to return this
                                        },
                                writable: false,
                                enumerable: false,
                                configurable:false
                            });
                
                Object.defineProperty(slidingBarChart, "__updateDrawing__", {
                                        /** __updateDrawing__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                            
                                            <b>WARNING</b>:    if you inherit from this class you might want to override both
                                                               this method and __drawNewData__ in order to obtain a custom chart.<br>
                                            See base class for method signature and details.
                                             
                                            @method  __updateDrawing__
                                            @protected
                                            @override  FixedWidthBarChart.__updateDrawing__
                                          */					
                                value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                            var that = this;
                                            var height = parseInt(this.__svgElement__.attr("height"), 10);
                                            var barWidth = this.getBarWidth(xScale);
                                            var initial_x = (this.__ticks__ - this.__getDatasetLength__()) * that.__dataDim__ * barWidth;
                                          
                                            if (dataIndex === 0){
                                                 //Executed only once, before drawing the first data component
                                                this.__updateBackground__(); 
                                                this.__updateAxes__(yScale);
                                            }
                                                
                                            dataSet.transition().duration(100)//.delay(250)
                                                    .attr("x", function(d, i){return initial_x + (i * that.__dataDim__ + dataIndex) * barWidth + 1;})
                                                    .attr("y", function(d){return height - yScale(d);})
                                                    .attr("width", barWidth - 3)
                                                    .attr("height", function(d){return yScale(d);})
                                                    .attr("opacity", function(d){return that.__getBarOpacity__((0.0 + yScale(d)) / height);});									
                                            if (that.areLabelsVisible(dataIndex) && barWidth > that.getLabelsSize(dataIndex)){
                                                labelsSet.transition()//.delay(250)
                                                        .text(function(d) {return d;})
                                                        .attr("x", function(d, i){return initial_x + (i * that.__dataDim__ + dataIndex + 0.5) * barWidth + 1;})
                                                        .attr("y", function(d){return height - yScale(d) + that.getLabelsSize(dataIndex) ;});
                                                        
                                            }else{
                                                labelsSet.remove();
                                            }						
                                            return;     //(Pseudo)Private method, no need to return this
                                        },
                                writable: false,
                                enumerable: false,
                                configurable:false
                            });	      
                                
            
            /** __init__()
                
                Inits the chart;
                
                @method __init__
                @private
                @param {Object} chart   [Mandatory]
                                        The chart object that needs initialization;
                @param {Number} width   [Mandatory]
                                        Chart's width;
                @param {Number} height  [Mandatory]
                                        Chart's height;
                @return {undefined}
              */                
            function __init__(chart, width, height){

                //Hides all labels by default
                for (var i=0; i<chart.__dataDim__; i++){
                    chart.toggleLabels(i, false);
                }
                  
                var barWidth = (width - AXES_LABEL_WIDTH) / (chart.__dataDim__ * chart.__ticks__);
                        //var barWidth = slidingBarChart.getBarWidth() ;
                        
                if (barWidth <= 0){
                    throw "Illegal Arguments combination: width too small to draw 'ticks' values";
                }
                                        /** 
                                            The width of each bar;
                                            
                                            @property __barWidth__
                                            @type {Number}
                                            @readOnly
                                            @protected                                              
                                            @override  FixedWidthBarChart.__barWidth__
                                          */
                Object.defineProperty(chart, "__barWidth__", {
                                            value: barWidth,
                                            writable: false,
                                            enumerable: false,
                                            configurable: false
                                        });	 
                                        /** 
                                            The horizontal position of chart's vertical axe;
                                            
                                            @property __axeLeft__
                                            @type {Number}
                                            @readOnly
                                            @protected
                                          */
                Object.defineProperty(chart, "__axeLeft__", {
                                            value: width - AXES_LABEL_WIDTH,
                                            writable: false,
                                            enumerable: false,
                                            configurable: false
                                        });	                                                                              
                
                //Adds the vertical axe box
                var axeArea =   chart.__svgElement__.append("svg")
                                     .attr("type", "axeArea")
                                     .attr("x", chart.__axeLeft__)
                                     .attr("y", 0)
                                     .attr("width", AXES_LABEL_WIDTH)
                                     .attr("height", height);
                
                axeArea.append("svg:line")
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", 0)
                        .attr("y2", height)
                        .style("stroke", "black");  
                        
                                        /** 
                                            The svg Object grouping all the vertical axe related drawings;
                                            
                                            @property __axeArea__
                                            @type {Object}
                                            @readOnly
                                            @protected
                                          */                        
                Object.defineProperty(chart, "__axeArea__", {
                                            value: axeArea,
                                            writable: false,
                                            enumerable: false,
                                            configurable: false
                                        });	    

                                        
                var totalBarsNumber = chart.__ticks__ * chart.__dataDim__;
                    
                //Adds background bars
                chart.__selectBackgroundBars__()
                    .data(new Array(totalBarsNumber))
                    .enter().append("rect")
                    .attr("type", "back")
                                                                //Data enter form right
                    .property("d_index", function(d,i){return Math.floor((totalBarsNumber - i - 1) / chart.__dataDim__);}) 
                    .attr("x", function(d, i){return i * barWidth;})
                    .attr("y", 0)	
                    .attr("width", barWidth - 1)
                    .attr("height", height)	
                    .attr("fill", chart.__backgroundColor__);
                
                return; //Private method, no need to return anything
            }


            __init__(slidingBarChart, width, height);
            Object.seal(slidingBarChart);
            
            return slidingBarChart;
        }
        
        
        /** 
            
            Advanced Chart: <b>TimeWheelChart</b><br>
            Inherits from BasicBarChart redefining the drawing methods.<br>
            <br>
            Data is represented as bars drawn around a time wheel.<br>
            <br>
            It is possible to choose between having only a fixed number of values accepted,
            or if a certain number of the oldest values should be removed when the
            chart is full.
            
            @class TimeWheelChart
            @private
            @extends FixedWidthBarChart
          */
        /** TimeWheelChart(ticks, startTime, wheelRadius, width, height [, dataDim, parent])
            
            TimeWheelChart (pseudo)Constructor.
            
            @method TimeWheelChart
            @param {Number} ticks [Mandatory]
                            The number of values that can be drawn at the same time (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {String} startTime [Mandatory]
                            The reference for the label of the first point.<br>
                            Should be an incrementable value.                                
            @param {Number} width  [Mandatory]
                            The desired width for the chart (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} height [Mandatory]
                            The desired height for the chart (<b>can't be changed later</b>)<br>
                            Can be any value that is or can be converted to a positive integer.
            @param {Number} [dataDim=1] [Optional]
                            The dimension of the data space, i.e. the number of subvalues for each data entry;<br>
                            Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
            @param {Object} [parent=body]
                            [Optional]
                            The DOM element to which the diagram should be appended as a child
            @return {Object}    A new TimeWheelChart object
            @throws
                                -   Illegal Argument Exception, if ticks isn't a positive integer
                                -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                -   Illegal Argument Exception, if width or height aren't valid (numeric, positive) values 
                                    (through setWidth or setHeight)
                                -   Illegal Argument Exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                -   Exception, if dataDim exceeds the maximum data dimension
                                -   Exception, if parent is passed but it is not a valid DOM element
          */
        function TimeWheelChart (ticks, startTime, wheelRadius, width, height, dataDim, parent){
           
            var TICK_LINES_LENGTH = 5;
            var BAR_TEXT_MARGIN = 5;
            
            var proto = FixedWidthBarChart(ticks, 0, width, height, dataDim, parent);
            //proto_properties = 
            var timeWheelChart = Object.create(proto);
            
                                                            
            if (ChartUtils.validateTimeString(startTime)){
                                                      /** 
                                                            Label stating the time corresponding to the first tick;
                                                            @property __startTime__
                                                            @type {String}
                                                            @protected                                                                                                         
                                                        */
                Object.defineProperty(timeWheelChart, "__startTime__", {
                                        value: 	startTime,
                                        writable: true,
                                        enumerable: false,
                                        configurable: false
                                    });
            }
                                                  /** 
                                                        Size in points of the static labels showing time references on the wheel;
                                                        @property __startTime__
                                                        @type {String}
                                                        @protected
                                                        @default data labels' size
                                                    */
            Object.defineProperty(timeWheelChart, "__timeWheelLabelsSize__", {
                                    value: 	timeWheelChart.getLabelsSize(0),  //Use the default value for value labels
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });
                                
            Object.defineProperty(timeWheelChart, "setTimeWheelLabelsSize", {
                                            /** setTimeWheelLabelsSize(size)
                                            
                                                Sets the size of the labels used for the wheel.
                                                
                                                @method setTimeWheelLabelsSize
                                                @chainable
                                                @param {Number} size    [Mandatory]
                                                                        The new size for the labels (must be an integer gt zero);
                                                @return {Object}        This chart object, to allow for method chaining;
                                                @throws    
                                                            - Illegal Argument Exception, if the argument is not valid (see above).
                                              */
                                    value: 	function(size){
                                                size = parseInt(size, 10);
                                                if (isNaN(size) || size <= 0){
                                                    throw "Illegal Argument: size";
                                                }
                                                if (this.hasOwnProperty("__timeWheelLabelsSize__")){
                                                    this.__timeWheelLabelsSize__ = size;
                                                }else{
                                                    //Looks for object's prototype
                                                    var proto = this.prototype ? this.prototype : this.__proto__;
                                                    if (proto && proto.setTimeWheelLabelsSize){
                                                        proto.setTimeWheelLabelsSize(size);
                                                    }
                                                } 
                                                //Now must update the static part of the wheel chart
                                                this.__updateWheelDrawing__();                                                    
                                                return this;    //Method chaining support;
                                            },
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });                                     
                                                    /** 
                                                        Color used for the static part of the wheel
                                                        @property __startTime__
                                                        @type {String|Object}
                                                        @protected
                                                        @default "lightgrey"                                                        
                                                      */
            Object.defineProperty(timeWheelChart, "__timeWheelForeColor__", {
                                    value: 	"lightgrey",  //Defaults to lightgrey
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });                  

            Object.defineProperty(timeWheelChart, "setTimeWheelForeColor", {
                                            /** setTimeWheelForeColor(color)
                                            
                                                Sets the color used for the static part of the wheel's drawing, 
                                                i.e. for labels and lines representing time ticks 
                                                of the time wheel.
                                                
                                                @method setTimeWheelForeColor
                                                @chainable
                                                @param {String|Object} color   [Mandatory]
                                                                                The new forecolor for the wheel;
                                                @return {Object}    This chart object, to allow for method chaining;
                                                @throws    
                                                            - Illegal Argument Exception, if color isn't passed or is null.
                                              */
                                    value: 	function(color){
                                                if (color === undefined  || color === null){
                                                    throw "Illegal Argument: color";
                                                }
                                                if (this.hasOwnProperty("__timeWheelForeColor__")){
                                                    this.__timeWheelForeColor__ = color;
                                                }else{
                                                    //Looks for object's prototype
                                                    var proto = this.prototype ? this.prototype : this.__proto__;
                                                    if (proto && proto.setTimeWheelForeColor){
                                                        proto.setTimeWheelForeColor(color);
                                                    }
                                                }  
                                                //Now must update the static part of the wheel chart
                                                this.__updateWheelDrawing__();
                                                return this;    //Method chaining support;                                                    
                                            },
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });    
                                
            Object.defineProperty(timeWheelChart, "__timeLabelsVisible__", {
                                            /** __timeLabelsVisible__()
                                                
                                                Checks whether or not the labels showing time references on the wheel
                                                should be drawn
                                                
                                                @method __timeLabelsVisible__
                                                @protected
                                                @return {Boolean} True <=> the time reference labels are visible.
                                                
                                              */
                                    value: 	function(){
                                                return (this.__startTime__ !== undefined);
                                            },
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });
                           
            Object.defineProperty(timeWheelChart, "setBarWidth", {
                                            /** setBarWidth(barWidth)
                                            
                                                Sets the width of this chart's bars.
                                                
                                                @method setBarWidth
                                                @chainable
                                                @param {Number}  barWidth [Mandatory]
                                                                 The new bar width to be set;<br>
                                                                 MUST be a positive number or its base 10 string representation.
                                                @return {Object}    This object, to allow for method chaining;
                                                @throws    Illegal Argument Exception, if the argument isn't valid (see above).
                                                @override  BasicBarChart.setBarWidth
                                              */
                                    value: 	function(barWidth){
                                                barWidth = parseInt(barWidth, 10);
                                                if (isNaN(barWidth) || barWidth <= 0){
                                                    throw "Illegal Argument: barWidth";
                                                }
                                                this.__barWidth__ = barWidth;
                                                return this;		//Method chaining oriented
                                            },
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	   
                                
            Object.defineProperty(timeWheelChart, "setWheelCenter", {
                            /** setWheelCenter(cx, cy)
                            
                                Sets the position of the center of the wheel.
                                If it is valid and it is different from the current position,
                                the drawing is moved to the new position
                                
                                @method setWheelCenter
                                @chainable
                                @param {Number} cx [Mandatory]
                                                   x coordinate of the new center;<br>
                                                   Only non negative integers or values that can be converted 
                                                   to non negative integers are accepted;
                                @param {Number} cy [Mandatory]
                                                   y coordinate of the new center;<br>
                                                   Only non negative integers or values that can be converted 
                                                   to non negative integers are accepted;
                                @return {Object}    This chart object, to allow for method chaining;
                                @throws     
                                            - Illegal Argument Exception, if cx or cy aren't valid. 
                             */
                    value: 	function(cx, cy){
                                cx = parseInt(cx, 10);
                                cy = parseInt(cy, 10);
                                if (!isNaN(cx) && !isNaN(cy)){
                                    this.__moveWheelCenter__(cx, cy);
                                }else{
                                    throw "Illegal Arguments: cx, cy";
                                }                                    
                                    
                                return this;	//Method chaining oriented
                            },
                    writable: false,
                    enumerable: true,
                    configurable:false
                });

            Object.defineProperty(timeWheelChart, "__moveWheelCenter__", {
                            /** __moveWheelCenter__(cx, cy)

                                When the center of the time wheel is moved,
                                it takes care of all the updates needed for the chart
                                
                                @method __moveWheelCenter__
                                @protected
                                @param {Number} cx [Mandatory]
                                                   x coordinate of the new center;
                                @param {Number} cy [Mandatory]
                                                   y coordinate of the new center;
                                @return {undefined}
                              */                                
                    value: 	function(cx, cy){
                                if (!Object.isNumber(cx) || !Object.isNumber(cy) ||    //Extra precaution, since it's not really a "private" method
                                    (this.__cx__ === cx && this.__cy__ === cy)){ //If values doesn't change, no reason to hassle
                                      
                                    return;     //(Pseudo)Private method, no need to return this
                                }
                                //else

                                this.__wheel__.transition()//.delay(250)
                                               .attr("x", cx - this.__r__).attr("y", cy - this.__r__);
                                this.__cx__ = cx;
                                this.__cy__ = cy;
                                
                                //Now updates all the bars
                                
                                var newDataLength = this.__getDatasetLength__() * this.__dataDim__;
                                
                                //The max is recomputed every time to retain the ability to switch on the fly between scaling locally and globally
                                var max_val;
                                
                                if (this.__scaleGlobally__){
                                    max_val = ChartUtils.fillArray(this.__maxVals__.max(), this.__dataDim__);
                                }else{
                                    max_val = this.__maxVals__;    //Values aren't going to be modified, so we can just copy the reference
                                }
                                
                                for (var j = 0; j < this.__dataDim__; j++){  

                                    var dataSet = this.__selectData__(this.__data__, j);           
                                    var labelsSet = this.__selectLabels__(this.__data__, j);

                                    //Computes the new X and Y scale
                                    this.__xScale__.domain([0, newDataLength]);        
                                    this.__yScale__[j].domain([0, 	max_val[j]]);
                                    this.__updateDrawing__(dataSet, labelsSet, j, this.__xScale__, this.__yScale__[j]);
                                }
                                
                                return;     //(Pseudo)Private method, no need to return this	
                            },  
                    writable: false,
                    enumerable: false,
                    configurable:false
                });   

            Object.defineProperty(timeWheelChart, "__drawNewData__", {
                            /** __drawNewData__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                                                           
                                <b>WARNING</b>:    if you inherit from this class you might want to override both
                                                   this method and __updateDrawing__ in order to obtain a custom chart.<br>
                                See base class for method signature and details.

                                @method __drawNewData__
                                @protected
                                @override   FixedWidthBarChart.__drawNewData__
                              */                
                    value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                
                                var that = this;
                                //var height = parseInt(this.__svgElement__.attr("height"), 10);
                                var initial_x = that.__cx__ + dataIndex * (that.__barWidth__ + 1), 
                                    initial_y = that.__cy__ - that.__r__ ;
                                
                                dataSet.enter().append("rect").attr("index", "data_" + dataIndex)
                                    .attr("x", initial_x)
                                    .attr("y", initial_y)
                                    .attr("width", that.__barWidth__)
                                    .attr("height", 0)
                                    .attr("transform", function(d, i){ return "rotate(" + (180 / Math.PI * (2 * i * that.__tickStep__)) + 
                                                                              " " + that.__cx__ +  ", " + that.__cy__ + ")";})                                        
                                    .attr("fill", that.getFillColor(dataIndex))
                                    .attr("stroke", that.getStrokeColor(dataIndex))
                                    .attr("opacity", function(d){return that.__getBarOpacity__((0.0 + yScale(d)) / that.__barHeight__);});
                                    
                                
                                if (that.areLabelsVisible(dataIndex) ){
                                    
                                    
                                    initial_x += that.getBarWidth();
                                    initial_y -= BAR_TEXT_MARGIN;
                                    labelsSet.enter()
                                        .append("text").attr("index", "data_" + dataIndex)
                                                //The text direction makes the string printed right to left, 
                                                //so it must reverse the string to represent
                                        .text(function(d) {return d;})      //("" + d).split("").reverse().join("") ;}) 
                                        .attr("text-anchor", "left")
                                        .attr("x", initial_x)
                                        .attr("y", function(){return initial_y;})  
                                        .attr("transform",  function(d, i){  
                                                                return "rotate(" + (180 / Math.PI * (2 * i * that.__tickStep__)) + 
                                                                        " " + that.__cx__ +  ", " + that.__cy__ + ")" +
                                                                        "rotate(-90 " + initial_x + ", " + initial_y +")";
                                                            })
                                        .attr("font-family", "sans-serif")
                                        .attr("font-size", that.getLabelsSize(dataIndex))
                                        .attr("fill", that.getLabelColor(dataIndex));
                                        //.attr("class", "wheelText")
                                }else{
                                    labelsSet.remove();
                                }
                                    
                                return;     //(Pseudo)Private method, no need to return this
                            },
                    writable: false,
                    enumerable: false,
                    configurable:false
                });
                    
            Object.defineProperty(timeWheelChart, "__updateDrawing__", {
                            /** __updateDrawing__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                
                                <b>WARNING</b>:    if you inherit from this class you might want to override both
                                                   this method and __drawNewData__ in order to obtain a custom chart.<br>
                                See base class for method signature and details.
                                 
                                @method  __updateDrawing__
                                @protected
                                @override  FixedWidthBarChart.__updateDrawing__
                              */					
                    value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){           
                    
                                var that = this; 
                                var initial_x = that.__cx__ + dataIndex * (that.__barWidth__ + 1);                              
                                
                                dataSet.transition()	
                                        .attr("x", initial_x)
                                        .attr("y", function(d){return that.__cy__ - that.__r__ - yScale(d);})
                                        .attr("height", function(d){return yScale(d);})
                                        .attr("transform", function(d, i){ return "rotate(" + (180 / Math.PI * (2 * i * that.__tickStep__)) + ", " + that.__cx__ +  ", " + that.__cy__ + ")";})                                       
                                        .attr("opacity", function(d){return that.__getBarOpacity__((0.0 + yScale(d)) / that.__barHeight__);});									

                                if (that.areLabelsVisible(dataIndex)){
                                    initial_x += that.getBarWidth();
                                    
                                    labelsSet.transition()
                                            .attr("y", function(d){return   that.__cy__ - that.__r__ - yScale(d) - BAR_TEXT_MARGIN; })
                                            .attr("x", initial_x)
                                            .attr("transform",  function(d, i){  
                                                                    return "rotate(" + (180 / Math.PI * (2 * i * that.__tickStep__)) + 
                                                                            " " + that.__cx__ +  ", " + that.__cy__ + ")" +
                                                                            "rotate(-90 " + initial_x + ", " + (that.__cy__ - that.__r__ - yScale(d) - BAR_TEXT_MARGIN) +")";
                                                                });                                                
                                }else{
                                    labelsSet.remove();
                                }					
                                
                                return;     //(Pseudo)Private method, no need to return this
                            },
                    writable: false,
                    enumerable: false,
                    configurable:false
                });		
                
        Object.defineProperty(timeWheelChart, "__onClearData__", {            
                            /** __onClearData__(n)
                                
                                [Protected method, not supposed to be used by consumers]
                                
                                <b>WARNING</b>:    Inherited objects MIGHT NEED to override this function<br>
                                                   See base class for method signature and details.
                                @method __onClearData__
                                @protected
                                @override BasicBarChart.__onClearData__
                              */
                    value:	function(n){
                                this.__timeLabels__.map(function(label){label.text(ChartUtils.addIntToTimeString(label.text(), n));});
                                return;     //(Pseudo)Private method, no need to return this
                            },
                    writable: false,
                    enumerable: false,
                    configurable:false
                });	
                
        Object.defineProperty(timeWheelChart, "__updateWheelDrawing__", {            
                            /** __updateWheelDrawing__()
                                
                                Updates the drawing of the static elements of the wheel<br>
                                <br>
                                <b>WARNING</b>:    Inherited objects MIGHT NEED to override this function
                                
                                @method __updateWheelDrawing__
                                @protected
                                @return {undefined}
                              */
                    value:	function(){
                                var that = this;
                                var tmpLabel;
                                //Update labels text
                                this.__timeLabels__.map(function(label){
                                                            label.attr("fill", that.__timeWheelForeColor__)
                                                                 .attr("font-size", that.__timeWheelLabelsSize__);
                                                        });
                                //Now updates their position
                                for (var i=0; i < this.__timeLabels__.length; i++){
                                    tmpLabel = this.__timeLabels__[i];
                                    switch(tmpLabel.property("clock_time")){
                                        case "12":
                                            tmpLabel
                                                   .attr("x", this.__r__)
                                                   .attr("y", TICK_LINES_LENGTH + this.__timeWheelLabelsSize__);
                                            break;
                                        case "3":
                                            tmpLabel
                                                .attr("x", 2 * this.__r__ - TICK_LINES_LENGTH - this.__timeLabels__[i].node().getComputedTextLength() )
                                                .attr("y", this.__r__ + this.__timeWheelLabelsSize__ / 2);                                             
                                            break;
                                        case "6":
                                            tmpLabel
                                                .attr("x", this.__r__)
                                                .attr("y", 2 * this.__r__ - TICK_LINES_LENGTH);
                                            break;
                                        case "9":
                                            tmpLabel
                                                .attr("x", TICK_LINES_LENGTH )
                                                .attr("y", this.__r__ + this.__timeWheelLabelsSize__ / 2);                                         
                                            break;                                                
                                    }
                                }                                 

                                
                                //Updates wheel tick lines                        
                                this.__wheel__.selectAll("line")
                                                    .attr("stroke", this.__timeWheelForeColor__);
                                //Updates wheel tick lines                        
                                this.__wheel__.selectAll("circle")
                                                    .attr("stroke", this.__timeWheelForeColor__);                                                        
                                return;     //(Pseudo)Private method, no need to return this
                            },
                    writable: false,
                    enumerable: false,
                    configurable:false
                });                    
            Object.defineProperty(timeWheelChart, "destroy", {
                            /** destroy()
                                
                                Object's destructor: helps garbage collector freeing memory, and removes chart DOM elements.<br>
                                <br>
                                <b>WARNING</b>: calling destroy on an object will force any further reference 
                                                to its attributes / methods to throw exceptions.<br>
                                <br>
                                <b>NOTE</b>:   This function should be override by any class inheriting from this chart.<br>
                                               In order to properly work, any overriding destroyer should:
                                                <ol>
                                                    <li> Free any array specific to the object on which is called;</li>
                                                    <li> Remove any event listener on chart objects;</li>
                                                    <li> Call super object's destroy method.</li>
                                                </ol>
                                @method destroy
                                @return {null} to state that the object has been destroyed.
                                @override BasicBarChart.destroy()
                              */                         
                    value: 	function(){
                                        //Deletes all the elements from object's arrays
                                        if (this.__timeLabels__){
                                            this.__timeLabels__.length = 0;
                                        }
                                        
                                        //Removes DOM objects
                                        this.__wheel__.remove();
                                        //Looks for object's prototype destructor
                                        var proto = this.prototype ? this.prototype : this.__proto__;
                                        if (proto && proto.destroy){
                                            proto.destroy();
                                        }
                                        return null;
                                    },
                    writable: false,
                    enumerable: false,
                    configurable: false
                });		
            
            
            /** __init__()
                
                Inits the chart;
                
                @method __init__
                @private
                @param {Object} chart   [Mandatory]
                                        The chart that need initialization;
                @param {Number} width   [Mandatory]
                                        Chart's width;
                @param {Number} height  [Mandatory]
                                        Chart's height;
                @param {Number} wheelRadius  [Mandatory]   
                                            Wheel inner radius;
                @return {undefined}
              */      
            function __init__(chart, width, height, wheelRadius){
                var __r__, __barHeight__;
                //Computes drawing related object contants
                                            /** 
                                                Chart's bars' width, in pixel <br>
                                                Can be changed at runtime
                                                @property __barWidth__
                                                @type {Number}
                                                @protected
                                                @default 8
                                                @override  FixedWidthBarChart.__barWidth__  
                                              */
                Object.defineProperty(chart, "__barWidth__", {
                                            value: 8,
                                            writable: true,
                                            enumerable: false,
                                            configurable: false
                                        });	
                                            /** 
                                                X coordinate of the center of the wheel
                                                Can be changed at runtime
                                                
                                                @property __cx__
                                                @type {Number}
                                                @protected
                                                @default the horizontal center of the chart                                                
                                              */
                Object.defineProperty(chart, "__cx__", {
                                            value: width / 2, //Aligns left by default
                                            writable: true,                     //to allow enough space for the legend
                                            enumerable: false,
                                            configurable:false
                                        });
                                        
                                            /** 
                                                Y coordinate of the center of the wheel<br>
                                                Can be changed at runtime
                                                @property __cy__
                                                @type {Number}
                                                @protected
                                                @default the vertical center of the chart                                                  
                                              */
                Object.defineProperty(chart, "__cy__", {
                                            value: height / 2,
                                            writable: true,
                                            enumerable: false,
                                            configurable:false
                                        });                                                               
                wheelRadius = parseInt(wheelRadius, 10);
                
                if (!isNaN(wheelRadius) && wheelRadius > 0){
                    //If a value for the wheel radius is set, then computes the height accordingly...                                                                    
                    __r__ = wheelRadius;
                    __barHeight__ = Math.min(width, height) / 4;
                }else{
                    //...Otherwise makes the radius 3/4 of the available height;
                    __barHeight__ = ((Math.min(width, height) - 2 * wheelRadius) / 2) * 0.75;                    
                    __r__ = __barHeight__ * 0.75; 
                }
                
                                            /** 
                                                Radius of the wheel<br>
                                                <b>CAN NOT</b> be changed at runtime
                                                @property __r__
                                                @type {Number}
                                                @protected    
                                                @readOnly
                                              */
                Object.defineProperty(chart, "__r__", {
                                            value: __r__,
                                            writable: false,
                                            enumerable: false,
                                            configurable:false
                                        }); 
                                            /** 
                                                Maximum height for each bar<br>
                                                <b>CAN NOT</b> be changed at runtime
                                                @property __barHeight__
                                                @type {Number}
                                                @protected    
                                                @readOnly
                                              */                                                                    
                Object.defineProperty(chart, "__barHeight__", {
                                            value: __barHeight__,
                                            writable: false,
                                            enumerable: false,
                                            configurable:false
                                        });                 
                
                //Modify the range for each of the data components
                for (var i=0; i < chart.__dataDim__; i++){
                    chart.__yScale__[i].range([0, chart.__barHeight__]);
                }
                
                //Computes the angle between two consecutive ticks
                                            /** 
                                                The angle between two consecutive ticks<br>
                                                <b>CAN NOT</b> be changed at runtime
                                                
                                                @property __tickStep__
                                                @type {Number}
                                                @protected    
                                                @readOnly
                                              */  
                Object.defineProperty(chart, "__tickStep__", {
                                            value: Math.PI / (chart.__ticks__), // == 2 * Math.PI / (chart.__ticks__ * 2)
                                            writable: false,
                                            enumerable: false,
                                            configurable:false
                                        });   
                
                var     initial_x = chart.__cx__ - chart.__r__, 
                        initial_y = chart.__cy__ - chart.__r__;
                                           
                                           /** 
                                                The actual svg object for the static part of the wheel
                                                
                                                @property __wheel__
                                                @type {Object}
                                                @protected    
                                                @readOnly                                                
                                              */
                Object.defineProperty(chart, "__wheel__", {
                                            value: chart.__svgElement__.append("svg")
                                                                  .attr("id", "timeWheel")
                                                                  .attr("x", initial_x)
                                                                  .attr("y", initial_y),
                                            writable: false,
                                            enumerable: false,
                                            configurable:false
                                        });  
                                        
                //Appends an inner circle to represent the wheel
                chart.__wheel__.append("circle")
                               .attr("id", "timeWheel")
                               .attr("cx", chart.__r__)
                               .attr("cy", chart.__r__)
                               .attr("stroke", chart.__timeWheelForeColor__)
                               .attr("stroke-dasharray", "2, 4")
                               .attr("fill", "none")
                               .attr("r", chart.__r__)
                               .attr("stroke-width", 1);
                               
                
                chart.__wheel__.selectAll("line").data(d3.range(chart.__ticks__))
                                .enter()
                                .append("svg:line")
                                .attr("x1", chart.__r__)
                                .attr("y1", 0)
                                .attr("x2", chart.__r__)
                                .attr("y2", TICK_LINES_LENGTH)
                                .attr("stroke", chart.__timeWheelForeColor__)
                                .attr("transform",      function(d, i){
                                                            return  "rotate(" + (180 / Math.PI * (2 * i * chart.__tickStep__)) +
                                                                    " " + chart.__r__ + ", " + chart.__r__ +")";
                                                        });
                                                        
                if (chart.__timeLabelsVisible__()){
                    var timeLabels = [];
                    timeLabels.push(
                            chart.__wheel__
                                .append("text")
                                .property("clock_time", "12")
                                .text(chart.__startTime__)
                                .attr("font-family", "sans-serif")
                                .attr("font-size", chart.__timeWheelLabelsSize__)   
                                .attr("fill", chart.__timeWheelForeColor__)
                                .attr("text-anchor", "middle")
                                .attr("x", chart.__r__)
                                .attr("y", TICK_LINES_LENGTH + chart.__timeWheelLabelsSize__)
                            );
                            
                    //For the "3 o'clock" label we must take particular care because it needs to be aligned "right"
                    //So we need to move it after creation, once we know its size
                    var tmpLabel = chart.__wheel__
                                .append("text")
                                .property("clock_time", "3")
                                .text(ChartUtils.addIntToTimeString(chart.__startTime__, Math.floor(chart.__ticks__/4)))
                                .attr("font-family", "sans-serif")
                                .attr("font-size", chart.__timeWheelLabelsSize__)   
                                .attr("fill", chart.__timeWheelForeColor__)
                                .attr("text-anchor", "left");
                    timeLabels.push(tmpLabel);
                            
                            tmpLabel.attr("x", 2 * chart.__r__ - TICK_LINES_LENGTH - tmpLabel.node().getComputedTextLength() )
                                    .attr("y", chart.__r__ + chart.__timeWheelLabelsSize__ / 2);                                                       

                    timeLabels.push(
                            chart.__wheel__
                                .append("text")
                                .property("clock_time", "6")
                                .text(ChartUtils.addIntToTimeString(chart.__startTime__, chart.__ticks__/2))
                                .attr("font-family", "sans-serif")
                                .attr("font-size", chart.__timeWheelLabelsSize__)   
                                .attr("fill", chart.__timeWheelForeColor__)
                                .attr("text-anchor", "middle")
                                .attr("x", chart.__r__)
                                .attr("y", 2 * chart.__r__ - TICK_LINES_LENGTH)                                                       
                            );  
                    timeLabels.push(
                            chart.__wheel__
                                .append("text")
                                .property("clock_time", "9")
                                .text(ChartUtils.addIntToTimeString(chart.__startTime__, Math.floor(3 * chart.__ticks__ / 4)))
                                .attr("font-family", "sans-serif")
                                .attr("font-size", chart.__timeWheelLabelsSize__)   
                                .attr("fill", chart.__timeWheelForeColor__)
                                .attr("text-anchor", "left")
                                .attr("x", TICK_LINES_LENGTH )
                                .attr("y", chart.__r__ + chart.__timeWheelLabelsSize__ / 2)                                                       
                            ); 

                                                /** 
                                                    List of labels for wheel's time references
                                                    
                                                    @property __timeLabels__
                                                    @type {Array}
                                                    @protected    
                                                    @readOnly                                                           
                                                  */
                    Object.defineProperty(chart, "__timeLabels__", {
                                            value: timeLabels,
                                            writable: false,
                                            enumerable: false,
                                            configurable:false
                                        });  
                }
                return ;
            }

            
            __init__(timeWheelChart, width, height, wheelRadius);
            Object.seal(timeWheelChart);

            return timeWheelChart;
        }		
		
		var modulePrototype = {
            /** 
                @method BasicBarChart
                @for DynamicChart
                @chainable

                @param {Number} width [Mandatory]
                                The desired width for the chart (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} height [Mandatory]
                                The desired height for the chart (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} [dataDim=1] [Optional]
                                The dimension of the data space, i.e. the number of subvalues for each data entry<br>
                                Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
                @param {Object} [parent=body] [Optional]
                                The DOM element to which the diagram should be appended as a child                                                              
                @return {Object} A (wrapped-in-a-proxy version of a) BasicBarChart object
                @throws
                                    -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                    -   Illegal Argument exception , if width or height aren't valid (numeric, positive) values 
                                        (through setWidth or setHeight)
                                    -   Illegal Argument exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                    -   Exception, if dataDim exceeds the maximum data dimension
                                    -   Exception, if parent is passed but it is not a valid DOM element                             
              */
            BasicBarChart: function(){
                               return BasicBarChart.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy(true);
                           },
            /** 
                @method FixedWidthBarChart
                @for DynamicChart
                @chainable
                
                @param {Number} ticks [Mandatory]
                                The number of values that can be drawn at the same time (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} startingPoint [Mandatory, but not used at the moment: inserted for future back-compatibility]<br>
                                The reference for the label of the first point.<br>
                                Should be an incrementable value;
                @param {Number} width [Mandatory]
                                The desired width for the chart (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} height [Mandatory]
                                The desired height for the chart (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} [dataDim=1] [Optional]
                                The dimension of the data space, i.e. the number of subvalues for each data entry<br>
                                Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
                @param {Object} [parent=body] [Optional]
                                The DOM element to which the diagram should be appended as a child
                @return {Object} A properly initialized (wrapped-in-a-proxy version of a) FixedWidthBarChart object
                @throws
                                    -   Illegal Argument Exception, if ticks isn't a positive integer
                                    -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                    -   Illegal Argument Exception, if width or height aren't valid (numeric, positive) values 
                                        (through setWidth or setHeight)
                                    -   Illegal Argument Exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                    -   Exception, if dataDim exceeds the maximum data dimension
                                    -   Exception, if parent is passed but it is not a valid DOM element                
              */                           
            FixedWidthBarChart: function(){
                               return FixedWidthBarChart.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy(true);
                           },
            /** 
                @method SlidingBarChart
                @for DynamicChart
                @chainable
                
                @param {Number} ticks [Mandatory]
                                The number of values that can be drawn at the same time (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} width [Mandatory]
                                The desired width for the chart (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} height [Mandatory]
                                The desired height for the chart (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} [dataDim=1] [Optional]
                                The dimension of the data space, i.e. the number of subvalues for each data entry <br>
                                Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
                @param {Object} [parent=body] The DOM element to which the diagram should be appended as a child
                @return {Object} A properly initialized (wrapped-in-a-proxy version of a) SlidingBarChart object
                @throws
                                    -   Illegal Argument Exception, if ticks isn't a positive integer
                                    -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                    -   Illegal Argument Exception, if width or height aren't valid (numeric, positive) values 
                                        (through setWidth or setHeight)
                                    -   Illegal Argument Exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                    -   Exception, if dataDim exceeds the maximum data dimension
                                    -   Exception, if the ratio between chart's width and number of ticks is such
                                        that the computed bar height is smaller than 1 pixel
                                    -   Exception, if parent is passed but it is not a valid DOM element                
              */                              
            SlidingBarChart: function(){
                               return SlidingBarChart.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy(true);
                           },
            /** 
                @method TimeWheelChart
                @for DynamicChart
                @chainable
                
                @param {Number} ticks [Mandatory]
                                The number of values that can be drawn at the same time (<b>can't be changed later</b>)
                                Can be any value that is or can be converted to a positive integer.
                @param {String} startTime [Mandatory]
                                The reference for the label of the first point.<br>
                                Should be an incrementable value.                                
                @param {Number} width [Mandatory]
                                The desired width for the chart (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} height [Mandatory]
                                The desired height for the chart (<b>can't be changed later</b>)<br>
                                Can be any value that is or can be converted to a positive integer.
                @param {Number} [dataDim=1] [Optional]
                                The dimension of the data space, i.e. the number of subvalues for each data entry<br>
                                Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
                @param {Object} [parent=body] [Optional]
                                The DOM element to which the diagram should be appended as a child<br>
                @return {Object} A properly initialized (wrapped-in-a-proxy version of a) TimeWheelChart object
                @throws
                                    -   Illegal Argument Exception, if ticks isn't a positive integer
                                    -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                    -   Illegal Argument Exception, if width or height aren't valid (numeric, positive) values 
                                        (through setWidth or setHeight)
                                    -   Illegal Argument Exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                    -   Exception, if dataDim exceeds the maximum data dimension
                                    -   Exception, if parent is passed but it is not a valid DOM element                
              */                            
            TimeWheelChart: function(){
                               return TimeWheelChart.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy(true);
                           },                           
        };
		
		Object.freeze(modulePrototype);
		
		return Object.create(modulePrototype);
	})();

	Object.freeze(DynamicChart);
}
