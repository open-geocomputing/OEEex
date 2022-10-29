//https://code.earthengine.google.com/d33816b63fc18684c744b1fcbac56b25
var OEEexidString=document.currentScript.src.match("([a-z]{32})")[0];
const consolePlotlyExtensionPrefix='OEEex_AddonPlotly';
var plotPosition=0;
var EECache={};

const listPlotlyEvent=["plotly_click","plotly_hover","plotly_unhover","plotly_selecting","plotly_selected","plotly_legendclick","plotly_legenddoubleclick","plotly_restyle","plotly_relayout","plotly_deselect","plotly_doubleclick","plotly_redraw","plotly_animated"];

var dynamicPlotly=false;

if(typeof OEEexEscapeURL == 'undefined'){
    OEEexEscapeURL = trustedTypes.createPolicy("OEEexEscapeURL", {
      createScriptURL: (string, sink) => string
    });
}

if(typeof OEEexEscape == 'undefined'){
    OEEexEscape = trustedTypes.createPolicy("OEEexEscape", {
      createHTML: (string, sink) => string
    });
}

function isPromise(p) {
  if (typeof p === 'object' && typeof p.then === 'function') {
    return true;
  }

  return false;
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
}

const plotlyDarkTemplate = {
    "data": {
        "barpolar": [
            {
                "marker": {
                    "line": {
                        "color": "#1d1f21",
                        "width": 0.5
                    },
                    "pattern": {
                        "fillmode": "overlay",
                        "size": 10,
                        "solidity": 0.2
                    }
                },
                "type": "barpolar"
            }
        ],
        "bar": [
            {
                "error_x": {
                    "color": "#f2f5fa"
                },
                "error_y": {
                    "color": "#f2f5fa"
                },
                "marker": {
                    "line": {
                        "color": "#1d1f21",
                        "width": 0.5
                    },
                    "pattern": {
                        "fillmode": "overlay",
                        "size": 10,
                        "solidity": 0.2
                    }
                },
                "type": "bar"
            }
        ],
        "carpet": [
            {
                "aaxis": {
                    "endlinecolor": "#A2B1C6",
                    "gridcolor": "#506784",
                    "linecolor": "#506784",
                    "minorgridcolor": "#506784",
                    "startlinecolor": "#A2B1C6"
                },
                "baxis": {
                    "endlinecolor": "#A2B1C6",
                    "gridcolor": "#506784",
                    "linecolor": "#506784",
                    "minorgridcolor": "#506784",
                    "startlinecolor": "#A2B1C6"
                },
                "type": "carpet"
            }
        ],
        "choropleth": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "type": "choropleth"
            }
        ],
        "contourcarpet": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "type": "contourcarpet"
            }
        ],
        "contour": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "colorscale": [
                    [
                        0.0,
                        "#0d0887"
                    ],
                    [
                        0.1111111111111111,
                        "#46039f"
                    ],
                    [
                        0.2222222222222222,
                        "#7201a8"
                    ],
                    [
                        0.3333333333333333,
                        "#9c179e"
                    ],
                    [
                        0.4444444444444444,
                        "#bd3786"
                    ],
                    [
                        0.5555555555555556,
                        "#d8576b"
                    ],
                    [
                        0.6666666666666666,
                        "#ed7953"
                    ],
                    [
                        0.7777777777777778,
                        "#fb9f3a"
                    ],
                    [
                        0.8888888888888888,
                        "#fdca26"
                    ],
                    [
                        1.0,
                        "#f0f921"
                    ]
                ],
                "type": "contour"
            }
        ],
        "heatmapgl": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "colorscale": [
                    [
                        0.0,
                        "#0d0887"
                    ],
                    [
                        0.1111111111111111,
                        "#46039f"
                    ],
                    [
                        0.2222222222222222,
                        "#7201a8"
                    ],
                    [
                        0.3333333333333333,
                        "#9c179e"
                    ],
                    [
                        0.4444444444444444,
                        "#bd3786"
                    ],
                    [
                        0.5555555555555556,
                        "#d8576b"
                    ],
                    [
                        0.6666666666666666,
                        "#ed7953"
                    ],
                    [
                        0.7777777777777778,
                        "#fb9f3a"
                    ],
                    [
                        0.8888888888888888,
                        "#fdca26"
                    ],
                    [
                        1.0,
                        "#f0f921"
                    ]
                ],
                "type": "heatmapgl"
            }
        ],
        "heatmap": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "colorscale": [
                    [
                        0.0,
                        "#0d0887"
                    ],
                    [
                        0.1111111111111111,
                        "#46039f"
                    ],
                    [
                        0.2222222222222222,
                        "#7201a8"
                    ],
                    [
                        0.3333333333333333,
                        "#9c179e"
                    ],
                    [
                        0.4444444444444444,
                        "#bd3786"
                    ],
                    [
                        0.5555555555555556,
                        "#d8576b"
                    ],
                    [
                        0.6666666666666666,
                        "#ed7953"
                    ],
                    [
                        0.7777777777777778,
                        "#fb9f3a"
                    ],
                    [
                        0.8888888888888888,
                        "#fdca26"
                    ],
                    [
                        1.0,
                        "#f0f921"
                    ]
                ],
                "type": "heatmap"
            }
        ],
        "histogram2dcontour": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "colorscale": [
                    [
                        0.0,
                        "#0d0887"
                    ],
                    [
                        0.1111111111111111,
                        "#46039f"
                    ],
                    [
                        0.2222222222222222,
                        "#7201a8"
                    ],
                    [
                        0.3333333333333333,
                        "#9c179e"
                    ],
                    [
                        0.4444444444444444,
                        "#bd3786"
                    ],
                    [
                        0.5555555555555556,
                        "#d8576b"
                    ],
                    [
                        0.6666666666666666,
                        "#ed7953"
                    ],
                    [
                        0.7777777777777778,
                        "#fb9f3a"
                    ],
                    [
                        0.8888888888888888,
                        "#fdca26"
                    ],
                    [
                        1.0,
                        "#f0f921"
                    ]
                ],
                "type": "histogram2dcontour"
            }
        ],
        "histogram2d": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "colorscale": [
                    [
                        0.0,
                        "#0d0887"
                    ],
                    [
                        0.1111111111111111,
                        "#46039f"
                    ],
                    [
                        0.2222222222222222,
                        "#7201a8"
                    ],
                    [
                        0.3333333333333333,
                        "#9c179e"
                    ],
                    [
                        0.4444444444444444,
                        "#bd3786"
                    ],
                    [
                        0.5555555555555556,
                        "#d8576b"
                    ],
                    [
                        0.6666666666666666,
                        "#ed7953"
                    ],
                    [
                        0.7777777777777778,
                        "#fb9f3a"
                    ],
                    [
                        0.8888888888888888,
                        "#fdca26"
                    ],
                    [
                        1.0,
                        "#f0f921"
                    ]
                ],
                "type": "histogram2d"
            }
        ],
        "histogram": [
            {
                "marker": {
                    "pattern": {
                        "fillmode": "overlay",
                        "size": 10,
                        "solidity": 0.2
                    }
                },
                "type": "histogram"
            }
        ],
        "mesh3d": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "type": "mesh3d"
            }
        ],
        "parcoords": [
            {
                "line": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "type": "parcoords"
            }
        ],
        "pie": [
            {
                "automargin": true,
                "type": "pie"
            }
        ],
        "scatter3d": [
            {
                "line": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "marker": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "type": "scatter3d"
            }
        ],
        "scattercarpet": [
            {
                "marker": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "type": "scattercarpet"
            }
        ],
        "scattergeo": [
            {
                "marker": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "type": "scattergeo"
            }
        ],
        "scattergl": [
            {
                "marker": {
                    "line": {
                        "color": "#283442"
                    }
                },
                "type": "scattergl"
            }
        ],
        "scattermapbox": [
            {
                "marker": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "type": "scattermapbox"
            }
        ],
        "scatterpolargl": [
            {
                "marker": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "type": "scatterpolargl"
            }
        ],
        "scatterpolar": [
            {
                "marker": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "type": "scatterpolar"
            }
        ],
        "scatter": [
            {
                "marker": {
                    "line": {
                        "color": "#283442"
                    }
                },
                "type": "scatter"
            }
        ],
        "scatterternary": [
            {
                "marker": {
                    "colorbar": {
                        "outlinewidth": 0,
                        "ticks": ""
                    }
                },
                "type": "scatterternary"
            }
        ],
        "surface": [
            {
                "colorbar": {
                    "outlinewidth": 0,
                    "ticks": ""
                },
                "colorscale": [
                    [
                        0.0,
                        "#0d0887"
                    ],
                    [
                        0.1111111111111111,
                        "#46039f"
                    ],
                    [
                        0.2222222222222222,
                        "#7201a8"
                    ],
                    [
                        0.3333333333333333,
                        "#9c179e"
                    ],
                    [
                        0.4444444444444444,
                        "#bd3786"
                    ],
                    [
                        0.5555555555555556,
                        "#d8576b"
                    ],
                    [
                        0.6666666666666666,
                        "#ed7953"
                    ],
                    [
                        0.7777777777777778,
                        "#fb9f3a"
                    ],
                    [
                        0.8888888888888888,
                        "#fdca26"
                    ],
                    [
                        1.0,
                        "#f0f921"
                    ]
                ],
                "type": "surface"
            }
        ],
        "table": [
            {
                "cells": {
                    "fill": {
                        "color": "#506784"
                    },
                    "line": {
                        "color": "#1d1f21"
                    }
                },
                "header": {
                    "fill": {
                        "color": "#2a3f5f"
                    },
                    "line": {
                        "color": "#1d1f21"
                    }
                },
                "type": "table"
            }
        ]
    },
    "layout": {
        "annotationdefaults": {
            "arrowcolor": "#f2f5fa",
            "arrowhead": 0,
            "arrowwidth": 1
        },
        "autotypenumbers": "strict",
        "coloraxis": {
            "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
            }
        },
        "colorscale": {
            "diverging": [
                [
                    0,
                    "#8e0152"
                ],
                [
                    0.1,
                    "#c51b7d"
                ],
                [
                    0.2,
                    "#de77ae"
                ],
                [
                    0.3,
                    "#f1b6da"
                ],
                [
                    0.4,
                    "#fde0ef"
                ],
                [
                    0.5,
                    "#f7f7f7"
                ],
                [
                    0.6,
                    "#e6f5d0"
                ],
                [
                    0.7,
                    "#b8e186"
                ],
                [
                    0.8,
                    "#7fbc41"
                ],
                [
                    0.9,
                    "#4d9221"
                ],
                [
                    1,
                    "#276419"
                ]
            ],
            "sequential": [
                [
                    0.0,
                    "#0d0887"
                ],
                [
                    0.1111111111111111,
                    "#46039f"
                ],
                [
                    0.2222222222222222,
                    "#7201a8"
                ],
                [
                    0.3333333333333333,
                    "#9c179e"
                ],
                [
                    0.4444444444444444,
                    "#bd3786"
                ],
                [
                    0.5555555555555556,
                    "#d8576b"
                ],
                [
                    0.6666666666666666,
                    "#ed7953"
                ],
                [
                    0.7777777777777778,
                    "#fb9f3a"
                ],
                [
                    0.8888888888888888,
                    "#fdca26"
                ],
                [
                    1.0,
                    "#f0f921"
                ]
            ],
            "sequentialminus": [
                [
                    0.0,
                    "#0d0887"
                ],
                [
                    0.1111111111111111,
                    "#46039f"
                ],
                [
                    0.2222222222222222,
                    "#7201a8"
                ],
                [
                    0.3333333333333333,
                    "#9c179e"
                ],
                [
                    0.4444444444444444,
                    "#bd3786"
                ],
                [
                    0.5555555555555556,
                    "#d8576b"
                ],
                [
                    0.6666666666666666,
                    "#ed7953"
                ],
                [
                    0.7777777777777778,
                    "#fb9f3a"
                ],
                [
                    0.8888888888888888,
                    "#fdca26"
                ],
                [
                    1.0,
                    "#f0f921"
                ]
            ]
        },
        "colorway": [
            "#636efa",
            "#EF553B",
            "#00cc96",
            "#ab63fa",
            "#FFA15A",
            "#19d3f3",
            "#FF6692",
            "#B6E880",
            "#FF97FF",
            "#FECB52"
        ],
        "font": {
            "color": "#f2f5fa"
        },
        "geo": {
            "bgcolor": "#1d1f21",
            "lakecolor": "#1d1f21",
            "landcolor": "#1d1f21",
            "showlakes": true,
            "showland": true,
            "subunitcolor": "#506784"
        },
        "hoverlabel": {
            "align": "left"
        },
        "hovermode": "closest",
        "mapbox": {
            "style": "dark"
        },
        "paper_bgcolor": "#1d1f21",
        "plot_bgcolor": "#1d1f21",
        "polar": {
            "angularaxis": {
                "gridcolor": "#506784",
                "linecolor": "#506784",
                "ticks": ""
            },
            "bgcolor": "#1d1f21",
            "radialaxis": {
                "gridcolor": "#506784",
                "linecolor": "#506784",
                "ticks": ""
            }
        },
        "scene": {
            "xaxis": {
                "backgroundcolor": "#1d1f21",
                "gridcolor": "#506784",
                "gridwidth": 2,
                "linecolor": "#506784",
                "showbackground": true,
                "ticks": "",
                "zerolinecolor": "#C8D4E3"
            },
            "yaxis": {
                "backgroundcolor": "#1d1f21",
                "gridcolor": "#506784",
                "gridwidth": 2,
                "linecolor": "#506784",
                "showbackground": true,
                "ticks": "",
                "zerolinecolor": "#C8D4E3"
            },
            "zaxis": {
                "backgroundcolor": "#1d1f21",
                "gridcolor": "#506784",
                "gridwidth": 2,
                "linecolor": "#506784",
                "showbackground": true,
                "ticks": "",
                "zerolinecolor": "#C8D4E3"
            }
        },
        "shapedefaults": {
            "line": {
                "color": "#f2f5fa"
            }
        },
        "sliderdefaults": {
            "bgcolor": "#C8D4E3",
            "bordercolor": "#1d1f21",
            "borderwidth": 1,
            "tickwidth": 0
        },
        "ternary": {
            "aaxis": {
                "gridcolor": "#506784",
                "linecolor": "#506784",
                "ticks": ""
            },
            "baxis": {
                "gridcolor": "#506784",
                "linecolor": "#506784",
                "ticks": ""
            },
            "bgcolor": "#1d1f21",
            "caxis": {
                "gridcolor": "#506784",
                "linecolor": "#506784",
                "ticks": ""
            }
        },
        "updatemenudefaults": {
            "bgcolor": "#506784",
            "borderwidth": 0
        },
        "xaxis": {
            "automargin": true,
            "gridcolor": "#283442",
            "linecolor": "#506784",
            "ticks": "",
            "title": {
                "standoff": 15
            },
            "zerolinecolor": "#283442",
            "zerolinewidth": 2
        },
        "yaxis": {
            "automargin": true,
            "gridcolor": "#283442",
            "linecolor": "#506784",
            "ticks": "",
            "title": {
                "standoff": 15
            },
            "zerolinecolor": "#283442",
            "zerolinewidth": 2
        }
    }
}

