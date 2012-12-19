if (!window.ChartUtils){
	/**
		module ChartUtils       
	*/
	var ChartUtils = (function(){
		"use strict";

		//Add a init method to Object
		if (!Object.hasOwnProperty("init")) {
			Object.init = function (o, properties){
				if (arguments.length !== 2){
					throw new Error('Object.init implementation only accepts 2 parameters.');
				}
				var key, new_obj = Object.create(o);
				
				if (properties){
					for (key in properties){
						if (properties.hasHownProperty(key)){
							Object.defineProperty(new_obj, key, {
									value: properties[key],
									writable: true,
									enumerable: true,
									configurable: false
								}
							);
						}
					}
				}
				return new_obj;
			};
		}
		
		if (Object.prototype.clear){
			Object.prototype.clear = 	function(){
											for (var prop in this){
												if (this.hasOwnProperty(prop)){
													delete this[prop]; 
												}
											}
											return this;
										};
		
		}

        if (!Object.prototype.createSafeProxy){
                                                /** createSafeProxy()
                                                
                                                    Creates and returns a safe proxy for the object passed
                                                    that will wrap around it and expose only those methods
                                                    that are declared as enumerable.
                                                    
                                                    @param {boolean, default=false} CanDestroy 
                                                                     States if the proxy consumer has the authority to call destroy 
                                                                     on the original object
                                                    
                                                    @return {Object} A proxy wrapping this object;
                                                    @throw  Any exception the original object pseudo-constructor might throw.
                                                  */
            Object.prototype.createSafeProxy = function(canDestroy){
                var property;
                var proxy = Object.create(null);
                var obj = this; //We must retain the "this" pointer to the current object to use it inside different contexts
                
                for (property in obj){
                    //DO NOT check hasOwnProperty: the proxy must work for obj's prototype methods as well
                    //ONLY enumerable methods will be added to proxy's interface
                    if (Object.isFunction(obj[property])){
                        
                        //If it's a method not marked as protected, it is added to the proxy interface;
                        proxy[property] = ( function(p){
                                                return  function(){
                                                            var result;
                                                            if (obj){
                                                                result = obj[p].apply(obj, Array.prototype.slice.apply(arguments, [0]));
                                                                //Special care is needed to support method chaining
                                                                if (result === obj){
                                                                    //obj.property returns obj itself, but we must return this proxy instead;
                                                                    return proxy;
                                                                }else{
                                                                    return result;
                                                                }
                                                            }else{
                                                                throw "Null reference: the object has been already destroyed";
                                                            }
                                                        };
                                            })(property);
                    }
                }
                
                //Adds a wrapping destroy method to allow withdrawal of the privileges given up introducing 
                //the consumer to obj;
                proxy.destroy = function(){
                                    try{
                                        if (canDestroy){
                                            obj.destroy();  //Destroys the original object only if authorized to
                                        }
                                    }finally{
                                        obj = null;
                                    }
                                };
                                    
                return proxy;
            };
        }        
        
		if (Array.prototype.clear){
			Array.prototype.clear = function(){
										this.length = 0;
										return this;
									};	
		}	
		
		if (!Array.prototype.map){
			Array.prototype.map = function(extract_element_val /*,A*/){
				if (!Function.isFunction(extract_element_val)){
					throw new TypeError();
				}else{
					var len = this.length;
					var res = new Array(len);
					var A = arguments[1];
					for (var i = 0; i < len; i++){
						if (i in this){
							res[i] = extract_element_val.call(A, this[i], i, this);
						}
					}

					return res;
				}
			};	
		}

		if (!Array.prototype.sum){
			Array.prototype.sum = function(){
                var len = this.length;
                var res = 0;
                for (var i = 0; i < len; i++){
                    res += this[i];
                }

                return res;
				
			};	
		}       

        
		if (!Array.prototype.shallowCopy){
                                        /** Array.shallowCopy([n])
                                            Creates a new array (shallow) copying the elements of the current one
                                            @param n:   [Optional]
                                                        If defined, the max number of elements to copy from the current array
                                        */
			Array.prototype.shallowCopy =  function(n){
                                                var len = this.length;
                                                if (n === undefined){
                                                    n = len;
                                                }else{
                                                    n = parseInt(n, 10);
                                                    if (isNaN(n) || n <= 0){
                                                        throw "Invalid argument: n";
                                                    }else{
                                                        n = Math.min(n, len);
                                                    }
                                                }
                                                
                                                var res = new Array(n);
                                                for (var i = 0; i < n; i++){
                                                    res[i] = this[i];
                                                }

                                                return res;
                                            };	
		}	        
		
		if (!Array.prototype.max){
			Array.prototype.max = function(extract_element_val){
										if (Function.isFunction(extract_element_val)){
											return Math.max.apply(Math, this.map(extract_element_val));
										}else{
											return Math.max.apply(Math, this);
										}
									};	
		}	
		
		if (!Array.prototype.min){
			Array.prototype.min = function(extract_element_val){
										if (Function.isFunction(extract_element_val)){
											return Math.min.apply(Math, this.map(extract_element_val));
										}else{
											return Math.min.apply(Math, this);
										}
									};	
		}	

        if (!Object.prototype.isArray){
        	Object.prototype.isArray = function(obj) {
				return obj && (obj.constructor === Array);
			};
        }
        
        if (!Object.prototype.isString){
        	Object.prototype.isString = function(arg) {
				return typeof(arg)==='string';
			};
        }    
        
        if (!Object.prototype.isFunction){
        	Object.prototype.isFunction = function(arg) {
				return typeof(arg) === 'function';
			};
        }        
		
        if (!Object.prototype.isNumber){
            Object.prototype.isNumber = function(n){
              return !isNaN(parseFloat(n)) && isFinite(n);
            };
        }        
		
        var TIME_REGEXP = /^\d\d?:\d\d?$/;
            
		var utils = {

                        /** fillArray(value, n)
                            Takes a value and a positive integer and returns an Array of n copies of that value
                            @param value:   [Mandatory]
                                            The value to assign to each element of the newly created array.
                                            If value is a function, it is called  n times, with no parameters
                            @param n:   [Mandatory]
                                        The size of the final array;
                                            WARNING:   since shallow copy is used, only works for
                                                                            primitive (immutable) values
                        */
			fillArray:  function(value, n){
                            n = parseInt(n, 10);
                            if (isNaN(n) || n <= 0){
                                throw "Invalid argument: n";
                            }

                            var i, res = new Array(n);
                            if (Function.isFunction(value)){
                                for (i = 0; i < n; i++){
                                    res[i] = value();
                                }                            
                            }else{
                                for (i = 0; i < n; i++){
                                    res[i] = value;
                                }
                            }

                            return res;
                        },
                            /** formatTimeString(HH, MM)
                                Format a hours, minutes couple into a proper time string
                                INVARIANT: HH and MM are valid, positive integers
                                           If the overcome their range, proper formatting is enforced:
                                           F.i. 23,60 -> "00:00"
                                
                                @param HH:  [Mandatory]
                                            An int value (between 0 and 23), representing the hours
                                @param MM:  [Mandatory]
                                            An int value (between 0 and 59), representing the minutes
                                            
                                @return:    - An array with two integers, the values for hours and minutes
                                                <=> The string validates successfully
                                            - null <-> Otherwise
                              */                        
            formatTimeString:   function(HH, MM){ 
                                    HH = (HH + Math.floor(MM/60)) % 24;
                                    MM = MM % 60;
                                    return (HH < 10 ? "0" + HH : HH) + ":" + (MM < 10 ? "0" + MM : MM);
                                }, 
                            /** validateTimeString(timeString)
                                Takes a string as input and checks if it is a valid
                                time representation, according to the format HH:MM
                                @param timeString: [Mandatory]
                                                    The string to be evaluated
                                @return:    - An array with two integers, the values for hours and minutes
                                                <=> The string validates successfully
                                            - null <-> Otherwise
                              */
            validateTimeString:     function(timeString){
                                        if (!TIME_REGEXP.test(timeString)){
                                            return null;
                                        }//else, the formatting is fine, but we MUST check the values (i.e.: HH < 24, MM < 60
                                        var v = timeString.split(":").map(function(s){return parseInt(s, 10);});
                                        if (v[0] >= 24 || v[1] >= 60){
                                            return null;
                                        }else{
                                            return  v;
                                        }
                                    },
                        
                            /** addTimeStrings(timeString_1, timeString_2)
                                Takes two strings as input and checks if they are valid
                                time representations, according to the format HH:MM
                                If it is so, sums them and returns a new string representing
                                the resulting time;
                                
                                @param timeString_1:    [Mandatory]
                                                        The first time string to be added
                                @param timeString_2:    [Mandatory]
                                                        The second time string to be added                                                    
                                @return:    - A string representation of the sum of the two timeStamps, in the format HH:MM (modulo 24 hours)
                                                <=> Both strings validates successfully
                                @throw:     
                                            - Invalid Argument Exception, if either input fails to validate
                              */
            addTimeStrings:     function(timeString_1, timeString_2){
                                    var t1 = this.validateTimeString(timeString_1);
                                    
                                    if (!t1){
                                            throw "Invalid Argument: timeString_1";
                                    }
                                    var t2 = this.validateTimeString(timeString_2);
                                    
                                    if (!t2){
                                            throw "Invalid Argument: timeString_2";
                                    }
                                    //INVARIANT: either validateTimeString returns null, or it returns an array with integers;
                                    t1[1] += t2[1];
                                    t1[0] += t2[0];

                                    return this.formatTimeString(t1[0], t1[1]);   
                                },
                            /** addIntToTimeString(timeString, minutes)
                                Takes a string and an int value and checks if it is a valid
                                time representation, according to the format HH:MM
                                @param timeString:    [Mandatory]
                                                      The time string taken as initial time
                                @param minutes:     [Mandatory]
                                                    Minutes to be added to the time string                                                    
                                @return:    - A string representation of the sum of the two time values, in the format HH:MM (modulo 24 hours)
                                                <=> Both inputs validates successfully
                                @throw:     
                                            - Invalid Argument Exception, if either input fails to validate
                              */
            addIntToTimeString:     function(timeString, minutes){
                                    var t = this.validateTimeString(timeString);
                                    
                                    if (!t){
                                        throw "Invalid Argument: timeString";
                                    }
                                    
                                    if (minutes < 0){
                                        throw "Invalid Argument: minutes";
                                    }
                                    //INVARIANT: either validateTimeString returns null, or it returns an array with integers;
                                    t[1] += minutes;
                                    
                                    return this.formatTimeString(t[0], t[1]);  
                                }                                 
		};
		Object.freeze(utils);
		return utils;
	})();
}