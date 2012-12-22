if (!window.ChartUtils){
	/**
		Module ChartUtils
        
        Extends Object class with several useful methods to allow better encapsulation mechanisms.
        Exposes a few utility functions
        
        @module ChartUtils       
        
	*/
	var ChartUtils = (function(){
		"use strict";

		//Add a init method to Object
		if (!Object.hasOwnProperty("init")) {
        
                          /** 
                                Creates an object inheriting from a given prototype and then, if required, 
                                inits it with a list of properties tha can be passed as its second argument.
                                
                                @method init
                                @for Object
                                @param {Object} proto  The protetype to inherit from;
                                @param {Object} [properties] A dictionary of key-value properties to be used for the new object's initialization;
                                @return {Object} The newly created object.
                                @throws Error, if the wrong number of arguments is passed.
                            */
			Object.init = function (proto, properties){
				if (arguments.length !== 2){
					throw new Error('Object.init implementation only accepts 2 parameters.');
				}
				var key, new_obj = Object.create(proto);
				
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
                                        /**
                                            Deletes every property from an object
                                            
                                            @method clear
                                            @for Object
                                            @chainable
                                            @return {Object} The same object on whom this method is called.
                                          */
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
                                                
                                                    Creates and returns a safe proxy for the object passed, 
                                                    that will wrap around it and expose only those methods
                                                    marked as public (i.e. those that are declared as enumerable).
                                                    
                                                    @method createSafeProxy
                                                    @for Object
                                                    @param {Boolean} [canDestroy=false]
                                                                     States if the proxy consumer has the authority to call destroy 
                                                                     on the original object;<br>
                                                                     We assume the convention that object's uses destroy method
                                                                     as their destructor.
                                                    @return {Object} A proxy wrapping this object.
                                                    @throws  Any exception the original object pseudo-constructor might throw.
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
                /** 
                    Clears an Array, removing all its elements;
                    @method clear
                    @for Array
                    @param {Boolean} [deepClear=false] If it is required for all the array elements to be cleared,
                                                       this paramenter should be true; can  be omitted otherwise; <br>
                                                       If deep clearance is required, thie method will try to 
                                                       call the clear method for each and every element of this array
                                                       (Object class has already been extended with a clear method).
                    @return {Array} This array.
                  */
			Array.prototype.clear = function(deepClear){
                                        if (deepClear){
                                            //If a deep clear is required, try to execute clear method of every element
                                            for (var i=0; i<this.length; i++){
                                                if (Object.isFunction(this[i].clear)){
                                                    this[i].clear();
                                                }
                                            }
                                        }
                                        //Clear this array (the efficient way)
										this.length = 0;
										return this;
									};	
		}	
		
		if (!Array.prototype.map){
                                /**
                                    Maps a function on every element of the array, creting a new array populated
                                    with the results of these calls.
                                    
                                    @method map
                                    @for Array
                                    @param {Function} f The function to map on the array;
                                    @param {Object} [contest=window] The new this pointer for the function to map, if needed;
                                    @return {Array} The array of the results of mapping f over the elements this array.
                                    @throws TypeError if f isn't a function.
                                  */
			Array.prototype.map = function(f /*,contest*/){
				if (!Function.isFunction(f)){
					throw new TypeError();
				}else{
					var len = this.length;
					var res = new Array(len);
					var contest = arguments[1];
					for (var i = 0; i < len; i++){
						if (i in this){
							res[i] = f.call(contest, this[i], i, this);
						}
					}

					return res;
				}
			};	
		}

		if (!Array.prototype.sum){
                                /**
                                    Sums the elements of an array.

                                    @method sum
                                    @for Array
                                    @return {Number|String} The sum of the elements in the array;<br>
                                    <br>
                                    <b>WARNING</b>: 
                                        <ul>
                                            <li>If all the elements in the array are numbers, then returs their arithmetic sum</li>
                                            <li>If any element of the array isn't a number, returns a string obtained by concatenating
                                                the partial arithmetic sum until that element, and the concatenation
                                                of the string conversion of every other element in the array.</li>
                                        </ul>                                    
                                  */        
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
                                            
                                            @method shallowCopy
                                            @for Array
                                            @param [n] If defined, the max number of elements to copy from the current array
                                            @return {Array} A new array, with a shallow copy of all the elements in the original one.
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
                                    /** 
                                        Return the maximum element of an array.
                                        
                                        @method max
                                        @for Array
                                        @param [extract_element_key] A function that, given any element of the array, will produce
                                                                     a numeric value used for ranking the element itself (its sorting key)
                                        @return {Number|NaN} The maximum value in the array, if all elements (or their keys)
                                                             are Number;<br>
                                                             NaN otherwise
                                    */
			Array.prototype.max = function(extract_element_key){
										if (Function.isFunction(extract_element_key)){
											return Math.max.apply(Math, this.map(extract_element_key));
										}else{
											return Math.max.apply(Math, this);
										}
									};	
		}	
		
		if (!Array.prototype.min){
                                    /** 
                                        Return the minimum element of an array.
                                        
                                        @method min
                                        @for Array
                                        @param [extract_element_key]  A function that, given any element of the array, will produce
                                                                      a numeric value used for ranking the element itself (its sorting key)
                                        @return {Number|NaN} The minimum value in the array, if all elements (or their keys)
                                                             are Number;<br>
                                                             NaN otherwise
                                    */        
			Array.prototype.min = function(extract_element_key){
										if (Function.isFunction(extract_element_key)){
											return Math.min.apply(Math, this.map(extract_element_key));
										}else{
											return Math.min.apply(Math, this);
										}
									};	
		}	

        if (!Object.prototype.isArray){
            /** 
                Checks if its argument is an array.
                
                @method isArray
                @for Object
                @param {Object} obj The argument to be checked.
                @return {Boolean} True <=> the object is an Array.
            */         
        	Object.prototype.isArray = function(obj) {
				return obj && (obj.constructor === Array);
			};
        }
        
        if (!Object.prototype.isString){
            /** 
                Checks if its argument is a string.
                
                @method isString
                @for Object
                @param {Object} obj The argument to be checked.
                @return {Boolean} True <=> the object is a String.
            */          
        	Object.prototype.isString = function(arg) {
				return typeof(arg)==='string';
			};
        }    
        
        if (!Object.prototype.isFunction){
            /** 
                Checks if its argument is a Function.
                
                @method isFunction
                @for Object
                @param {Object} obj The argument to be checked.
                @return {Boolean} True <=> the object is a Function.
            */              
        	Object.prototype.isFunction = function(arg) {
				return typeof(arg) === 'function';
			};
        }        
		
        if (!Object.prototype.isNumber){
            /** 
                Checks if its argument is a Number.
                
                @method isNumber
                @for Object
                @param {Object} obj The argument to be checked.
                @return {Boolean} True <=> the object is a Number.
            */              
            Object.prototype.isNumber = function(n){
              return !isNaN(parseFloat(n)) && isFinite(n);
            };
        }        
		
        var TIME_REGEXP = /^\d\d?:\d\d?$/;
            
            
            /** formatTimeString(HH, MM)
                Format a hours, minutes couple into a proper time string<br>
                <br>
                <b>INVARIANT</b>: HH and MM must be valid, positive integers 
                                  (since it's a private method, defensive programming is avoided<br>
                           If the overcome their range, proper formatting is enforced:
                           F.i. HH=23, MM=60 -> "00:00"
                @method formatTimeString
                @for ChartUtils
                @private
                @param {Number} HH An int value (between 0 and 23), representing the hours
                @param {Number} MM An int value (between 0 and 59), representing the minutes
                            
                @return {String} The properly formatted time string.
              */                        
            function formatTimeString(HH, MM){ 
                HH = (HH + Math.floor(MM/60)) % 24;
                MM = MM % 60;
                return (HH < 10 ? "0" + HH : HH) + ":" + (MM < 10 ? "0" + MM : MM);
            } 

                              
		var utils = {

                        /** fillArray(value, n)
                            Takes a value and a positive integer n and returns an Array of n copies of that value.<br>
                            <br>
                            <b>WARNING</b>:   since shallow copy is used, only works for
                                              primitive (immutable) values                            
                            @method fillArray
                            @for ChartUtils
                            @param {String|Number} value The value to assign to each element of the newly created array.
                                                         If value is a function, it is called  n times, with no parameters
                            @param {Number} n The size of the final array;<br>
                                              Must be a positive integer.
                            @return {Array} The newly created array.
                            @throws {Invalid Argument Exception} if n isn't passed, it's not a number, or it's not positive.

                        */
			fillArray:  function(value, n){
                            n = parseInt(n, 10);
                            if (isNaN(n) || n <= 0){
                                throw "Invalid Argument: n";
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
            /** validateTimeString(timeString)
            
                Takes a string as input and checks if it is a valid
                time representation, according to the format HH:MM
                
                @method validateTimeString
                @for ChartUtils
                @param {String} timeString The string to be evaluated
                @return {Array|null} <ul>
                                        <li>An array with two integers, the values for hours and minutes
                                            <=> The input string validates successfully</li>
                                        <li>null <-> Otherwise</li>
                                    </ul>
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
                time representations, according to the format HH:MM<br>
                If it is so, sums them and returns a new string representing
                the resulting time;
                
                @method addTimeStrings
                @for ChartUtils
                @param {String} timeString_1 The first time string to be added
                @param {String} timeString_2 The second time string to be added                                                    
                @return {String} A string representation of the sum of the two timeStamps, in the format HH:MM (modulo 24 hours)
                                <=> Both strings validates successfully
                                
                @throws {Invalid Argument Exception} if either input fails to validate.
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

                                    return formatTimeString(t1[0], t1[1]);   
                                },
                                
            /** addIntToTimeString(timeString, minutes)
            
                Takes a string and an int value and checks if it is a valid
                time representation, according to the format HH:MM
                
                @method addIntToTimeString
                @for ChartUtils                
                @param {String} timeString The time string taken as initial time
                @param {Number} minutes How many minutes needs to be added to the time string;                                  
                @return {String} A string representation of the sum of the two time values, in the format HH:MM (modulo 24 hours)
                                <=> Both inputs validates successfully
                @throws {Invalid Argument Exception} if either input fails to validate
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
                                    
                                    return formatTimeString(t[0], t[1]);  
                                }                                 
		};
		Object.freeze(utils);
		return utils;
	})();
}