function setPlotlyComWithBackground(){
    if(window.location.origin!="https://code.earthengine.google.com")
        return;
    plotlyComWithBackground= chrome.runtime.connect(OEEexidString,{name: "oeel.extension.plotly"});

    plotlyComWithBackground.onMessage.addListener((request, sender, sendResponse) => {
        if(request.type=='setDynamicPlotly'){
            dynamicPlotly=request.message;
        };
    })
    plotlyComWithBackground.onDisconnect.addListener(function(port){ 
        plotlyComWithBackground=null;
        setPlotlyComWithBackground();
    })

    plotlyComWithBackground.postMessage({type:"getDynamicPlotly"});
}

setPlotlyComWithBackground();


function injectPlotly(){
	var s = document.createElement('script');
	s.src = OEEexEscapeURL.createScriptURL('https://cdn.plot.ly/plotly-2.12.1.min.js');
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
}

injectPlotly();

function loadConsolePlotlyWatcher(){
    let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
    let myObserver          = new MutationObserver(function(mutList){

        [...mutList].map(function(mut){
            [...mut.addedNodes].map(function(e){
                if(e.classList.contains('OEEexPlotlyAnalysis'))
                    return;
                e.classList.add('OEEexPlotlyAnalysis')
                analysisPlotlyAddon(e)
            });
        });
    });
    let obsConfig = { childList: true};
    
    if(document.querySelector('ee-console'))
        myObserver.observe(document.querySelector('ee-console'), obsConfig);

    let myObserver2= new MutationObserver(function(mutList){

        let cleaned=[...mutList].map(e=> [...e.addedNodes]).flat().filter(f=> (f.classList &&
                                                                          f.classList.contains('ui-label') &&
                                                                          ! f.classList.contains('OEEexPlotlyAnalysis') &&
                                                                          f.textContent &&
                                                                          f.textContent.startsWith(consolePlotlyExtensionPrefix+':')&&
                                                                          document.body.contains(f))
                                                                                ||
                                                                                (f.classList &&
                                                                          f.classList.contains('ui-textbox') &&
                                                                          ! f.classList.contains('OEEexPlotlyAnalysis') &&
                                                                          f.querySelector('input').placeholder=="OEEex_Active_AddonPlotly" &&
                                                                          document.body.contains(f)))

        cleaned=cleaned.filter(function(value, index, self) {
              return self.indexOf(value) === index;
            });

        cleaned.map(function(e){
            e.style.padding=0;
            if(e.classList.contains('ui-textbox'))
            {
                e.classList.add('OEEexPlotlyAnalysis')
                let input=e.querySelector('input');
                input.style.display='none';
                let plotDiv=document.createElement('div');
                plotDiv.style.margin=0;
                e.appendChild(plotDiv);
                if(input.placeholder=="OEEex_Active_AddonPlotly"){
                    addPlotlyPlot(input.value,plotDiv,true,input);
                }
            }
            else{
                e.classList.add('OEEexPlotlyAnalysis')
                addPlotlyPlot(e.textContent.slice((consolePlotlyExtensionPrefix+':').length),e,true);
            }
        });

    });
    let obsConfig2 = { childList: true, subtree:true};
    if(document.querySelector('.ui-root'))
        myObserver2.observe(document.querySelector('.ui-root'), obsConfig2);


    let resizeObserver= new ResizeObserver(function(newSize,element){
		document.querySelectorAll('.js-plotly-plot:not(.inApp)').forEach(function(e){
			Plotly.relayout(e,{width: newSize[0].contentRect.width-5})
		})
    });
    
    if(document.querySelectorAll('.goog-splitpane-second-container').length>1)
        resizeObserver.observe(document.querySelectorAll('.goog-splitpane-second-container')[1]);

    if(document.querySelector('.goog-button.run-button'))
		document.querySelector('.goog-button.run-button').addEventListener('click',function(){plotPosition=0;})
	if(document.querySelector('.goog-button.reset-button'))
		document.querySelector('.goog-button.reset-button').addEventListener('click',function(){plotPosition=0;})
}

