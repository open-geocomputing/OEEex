const consolePlanetExtensionPrefix='OEEex_AddonPlanetSearch';
var OEEexidString=document.currentScript.src.match("([a-z]{32})")[0];
planetConfig=null;
var OEEex_version='1.0'

const maxPlanetActivated=10;
var planetActivated=0; 

var planetPortWithBackground=null;
function setPlanetPortWithBackground(){
    planetPortWithBackground= chrome.runtime.connect(OEEexidString,{name: "oeel.extension.planet"});
    planetPortWithBackground.onDisconnect.addListener(function(port){ 
        planetPortWithBackground=null;
        setPlanetPortWithBackground();
    })

    planetPortWithBackground.onMessage.addListener((request, sender, sendResponse) => {
        if(request.type=='planetConfig'){
            planetConfig=request.message;
            // if('maxParallelActivation' in planetConfig)
            //     maxPlanetActivated=planetConfig['maxParallelActivation'];
            document.querySelectorAll('.planetScenesList').forEach(e=>{
                if(!planetConfig.Thumbnail) e.classList.add('withoutPrevi');
                else e.classList.remove('withoutPrevi');
            });
        };
    })
}

setPlanetPortWithBackground();



function loadConsolePlanetWatcher(){
    let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
    let myObserver          = new MutationObserver(function(mutList){

        [...mutList].map(function(mut){
            [...mut.addedNodes].map(function(e){
                if(e.classList.contains('OEEexAddonPlanetAnalysis'))
                    return;
                e.classList.add('OEEexAddonPlanetAnalysis')
                analysisPlanetAddon(e)
            });
        });
    });
    let obsConfig = { childList: true};
    
    myObserver.observe(document.querySelector('ee-console'), obsConfig);
}

