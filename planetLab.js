const consolePlanetExtensionPrefix='GEE_Addon_PlanetSearch';
planetConfig=null;
var planetPortWithBackground = chrome.runtime.connect(document.currentScript.src.match("([a-z]{32})")[0],{name: "oeel.extension.planet"});

planetPortWithBackground.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type=='planetConfig'){
        planetConfig=request.message;
    };
})


function loadConsolePlanetWatcher(){
    let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
    let myObserver          = new MutationObserver(function(){
        [...document.querySelectorAll("pre.console > div.string:not(.OEEexAddonPlanetAnalysis)")].map(function(e){
            e.classList.add('OEEexAddonPlanetAnalysis')
            analysisPlanetAddon(e)
        });
    });
    let obsConfig = { childList: true};
    myObserver.observe(document.querySelector('pre.console'), obsConfig);
}

function analysisPlanetAddon(val){
    var consoleCode=val.querySelector('.trivial').innerHTML;
    if(consoleCode.startsWith(consolePlanetExtensionPrefix+':')){
        runPlanetSearch(consoleCode,val);
        return; 
    }
}

loadConsolePlanetWatcher();

function genreateFilter(filter){
    let result=null;
    switch(filter.functionName){
        case "Filter.dateRangeContains" :
        result={
            "type": "DateRangeFilter",
            "field_name": "acquired",
            "config": {
                "gte": filter.arguments.leftValue.arguments.start+"T21:44:08.703Z",
                "lte": filter.arguments.leftValue.arguments.end+"T21:44:08.703Z"
            }
        }
        break;
        case "Filter.intersects" :
        result= {
            "type": "GeometryFilter",
            "field_name": "geometry",
            "config": filter.arguments.rightValue.arguments.geometry
        };
        break;
        case "Filter.lessThan" :
        result= {
            "type": "RangeFilter",
            "field_name": filter.arguments.leftField,
            "config": {
                //"gt": -Number.MAX_VALUE,
                "lt": filter.arguments.rightValue
            }
        }
        break;
        case "Filter.greaterThan" :
        result= {
            "type": "RangeFilter",
            "field_name": filter.arguments.leftField,
            "config": {
                "gt": filter.arguments.rightValue,
                //"lt": Number.MAX_VALUE
            }
        }
        break;
        case "Filter.rangeContains" :
        result= {
            "type": "RangeFilter",
            "field_name": filter.arguments.field,
            "config": {
                "gt": filter.arguments.minValue,
                "lt": filter.arguments.maxValue
            }
        }
        break;
        case "Filter.equals" :
        result= {
            "type": "NumberInFilter",
            "field_name": filter.arguments.leftField,
            "config":[ filter.arguments.rightValue ]
        }
        break;
        case "Filter.listContains" :
        listString=[];
        listNumber=[];
        for (let i = 0; i < filter.arguments.leftValue.length; i++) {
            if(typeof filter.arguments.leftValue[i] === 'string'){
                listString.push(filter.arguments.leftValue[i])
            }else{
                listNumber.push(filter.arguments.leftValue[i])
            }
        }

        result={  
            "type":"OrFilter",
            "config":[  
            {
                "type":"StringInFilter",
                "field_name":filter.arguments.rightField,
                "config":listString
            },
            {
                "type":"NumberInFilter",
                "field_name":filter.arguments.rightField,
                "config":listNumber
            }
            ]
        }
        break;
        case "Filter.not" :
        result= {
            "type":"NotFilter",
            "config":[genreateFilter(filter.arguments.filter)]
        }
        break;
        case "Filter.or" :
        subFilter=[];
        for (let i = 0; i < filter.arguments.filters.length; i++) {
            subFilter.push(genreateFilter(filter.arguments.filters[i]))
        }
        result= {
            "type":"OrFilter",
            "config":subFilter
        }
        break;
        case "Filter.and" :
        subFilter=[];
        for (let i = 0; i < filter.arguments.filters.length; i++) {
            subFilter.push(genreateFilter(filter.arguments.filters[i]))
        }
        result= {
            "type":"AndFilter",
            "config":subFilter
        }
        break;
        default:
        console.error(filter.functionName+ 'is not supported !')
        
    }   
    return result;
}

