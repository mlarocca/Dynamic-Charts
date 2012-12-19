//require d3.v2.js
//require chart_utils.js

if (!window.DynamicChart){
	/**
		Module DynamicChart
        Exposes methods for creating different types of dynamic charts:
        - BasicBarChart
        - FixedWidthBarChart
        - SlidingBarChart
        - TimeWheelChart
	*/
	var DynamicChart = (function (){
		"use strict";
		
        //      -----       CONSTANTS       --------
        var MAX_SPACE_DIMENSION = 10; //Maximum dimension of the input space, i.e. max number of subvalues for each single point
        //DEFAULT COLORS    
        var FILL_COLORS = ["blue", "red", "green", "orange", "purple", "cyan", "magenta", "yellow", "limegreen", "brown"];
        var DEFAULT_LABEL_SIZE = 12;
        var DEFAULT_TITLE_SIZE = 22;
        
        var LEGEND_ITEM_WIDTH = 25,
            LEGEND_ITEM_HEIGHT = 15,
            LEGEND_MARGIN = 5,
            LEGEND_ITEM_LEFT = LEGEND_MARGIN,
            LEGEND_ITEM_FONT_SIZE = 11;      
        //      -----       /CONSTANTS       --------
        
        
        //      -----       LEGEND       --------
        
        var legendPrototype = {
                            /** setPosition(left, top)
                                Sets the position of the legend in the page. Position is assumed to be absolute.
                                @param left:    [Mandatory]
                                                The horizontal position of the legend bounding box;
                                @param top:    [Mandatory]
                                                The vertical position of the legend bounding box;
                                @return:    This legend object, to allow for method chaining.
                                @throw:     Never: if either argument is not valid, simply ignores the action.
                            */
			setPosition:	function(left, top){
								left = parseInt(left, 10);
								top = parseInt(top, 10);
								if (this.divElement && !isNaN(left) && !isNaN(top)){
									this.divElement.attr("style", "position:absolute; left:" + left + "; top:"+top +";" );
								}	
                                return this;	//Method chaining support
							},	
                            
                        /** setWidth(width)
                            Sets the width of the legend box.
                            The 
                            @param width:   [Mandatory]
                                            The new width of the legend; Must be (convertable to) a positive integer;
                            @return:    This legend object, to allow for method chaining.
                            @throw:     
                                        - Illegal Argument Exception, if the argument is not valid (see above).
                        */                            
			setWidth: 	function(width){
							width = parseInt(width, 10);
							if (this.svgElement && !isNaN(width) && width >= 0){
								this.svgElement.attr("width", width);
                                this.divElement.attr("width", width);
							}else{
                                throw "Illegal Argument: width";
                            }
							return this;	//Method chaining support
						},	
                        
                        /** setHeight(height)
                            Sets the height of the legend box.
                            The 
                            @param height:   [Mandatory]
                                            The new height of the legend; Must be (convertable to) a positive integer;
                            @return:    This legend object, to allow for method chaining.
                            @throw:     
                                        - Illegal Argument Exception, if the argument is not valid (see above).
                        */                             
			setHeight: function(height){
							height = parseInt(height, 10);
							if (this.svgElement && !isNaN(height) && height >= 0){
								this.svgElement.attr("height", height);
							}else{
                                throw "Illegal Argument: height";
                            }
							return this;	//Method chaining support
						},	
                           
                        /** addItem(label, color)
                            
                            Adds an item to the legend and then redraws it;
                            
                            @param labelText:   [Mandatory]
                                                The text of the label for this new item;
                            @param labelColor:  [Manadatory]
                                                The color to be used to draw new item's label;
                            @param fillColor:   [Manadatory]
                                                The color associated with this new item;                                            
                            @return:    This legend object, to allow for method chaining;
                            @trow:
                                        - Wrong Number of arguments Exception, if either argument is missing.
                          */                        
            addItem:    function(labelText, labelColor, fillColor){
                            if (labelText === undefined || labelColor === undefined || fillColor === undefined){
                                throw "Wrong number of arguments: label and color are both mandatory";
                            }
                            this.__items__.push({labelText: labelText, labelColor: labelColor, fillColor: fillColor});
                            var n = this.__items__.length - 1;
                            this.svgElement.append("rect")
                                           .attr("stroke", "black")
                                           .attr("fill", fillColor)
                                           .attr("width", LEGEND_ITEM_WIDTH)
                                           .attr("height", LEGEND_ITEM_HEIGHT)
                                           .attr("x", LEGEND_ITEM_LEFT)
                                           .attr("y", LEGEND_MARGIN + n * (LEGEND_ITEM_HEIGHT + LEGEND_MARGIN));
                            this.svgElement.append("text")
                                           .text(labelText)
                                           .attr("fill", labelColor)
                                           .attr("x", LEGEND_ITEM_LEFT + LEGEND_ITEM_WIDTH + LEGEND_MARGIN)         //Aligns to the bottom of the rect
                                           .attr("y", n * (LEGEND_ITEM_HEIGHT + LEGEND_MARGIN) + LEGEND_ITEM_HEIGHT)
											.attr("font-family", "sans-serif")
											.attr("font-size", LEGEND_ITEM_FONT_SIZE)
                                            .attr("text-anchor", "left");                                         
                        }, 
                        /** removeItem(index)
                        
                            @param index:   [Mandatory]
                                            The index of the item to update; 
                            @return:    This legend object, to allow for method chaining;                                
                            @throw: 
                                    - Illegal Argument Exception, if index is not in its valid range.                        
                         */
            removeItem: function(index){
                            index = parseInt(index, 10);
                            if (isNaN(index) || index < 0 || index >= this.__items__.length){
                                throw "Illegal Argument: index";
                            }  
                            this.__items__.splice(index,1);
                            this.svgElement.selectAll("rect").data(this.__items__).exit().remove();
                            this.svgElement.selectAll("text").data(this.__items__).exit().remove();
                            this.__redrawLegend__();
                            return this;    //Method chaining support
                        },
                        
                        /** updateItem(index, newLabelText, newLabelColor, newFillColor)
                            
                            Updates the attributes of an item of the legend and then redraws it;
                            
                            @param index:   [Mandatory]
                                            The index of the item to update;
                            @param labelText:   [Optional]
                                                The new text for the label of the index-th item;
                                                If omitted or undefined won't be changed;
                            @param labelColor:  [Optional]
                                                The new color to be used to draw the index-th item's label;
                                                If omitted or undefined won't be changed;
                            @param fillColor:   [Optional]
                                                The new color associated with the index-th item;
                                                If omitted or undefined won't be changed;
                            @return:    This legend object, to allow for method chaining;                                
                            @throw: 
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
                            
                            WARNING: calling destroy on an object will force any further reference 
                                     to its attributes / methods to throw exceptions.
                            
                            NOTE:   This function should be override by any class inheriting from this chart.
                                    In order to properly work, any overriding destroyer should:
                                    - Free any array specific to the object on which is called;
                                    - Remove any event listener on chart objects;
                                    - Call super object's destroy method.
                            @return:    null, to state that the object has been destroyed.
                          */                        
            destroy: 	function(){
                                
                                //Deletes all the elements from object's arrays
                                this.__items__.length = 0;
                                
                                //Removes DOM objects
                                this.svgElement.remove();
                                this.divElement.remove();

                                return null;
                            }
        };
        
        /** LegendFactory(width, height [, left, top, parent])
            @private
            [Private Object, only accessible to DynamicChart classes]
            
            Creates, upon request, a new Legend object and returns it;
            
            @param width:   [Mandatory]
                            The desired width for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param height:  [Mandatory]
                            The desired height for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param left:    [Optional]
                            The horizontal position of the legend bounding box;
            @param top:    [Optional]
                            The vertical position of the legend bounding box;
            @param parent:  [Optional, default = page's body element]
                            The DOM element to which the diagram should be appended as a child
            @return:    A new Legend object;
            @throw:
                    -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                    -   Illegal Argument exception , if width or height aren't valid (numeric, positive) values 
                        (through setWidth or setHeight)
                    -   Illegal Argument exception, if dataDim is passed but it's invalid (not numeric or not positive)
                    -   Exception, if dataDim exceeds the maximum data dimension
                    -   Exception, if parent is passed but it is not a valid DOM element
        */
        function LegendFactory(width, height, left, top, parent){
            
            /** __init__(legend, width, height)
                @private
                [Private method, not visible from consumers]
                
                @param legend:  [Mandatory]
                                The legend object to be initialized;
                @param width:   [Mandatory]
                                The width of the legend object;
                @param height:  [Mandatory]
                                The height of the legend object;
                @return:    Nothing.
                @throw: 
                            -   Illegal Argument exception , if width or height aren't valid (numeric, positive) values 
                                (through setWidth or setHeight)
              */
            function __init__(legend, width, height){
                legend.setWidth(width);
                legend.setHeight(height);
                legend.setPosition(left, top);
                legend.svgElement.append("rect")
                      .attr("stroke", "black")
                      .attr("width", width)
                      .attr("fill", "none")
                      .attr("height", height);            
            }
            
            var legend = Object.create(legendPrototype);
            
        
            Object.defineProperty(legend, "__redrawLegend__", {
                    value:	function(){
                    
                                this.svgElement.selectAll("rect").data(this.__items__)
                                               .attr("stroke", "black")
                                               .attr("fill", function(item){return item.fillColor;})
                                               .attr("width", LEGEND_ITEM_WIDTH)
                                               .attr("height", LEGEND_ITEM_HEIGHT)
                                               .attr("x", LEGEND_ITEM_LEFT)
                                               .attr("y", function(item, i){return LEGEND_MARGIN + i * (LEGEND_ITEM_HEIGHT + LEGEND_MARGIN);});
                                this.svgElement.selectAll("text").data(this.__items__)
                                               .text(function(item){return item.labelText;})
                                               .attr("fill", function(item){return item.labelColor;})
                                               .attr("x", LEGEND_ITEM_LEFT + LEGEND_ITEM_WIDTH + LEGEND_MARGIN)         //Aligns to the bottom of the rect
                                               .attr("y", function(item, i){return i * (LEGEND_ITEM_HEIGHT + LEGEND_MARGIN) + LEGEND_ITEM_HEIGHT;})
                                                .attr("font-family", "sans-serif")
                                                .attr("font-size", LEGEND_ITEM_FONT_SIZE)
                                                .attr("text-anchor", "left");                      
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
                                                      */            
            Object.defineProperty(legend, "divElement", {
                    value:	div,
                    writable: false,
                    enumerable: false,
                    configurable:false                                   
            });  
                                            /**
                                                The div element that will be a container to the legend's svg element
                                              */             
            Object.defineProperty(legend, "svgElement", {
                    value:	svg,
                    writable: false,
                    enumerable: false,
                    configurable:false                                   
            });
                                          /** Array of the items contained in the legend
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

        
        //      -----       DYNAMIC CHART       --------
        

		var next_id = 0;
		var basicBarChartSharedPrototype = {
                            /** setPosition(left, top)
                                Sets the position of the chart in the page. Position is assumed to be absolute.
                                @param left:    [Mandatory]
                                                The horizontal position of the chart bounding box;
                                @param top:     [Mandatory]
                                                The vertical position of the chart bounding box;
                                @return:    This chart object, to allow for method chaining.
                                @throw:     Never: if either argument is not valid, simply ignores the action.
                            */
			setPosition:	function(left, top){
								left = parseInt(left, 10);
								top = parseInt(top, 10);
								if (this.divElement && !isNaN(left) && !isNaN(top)){
									this.divElement.attr("style", "position:absolute; left:" + left + "; top:"+top +";" );
								}	
                                return this;	//Method chaining support
							},	
                            
                        /** setWidth(width)
                            Sets the width of the chart.
                            The 
                            @param width:   [Mandatory]
                                            The new width of the chart; Must be (convertable to) a positive integer;
                            @return:    This chart object, to allow for method chaining.
                            @throw:     
                                        - Illegal Argument Exception, if the argument is not valid (see above).
                        */                            
			setWidth: 	function(width){
							width = parseInt(width, 10);
							if (this.svgElement && !isNaN(width) && width >= 0){
								this.svgElement.attr("width", width);
                                this.divElement.attr("width", width);
							}else{
                                throw "Illegal Argument: width";
                            }
							return this;	//Method chaining support
						},	
                        
                        /** setHeight(height)
                            Sets the height of the chart.
                            The 
                            @param height:   [Mandatory]
                                            The new height of the chart; Must be (convertable to) a positive integer;
                            @return:    This chart object, to allow for method chaining.
                            @throw:     
                                        - Illegal Argument Exception, if the argument is not valid (see above).
                        */                             
			setHeight: function(height){
							height = parseInt(height, 10);
							if (this.svgElement && !isNaN(height) && height >= 0){
								this.svgElement.attr("height", height);
							}else{
                                throw "Illegal Argument: height";
                            }
							return this;	//Method chaining support
						},	
                          
            setTitle:   function(title, size, color, left, top){    
                            var titleElement = this.svgElement.selectAll("text[type=title_element]");
                            
                            size = parseInt(size, 10);
                            if (!Object.isNumber(size)){
                                size = DEFAULT_TITLE_SIZE;
                            }
                            
                            left = parseInt(left, 10);
                            if (!Object.isNumber(left)){
                                left = this.svgElement.attr("width") / 2;
                            } 
                            
                            top = parseInt(top, 10);
                            if (!Object.isNumber(top)){
                                top = size;
                            }                             
                            
                            if (titleElement.empty()){
                                titleElement = this.svgElement.append("text")
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
                            
                            @param labels:  [Mandatory]
                                            An array containing exactly one label for each component of the data space.
                                            A new legend object will be created and attached to the chart, and then
                                            for every subcomponent [label] a new item will be added to the legend.
                                                    
                            @return: This chart object, to support method chaining;  
                            @throw: 
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
                            
                            @param newDataArray:    [Mandatory]
                                                    an array containing the next values that needs to be drawn in the chart;
                                                    Each array element, in order to be added to the chart, must be compliant
                                                    with the data format defined by the function __formatData__ (which 
                                                    can itself be set at runtime, and by default accepts arrays of 
                                                    __dataDim__ integers, neglecting to render the negative ones).
                                                    
                            @return: This chart object, to support method chaining;  
                            @throw: 
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
                            
                            @param formaValueFunction: [Mandatory] 
                                        The new function
                            @return:    This object, to allow for method chaining;
                            @throw:     
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
                        
                            Remove all the data or part of it from the chart;
                            @param n: [Optional, For internal use only] 
                                        The number of elements to remove from the beginning of the data array,
                                        i.e. how many of the oldest values should be removed from the chart;
                            @return:    This object, to allow for method chaining;
                            @throw:     Illegal Argument Exception, if n is passed but it isn't valid, i.e. it isn't convertible to a positive int.
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
                            
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be affected;
								@param visible: [Optional]
                                                If specified overwrites toggle behaviour and set
												the visibility to visible.
                                @return:    This chart object, to allow for method chaining
                                @throw 
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
                                    
                                        @param index:   [Optional, default = 0]
                                                        For multi-dimensional data spaces, specifies
                                                        which component is going to be affected;
                                        @return:    The visibility of the label 
                                        @throw 
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
                                
                                    Sets scaling to global
                                
                                    When data space has a dimension greater than 1 (i.e. when each data value has more than 1 component)
                                    these charts support either global scaling (relative to the whole dataset)
                                    or local scaling (relative to value of the same component) of each subcomponent.
                                    
                                    @return:    This chart object, to allow for method chaining.
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
                                
                                    Sets scaling to local
                                
                                    When data space has a dimension greater than 1 (i.e. when each data value has more than 1 component)
                                    these charts support either global scaling (relative to the whole dataset)
                                    or local scaling (relative to value of the same component) of each subcomponent.
                                    
                                    @return:    This chart object, to allow for method chaining
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
                            
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return:    The selected fill color
                                @throw 
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
                            
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return:    The selected stroke color
                                @throw 
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
                            
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return:    The selected label color
                                @throw 
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
                            
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return:    The selected size
                                @throw 
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
                            
                                @param color:   [Mandatory]
                                                The new fill color for the selected component's;
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return:    This chart object, to allow for method chaining
                                @throw 
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
                            
                                @param color:   [Mandatory]
                                                The new stroke color for the selected component's;
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return:    This chart object, to allow for method chaining
                                @throw 
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
                            
                                @param color:   [Mandatory]
                                                The new color for the selected component's labels;
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return:    This chart object, to allow for method chaining
                                @throw 
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
                            
                                @param size:    [Mandatory]
                                                The new size for the selected component's labels;
                                                Must be a positive integer, or a value that can be converted
                                                to a positive integer;
                                @param index:   [Optional, default = 0]
                                                For multi-dimensional data spaces, specifies
                                                which component is going to be selected;
                                @return:    This chart object, to allow for method chaining
                                @throw 
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
                                so this property can't be set.
                                Function is declared to improve the consistency of the interface.
                                                                
                                @throw: Read only property Exception
                              */
            setBarWidth: 	function(/*barWidth*/){
                                throw "Read only property";
                            },
                            /** getBarWidth([index])
                                
                                Gets the current bar width for this chart;
                                For this chart, bar width is computed at runtime according to the number of bars plotted;
                            
                                @param xScale:  [Optional, default = this.__xScale__]
                                                It is possible to pass a d3 scale object to get the bar width
                                                computed with respect to a different scale metric;
                                                On default, the value is computed with respect to this chart's
                                                current metric.
                                @return:    The value computed for the bar width under current object state.
                                @throw 
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
                            
                            Object's destructor: helps garbage collector freeing memory, and removes chart DOM elements.
                            
                            WARNING: calling destroy on an object will force any further reference 
                                     to its attributes / methods to throw exceptions.
                            
                            NOTE:   This function should be override by any class inheriting from this chart.
                                    In order to properly work, any overriding destroyer should:
                                    - Free any array specific to the object on which is called;
                                    - Remove any event listener on chart objects;
                                    - Call super object's destroy method.
                            @return:    null, to state that the object has been destroyed.
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
                                this.svgElement.remove();
                                this.divElement.remove();
                                
                                //Removes legend, if any
                                if (this.__legend__ && this.__legend__.destroy){
                                    this.__legend__.destroy();
                                }
                                return null;
                            }
                              
                        
		};
        
        //  ---------------------  NOT ENUMERABLE METHODS    ---------------------------------------
          
         Object.defineProperty(basicBarChartSharedPrototype, "__getDatasetLength__", {
                                /** __getDatasetLength__()  
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                    
                                    Utility function to take account of the number of points currently added to the chart
                                    @return:    How many points are stored in the dataset right now.
                                */
                        value: 	function(){
                            return this.__data__[0].length;
						},
						writable: false,
						enumerable: false,
						configurable:false
					});	
                    
        Object.defineProperty(basicBarChartSharedPrototype, "__canAppendData__", {
                                /** __canAppendData__(newDataArray)   
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                
                                    Checks that new data can be added to the chart (if the chart can represent only a limited number of points);
                                    
                                    WARNING: This function SHOULD be overriden in any class inheriting from the base class
                                    in order to handle differents needs
                                    @param newDataArray:    [Mandatory]
                                                            The array of values that should be added;
                                    @return:    The array of values that can still be added to the chart;
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
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                    
                                    Checks that the value passed corresponds to the data format allowed for the current chart;
                                    This function can be overriden in any class inheriting from the base class
                                    in order to handle differents data formats (i.e. Objects or JSON).
                                    
                                    @param value:   [Mandatory]
                                                    The value to be tested;
                                    @return:    An array with properly formatted values, each of whom converted to float
                                                     <=> value is correctly validated
                                                null <-> Otherwise
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
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                    
                                    Returns the list of the svg elements used to represent data subcomponents
                                    with the required index.
                                    I.e.:   if data space is 3-dimensional (i.e. every point has 3 components)
                                            __selectData__(data, 2) would select the svg elements representing
                                            the 2nd component of every point in data
                                    @param data:    [Mandatory]
                                                    The dataset on which selection should be applied
                                    @param index:   [Mandatory]
                                                    The index of the required component
                                                    INVARIANT:  to avoid defensive programming,
                                                                it is assumed 0 <= index < this.__dataDim__
                                    @param n:       [Optional]
                                                    The maximum number of elements to return;
                                    @return:    The proper set of d3 elements.                    
                                  */
						value: 	function(data, index, n){
                                    if (n === undefined){
                                        return this.svgElement.selectAll("rect[index=data_"+index+"]").data(data[index]);
                                    }else{
                                        return this.svgElement.selectAll("rect[index=data_"+index+"]").data(data[index].slice(0, n));
                                    }
                                },
						writable: false,
						enumerable: false,
						configurable:false
					});
                    
		Object.defineProperty(basicBarChartSharedPrototype, "__selectLabels__", {
                                /** __selectLabels__(data, index [, n])
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                    
                                    Returns the list of the svg elements used to draw the labels of
                                    subcomponents of data with the required index.
                                    I.e.:   if data space is 3-dimensional (i.e. every point has 3 components)
                                            __selectLabels__(data, 3) would select the svg elements representing
                                            the labels of the 3nd component of every point in data
                                    @param data:    [Mandatory]
                                                    The dataset on which selection should be applied;
                                    @param index:   [Mandatory]
                                                    The index of the required component;
                                                    INVARIANT:  to avoid defensive programming,
                                                                it is assumed 0 <= index < this.__dataDim__
                                    @param n:       [Optional]
                                                    The maximum number of elements to return;
                                    @return:    The proper set of d3 elements.                    
                                  */      
						value: 	function(data, index, n){
                                    if (n === undefined){
                                        return this.svgElement.selectAll("text[index=data_"+index+"]").data(data[index]);
                                    }else{
                                        return this.svgElement.selectAll("text[index=data_"+index+"]").data(data[index].slice(0, n));
                                    }
                                },
						writable: false,
						enumerable: false,
						configurable:false
					});

                    
		Object.defineProperty(basicBarChartSharedPrototype, "__drawNewData__", {
                                /** __drawNewData__(dataSet, labelsSet, dataIndex, xScale, yScale)
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                    
                                    Called by appendData() to draw the newly added points in dataSet, once for
                                    every data subcomponent.
                                    
                                    WARNING:    if you inherit from this class you might want to override both
                                                this method and __updateDrawing__ in order to obtain a custom chart.

                                                
                                    @param dataSet: [Mandatory]
                                                    The set of svg elements created so far to represent the data
                                                    WARNING: this parameter should be generated by an appropriate
                                                             call to __selectData__
                                    @param labelsSet:   [Mandatory]
                                                        The set of svg elements created so far to represent the labels of the data
                                                        WARNING: this parameter should be generated by an appropriate
                                                                call to __selectLabels__     
                                    @param dataIndex:   [Mandatory]
                                                        The index of the component of the data which is to be drawn                            
                                    @param xScale:  [Mandatory]
                                                    D3 scale object for X axis
                                    @param yScale:  [Mandatory]
                                                    D3 scale object for Y axis (specific current component)
                                    
                                    @return:    Nothing.
                                  */
						value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
									var that = this;
									var height = parseInt(this.svgElement.attr("height"), 10);
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
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                    
                                    Called by appendData() to update drawing of the points in dataSet, once for
                                    every data subcomponent.
                                    After new data is inserted by __drawNewData__, appendData performs adjustments
                                    to accomodate for scale change or shift in the drawing due to time, and this
                                    function takes care of updating and fixing the chart representation.
                                    
                                    WARNING:    if you inherit from this class you might want to override both
                                                this method and __drawNewData__ in order to obtain a custom chart.
                                    
                                    @param dataSet: [Mandatory]
                                                    The set of svg elements created so far to represent the data
                                                    WARNING: this parameter should be generated by an appropriate
                                                             call to __selectData__
                                    @param labelsSet:   [Mandatory]
                                                        The set of svg elements created so far to represent the labels of the data
                                                        WARNING:    this parameter should be generated by an appropriate
                                                                    call to __selectLabels__     
                                    @param dataIndex:   [Mandatory]
                                                        The index of the component of the data which is to be drawn                            
                                    @param xScale:      [Mandatory]
                                                        D3 scale object for X axis
                                    @param yScale:      [Mandatory]
                                                        D3 scale object for Y axis (specific current component)
                                    @return:    Nothing.
                                  */					
                        value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                    var that = this;
                                    var height = parseInt(this.svgElement.attr("height"), 10);
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
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                    
                                    Takes care of the remaining details related to the removal of part of the values from the chart,
                                    based on to the particular chart needs.
                                    
                                    WARNING:    Inherited objects MIGHT NEED to override this function
                                    
                                    @param n:   [Mandatory]
                                                Number of elements removed from the chart

                                    @return:    Nothing.
                                  */
                        value:	function(n){
                                    //Do nothing
                                    return;     //(Pseudo)Private method, no need to return this
                                },
						writable: false,
						enumerable: false,
						configurable:false
					});		
                    
			Object.defineProperty(basicBarChartSharedPrototype, "__clearDrawing__", {            
                                /** __clearDrawing__(dataSet, labelsSet)
                                    @protected
                                    [Protected method, not supposed to be used by consumers]
                                    
                                    Removes the svg objects related to the data cleared by the caller (clearData)
                                    
                                    @param dataSet: [Mandatory]
                                                    List of drawing objects (default: rects) representing data
                                    @param labelsSet:   [Mandatory]
                                                        List of labels related to data removed
                                    @return:    Nothing.
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
                                @protected
                                [Protected method, not supposed to be used by consumers]
                                
                                Computes and return the suggested value for the opacity of the bar
                                drawn to represent a certain value.
                                                                
                                @param val: [Mandatory]
                                            The value to be represented, after being normalized
                                            (scaled between 0 and 1).
                                            INVARIANT:  to avoid defensive programming,
                                                        it is assumed 0 <= val <=1                               
                                @return:    The opacity to apply to the value representation in the chart.
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
            
            Basic bar histogram chart.
            Values are represented using vertical bars;
            Each point or value can have up to 10 subcomponents, where each component can be 
            any non-nregative real number (i.e., each point can be in R_+^i, for 1 <= i <= 10).
                                            
            @param width:   [Mandatory]
                            The desired width for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param height:  [Mandatory]
                            The desired height for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param dataDim: [Optional, default = 1]
                            The dimension of the data space, i.e. the number of subvalues for each data entry
                            Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
            @param parent:  [Optional, default = page's body element]
                            The DOM element to which the diagram should be appended as a child
            @return:    A new BasicBarChart object
            @throw:
                                -   Wrong number of arguments Exception, if width or height are not passed as arguments (directly)
                                -   Illegal Argument exception , if width or height aren't valid (numeric, positive) values 
                                    (through setWidth or setHeight)
                                -   Illegal Argument exception, if dataDim is passed but it's invalid (not numeric or not positive)
                                -   Exception, if dataDim exceeds the maximum data dimension
                                -   Exception, if parent is passed but it is not a valid DOM element
          */
        function BasicBarChart(width, height, dataDim, parent){
                   

            /** __initChart__(width, height)
                @private
                [Private method]
                
                Inits the chart DIV and SVG container, setting width and height, if they are passed as arguments;
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
                @throw:     
                            - Inconsitent Chart State Exception, if the internale state of the object is compromised;
                            - Illegal Argument Exception, through setWidth or setHeight, if one of the arguments is
                                not valid.
            */
            function __initChart__(chart, width, height){
                if (!chart.svgElement || !chart.divElement){
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
                @private
                [Private method]
                
                Performs all the settings related to the data handling area of the chart;
                
                @param basicCharObj:    [Mandatory]
                                        The chart object to init;
                @param dataDim: [Optional, default = 1]
                                The dimension of the data space, i.e. the number of subvalues
                                for each data entry;
                                Can take any value that is or can be converted to an integer 
                                between 1 and MAX_SPACE_DIMENSION.
                @return:    Nothing;   
                @throw:
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
                                                     /** Dimension of the data space, 
                                                         i.e. number of subcomponents of each data "point"
                                                       */
                Object.defineProperty(basicBarChart, "__dataDim__", {
                                        value: dataDim,
                                        writable: false,
                                        enumerable: false,
                                        configurable: false
                                    });   
                                            
                                                    /** The array that will hold data, separately for each component
                                                        Initially every component's array is set to []
                                                      */
                Object.defineProperty(basicBarChart, "__data__", {
                                        value: ChartUtils.fillArray(function(){return [];}, basicBarChart.__dataDim__),
                                        writable: false,
                                        enumerable: false,
                                        configurable: false
                                    });
                                                     /** Array of maximum values for each component
                                                         (used to compute the vertical scale)
                                                         Defaults to 0
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

                                                /** The parent object to whom the chart is added
                                                  */
            Object.defineProperty(basicBarChart, "__parent__", {
                                    value: parent,
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });
            
                                                /**
                                                    The div element that will be a container to the chart's svg element
                                                  */
            Object.defineProperty(basicBarChart, "divElement", {
                                    value: div,
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });
                                
                                                /**
                                                    The chart's svg element
                                                  */                                    
            Object.defineProperty(basicBarChart, "svgElement", {
                                    value: svg,
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });

                                                /**
                                                    Scale object for the horizontal axis of the chart 
                                                    (common to all data subcomponents)
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
                                                  */                                       
            Object.defineProperty(basicBarChart, "__yScale__", {
                                    value: ChartUtils.fillArray(__yScaleGenerator__, basicBarChart.__dataDim__),
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });
                                                 /**For data space with dimension gt 1, states
                                                    if the different components should scale locally or globally
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
                                                    [Defaults to DEFAULT_LABEL_SIZE]
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
                                                    [Defaults to true]
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
                                                    [Defaults to a predefined color sequence]
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
                                                    [Defaults to black]
                                                  */                                       
            Object.defineProperty(basicBarChart, "__strokeColors__", {
                                    value: ChartUtils.fillArray("black", basicBarChart.__dataDim__),  //Default values: black
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	
                                                 /**
                                                    For each data subcomponent, stores the color to be used
                                                    to draw its labels [Defaults to black]
                                                  */                                       
            Object.defineProperty(basicBarChart, "__labelColors__", {
                                    value: ChartUtils.fillArray("black", basicBarChart.__dataDim__),  //Default values: black
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	  

                                                 /**Placeholder for a possible legend object, if the consumer
                                                    decides to add a legend to the chart;
                                                    [Defaults to null]
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
        
        /** FixedWidthBarChart(ticks, startingPoint, width, height [, dataDim, parent])
            @extends {BasicBarChart}
            Advanced Chart: FixedWidthBarChart
            Inherits from BasicBarChart redefining the drawing methods.
            As for its super class values are represented using vertical bars, and each point 
            can have up to 10 subcomponents, where each component can be any non-negative 
            real number (i.e., each point can be in R_+^i, for 1 <= i <= 10).
            
            For this chart the bar width is fixed (although can be set at run time)
            It is possible to choose between having only a fixed number of values accepted,
            or if a certain number of the oldest values should be removed when the
            chart is full.
            
            @param ticks:   [Mandatory]
                            The number of values that can be drawn at the same time (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param startingPoint:   [Mandatory, but not used at the moment: inserted for future back-compatibility]
                            The reference for the label of the first point.
                            Should be an incrementable value;
            @param width:   [Mandatory]
                            The desired width for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param height:  [Mandatory]
                            The desired height for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param dataDim: [Optional, default = 1]
                            The dimension of the data space, i.e. the number of subvalues for each data entry
                            Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
            @param parent:  [Optional, default = page's body element]
                            The DOM element to which the diagram should be appended as a child
            @return:    A new FixedWidthBarChart object
            @throw:
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
              

                                                  /** Number of different values that can be 
                                                      drawn at the same time in this chart
                                                    */
            Object.defineProperty(fixedWidthBarChart, "__ticks__", {
                                    value: ticks,
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });
                                                    /** Tick length, in minutes
                                                        [Defaults to 1]
                                                      */
            Object.defineProperty(fixedWidthBarChart, "__tickLength__", {
                                    value: 1,
                                    writable: false,
                                    enumerable: false,
                                    configurable: false
                                });	
                                                
                                                    /** When __ticks__ data points have already been plotted,
                                                        new plots would override previous ones.
                                                        Two solutions are made available:
                                                        1)  By default, new data is rejected, generating a full stack exception;
                                                        2)  A certain number of the oldest data points can be purged off the chart,
                                                            counter-clockwise rotating the data
                                                      */
            Object.defineProperty(fixedWidthBarChart, "__ticksToRemoveOnFullQueue__", {
                                    value: 0,           //By default, no previous data is cleared: new data is simply rejected
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });	   
                                

            Object.defineProperty(fixedWidthBarChart, "setFixedDataLengthMode", {
                                            /** setFixedDataLengthMode()
                                            
                                                Sets fixed data length mode.
                                                
                                                When __ticks__ data points have already been plotted,
                                                new plots would override previous ones.
                                                Two solutions are made available:
                                                1)  By default, new data is rejected, generating a full stack exception;
                                                2)  A certain number of the oldest data points can be purged off the chart,
                                                    counter-clockwise rotating the data
                                                    
                                                This function sets the first option.
                                                
                                                @return:    This chart object, to allow for methd chaining.
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
                                            
                                                Sets data shift mode.
                                                
                                                When __ticks__ data points have already been plotted,
                                                new plots would override previous ones.
                                                Two solutions are made available:
                                                1)  By default, new data is rejected, generating a full stack exception;
                                                2)  A certain number of the oldest data points can be purged off the chart,
                                                    shifting back (left) the remaining data.
                                                    
                                                This function sets the second option.
                                                @param ticksToRemove: [Mandatory]
                                                                      How much data to remove on full chart;
                                                @return:    This object, to allow for method chaining;
                                                @throw:     Illegal Argument Exception, if the argument isn't valid (see above).
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
                                                @return: the value set for __barWidth__;
                                                @override:  basicBarChartSharedPrototype.getBarWidth
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
                                            @protected
                                            [Protected method, not supposed to be used by consumers]
                                            
                                            WARNING: This function SHOULD be overriden in any class inheriting from the base class
                                                     in order to handle differents needs
                                                     
                                            @override:  basicBarChartSharedPrototype.__canAppendData__
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
                                            @protected
                                            [Protected method, not supposed to be used by consumers]
                                                                                           
                                            WARNING:    if you inherit from this class you might want to override both
                                                        this method and __updateDrawing__ in order to obtain a custom chart.

                                            @override:   basicBarChartSharedPrototype.__drawNewData__
                                          */
                                value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                            var that = this;
                                            var height = parseInt(this.svgElement.attr("height"), 10);
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
                                            @protected
                                            [Protected method, not supposed to be used by consumers]
                                            
                                            WARNING:    if you inherit from this class you might want to override both
                                                        this method and __drawNewData__ in order to obtain a custom chart.
                                                        
                                            @override:  basicBarChartSharedPrototype.__updateDrawing__
                                          */					
                                value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                            var that = this;
                                            var height = parseInt(this.svgElement.attr("height"), 10);
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
                @private
                [Private method, not visible to consumers]
                
                Inits the chart by computing the allowed barWidth;
                
                @param chart:   [Mandatory]
                                The chart object that needs initialization;                   
                @param width:   [Mandatory]
                                Chart's width;
                @param height:  [Mandatory]
                                Chart's height;                                                            
                
                @return: Nothing
              */                                    
            function __init__(chart, width, height){
                var barWidth = width / (chart.__dataDim__ * chart.__ticks__);
                if (barWidth <= 0){
                    throw "Illegal Arguments combination: width too small to draw 'ticks' values";
                }
                                            /** The width of each bar
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

        /** SlidingBarChart(ticks, width, height [, dataDim, parent])
            @extends {FixedWidthBarChart}
            
            Advanced Chart: SlidingBarChart
            Inherits from FixedWidthBarChart redefining the drawing methods.
            As for its super class values are represented using vertical bars, and each point 
            can have up to 10 subcomponents, where each component can be any non-negative 
            real number (i.e., each point can be in R_+^i, for 1 <= i <= 10).
            
            For this chart the bar width is fixed (although can be set at run time)
            It is possible to choose between having only a fixed number of values accepted,
            or if a certain number of the oldest values should be removed when the
            chart is full.
            
            Every __ticksBetweenHighlights__ values inserted (where __ticksBetweenHighlights__ can 
            be set at runtime, although it defaults to 10) the background of those values is highlighted, 
            to stress out time progression.
            
            @param ticks:   [Mandatory]
                            The number of values that can be drawn at the same time (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param width:   [Mandatory]
                            The desired width for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param height:  [Mandatory]
                            The desired height for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param dataDim: [Optional, default = 1]
                            The dimension of the data space, i.e. the number of subvalues for each data entry
                            Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
            @param parent:  [Optional, default = page's body element]
                            The DOM element to which the diagram should be appended as a child
            @return:    A new FixedWidthBarChart object
            @throw:
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
            
            var DEFAULT_BACKGROUND = "lightgrey";
            var DEFAULT_BACKGROUND_HIGHLIGHT = "lightpink";
            var AXES_LABEL_SIZE = 14;
            var AXES_LABEL_WIDTH = 50;
            var AXES_LABEL_MARGIN = 5;
            
            var proto = FixedWidthBarChart(ticks, 0, width, height, dataDim, parent);	
            var slidingBarChart = Object.create(proto);   
                                             
                                                    /** Takes track of how much data has been actually inserted into
                                                        the chart from its creation (to synch the highlighted ticks)
                                                      */
            Object.defineProperty(slidingBarChart, "__dataCounter__", {
                                value: 	0,
                                writable: true,
                                enumerable: false,
                                configurable:false
                            });
                            
                                                    /** 
                                                        Every __ticksBetweenHighlights__ ticks, the data is "higlighted"
                                                        by applying the selected highlight style to the background
                                                        [Defaults to 10]
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
                                                @return:    The number of ticks between two consecutive highlights;
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
                                                
                                                @param ticks:   [Mandatory]
                                                                The number of ticks between two consecutive highlights;
                                                @return:    This object, to allow for method chaining;
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

                                                    /** Color of the background bars
                                                        Defaults to DEFAULT_BACKGROUND ("lightgrey")
                                                      */
            Object.defineProperty(slidingBarChart, "__backgroundColor__", {
                                value: 	DEFAULT_BACKGROUND,
                                writable: true,
                                enumerable: false,
                                configurable:false
                            });

                            
                                                    /** Color of the background bars when highlighted
                                                        Defaults to DEFAULT_BACKGROUND_HIGHLIGHT ("lightpink")
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
                                                
                                                @param bgColor: [Mandatory]
                                                                The new color for background bars;
                                                @return:    This object, to allow for method chaining;
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
                                                
                                                @return: the value set for __backgroundColor__;
                                              */
                                    value: 	function(){
                                                return this.__backgroundColor__;
                                            },   
                                    writable: false,
                                    enumerable: true,
                                    configurable: false
                                });	    

            Object.defineProperty(slidingBarChart, "setBackgroundHighlightColor", {
                                            /** Changes the background color for highlighted points
                                                @param bgHColor: [Mandatory]
                                                                The new color for highlighted background bars;
                                                @return:    This object, to allow for method chaining;
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
                                            /** Returns current color for background highlighted bars 
                                                @return: the value set for __backgroundHighlightColor__;
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
                                            @protected
                                            [Protected method, not supposed to be used by consumers]
                                            
                                            WARNING: This function SHOULD be overriden in any class inheriting from the base class
                                                     in order to handle differents needs
                                                     
                                            @override:  fixedWidthBarChart.__canAppendData__
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
                                                @protected
                                                [Protected method, not supposed to be used by consumers]
                                                
                                                Returns the list of the svg elements used to draw background; 
                                                Elements can be filtered using a custom filter passad as an optional
                                                parameter;

                                                @param filter:  [Optional]
                                                                A filter to be applied to the selection;
                                                @return:    The proper set of d3 elements.                    
                                              */
                                    value: 	function(filter){
                                                if (filter === undefined){
                                                    return this.svgElement.selectAll("rect[type=back]");
                                                }else{
                                                    return this.svgElement.selectAll("rect[type=back]").filter(filter);
                                                }
                                            },
                                    writable: false,
                                    enumerable: false,
                                    configurable:false
                                });
                                
                    Object.defineProperty(slidingBarChart, "__updateBackground__", {
                                        /** __updateBackground__()
                                            @protected
                                            [Protected method, not supposed to be used by consumers]
                                            
                                            Called by __drawNewData__() to redraw the background properly
                                            
                                            WARNING:    if you inherit from this class you might want to override both
                                                        this method as well as __drawNewData__ and __updateDrawing__ 
                                                        in order to obtain a custom chart.
                                            
                                            @return:    Nothing.
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
                                            @protected
                                            [Protected method, not supposed to be used by consumers]
                                            
                                            Called by __updateDrawing__() to update the labels of the vertical axe
                                            
                                            WARNING:    if you inherit from this class you might want to override both
                                                        this method as well as __drawNewData__ and __updateDrawing__ 
                                                        in order to obtain a custom chart.
                                                        
                                            @param yScale:  [Mandatory]
                                                            D3 scale object for Y axis;
                                            @return:    The current chart object, to allow for method chaining.
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
                                            var height = parseInt(this.svgElement.attr("height"), 10);
                                            
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
                                            @protected
                                            [Protected method, not supposed to be used by consumers]
                                            
                                            WARNING:    if you inherit from this class you might want to override both
                                                        this method and __updateDrawing__ in order to obtain a custom chart.
                                                        
                                            @override:   fixedWidthBarChart.__drawNewData__
                                          */
                                value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                            var that = this;
                                            var height = parseInt(this.svgElement.attr("height"), 10);
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
                                            @protected
                                            [Protected method, not supposed to be used by consumers]
                                            
                                            WARNING:    if you inherit from this class you might want to override both
                                                        this method and __drawNewData__ in order to obtain a custom chart.
                                                        
                                            @override:  fixedWidthBarChart.__updateDrawing__
                                          */					
                                value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                            var that = this;
                                            var height = parseInt(this.svgElement.attr("height"), 10);
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
                @private
                [Private method, not visible to consumers]
                
                Inits the chart;
                
                @param chart:   [Mandatory]
                                The chart object that needs initialization;
                @param width:   [Mandatory]
                                Chart's width;
                @param height:  [Mandatory]
                                Chart's height;

                @return: This chart object (see how it's called)
                @override:  fixedWidthBarChart.__init__
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
                                        /** Width of each bar
                                            @override:  fixedWidthBarChart.__barWidth__
                                          */
                Object.defineProperty(chart, "__barWidth__", {
                                            value: barWidth,
                                            writable: false,
                                            enumerable: false,
                                            configurable: false
                                        });	  
                Object.defineProperty(chart, "__axeLeft__", {
                                            value: width - AXES_LABEL_WIDTH,
                                            writable: false,
                                            enumerable: false,
                                            configurable: false
                                        });	                                                                              
                
                //Adds the vertical axe box
                var axeArea =   chart.svgElement.append("svg")
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
        
        /** TimeWheelChart(ticks, startTime, wheelRadius, width, height [, dataDim, parent])
            @extends {FixedWidthBarChart}
            
            Advanced Chart: TimeWheelChart
            Inherits from BasicBarChart redefining the drawing methods.
            
            Data is represented as bars drawn around a time wheel.
            
            It is possible to choose between having only a fixed number of values accepted,
            or if a certain number of the oldest values should be removed when the
            chart is full.
            
            @param ticks:   [Mandatory]
                            The number of values that can be drawn at the same time (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param startTime:   [Mandatory]
                            The reference for the label of the first point.
                            Should be an incrementable value.                                
            @param width:   [Mandatory]
                            The desired width for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param height:  [Mandatory]
                            The desired height for the chart (can't be changed later)
                            Can be any value that is or can be converted to a positive integer.
            @param dataDim: [Optional, default = 1]
                            The dimension of the data space, i.e. the number of subvalues for each data entry
                            Can be any value that is or can be converted to an integer between 1 and MAX_SPACE_DIMENSION.
            @param parent:  [Optional, default = page's body element]
                            The DOM element to which the diagram should be appended as a child
            @return:    A new TimeWheelChart object
            @throw:
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
                                                      /** Label stating the time corresponding to the first tick
                                                        */
                Object.defineProperty(timeWheelChart, "__startTime__", {
                                        value: 	startTime,
                                        writable: true,
                                        enumerable: false,
                                        configurable: false
                                    });
            }
                                                  /** Size in points of the static labels showing time references on the wheel
                                                    */
            Object.defineProperty(timeWheelChart, "__timeWheelLabelsSize__", {
                                    value: 	timeWheelChart.getLabelsSize(0),  //Use the default value for value labels
                                    writable: true,
                                    enumerable: false,
                                    configurable: false
                                });
                                
            Object.defineProperty(timeWheelChart, "setTimeWheelLabelsSize", {
                                            /** setTimeWheelLabelsSize(size)
                                            
                                                Sets the size of the labels used for the wheel
                                                
                                                @param size:    [Mandatory]
                                                                The new size for the labels (must be an integer gt zero);
                                                @return:    This chart object, to allow for method chaining;
                                                @throw:    
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
                                                    /** Color used for the static part of the wheel
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
                                                of the time wheel
                                                
                                                @param color:   [Mandatory]
                                                                The new forecolor for the wheel;
                                                @return:    This chart object, to allow for method chaining;
                                                @throw:    
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
                                                @protected
                                                [Protected method, not supposed to be used by consumers]
                                                Checks whether or not the labels showing time references on the wheel
                                                should be drawn
                                                
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
                                            
                                                Sets the width of this chart's bars
                                                
                                                @param barWidth: [Mandatory]
                                                                 The new bar width to be set;
                                                                 Can be a positive number or its base 10 string representation.
                                                @return:    This object, to allow for method chaining;
                                                @throw:     Illegal Argument Exception, if the argument isn't valid (see above).
                                                @override:  basicBarChartSharedPrototype.setBarWidth
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
                                
                                @param cx, cy:  [Mandatory]
                                                x and y coordinates of the new center;
                                @return:    This chart object, to allow for method chaining;
                                @throw:     
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
                                @protected
                                [Protected method, not supposed to be used by consumers]
                                
                                When the center of the time wheel is moved,
                                then takes care of all the updates needed for the chart
                                
                                @param cx, cy:  [Mandatory]
                                                The new center coordinates;
                                @return:    Nothing.
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
                                @protected
                                [Protected method, not supposed to be used by consumers]
                                                                               
                                WARNING:    if you inherit from this class you might want to override both
                                            this method and __updateDrawing__ in order to obtain a custom chart.
                                            
                                @override:   fixedWidthBarChart.__drawNewData__
                              */                
                    value: 	function(dataSet, labelsSet, dataIndex, xScale, yScale){
                                
                                var that = this;
                                //var height = parseInt(this.svgElement.attr("height"), 10);
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
                                @protected
                                [Protected method, not supposed to be used by consumers]
                                
                                WARNING:    if you inherit from this class you might want to override both
                                            this method and __drawNewData__ in order to obtain a custom chart.
                                            
                                @override:  fixedWidthBarChart.__updateDrawing__
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
                                @protected
                                [Protected method, not supposed to be used by consumers]
                                
                                WARNING:    Inherited objects MIGHT NEED to override this function
                                
                                @override: basicBarChartSharedPrototype.__onClearData__
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
                                @protected
                                [Protected method, not supposed to be used by consumers]
                                
                                Updates the drawing of the static elements of the wheel
                                
                                WARNING:    Inherited objects MIGHT NEED to override this function

                                @return:    Nothing.
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
                                
                                Object's destructor: helps garbage collector freeing memory, and removes chart DOM elements.
                                
                                WARNING: calling destroy on an object will force any further reference 
                                         to its attributes / methods to throw exceptions.
                                
                                NOTE:   This function should be override by any class inheriting from this chart.
                                        In order to properly work, any overriding destroyer should:
                                        - Free any array specific to the object on which is called;
                                        - Remove any event listener on chart objects;
                                        - Call super object's destroy method.
                                @return:    null, to state that the object has been destroyed.
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
                @private
                [Private method, not visible to consumers]
                
                Inits the chart;
                
                @param chart:   [Mandatory]
                                The chart that need initialization;
                @param width:   [Mandatory]
                                Chart's width;
                @param height:  [Mandatory]
                                Chart's height;
                @param wheelRadius:  [Mandatory]   
                                     Wheel inner radius;
                @return: This chart object (see how it's called)
                @override:  fixedWidthBarChart.3
              */      
            function __init__(chart, width, height, wheelRadius){
                //Computes drawing related object contants
                                            /** Chart's bars' width, in pixel
                                                Defaults to 8, can be changed at runtime

                                                @override:  fixedWidthBarChart.__barWidth__  
                                              */
                Object.defineProperty(chart, "__barWidth__", {
                                            value: 8,
                                            writable: false,
                                            enumerable: false,
                                            configurable: false
                                        });	
                                            /** X coordinate of the center of the wheel
                                                Defaults to the horizontal center of the chart
                                                Can be changed at runtime
                                              */
                Object.defineProperty(chart, "__cx__", {
                                            value: width / 2, //Aligns left by default
                                            writable: true,                     //to allow enough space for the legend
                                            enumerable: false,
                                            configurable:false
                                        });
                                        
                                            /** Y coordinate of the center of the wheel
                                                Defaults to the vertical center of the chart
                                                Can be changed at runtime
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
                                                /** Radius of the wheel
                                                    CAN NOT be changed at runtime
                                                  */
                    Object.defineProperty(chart, "__r__", {
                                                value: wheelRadius,
                                                writable: false,
                                                enumerable: false,
                                                configurable:false
                                            }); 
                                                /** Maximum height for each bar
                                                    CAN NOT be changed at runtime
                                                  */                                                                    
                    Object.defineProperty(chart, "__barHeight__", {
                                                value: ((Math.min(width, height) - 2 * wheelRadius) / 2) * 0.75,
                                                writable: false,
                                                enumerable: false,
                                                configurable:false
                                            });                                                                     
                    
                }else{
                    //...Otherwise makes the radius 3/4 of the available height;
                                                /** Maximum height for each bar
                                                    CAN NOT be changed at runtime
                                                  */                                            
                    Object.defineProperty(chart, "__barHeight__", {
                                                value: Math.min(width, height) / 4,
                                                writable: false,
                                                enumerable: false,
                                                configurable:false
                                            });     
                                                /** Radius of the wheel
                                                    CAN NOT be changed at runtime
                                                  */                                                                    
                    Object.defineProperty(chart, "__r__", {
                                                value: this.__barHeight__ * 0.75,
                                                writable: false,
                                                enumerable: false,
                                                configurable:false
                                            });  
                }
                
                //Modify the range for each of the data components
                for (var i=0; i < chart.__dataDim__; i++){
                    chart.__yScale__[i].range([0, chart.__barHeight__]);
                }
                
                //Computes the angle between two consecutive ticks
                Object.defineProperty(chart, "__tickStep__", {
                                            value: Math.PI / (chart.__ticks__), // == 2 * Math.PI / (chart.__ticks__ * 2)
                                            writable: false,
                                            enumerable: false,
                                            configurable:false
                                        });   
                
                var     initial_x = chart.__cx__ - chart.__r__, 
                        initial_y = chart.__cy__ - chart.__r__;
                                            /** The actual wheel graphic object
                                              */
                Object.defineProperty(chart, "__wheel__", {
                                            value: chart.svgElement.append("svg")
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

                                                /** Set of labels for wheel's time references
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
            BasicBarChart: function(){
                               return BasicBarChart.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy();
                           },
            FixedWidthBarChart: function(){
                               return FixedWidthBarChart.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy();
                           },
            SlidingBarChart: function(){
                               return SlidingBarChart.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy();
                           },
            TimeWheelChart: function(){
                               return TimeWheelChart.apply(null, Array.prototype.slice.apply(arguments, [0])).createSafeProxy();
                           },                           
        };
		
		Object.freeze(modulePrototype);
		
		return Object.create(modulePrototype);
	})();

	Object.freeze(DynamicChart);
}