function analysisPlotlyAddon(val){
    val.querySelectorAll('.trivial').forEach(function(obj){
	    let consoleCode=obj.innerHTML;
	    if(consoleCode.startsWith(consolePlotlyExtensionPrefix+':')){
	        addPlotlyPlot(consoleCode.slice((consolePlotlyExtensionPrefix+':').length),obj,false);
	        return; 
	    }
    });

    val.querySelectorAll('.ui-widget.ui-textbox').forEach(function(obj){
        let input=obj.querySelector('input');
        let plotDiv=document.createElement('div');
        obj.appendChild(plotDiv);
        input.style.display='none';
        if(input.placeholder=="OEEex_Active_AddonPlotly"){
            addPlotlyPlot(input.value,plotDiv,false,input);
        }
    });
    
}

function explorAllJSON(input){
	let promisesArray=[];
	
	if(input && !(typeof input === 'string' || input instanceof String)){
		let keys=Object.keys(input);
		for (let idx=0; idx< keys.length; idx++) {
			let key=keys[idx];
			if(input[key] && input[key].toString && input[key].toString().slice(0,3)=="ee."){
                let keyCache=hashCode(ee.Serializer.toJSON(input[key]))
                if(keyCache in EECache){
                    if(isPromise(EECache[keyCache])){
                        EECache[keyCache].then(function(eeCompute){
                            input[key]=eeCompute;
                        })
                    }else{
                        input[key]=EECache[keyCache];
                    }
                }else{

    				let prom=new Promise((resolve, reject) => {
                        input[key].evaluate(function(eeCompute){
    						resolve(eeCompute);
    						input[key]=eeCompute;
                            EECache[keyCache]=eeCompute
    					})
    				})
                    promisesArray.push(prom)
                }
				continue;
			}

			let out=explorAllJSON(input[key]);
			input[key]=out.ud;
			promisesArray=promisesArray.concat(out.promises);
		}
	}
	return {ud:input,promises:promisesArray}
}