function runPlanetSearch(consoleCode,val){
    // autoUpdate=true;
    console.log(consoleCode)
    val.classList.add('loading');
    val.innerHTML='Planet search';
    let searchRequest=consoleCode.slice(consolePlanetExtensionPrefix.length+1+'ee.ImageCollection('.length,-1);
    let jsonData=JSON.parse(searchRequest);
    console.log(jsonData)
    // let assetConfig;
    let jsonVal=jsonData;
    let listFilter=[];
    // let item_type;
    while(jsonVal){
        switch(jsonVal.functionName) {
            case "Collection.filter":
                listFilter.push(genreateFilter(jsonVal.arguments.filter))
                jsonVal=jsonVal.arguments.collection;
                break;
            case "ImageCollection.load":
                var listParameter=jsonVal.arguments.id.split('/');
                if(listParameter[0]!='PlanetLab')
                    console.error('Unexistant dataset !')
                else
                {
                    item_type=listParameter[1];
                    if(listParameter.length>2)
                        assetConfig=listParameter[2];
                }
                jsonVal=undefined;
                break;
            default:
            console.error(jsonVal.functionName+ 'is not supported !')
        }
    }


    listFilter.push({  
        "type":"PermissionFilter",
        "config":[ "assets"+( typeof assetConfig !== 'undefined' ? "."+assetConfig : "")+":download"]
    });
    assetConfig=( typeof assetConfig !== 'undefined' ? assetConfig : "");

    researchData={
        "filter": {
            "type": "AndFilter",
            "config": listFilter
        },
        "item_types": [
        item_type
        ],
    };

    console.log(JSON.stringify(researchData))

    let planetSearch=new XMLHttpRequest();
    planetSearch.open("POST",'https://api.planet.com/data/v1/quick-search',true);
    planetSearch.responseType = 'json';
    planetSearch.setRequestHeader("Content-Type", "application/json");
    planetSearch.onload = function(e) {
        console.log(this.response)
      if (this.status == 200) {
        displayResult(val,this.response,assetConfig,item_type);
        return;
      }
      if (this.status >=400) {
        return;
      }
    }
    planetSearch.send(JSON.stringify(researchData));

}


