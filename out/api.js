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
            "description": "Module ChartUtils\n        \nExtends Object class with several useful methods to allow better encapsulation mechanisms.\nExposes a few utility functions"
        },
        {
            "displayName": "DynamicChart",
            "name": "DynamicChart",
            "description": "Module DynamicChart\n        \nThis module requires:\n<ol>\n    <li>{{#crossLinkModule \"chart_utils.js\"}}{{/crossLinkModule}}</li>\n    <li>{{#crossLink \"http://d3js.org/d3.v2.js\"}}{{/crossLink}}</li>\n</ol>\n\nExposes methods for creating different types of dynamic charts:\n<ol>\n    <li>BasicBarChart</li>\n    <li>FixedWidthBarChart</li>\n    <li>SlidingBarChart</li>\n    <li>TimeWheelChart</li>"
        }
    ]
} };
});