function updatePlot(plotDiv,plot){
    plotDiv.classList.add('loading');
    var plotEval=explorAllJSON(plot)
    Promise.all(plotEval.promises).then(function(){
        let plot=configPlot(plotEval.ud,plotDiv,plotDiv.classList.contains('inApp'));
        Plotly.react(plotDiv,plot.data,plot.layout);
        plotDiv.classList.remove('loading');
        plotDiv.addEventListener('refreshDraw', function(e) {
            if(document.getElementsByTagName('html')[0].classList.contains('dark')){
                plot.layout.template=plotlyDarkTemplate;
            }else{
                delete plot.layout.template;
            }
            Plotly.relayout(plotDiv,plot.layout)
        }, false);
    })
}

listPlot=[];

function configPlot(plot,val,inApp){


    if(!plot.layout){
        plot.layout={}
    }
    if(!plot.layout.width){
        if(!inApp && document.querySelectorAll('.goog-splitpane-second-container').length>1)
          plot.layout.width=getComputedStyle(document.querySelectorAll('.goog-splitpane-second-container')[1]).width.slice(0,-2)-12;
        if(inApp && val.style.width){
            plot.layout.width=val.style.width.slice(0,-2);
        }
    }
    if(!plot.layout.height){
        if(!inApp && document.querySelectorAll('.goog-splitpane-second-container').length>1)
          plot.layout.height=Math.max(Math.min(getComputedStyle(document.querySelectorAll('.goog-splitpane-second-container')[1]).height.slice(0,-2)-12,500),250);
        if(inApp && val.style.height)
        { 
            plot.layout.height=val.style.height.slice(0,-2);
        }
    }
    if(!plot.layout.margin){
        plot.layout.margin={
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
        }
    }

    if(plot.transparent)
    {
        plot.layout.paper_bgcolor="#0000";
        plot.layout.plot_bgcolor="#0000";
    }

    if(plot.annotations){
        if(!plot.layout)plot.layout={};
        plot.layout.annotations=plot.annotations;
    }

    if(document.getElementsByTagName('html')[0].classList.contains('dark')){
        plot.layout.template=plotlyDarkTemplate;
    }

    return plot
}