function addSceneInConsole(randomId,features,assetConfig,dispTunail){
    let head=document.querySelector('#randId_'+randomId+' .planetScenesList');
    for (var i = 0; i < features.length; i++) {
        let im = document.createElement("option");
        im.innerHTML=features[i].id;
        im.setAttribute('value',features[i].id);
        im.setAttribute('assetType',assetConfig);
        im.setAttribute('data-assetLink',features[i]._links.assets);
        let t1='Date: '+features[i].properties.acquired;
        let t2='Cloud: '+features[i].properties.cloud_cover*100+'%';
        let t3='Resoution: '+features[i].properties.pixel_resolution+' m';
        let svg="<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='65px' width='250px'><text x='0' y='20' fill='black' font-size='16'>"+t1+"</text><text x='0' y='40' fill='black' font-size='16'>"+t2+"</text><text x='0' y='60' fill='black' font-size='16'>"+t3+"</text></svg>";
        let svgDark="<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='65px' width='250px'><text x='0' y='20' fill='rgb(197, 200, 198)' font-size='16'>"+t1+"</text><text x='0' y='40' fill='rgb(197, 200, 198)' font-size='16'>"+t2+"</text><text x='0' y='60' fill='rgb(197, 200, 198)' font-size='16'>"+t3+"</text></svg>";
        im.setAttribute('style','--bg-image: url('+features[i]._links.thumbnail+');--bg-text: url("data:image/svg+xml;utf8,'+svg+'");--bg-text-dark: url("data:image/svg+xml;utf8,'+svgDark+'")');
        head.appendChild(im);
        // im.addEventListener('mousedown', function (e) {
        //     console.log(this)
        //     e.preventDefault();
        //     var st = this.scrollTop;
        //     e.target.selected = !e.target.selected;
        //     setTimeout(() => this.scrollTop = st, 0);
        //     this.focus();
        // });
    }

    // var dataJson=JSON.stringify({"expression":{"result":"0","values":{"0":{"functionInvocationValue":{"arguments":{"list":{"valueReference":"1"},"other":{"functionInvocationValue":{"arguments":{"list":{"functionInvocationValue":{"arguments":{"collection":{"valueReference":"2"},"count":{"functionInvocationValue":
    // {"arguments":{"left":{"functionInvocationValue":{"arguments":{"collection":{"valueReference":"2"}},"functionName":"Collection.size"}},"right":{"constantValue":1}},"functionName":"Number.add"}}},"functionName":"Collection.toList"}},"baseAlgorithm":{"functionDefinitionValue":
    // {"argumentNames":["_MAPPING_VAR_0_0"],"body":"4"}}},"functionName":"List.map"}}},"functionName":"List.removeAll"}},"1":{"constantValue":features.map(e=>{return e.id})},"2":{"functionInvocationValue":{"arguments":{"collection":{"functionInvocationValue":{"arguments":
    // {"id":{"constantValue":planetPath.slice(0,-1)}},"functionName":"ImageCollection.load"}},"filter":{"functionInvocationValue":{"arguments":{"filters":{"arrayValue":{"values":[{"functionInvocationValue":{"arguments":{"rightField":{"valueReference":"3"},
    // "leftValue":{"valueReference":"1"}},"functionName":"Filter.listContains"}},{"functionInvocationValue":{"arguments":{"leftField":{"constantValue":"assetType"},"rightValue":{"constantValue":assetConfig}},"functionName":"Filter.equals"}}]}}},"functionName":"Filter.and"}}},
    // "functionName":"Collection.filter"}},"3":{"constantValue":"id"},"4":{"functionInvocationValue":{"arguments":{"object":{"argumentReference":"_MAPPING_VAR_0_0"},"property":{"valueReference":"3"}},"functionName":"Element.get"}}}}});

    // var IdPresneteInGEE4AjaxCall={
    //     url: "https://content-earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/value:compute"
    //     type: "POST",
    //     data: dataJson,
    //     dataType: "json",
    //     cache: false,
    //     contentType: "application/json; charset=UTF-8",
    //     success: function(result){
    //         $('#randId_'+randomId+' .planetScenesList div.sceneId.avoid-clicks').each(function(){
    //             if(result.result.indexOf($(this).attr('value'))>=0){
    //                 $(this).removeClass('avoid-clicks');
    //             }else{
    //                 $(this).slideUp();
    //             }
    //         })
    //         for (var i = 0; i < result.result.length; i++) {
    //             result.result[i];
    //         }
    //         updateCountSelected(randomId);
    //     }
    // }
    // $.ajax(IdPresneteInGEE4AjaxCall);

    // updateCountSelected(randomId);
}

// function updateCountSelected(randomId){
//     // $('#selectAmount_'+randomId).html("Selected "+$('#randId_'+randomId+' div.sceneId.selected:not(.avoid-clicks)').length+'/'+$('#randId_'+randomId+' div.sceneId:not(.avoid-clicks)').length);
//     // if($('#randId_'+randomId+' div.sceneId:not(.avoid-clicks)').length<numberMinOfTileToDisp && !$('#loadMore_'+randomId).prop("disabled")  && autoUpdate){
//     //     $('#loadMore_'+randomId).click();
//     // }
// }

loadMore=false;

