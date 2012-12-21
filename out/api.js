YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "BasicBarChart",
        "DynamicChart",
        "FixedWidthBarChart",
        "Legend"
    ],
    "modules": [
        "DynamicChart"
    ],
    "allModules": [
        {
            "displayName": "DynamicChart",
            "name": "DynamicChart",
            "description": "Module DynamicChart\n\n        This module requires:\n        \n        {{#crossLinkModule \"chart_utils.js\"}}{{/crossLinkModule}}\n        {{#crossLink \"http://d3js.org/d3.v2.js\"}}{{/crossLink}} \n\n        Exposes methods for creating different types of dynamic charts:\n        * BasicBarChart\n        * FixedWidthBarChart\n        * SlidingBarChart\n        * TimeWheelChart"
        }
    ]
} };
});