function analysisPlanetAddon(val){
    let obj=val.querySelector('.trivial');
    if(!obj)return;
    let consoleCode=obj.innerHTML;
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
    val.classList.add('loading');
    val.innerHTML='Planet search';
    let searchRequest=consoleCode.slice(consolePlanetExtensionPrefix.length+1+'ee.ImageCollection('.length,-1);
    let jsonData=JSON.parse(searchRequest);
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
            let listParameter=jsonVal.arguments.id.split('/');
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

    let indexUdmSlice=assetConfig.length;
    if(typeof assetConfig !== 'undefined' && assetConfig.includes('_udm')){
        indexUdmSlice=assetConfig.indexOf('_udm');
    }

    listFilter.push({  
        "type":"PermissionFilter",
        "config":[ "assets"+( typeof assetConfig !== 'undefined' ? "."+assetConfig.slice(0,indexUdmSlice) : "")+":download"]
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


    let planetSearch=new XMLHttpRequest();
    planetSearch.open("POST",'https://api.planet.com/data/v1/quick-search',true);
    planetSearch.responseType = 'json';
    planetSearch.setRequestHeader("Content-Type", "application/json");
    planetSearch.onload = function(e) {
      if (this.status == 200) {
        displayResult(val,this.response,assetConfig,item_type);
        return;
    }
    if(this.status ==429){
        this.open("POST",'https://api.planet.com/data/v1/quick-search',true);
        this.sendPlanetWhenPossible(JSON.stringify(researchData),true);
        return;
    }
    if (this.status >=400) {
        alert("Error loading data from Planet.")
        return;
    }
}
planetSearch.sendPlanetWhenPossible(JSON.stringify(researchData),true);

}


function addSceneInConsole(randomId,features,assetConfig,item_type,dispTunail){
    let head=document.querySelector('#randId_'+randomId+' .planetScenesList');
    if(!head)return;
    if(!planetConfig.Thumbnail)head.classList.add('withoutPrevi');
    for (let i = 0; i < features.length; i++) {
        let im = document.createElement("option");
        im.innerHTML=features[i].id;
        im.setAttribute('value',features[i].id);
        im.setAttribute('data-forDownload',JSON.stringify({assetLink:features[i]._links.assets,assetType:assetConfig,itemType:item_type}));
        let t1='Date: '+features[i].properties.acquired;
        let t2='Cloud: '+features[i].properties.cloud_cover*100+'%';
        let t3='Resoution: '+features[i].properties.pixel_resolution+' m';
        let svg="<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='65px' width='250px'><text x='0' y='20' fill='black' font-size='16'>"+t1+"</text><text x='0' y='40' fill='black' font-size='16'>"+t2+"</text><text x='0' y='60' fill='black' font-size='16'>"+t3+"</text></svg>";
        let svgDark="<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='65px' width='250px'><text x='0' y='20' fill='rgb(197, 200, 198)' font-size='16'>"+t1+"</text><text x='0' y='40' fill='rgb(197, 200, 198)' font-size='16'>"+t2+"</text><text x='0' y='60' fill='rgb(197, 200, 198)' font-size='16'>"+t3+"</text></svg>";
        im.setAttribute('style','--bg-image: url('+features[i]._links.thumbnail+');--bg-text: url("data:image/svg+xml;utf8,'+svg+'");--bg-text-dark: url("data:image/svg+xml;utf8,'+svgDark+'")');
        im.addEventListener('dblclick',addPanetToDownloadV1);
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

    collectionPath=planetConfig.collectionPath;

    let reg=/^projects\/(.+)\/assets\/(.*$)/
    let matches=reg.exec(collectionPath);

    if(!matches || (matches.length!=3)){
        if(!(collectionPath.startsWith('users/') || collectionPath.startsWith('projects/'))){
            collectionPath=getUserRoot()+'/'+collectionPath;
        }
    }

    let dataJson=JSON.stringify(
    {
        "expression":
        {
            "result": "0",
            "values":
            {
                "0":
                {
                    "functionInvocationValue":
                    {
                        "arguments":
                        {
                            "collection":
                            {
                                "functionInvocationValue":
                                {
                                    "arguments":
                                    {
                                        "collection":
                                        {
                                            "functionInvocationValue":
                                            {
                                                "arguments":
                                                {
                                                    "id":
                                                    {
                                                        "constantValue": collectionPath
                                                    }
                                                },
                                                "functionName": "ImageCollection.load"
                                            }
                                        },
                                        "filter":
                                        {
                                            "functionInvocationValue":
                                            {
                                                "arguments":
                                                {
                                                    "rightField":
                                                    {
                                                        "valueReference": "1"
                                                    },
                                                    "leftValue":
                                                    {
                                                        "constantValue":features.map(e=>{return e.id})
                                                    }
                                                },
                                                "functionName": "Filter.listContains"
                                            }
                                        }
                                    },
                                    "functionName": "Collection.filter"
                                }
                            },
                            "property":
                            {
                                "valueReference": "1"
                            }
                        },
                        "functionName": "AggregateFeatureCollection.array"
                    }
                },
                "1":
                {
                    "constantValue": "id"
                }
            }
        }
    }
    );


    // var dataJson=JSON.stringify(
    // {
    //     "expression":
    //     {
    //         "result": "0",
    //         "values":
    //         {
    //             "0":
    //             {
    //                 "functionInvocationValue":
    //                 {
    //                     "arguments":
    //                     {
    //                         "collection":
    //                         {
    //                             "functionInvocationValue":
    //                             {
    //                                 "arguments":
    //                                 {
    //                                     "collection":
    //                                     {
    //                                         "functionInvocationValue":
    //                                         {
    //                                             "arguments":
    //                                             {
    //                                                 "collection":
    //                                                 {
    //                                                     "functionInvocationValue":
    //                                                     {
    //                                                         "arguments":
    //                                                         {
    //                                                             "id":
    //                                                             {
    //                                                                 "constantValue": collectionPath
    //                                                             }
    //                                                         },
    //                                                         "functionName": "ImageCollection.load"
    //                                                     }
    //                                                 },
    //                                                 "baseAlgorithm":
    //                                                 {
    //                                                     "functionDefinitionValue":
    //                                                     {
    //                                                         "argumentNames":
    //                                                         [
    //                                                             "_MAPPING_VAR_0_0"
    //                                                         ],
    //                                                         "body": "1"
    //                                                     }
    //                                                 }
    //                                             },
    //                                             "functionName": "Collection.map"
    //                                         }
    //                                     },
    //                                     "filter":
    //                                     {
    //                                         "functionInvocationValue":
    //                                         {
    //                                             "arguments":
    //                                             {
    //                                                 "rightField":
    //                                                 {
    //                                                     "valueReference": "2"
    //                                                 },
    //                                                 "leftValue":
    //                                                 {
    //                                                     "constantValue":features.map(e=>{return e.id})
    //                                                 }
    //                                             },
    //                                             "functionName": "Filter.listContains"
    //                                         }
    //                                     }
    //                                 },
    //                                 "functionName": "Collection.filter"
    //                             }
    //                         },
    //                         "property":
    //                         {
    //                             "valueReference": "2"
    //                         }
    //                     },
    //                     "functionName": "AggregateFeatureCollection.array"
    //                 }
    //             },
    //             "1":
    //             {
    //                 "functionInvocationValue":
    //                 {
    //                     "arguments":
    //                     {
    //                         "object":
    //                         {
    //                             "argumentReference": "_MAPPING_VAR_0_0"
    //                         },
    //                         "key":
    //                         {
    //                             "valueReference": "2"
    //                         },
    //                         "value":
    //                         {
    //                             "functionInvocationValue":
    //                             {
    //                                 "arguments":
    //                                 {
    //                                     "list":
    //                                     {
    //                                         "functionInvocationValue":
    //                                         {
    //                                             "arguments":
    //                                             {
    //                                                 "list":
    //                                                 {
    //                                                     "functionInvocationValue":
    //                                                     {
    //                                                         "arguments":
    //                                                         {
    //                                                             "string":
    //                                                             {
    //                                                                 "functionInvocationValue":
    //                                                                 {
    //                                                                     "arguments":
    //                                                                     {
    //                                                                         "input":
    //                                                                         {
    //                                                                             "functionInvocationValue":
    //                                                                             {
    //                                                                                 "arguments":
    //                                                                                 {
    //                                                                                     "object":
    //                                                                                     {
    //                                                                                         "argumentReference": "_MAPPING_VAR_0_0"
    //                                                                                     },
    //                                                                                     "property":
    //                                                                                     {
    //                                                                                         "constantValue": "system:index"
    //                                                                                     }
    //                                                                                 },
    //                                                                                 "functionName": "Element.get"
    //                                                                             }
    //                                                                         }
    //                                                                     },
    //                                                                     "functionName": "String"
    //                                                                 }
    //                                                             },
    //                                                             "regex":
    //                                                             {
    //                                                                 "valueReference": "3"
    //                                                             }
    //                                                         },
    //                                                         "functionName": "String.split"
    //                                                     }
    //                                                 },
    //                                                 "start":
    //                                                 {
    //                                                     "constantValue": 0
    //                                                 },
    //                                                 "end":
    //                                                 {
    //                                                     "constantValue": 4
    //                                                 }
    //                                             },
    //                                             "functionName": "List.slice"
    //                                         }
    //                                     },
    //                                     "separator":
    //                                     {
    //                                         "valueReference": "3"
    //                                     }
    //                                 },
    //                                 "functionName": "List.join"
    //                             }
    //                         }
    //                     },
    //                     "functionName": "Element.set"
    //                 }
    //             },
    //             "2":
    //             {
    //                 "constantValue": "id"
    //             },
    //             "3":
    //             {
    //                 "constantValue": "_"
    //             }
    //         }
    //     }
    // }
    // );

    let chackIDAvailableInGEE=new XMLHttpRequest();
    chackIDAvailableInGEE.open("POST",'https://content-earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/value:compute',true);
    chackIDAvailableInGEE.responseType = 'json';
    chackIDAvailableInGEE.setRequestHeader("Content-Type", "application/json");
    chackIDAvailableInGEE.onload = function(e) {
      if (this.status == 200) {
        let alreadyAvailable=this.response.result;
        for (let i = 0; i < alreadyAvailable.length; i++) {
            head.querySelector('option[value="'+alreadyAvailable[i]+'"]').remove()
        }
        if((features.length==alreadyAvailable.length) && (features.length>0)){
            let event = new Event('loadMore');
            head.dispatchEvent(event);
        }else{
            loadMore=false;
            head.parentNode.parentNode.classList.remove('loading');
        }
        return;
    }
    if (this.status >=400) {
        alert("Unable to check the image already available on GEE, make sure not to download the image already present.")
        return;
    }
}

chackIDAvailableInGEE.setRequestHeader("Authorization", ee.data.getAuthToken());
chackIDAvailableInGEE.send(dataJson);
}

loadMore=false;

function displayResult(val,result,assetConfig,item_type){
    let randomId=Math.floor((Math.random() * 100000) + 1);
    let htmlCode='<div class="planetSearch" id="randId_'+randomId+'">';
    htmlCode+='<button type="button" id="satckToActivatePlanetImages_'+randomId+'">Download selected</button>'
    //htmlCode+='<button type="button" id="selectAllImages_'+randomId+'">Select all</button>'
    //htmlCode+='<button type="button" id="toggleAllImages_'+randomId+'">Toggle</button>'
    //htmlCode+='<button type="button" id="loadMore_'+randomId+'">Load more</button>'
    //htmlCode+='<span id="selectAmount_'+randomId+'" style="white-space:nowrap;"></span>'
    htmlCode+='<select multiple="multiple" class="planetScenesList">'
    htmlCode+='</select>'
    htmlCode+='</div>'
    val.innerHTML=htmlCode;
    addSceneInConsole(randomId,result.features,assetConfig,item_type,true);
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

    let loadMoreImage=function(e){

        let nextLink=e.target.getAttribute('linkMore');
        if(!nextLink || nextLink=='null') return;
        e.target.parentNode.parentNode.classList.add('loading');
        loadMore=true;
        let planetSearch=new XMLHttpRequest();
        planetSearch.open("GET",nextLink,true);
        planetSearch.responseType = 'json';
        planetSearch.setRequestHeader("Content-Type", "application/json");
        planetSearch.onload = function(result) {
          if (this.status == 200) {
            let result=this.response;
            e.target.setAttribute('linkMore',result._links._next)
            addSceneInConsole(randomId,result.features,assetConfig,item_type,true);
            return;
        }
        if(this.status ==429){
            this.planetSearch.open("GET",nextLink,true);
            this.sendPlanetWhenPossible(null,true);
            return;
        }
        if (this.status >=400) {
            alert("Error loading data from Planet.")
            return;
        }
    }
    planetSearch.sendPlanetWhenPossible();
}

val.querySelector('.planetScenesList').addEventListener('loadMore',loadMoreImage);

val.querySelector('.planetScenesList').addEventListener('scroll',function(e){
    if(!loadMore && e.target.scrollHeight-e.target.scrollTop<10*e.target.firstChild.offsetHeight){
        let event = new Event('loadMore');
        e.target.dispatchEvent(event);
    }
})
}

function planetDownloadSelected(randomId,a){
    let head=document.querySelector('#randId_'+randomId+' .planetScenesList');
    let listImageElement=[...head.querySelectorAll('option:checked')]
    if(listImageElement.length<1)return;

    if(planetConfig && planetConfig.apiVersion==2)
    {
        let imageIDs=listImageElement.map(e=> e.value);
        let batchSize=planetConfig.batchSize
        let arrayOfNode=[];
        let numberOfChunck=Math.ceil(imageIDs.length/batchSize);
        for (let i=0; i<numberOfChunck; i++ ){
            arrayOfNode[i]=imageIDs.slice(i*batchSize,Math.min((i+1)*batchSize,imageIDs.length));
        }


        for (let i = 0; i < arrayOfNode.length; i++) {

            let reg=/^projects\/(.+)\/assets\/(.*$)/
            let matches=reg.exec(planetConfig.collectionPath);

            if(matches.length!=3){
                alert('Inavalide collection path! Update it in the option page')
                return
            }

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


            let imageRequest=new XMLHttpRequest();
            imageRequest.open("POST",'https://api.planet.com/compute/ops/orders/v2',true);
            //imageRequest.responseType = 'json';
            imageRequest.setRequestHeader("Content-Type", "application/json");
            imageRequest.onload = function(e) {
              if (this.status == 200) {
                alert(this.response["_links"]["_self"])
                return;
            }
            if(this.status ==429){
                this.open("POST",'https://api.planet.com/compute/ops/orders/v2',true);
                this.sendPlanetWhenPossible(JSON.stringify(requestData),true);
                return;
            }
            if (this.status >=400) {
                alert(JSON.stringify(this.response))
                return;
            }
        }



            imageRequest.sendPlanetWhenPossible(JSON.stringify(requestData),false);
            listImageElement.map((e)=>e.remove())
        }
    }

    if(planetConfig && planetConfig.apiVersion==1){
        let dblclickEvent = new Event('dblclick');
        listImageElement.forEach((e)=>e.dispatchEvent(dblclickEvent));
    }
}

// V1

var planetImageToActivate=[];
function addPanetToDownloadV1(e){
    if(planetConfig && planetConfig.apiVersion==1){
        planetImageToActivate.push(JSON.parse(e.target.getAttribute('data-forDownload')));
        e.target.remove();
        planetTransfert();
    }
}

function planetTransfert(){
    while(planetImageToActivate.length>0 && maxPlanetActivated>planetActivated){
        let im2Transfer=planetImageToActivate.shift();
        //{assetLink:features[i]._links.assets,assetType:assetConfig,itemType:item_type}
        requestPlanetImageStatus(im2Transfer);
    }
}

function requestPlanetImageStatus(im2Transfer){
    let sheckImageStatus=new XMLHttpRequest();
    sheckImageStatus.open("GET",im2Transfer.assetLink,true);
    sheckImageStatus.responseType = 'json';
    sheckImageStatus.setRequestHeader("Content-Type", "application/json");
    sheckImageStatus.onload = function(result) {
      if (this.status == 200) {
        processPlanetImageStatus(im2Transfer,this.response);
    }
    if(this.status ==429){
        requestPlanetImageStatus(im2Transfer);
        return;
    }
    if (this.status >=400) {
        alert("Error loading data from Planet.")
        return;
    }
}
sheckImageStatus.sendPlanetWhenPossible(null,true);
}

function processPlanetImageStatus(im2Transfer,reponse){
    let udm=false;
    let trueAssetType=im2Transfer.assetType;
    if(im2Transfer.assetType.includes('_udm')){
        let indexUDM = im2Transfer.assetType.indexOf('_udm');
        trueAssetType=im2Transfer.assetType.slice(0,indexUDM);
        udm=im2Transfer.assetType.slice(indexUDM+1,im2Transfer.assetType.length);
        if(im2Transfer.assetType.startsWith('basic_')){
            udm='basic_'+udm;
        }
    }
    let xmlAssetType=trueAssetType+"_xml";
    if(trueAssetType.endsWith('_sr')){
        xmlAssetType=trueAssetType.slice(0,-3)+"_xml";
    }

    if(reponse[trueAssetType].status=="inactive"){
        //activate image
        let activeLink=reponse[trueAssetType]._links.activate;
        let requestToActivate=new XMLHttpRequest();
        requestToActivate.open("GET",activeLink,true);
        requestToActivate.responseType = 'json';
        requestToActivate.setRequestHeader("Content-Type", "application/json");
        requestToActivate.onload = function(result) {
          if (this.status == 202) {
            return;
        }
        if(this.status ==429){
            this.open("GET",activeLink,true);
            this.sendPlanetWhenPossible(null,true)
            return;
        }
        alert("Error in activating "+JSON.stringify(im2Transfer));
    }
    requestToActivate.sendPlanetWhenPossible(null,true);
}
    // if(reponse[xmlAssetType].status=="inactive"){
    //     //activate image
    //     let activeLink=reponse[xmlAssetType]._links.activate;
    //     let requestToActivate=new XMLHttpRequest();
    //     requestToActivate.open("GET",activeLink,true);
    //     requestToActivate.responseType = 'json';
    //     requestToActivate.setRequestHeader("Content-Type", "application/json");
    //     requestToActivate.onload = function(result) {
    //       if (this.status == 202) {
    //         return;
    //       }
    //       if(this.status ==429){
    //         this.open("GET",activeLink,true);
    //         this.sendPlanetWhenPossible(null,true)
    //         return;
    //       }
    //       alert("Error in activating "+JSON.stringify(im2Transfer));
    //     }
    //     requestToActivate.sendPlanetWhenPossible(null,true);
    // }
    if(udm && reponse[udm].status=="inactive"){
        //activate image
        let activeLink=reponse[udm]._links.activate;
        let requestToActivate=new XMLHttpRequest();
        requestToActivate.open("GET",activeLink,true);
        requestToActivate.responseType = 'json';
        requestToActivate.setRequestHeader("Content-Type", "application/json");
        requestToActivate.onload = function(result) {
          if (this.status == 202) {
            return;
        }
        if(this.status ==429){
            this.open("GET",activeLink,true);
            this.sendPlanetWhenPossible(null,true)
            return;
        }
        alert("Error in activating UDM "+JSON.stringify(im2Transfer));
    }
    requestToActivate.sendPlanetWhenPossible(null,true);
}

if( (reponse[trueAssetType].status=="active") &&
        (!udm || reponse[udm].status=="active") /*&&
        (reponse[xmlAssetType].status=="active")*/ ){
    im2Transfer.downloadLink=reponse[trueAssetType]["location"];
if(udm) im2Transfer.downloadLink_udm=reponse[udm]["location"];

let requestMetaData=new XMLHttpRequest();
        //requestMetaData.open("GET",reponse[xmlAssetType]["location"],true);
        requestMetaData.open("GET",im2Transfer.assetLink.slice(0,-8),true);
        requestMetaData.responseType = 'json';
        requestMetaData.setRequestHeader("Content-Type", "application/json");
        requestMetaData.onload = function(result) {
          if (this.status == 200) {
            createPlanetManifest(im2Transfer,trueAssetType,udm,this.response)
            return;
        }
        if(this.status ==429){
            this.open("GET",im2Transfer.assetLink.slice(0,-8),true);
            this.sendPlanetWhenPossible(null,true)
            return;
        }
        alert("Error in loading XML "+JSON.stringify(im2Transfer));
    }
    requestMetaData.sendPlanetWhenPossible(null,true);
}else{
    requestPlanetImageStatus(im2Transfer);
}
}

function createPlanetManifest(im2Transfer,trueAssetType,udm,jsonMeta){
    let bandsName=null;
    {
        let fullName=["Blue","Green","Red","RedEdge","NIR"];

        switch(im2Transfer.itemType) {
            case "PSScene3Band":
            bandsName=[ { "id": fullName[0],"tileset_band_index": 2,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[1],"tileset_band_index": 1,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[2],"tileset_band_index": 0,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"}];
            break;
            case "PSScene4Band":
            bandsName=[ { "id": fullName[0],"tileset_band_index": 0,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[1],"tileset_band_index": 1,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[2],"tileset_band_index": 2,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[4],"tileset_band_index": 3,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"}];
            break;
            case "PSOrthoTile":
            bandsName=[ { "id": fullName[0],"tileset_band_index": 0,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[1],"tileset_band_index": 1,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[2],"tileset_band_index": 2,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[4],"tileset_band_index": 3,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"}];
            break;
            case "REOrthoTile":
            bandsName=[ { "id": fullName[0],"tileset_band_index": 0,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[1],"tileset_band_index": 1,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[2],"tileset_band_index": 2,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[3],"tileset_band_index": 3,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": fullName[4],"tileset_band_index": 4,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"}];
            break;
            case "PSScene":
            bandsName=[ { "id": "CoastalBlue","tileset_band_index": 0,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": "Blue","tileset_band_index": 1,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": "GreenI","tileset_band_index": 2,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": "GreenII","tileset_band_index": 3,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": "Yellow","tileset_band_index": 4,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": "Red","tileset_band_index": 5,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": "RedEdge","tileset_band_index": 6,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"},
            { "id": "NIR","tileset_band_index": 7,"tileset_id":"colorImage","pyramidingPolicy": "MEAN"}];
            break;
        }
        if(planetConfig.bandNomenclature=='default'){
            for (let i = bandsName.length - 1; i >= 0; i--) {
                bandsName[i].id='B'+(i+1);
            }
        }
        if(planetConfig.bandNomenclature=='hybrid'){
            for (let i = bandsName.length - 1; i >= 0; i--) {
                bandsName[i].id='B'+(i+1)+'_'+bandsName[i].id;
            }
        }
    }

    let UDMBandsName=[];
    if(udm){
        switch(udm.toLowerCase()){
            case "udm":
            UDMBandsName=[ { "id": "UDM","tileset_band_index": 0,"tileset_id":"udm","pyramidingPolicy": "SAMPLE"}];
            break;
            case "udm2":
            case "udm_2":
            UDMBandsName=[ { "id": "Clear", "tileset_band_index": 0,"tileset_id":"udm","pyramidingPolicy": "MEAN"},
            { "id": "Snow", "tileset_band_index": 1,"tileset_id":"udm","pyramidingPolicy": "MEAN"},
            { "id": "Shadow", "tileset_band_index": 2,"tileset_id":"udm","pyramidingPolicy": "MEAN"},
            { "id": "Light_haze", "tileset_band_index": 3,"tileset_id":"udm","pyramidingPolicy": "MEAN"},
            { "id": "Heavy_haze", "tileset_band_index": 4,"tileset_id":"udm","pyramidingPolicy": "MEAN"},
            { "id": "Cloud", "tileset_band_index": 5,"tileset_id":"udm","pyramidingPolicy": "MEAN"},
            { "id": "Confidence", "tileset_band_index": 6,"tileset_id":"udm","pyramidingPolicy": "MEAN"},
            { "id": "UDM", "tileset_band_index": 7,"tileset_id":"udm","pyramidingPolicy": "SAMPLE"}];
            break;
        }
        if(planetConfig.bandNomenclature=='default'){
            for (let i = UDMBandsName.length - 1; i >= 0; i--) {
                UDMBandsName[i].id='Q'+(i+1);
            }
        }
        if(planetConfig.bandNomenclature=='hybrid'){
            for (let i = UDMBandsName.length - 1; i >= 0; i--) {
                UDMBandsName[i].id='Q'+(i+1)+'_'+UDMBandsName[i].id;
            }
        }
    }

    let meta=jsonMeta.properties;
    meta.id=jsonMeta.id;
    meta.ingestedwith='Open Earth Engine chrome extenstion, version:'+OEEex_version;
    meta.ingestionTime=Date.now;
    meta.assetType=trueAssetType.assetType;
    meta.udmType=(udm?udm:'no_udm');
    let keys =Object.keys(meta);
    for (let i = 0; i < keys.length; i++) {
        if(typeof meta[keys[i]] == typeof true){
            meta[keys[i]]=Number(meta[keys[i]]);
        }
    }

    let planetManifest=
    {
        "name": planetConfig.collectionPath+"/"+jsonMeta.id+"_"+im2Transfer.assetType,
        "tilesets": [
        {
            "id": "colorImage", 
            "sources": [
            {
                "uris": [
                im2Transfer.downloadLink
                ]
            }
            ]
        }
        ],
        /*"mask_bands": {
            "tileset_id": "udm"
        },*/
        "start_time": {
            "seconds": Math.round(Date.parse(jsonMeta.properties.acquired)/1000)
        },
        "end_time": {
            "seconds": Math.round(Date.parse(jsonMeta.properties.acquired)/1000)+1
        },
        "properties":meta
    };
    if(udm){
        planetManifest["tilesets"]
        .push({
            "id": "udm", 
            "sources": [
            {
                "uris": [
                im2Transfer.downloadLink_udm
                ]
            }
            ]
        });
        bandsName.push(...UDMBandsName);
    }
    if(bandsName)
    {
        planetManifest["bands"]=bandsName;
    }
    let ue=exploreJson2Upload(planetManifest,null);
    for (var i = ue.length - 1; i >= 0; i--) {
    	ue[i].isPlanet=true;
    }
    addManifestToIngestInGEE(planetManifest,ue);
}


// limit planet request
var listPlanetRequest=[];
XMLHttpRequest.prototype.sendPlanetWhenPossible=function(dataValue,atStart=false){
    let value={request:this, data:dataValue};
    if(atStart){
        listPlanetRequest.unshift(value);
    }
    else{
        listPlanetRequest.push(value);
    }
    checkForPlanetRequest();
}

var planetIntervalCheck=null;

let lastPlanetCall=0;
function checkForPlanetRequest(){
    if(!planetIntervalCheck){
        planetIntervalCheck=setInterval(checkForPlanetRequest, 250);
    }
    if(listPlanetRequest.length>0){
        if (Date.now()-lastPlanetCall>250)
        {
            lastPlanetCall=Date.now();
            let obj=listPlanetRequest.shift();
            if('downloadCountShift' in obj)
            	parallelDownload+=obj.downloadCountShift;
            obj.request.send(obj.data);
            lastPlanetCall=Date.now();
        }
    }
    else
    {
        clearInterval(planetIntervalCheck);
        planetIntervalCheck=null;
    }
};


// overload function
setTimeout(function(){
    let originalAddCommonToDownloadList=addCommonToDownloadList;
    addCommonToDownloadList=function(upload, toTheFront=false){
        // if it's a planet request it need to go in a different pipline
        if('isPlanet' in upload){
            let value={request:upload, data:null, downloadCountShift:1};
        if (toTheFront)
            listPlanetRequest.unshift(value);
        else
            listPlanetRequest.push(value);
        checkForPlanetRequest();
    }else
    originalAddCommonToDownloadList(upload, toTheFront);
}
},0);