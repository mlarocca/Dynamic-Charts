YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "Array",
        "BasicBarChart",
        "ChartUtils",
        "DynamicChart",
        "FixedWidthBarChart",
        "Legend",
        "Object",
        "SlidingBarChart",
        "TimeWheelChart"
    ],
    "modules": [
        "ChartUtils",
        "DynamicChart"
    ],
    "allModules": [
        {
            "displayName": "ChartUtils",
            "name": "ChartUtils",
            "description": "Module ChartUtils\n        \n        Extends Object class with several useful methods to allow better encapsulation mechanisms.\n        Exposes a few utility functions"
        },
        {
            "displayName": "DynamicChart",
            "name": "DynamicChart",
            "description": "Module DynamicChart\n        \n        This module requires:\n        \n        {{#crossLinkModule \"chart_utils.js\"}}{{/crossLinkModule}}\n        {{#crossLink \"http://d3js.org/d3.v2.js\"}}{{/crossLink}} \n\n        Exposes methods for creating different types of dynamic charts:\n        * BasicBarChart\n        * FixedWidthBarChart\n        * SlidingBarChart\n        * TimeWheelChart"
        }
    ]
} };
});