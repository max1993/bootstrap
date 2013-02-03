function _(x){
	return document.getElementById(x);
}
function ResourceList(a){

}
function renderPagelet(a){
	console.log(a);
}

//on page BEGIN
ResourceList({
	"jquery":"//ajax.googleapi.com/",
	"main":""
});
renderPagelet({
	id:1
	resources:["jquery","main"],
	html:'<a href=""></a>'
});
//on page END