function addPlotlyPlot(consoleCode,val,inApp,input){
    val.classList.add('loading');
    val.classList.add('explorer');
    val.innerHTML=OEEexEscape.createHTML('Plotly: Computing');
    let plot=ee.Deserializer.fromJSON(consoleCode)
    let locPlotPosition=plotPosition++;
    var plotEval=explorAllJSON(plot)
    Promise.all(plotEval.promises).then(function(){
    	plot=configPlot(plotEval.ud,val, inApp);

        //for config
	    let imageExportFormat='png';// one of png, svg, jpeg, webp
		let imageExportName="EE_plotly_chart";
        if(document.querySelectorAll('.goog-splitpane-second-container .panel.editor-panel .header > span').length>0)
            imageExportName="EE_plotly_chart_"+document.querySelectorAll('.goog-splitpane-second-container .panel.editor-panel .header > span')[0].textContent.replace('/', '_')+'_'+locPlotPosition;
		let imageExportScale=4;
		if(plot.exportFormat){
			imageExportFormat=plot.exportFormat;
		}
		if(plot.exportName){
			imageExportName=plot.exportName;
		}
		if(plot.exportScale){
			imageExportScale=plot.exportScale;
		}

	    let config={
	    	displaylogo: false,
			toImageButtonOptions: {
				format: imageExportFormat, 
				filename: imageExportName,
				scale: imageExportScale // Multiply title/legend/axis/canvas sizes by this factor
			}
	    }


	    val.innerHTML=OEEexEscape.createHTML('');
        // if(val.parentElement.parentElement.classList.contains('layout-flow')){
        //     val.parentElement.style.margin=0;
        //     if(val.parentElement.parentElement.classList.contains('layout-flow-vertical')){
        //         val.parentElement.style.width='100%'
        //     }
        //     if(val.parentElement.parentElement.classList.contains('layout-flow-horizontal')){
        //         val.parentElement.style.height='100%'
        //     }
        // }
	    Plotly.newPlot( val, plot.data, plot.layout,config )

        if(inApp)
        {
            val.classList.add('inApp')
        }

        if(input){
            const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
            Object.defineProperty(input, "value", {
                get: desc.get,
                set: function(v) {
                    try{
                        let payload=ee.Deserializer.fromJSON(v)
                        if(payload.toEE===false){
                            updatePlot(val,payload)
                        }
                    }catch(e){

                    }
                    desc.set.call(this, v);
                }
            });

            function allEvent(type, input, data){
                let payload={toEE:true, type:type, plotlyData:data,time:Date.now()}
                try{
                    input.value=JSON.stringify(payload,function(key,val){return (key.startsWith('_')|| ['targetLinks','sourceLinks','links','data','fullData'].includes(key) ?undefined:val)})
                    input.dispatchEvent(new Event('change'))
                }catch(e){
                    console.error(e)
                }
            }

            for (var i = listPlotlyEvent.length - 1; i >= 0; i--) {
                let eventType=listPlotlyEvent[i];
                val.on(eventType, function(data){allEvent(eventType,input,data)});
            }

        }



        /*if(plot.onClick && dynamicPlotly)
        {
            let obj={};
            if(plot.annotations){
                obj.annotations=plot.annotations;
            }
            let userFunction=new Function("return ("+htmlDecode(plot.onClick)+")")();
            val.on('plotly_click', function(data){userFunction(val,obj,data)});
        }*/
	    val.addEventListener('refreshDraw', function(e) {
			if(document.getElementsByTagName('html')[0].classList.contains('dark')){
				plot.layout.template=plotlyDarkTemplate;
			}else{
				delete plot.layout.template;
			}
			Plotly.relayout(val,plot.layout)
		}, false);

	    val.classList.remove('loading');
        [...document.querySelectorAll('.gm-style')].forEach(e=> e.dispatchEvent(new Event('resize')))
	    listPlot.push(val)
    })
}

let darkPlotlyObserver = new MutationObserver(function(mutations) {
    listPlot=listPlot.filter((e)=>document.body.contains(e))
    listPlot.forEach(function(elem){
		elem.dispatchEvent(new Event('refreshDraw'));
    })
});

darkPlotlyObserver.observe(document.getElementsByTagName('html')[0], { attributes : true, attributeFilter : ['class'] });

loadConsolePlotlyWatcher();