function displayResult(val,result,assetConfig,item_type){
    let randomId=Math.floor((Math.random() * 100000) + 1);
    var htmlCode='<div class="planetSearch" id="randId_'+randomId+'">';
    htmlCode+='<button type="button" id="satckToActivatePlanetImages_'+randomId+'">Download selected</button>'
    //htmlCode+='<button type="button" id="selectAllImages_'+randomId+'">Select all</button>'
    //htmlCode+='<button type="button" id="toggleAllImages_'+randomId+'">Toggle</button>'
    //htmlCode+='<button type="button" id="loadMore_'+randomId+'">Load more</button>'
    //htmlCode+='<span id="selectAmount_'+randomId+'" style="white-space:nowrap;"></span>'
    htmlCode+='<select multiple="multiple" class="planetScenesList">'
    htmlCode+='</select>'
    htmlCode+='</div>'
    val.innerHTML=htmlCode;
    addSceneInConsole(randomId,result.features,assetConfig,true);
    val.classList.remove('loading');
    val.querySelector('.planetScenesList').setAttribute('linkMore',result._links._next)
    // val.querySelector('.planetScenesList').onmousedown = function(e) {
    //   e.preventDefault();
    //   var st = this.scrollTop;
    //   e.target.selected = !e.target.selected;
    //   setTimeout(() => this.scrollTop = st, 0);
    //   this.focus();
    // }

    val.querySelector('#satckToActivatePlanetImages_'+randomId).addEventListener('click',function(){planetDownloadSelected(randomId,assetConfig,item_type);});

    val.querySelector('.planetScenesList').addEventListener('scroll',function(e){
        if(!loadMore && e.target.scrollHeight-e.target.scrollTop<10*e.target.firstChild.offsetHeight){
        loadMore=true;    
        let nextLink=e.target.getAttribute('linkMore');
            if(!nextLink || nextLink=='null') return;
            let planetSearch=new XMLHttpRequest();
            planetSearch.open("GET",nextLink,true);
            planetSearch.responseType = 'json';
            planetSearch.setRequestHeader("Content-Type", "application/json");
            planetSearch.onload = function(result) {
            console.log(this.response)
              if (this.status == 200) {
                let result=this.response;
                addSceneInConsole(randomId,result.features,assetConfig,true);
                e.target.setAttribute('linkMore',result._links._next)
                loadMore=false;
                return;
              }
              if (this.status >=400) {
                return;
              }
            }
            planetSearch.send();
        }
    })
}

function planetDownloadSelected(randomId,a){
    let head=document.querySelector('#randId_'+randomId+' .planetScenesList');
    let imageIDs=[...head.querySelectorAll('option:checked')].map(e=> e.value)
    if(imageIDs.length<1)return;

    if(planetConfig && planetConfig.apiVersion==2)
    {

        let batchSize=parseInt(planetConfig.batchSize)
        let arrayOfNode=[];
        let numberOfChunck=Math.ceil(imageIDs.length/batchSize);
        for (let i=0; i<numberOfChunck; i++ ){
            arrayOfNode[i]=imageIDs.slice(i*batchSize,Math.min((i+1)*batchSize,imageIDs.length));
        }


        for (let i = 0; i < arrayOfNode.length; i++) {
            
            let imageRequest=new XMLHttpRequest();
            imageRequest.open("POST",'https://api.planet.com/compute/ops/orders/v2',true);
            imageRequest.responseType = 'json';
            imageRequest.setRequestHeader("Content-Type", "application/json");
            imageRequest.onload = function(e) {
                console.log(this.response)
              if (this.status == 200) {
                displayResult(val,this.response,assetConfig);
                return;
              }
              if (this.status >=400) {
                alert(this.response)
                return;
              }
            }

            planetConfig.collectionPath='projects/earthengine-geouu/assets/Planet'

            let reg=/^projects\/(.+)\/assets\/(.*$)/
            let matches=reg.exec(planetConfig.collectionPath);

            if(matches.length!=3)
                return

            requestData={
                "name": "Planet->GEE",
                "products":
                [
                    {
                        "item_ids": arrayOfNode[i],
                        "item_type": item_type,
                        "product_bundle": assetConfig
                    }
                ],
                "delivery":
                {
                    "google_earth_engine":
                    {
                        "project": matches[1],
                        "collection": matches[2],
                    }
                }
            }

            if(planetConfig.serviceAccount && planetConfig.serviceAccount!=''){
                requestData.delivery.google_earth_engine['credentials']=btoa(planetConfig.serviceAccount);
            }

            console.log(requestData)
            //imageRequest.send(JSON.stringify(requestData));
        }
        
    }
}

