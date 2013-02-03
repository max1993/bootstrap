function _(x){
	return document.getElementById(x);
}
function ResourceList(a){

}

function renderPagelet(a){
	console.log(a);
}
function LoremIpsum(b,c,d,e){
	for(var a=0;a<c;a++)0===a%d&&1<a&&document.write(e),document.write(b);
}
function loadscript(url,callback){
	var script=document.createElement("script");
		script.type="text/javascript";
	if(script.readyState){
		script.onreadystatechange=function(){
			if(script.readyState=="loaded"||script.readyState=="complete"){
				script.onreadystatechange=null;
				callback();
			}
		};
	}else{
		script.onload=function(){
			callback();
		};
	}
	script.src=url;
	document.getElementsByTagName("head")[0].appendChild(script);
}
function doAjaxQuery(a){
	ajaxObject=!1;
	if(window.XMLHttpRequest)ajaxObject=new XMLHttpRequest,ajaxObject.overrideMimeType&&ajaxObject.overrideMimeType("text/xml");
	else if(window.ActiveXObject)try{
		ajaxObject=new ActiveXObject("Msxml2.XMLHTTP")
	}catch(b){
		try{
			ajaxObject=new ActiveXObject("Microsoft.XMLHTTP")
		}catch(c){}
	}
	if(!ajaxObject)return alert("Sorry, your browser seems to not support this functionality."),!1;
	ajaxObject.onreadystatechange=ajaxResponse;
	ajaxObject.open("GET",a,!0);
	ajaxObject.send(null);
	return!0
}

function ajaxResponse(e){
	console.log(e);
}
!function(htm){
	lct=null,nearest=function(elm,tag){while(elm && elm.nodeName != tag){elm=elm.parentNode;}return elm;};
	htm.onclick=function(e){
		e=e||window.event;
		lct=e.target||e.srcElement;
		var elem=nearest(lct,'A')||htm,href=elem.getAttribute('ajaxify')||elem.href;
		switch(elem.rel){
			case 'dialog':case 'dialog-post':loadscript('dialog',function(){Dialog.bootstrap(href,null,elem.rel=='dialog');});break;
			case 'async':case 'async-post':loadscript('async',function(){AsyncRequest.bootstrap(href,elem);});break;
			default:return;
		}
		return false;
	};
	htm.onsubmit=function(e){
		e=e||window.event;
		var elem=e.target||e.srcElement;
		if(!elem||elem.nodeName != 'FORM'||!elem.getAttribute('ajaxify')){return;}
		loadscript('dom-form',function(){bootstrap_form(elem,lct);});
		return false;
	};
	htm.className=htm.className.replace('no_js','');
}(document.documentElement)