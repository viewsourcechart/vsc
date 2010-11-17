/* *********************************************************************************

Copyright (C) 2005-2010  Jennifer Madden
View Source Chart is a Source Charting DOM Inspector

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

JenniferMadden.com
jennifer@jennifermadden.com 

*********************************************************************************** */
/*
View Source Chart 3.02
8/2010 Inline JavaScripts with more than 4096 characters (aka 1st text node in FX) are cut off at that point.
Inspect the DOM at lightning speed. If you're new to the containment concept, one glance at a Source Chart and you're over the learning curve.
3/2010 Jamie Butterworth (Angel) Updated View Source Chart to comply with AMO namespace standard.
9/2008 Jamie Butterworth Update to work on Fx3: fixed view in popup window mode, box-collapse-into-viewport working. 
9/24/2006 Jennifer Madden
Version 2.5 displays javascripts as part of a page chart. Cool!

9/18/2006 Jennifer Madden
V2.4.04 Moved all style declarations into separate javascript file, "style.js", which in turn writes decs to the source chart window. This allows for easy script access, as well as easy css editing with Web Developer Extension. 

06/03/2006 Jennifer Madden
Version 2.4 attempts to allow copying of text without the collapsing of containers. If text is selected, a container will not collapse. Containers can, however, be expanded if text is selected. This version makes further improvements to whitespace handling, and creates a seperate style sheet for easy modification of default styles.
*/
//
//  Tue Jul 12 21:01:16 2005 -- Scott R. Turner
//
//  Modifications to make VRS compatible with Platypus.
//

//
//  getComments
//  Tue Jul 12 21:01:36 2005 -- Scott R. Turner
//  Added comments
//  Extracts all the comment nodes into an array.




// Here is the stringbundle definition to localize one string of the .js file
// goofy Feb 8th 2007
if(!com) var com = {};
if(!com.jmadden) com.jmadden = {};
if(!com.jmadden.vrsOverlay) com.jmadden.vrsOverlay = {};


com.jmadden.vrsOverlay = {
  vrspagetitle: "",
  vrsmotto: "",
  gVRSwin: false,
  vsc_scripts: false,
  scrTags: false,
  vscEndPoint: "",
  defineStrings: function(){
	var gvrsBundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
	var mystrings = gvrsBundle.createBundle("chrome://vrs/locale/vrs.properties");
	com.jmadden.vrsOverlay.vrspagetitle = mystrings.GetStringFromName("PageTitle");
	com.jmadden.vrsOverlay.vrsmotto = mystrings.GetStringFromName("MaddenMotto");
  },
  getComments: function (pnode) {
	return com.jmadden.vrsOverlay.doGetComments(pnode, new Array());
  },
  doGetComments: function (node, c) {
	if (node.nodeType == 8) {
	   c.push(node.nodeValue);
	} else if (node.childNodes != null) {
	  for (var i=0; i < node.childNodes.length; ++i ) {
		com.jmadden.vrsOverlay.doGetComments(node.childNodes.item(i), c );
	  }
	}
	return c;
  },
  /*  
  Puts space after "<" and space before ">" to create flag 
  which will keep commented html from being styled
  */
  alteredComment: function (comment) {
	  comment = comment.replace(/</g,"< ").replace(/>/g," >");
	  return comment;
  },
  getScripts: function (scriptTagArray, scriptsHolder) {
	com.jmadden.vrsOverlay.scrTags = scriptTagArray;
	for(var si=0; si<com.jmadden.vrsOverlay.scrTags.length; si++) {
		  if (com.jmadden.vrsOverlay.scrTags[si].childNodes[0]) {
if(com.jmadden.vrsOverlay.scrTags[si].childNodes.length > 1){
var thisisthelength = com.jmadden.vrsOverlay.scrTags[si].childNodes.length;
for(var xx=1; xx<thisisthelength; xx++){
com.jmadden.vrsOverlay.scrTags[si].childNodes[xx].nodeValue="";
}
}
scriptsHolder.push(com.jmadden.vrsOverlay.scrTags[si].childNodes[0].nodeValue);
			com.jmadden.vrsOverlay.scrTags[si].childNodes[0].nodeValue="scriptHolderArray"+si; //changing contents of script tags.
		  } else {
			scriptsHolder.push("");
		  }
	}	
	return scriptsHolder;
  },
  /*  isFrameset()
	  Tue Jul 12 21:03:47 2005 -- Scott R. Turner
	  Added comments
      Called from the tools menu; uses window.content to identify the
      source to display.
  
	  Sept 26, 2005 Jennifer Madden
	  Changed function name from isFrameset to isFrameset. 
	  Reflected this change in vrsOverlay.xul (called from the Tools menu).
	  Changed var name from win to vrs_getFrame. */
  isFrameset: function () {
	var vrs_getFrame = window.content;	
	
	//the following line replaces above "script markers" functionality with actual javascripts!!
	com.jmadden.vrsOverlay.vsc_scripts = com.jmadden.vrsOverlay.getScripts(vrs_getFrame.document.getElementsByTagName("script"), new Array());
	
	var pageContents = vrs_getFrame.document.getElementsByTagName("html")[0].innerHTML;
	var ca = com.jmadden.vrsOverlay.getComments(vrs_getFrame.document.getElementsByTagName("html")[0]);
	
	for (var a=0; a<ca.length; a++) {
		pageContents=pageContents.replace("<!--"+ca[a]+"-->","<!--"+com.jmadden.vrsOverlay.alteredComment(ca[a])+"-->");
	};
	
	var rendered = pageContents;
	com.jmadden.vrsOverlay.handleSource(rendered);
  },  
  /*
  The following  function prepares source to be styled; 
  handles JavaScript code found between script tags,
  finds head and body comments and flags all tags 
  within them so they are not treated like regular tags,
  divides source into two groups - head and body, 
  then escapes them in order to remove extra returns,
  rebuilds the body tag and re-inserts it back into 
  place before sending altered source to styling function.
  
  Sept 26, 2005 Jennifer Madden
  Changed function name from vrsWin to prepareSource.
  Reflected this change in vrsOverlay.xul (called from the right click menu).
  Changed var name from win to vrs_getWin.
  */
  prepareSource: function () {
    var vrs_getWin = document.commandDispatcher.focusedWindow;
	
	//the following line replaces above "script markers" functionality with actual javascripts!!
	com.jmadden.vrsOverlay.vsc_scripts = com.jmadden.vrsOverlay.getScripts(vrs_getWin.document.getElementsByTagName("script"), new Array());

	var vsc_styleTag = vrs_getWin.document.getElementsByTagName("style");//TO DO: insert breaks

    var headContents = vrs_getWin.document.getElementsByTagName("head")[0].innerHTML;
    var bodyContents = vrs_getWin.document.getElementsByTagName("body")[0].innerHTML;
    var bodyTag = vrs_getWin.document.getElementsByTagName("body")[0];
    var attslist = "";

    var bc = com.jmadden.vrsOverlay.getComments(vrs_getWin.document.getElementsByTagName("body")[0]); 
	//flag html in body's comments
    for(var b = 0; b < bc.length; b++){
	  bodyContents = bodyContents.replace("<!--"+bc[b]+"-->","<!--"+com.jmadden.vrsOverlay.alteredComment(bc[b])+"-->");
    }
    var hc = com.jmadden.vrsOverlay.getComments(vrs_getWin.document.getElementsByTagName("head")[0]); 
	
	//flag html in head's comments
    for(var a=0; a<hc.length; a++){
	  headContents=headContents.replace("<!--"+hc[a]+"-->","<!--"+com.jmadden.vrsOverlay.alteredComment(hc[a])+"-->");
    };

    for(i=0; i < bodyTag.childNodes[0].parentNode.attributes.length; i++){ 
	  //rebuild body tag with all its attributes
	  atts = bodyTag.childNodes[0].parentNode.attributes[i];
	  attslist += " " + atts.nodeName + "=\"" + atts.nodeValue + "\"";
    };
	
	headContents=headContents.replace(/\r+|\n+/g,'');
	bodyContents=bodyContents.replace(/\r+|\n+/g,'');
    
    var rendered = "<head>" + headContents + "</head>\n<body"+
		attslist + ">" + bodyContents + "\n</body>";
	
    com.jmadden.vrsOverlay.handleSource(rendered);
  },
  /*  handleSource
	  Tue Jul 12 21:05:03 2005 -- Scott R. Turner
      placed code to find and code to replace with in multi-dimensional array
      and split/join methods moved inside a loop which iterates through array.
	  the handleSource function takes the html string and adds 
	  text styling, color-coding and formatting using split and join 
	  methods to find tags and replace them with renderable, styled tags
  */
  handleSource: function (rendered) {
	var vscContainer_TitleCursor = ' onmouseover="this.title=this.childNodes[0] && this.childNodes[0].nodeType!=1 ? this.childNodes[0].nodeValue : this.title;this.style.cursor=\'pointer\';"';
	var vscTag_TitleCursor = ' onmouseover="this.style.cursor=\'auto\';this.title=\' \';"';
	/*var vscHeadRE= rendered.match(/<[h][e][a][d][\s]*[\w]*[\S]*[\w]*[\s]*[\S]*[\s]*[\S]*[\s]*[\w]*>/);  
	//vscHeadRE=vscHeadRE.toString();
	//vscHeadRE=vscHeadRE.replace("<","&lt;");
	//vscHeadRE=vscHeadRE.replace("<","&gt;");
	*/
    var rendered_table =
	[
	  ["<","\n<"],
	  [">",">\n"],
	  ["&","&amp;"],
	  ["<","&lt;"],
	  [">","&gt;"],
	  
	  ["&lt;head","<div id=\"headTag\"" + vscContainer_TitleCursor + ">&lt;head&gt;<span style=\"cursor:auto;\" onmouseover=\"this.title=' '\">"],
	  ["&lt;/head&gt;","</span>&lt;/head&gt;</div>"],
	  ["onmouseover=\"this.title=' '\">&gt;","onmouseover=\"this.title=' '\">"],	 
	  
	  ["&lt;body","<div id=\"bodyTag\"" + vscContainer_TitleCursor + ">&lt;body"],
	  ["&lt;/body&gt;","&lt;/body&gt;</div>"],
	  
	  ["&lt;title","<div id=\"titleTag\"" + vscContainer_TitleCursor + ">&lt;title"],
	  ["&lt;/title&gt;","&lt;/title&gt;</div>"],
	  
	  ["&lt;script","<div id=\"scriptTag\"" + vscContainer_TitleCursor + ">&lt;script"],
	  ["&lt;/script&gt;","&lt;/script&gt;</div>"],
	  
	  ["&lt;style","<div id=\"styleTag\"" + vscContainer_TitleCursor + ">&lt;style"],
	  ["&lt;/style&gt;","&lt;/style&gt;</div>"],
	  
	  ["&lt;div","<div id=\"divTag\"" + vscContainer_TitleCursor + ">&lt;div"],
	  ["&lt;/div&gt;","&lt;/div&gt;</div>"],
	  
	  ["&lt;span","<div id=\"spanTag\"" + vscContainer_TitleCursor + ">&lt;span"],
	  ["&lt;/span&gt;","&lt;/span&gt;</div>"],
	  
	  ["&lt;table","<div id=\"tableTag\"" + vscContainer_TitleCursor + ">&lt;table"],//#C4D9FF #3399cc
	  ["&lt;/table&gt;","&lt;/table&gt;</div>"],
	  
	  ["&lt;caption","<div id=\"captionTag\"" + vscTag_TitleCursor +">&lt;caption"],
	  ["&lt;/caption&gt;","&lt;/caption&gt;</div>"],
	  
	  ["&lt;tbody","<div id=\"tbodyTag\"" + vscTag_TitleCursor +">&lt;tbody"],
	  ["&lt;/tbody&gt;","&lt;/tbody&gt;</div>"],
	  
	  ["&lt;thead","<div id=\"theadTag\"" + vscContainer_TitleCursor +">&lt;thead"],
	  ["&lt;/thead&gt;","&lt;/thead&gt;</div>"],
	  
	  ["&lt;tfoot","<div id=\"tfootTag\"" + vscContainer_TitleCursor +">&lt;tfoot"],
	  ["&lt;/tfoot&gt;","&lt;/tfoot&gt;</div>"],
	  
	  ["&lt;tr","<div id=\"trTag\"" + vscContainer_TitleCursor + ">&lt;tr"],//bdr #48d1cc back #e0ffff
	  ["&lt;/tr&gt;","&lt;/tr&gt;</div>"],
	  
	  ["&lt;th ","<div id=\"thTag\">&lt;th "],
	  ["&lt;th&gt;","<div id=\"thTag\">&lt;th&gt;"],
	  ["&lt;/th&gt;","&lt;/th&gt;</div>"],
	  
	  ["&lt;td","<div id=\"tdTag\"" + vscContainer_TitleCursor + ">&lt;td"],
	  ["&lt;/td&gt;","&lt;/td&gt;</div>"],
	  
	  ["&lt;frameset","<div id=\"framesetTag\"" + vscContainer_TitleCursor + ">&lt;frameset"],
	  ["&lt;/frameset&gt;","&lt;/frameset&gt;</div>"],
	  
	  ["&lt;iframe","<div id=\"iframeTag\"" + vscContainer_TitleCursor + ">&lt;iframe"],
	  ["&lt;/iframe&gt;","&lt;/iframe&gt;</div>"],
	  
	  ["&lt;ul","<div id=\"ulTag\"" + vscContainer_TitleCursor + ">&lt;ul"],
	  ["&lt;/ul&gt;","&lt;/ul&gt;</div>"],
	  
	  ["&lt;ol","<div id=\"olTag\"" + vscContainer_TitleCursor + ">&lt;ol"],
	  ["&lt;/ol&gt;","&lt;/ol&gt;</div>"],
	  
	  ["&lt;dl","<div id=\"dlTag\"" + vscContainer_TitleCursor + ">&lt;dl"],
	  ["&lt;/dl&gt;","&lt;/dl&gt;</div>"],
	  
	  ["&lt;dt","<div id=\"dtTag\"" + vscContainer_TitleCursor + ">&lt;dt"],
	  ["&lt;/dt&gt;","&lt;/dt&gt;</div>"],
	  
	  ["&lt;dd","<div id=\"ddTag\"" + vscContainer_TitleCursor + ">&lt;dd"],
	  ["&lt;/dd&gt;","&lt;/dd&gt;</div>"],
	  
	  ["&lt;li&gt;","<div id=\"liTag\"" + vscContainer_TitleCursor + ">&lt;li&gt;"],
	  ["&lt;li ","<div id=\"liTag\"" + vscContainer_TitleCursor + ">&lt;li "],
	  ["&lt;/li&gt;","&lt;/li&gt;</div>"],
	  
	  ["&lt;p&gt;","<div id=\"pTag\"" + vscContainer_TitleCursor + ">&lt;p&gt;"],
	  ["&lt;p ","<div id=\"pTag\"" + vscContainer_TitleCursor + ">&lt;p "],//#C4D9FF
	  ["&lt;/p&gt;","&lt;/p&gt;</div>"],
	  
	  ["&lt;blockquote","<div id=\"blockquoteTag\"" + vscContainer_TitleCursor + ">&lt;blockquote"],
	  ["&lt;/blockquote&gt;","&lt;/blockquote&gt;</div>"],
	  
	  ["&lt;a ","<div id=\"aTag\"" + vscTag_TitleCursor + ">&lt;a "],
	  ["&lt;a&gt;","<div id=\"aTag\"" + vscTag_TitleCursor + ">&lt;a&gt;"],
	  ["&lt;/a&gt;","&lt;/a&gt;</div>"],
	  
	  ["&lt;form","<div id=\"formTag\"" + vscTag_TitleCursor +">&lt;form"],
	  ["&lt;/form&gt;","&lt;/form&gt;</div>"],
	  
	  ["&lt;select","<div id=\"selectTag\"" + vscTag_TitleCursor +">&lt;select"],
	  ["&lt;/select&gt;","&lt;/select&gt;</div>"],
	  
	  ["&lt;legend","<div id=\"legendTag\"" + vscTag_TitleCursor +">&lt;legend"],
	  ["&lt;/legend&gt;","&lt;/legend&gt;</div>"],
	  
	  ["&lt;fieldset","<div id=\"fieldsetTag\"" + vscTag_TitleCursor +">&lt;fieldset"],
	  ["&lt;/fieldset&gt;","&lt;/fieldset&gt;</div>"],
	  
	  ["&lt;textarea","<div id=\"textareaTag\"" + vscTag_TitleCursor +">&lt;textarea"],
	  ["&lt;/textarea&gt;","&lt;/textarea&gt;</div>"],
	  
	  ["&lt;img","&nbsp;&nbsp;&lt;img"],
	  ["&lt;br","&nbsp;&nbsp;&lt;br"],
	  ["&lt;link","&nbsp;&nbsp;&lt;link"],
	  ["&lt;meta","&nbsp;&nbsp;&lt;meta"],
	  ["&lt;input","&nbsp;&nbsp;&lt;input"],
	  ["&lt;button","&nbsp;&nbsp;&lt;button"],
	  ["&lt;/button","&nbsp;&nbsp;&lt;/button"],
	  ["&lt;option","&nbsp;&nbsp;&lt;option"],
	  ["&lt;/option","&nbsp;&nbsp;&lt;/option"],
	  
	  ["&lt;!--","<div id=\"commTag\"" + vscContainer_TitleCursor + ">&lt;!--"],
	  ["--&gt;","--&gt;</div>"],
	  
	  ["&lt;em&gt;","<div id=\"emTag\"" + vscTag_TitleCursor +">&lt;em&gt;"],
	  ["&lt;em ","<div id=\"emTag\"" + vscTag_TitleCursor +">&lt;em "],
	  ["&lt;/em&gt;","&lt;/em&gt;</div>"],
	  
	  ["&lt;i&gt;","<div id=\"iTag\"" + vscTag_TitleCursor +">&lt;i&gt;"],
	  ["&lt;i ","<div id=\"iTag\"" + vscTag_TitleCursor +">&lt;i "],
	  ["&lt;/i&gt;","&lt;/i&gt;</div>"],
	  
	  ["&lt;strong","<div id=\"strongTag\"" + vscTag_TitleCursor +">&lt;strong"],
	  ["&lt;/strong&gt;","&lt;/strong&gt;</div>"],
	  
	  ["&lt;b&gt;","<div id=\"bTag\"" + vscTag_TitleCursor +">&lt;b&gt;"],
	  ["&lt;b ","<div id=\"bTag\"" + vscTag_TitleCursor +">&lt;b "],
	  ["&lt;/b&gt;","&lt;/b&gt;</div>"],
	  
	  ["&lt;u&gt;","<div id=\"uTag\"" + vscTag_TitleCursor +">&lt;u&gt;"],
	  ["&lt;u ","<div id=\"uTag\"" + vscTag_TitleCursor +">&lt;u "],
	  ["&lt;/u&gt;","&lt;/u&gt;</div>"],
	  
	  ["&lt;font","<div id=\"fontTag\"" + vscTag_TitleCursor +">&lt;font"],
	  ["&lt;/font&gt;","&lt;/font&gt;</div>"],
	  
	  ["&lt;h1","<div id=\"h1Tag\"" + vscTag_TitleCursor +">&lt;h1"],
	  ["&lt;/h1&gt;","&lt;/h1&gt;</div>"],
	  
	  ["&lt;h2","<div id=\"h2Tag\"" + vscTag_TitleCursor +">&lt;h2"],
	  ["&lt;/h2&gt;","&lt;/h2&gt;</div>"],
	  
	  ["&lt;h3","<div id=\"h3Tag\"" + vscTag_TitleCursor +">&lt;h3"],
	  ["&lt;/h3&gt;","&lt;/h3&gt;</div>"],
	  
	  ["&lt;h4","<div id=\"h4Tag\"" + vscTag_TitleCursor +">&lt;h4"],
	  ["&lt;/h4&gt;","&lt;/h4&gt;</div>"],
	  
	  ["&lt;h5","<div id=\"h5Tag\"" + vscTag_TitleCursor +">&lt;h5"],
	  ["&lt;/h5&gt;","&lt;/h5&gt;</div>"],
	  
	  ["&lt;h6","<div id=\"h6Tag\"" + vscTag_TitleCursor +">&lt;h6"],
	  ["&lt;/h6&gt;","&lt;/h6&gt;</div>"],
	  
	  ["&lt;center","<div id=\"centerTag\"" + vscTag_TitleCursor +">&lt;center"],
	  ["&lt;/center&gt;","&lt;/center&gt;</div>"],
	  
	  ["&lt;br clear=\"all\"&gt;","<br clear=\"all\"" + vscTag_TitleCursor + ">&lt;br clear=\"all\"&gt;"]
	];

    for (var i=0;i < rendered_table.length;i++) {
	  rendered = rendered.split(rendered_table[i][0]);
	  rendered = rendered.join(rendered_table[i][1]);
    };

	/*removes whitespace using regexps. */
	rendered=rendered.replace(/\n\s*\n/gm,'\n');
	rendered=rendered.replace(/\n<blockquote/gm,'<blockquote');
	rendered=rendered.replace(/<\/blockquote>\n/gm,'</blockquote>');
	rendered=rendered.replace(/\n<div/gm,'<div');
	rendered=rendered.replace(/<\/div>\n/gm,'</div>');
	
	//replacing the "<" in array-stored javascripts with "&lt;"
	for(var sc=0; sc < com.jmadden.vrsOverlay.vsc_scripts.length; sc++){
	  if(com.jmadden.vrsOverlay.vsc_scripts[sc]!=""){
		com.jmadden.vrsOverlay.vsc_scripts[sc] = com.jmadden.vrsOverlay.vsc_scripts[sc].replace(/</gm,"&lt;");
	  } else {
		continue;
	  }
	}
	
	for(var sc2=0; sc2<com.jmadden.vrsOverlay.vsc_scripts.length; sc2++){
	  if(com.jmadden.vrsOverlay.vsc_scripts[sc2]!=""){
		//put array-stored scripts back into rendered string to display in chart
		rendered = rendered.replace('scriptHolderArray'+sc2,com.jmadden.vrsOverlay.vsc_scripts[sc2]);	
		
		//put scripts back into page source in case vsc is executed again w/out refreshing
		//com.jmadden.vrsOverlay.scrTags[sc2].childNodes[0].nodeValue = com.jmadden.vrsOverlay.scrTags[sc2].childNodes[0].nodeValue.replace('scriptHolderArray'+sc2,com.jmadden.vrsOverlay.vsc_scripts[sc2]);
	  } else {
		continue;
	  }
	}
	
	/*
	October 30, 2005 Jennifer Madden
	added DOCTYPE tag and HTML tag along with their attributes to Source Chart
	VRSC version 1.3
	*/
	var vrs_doctypeTag = "";
	var vrs_htmlTag = "";
	for(var len=0; len < window.content.document.childNodes.length; len++){
	  //root document will have at least 1 childNode (HTML tag), or 2 childNodes (doctype & HTML tag)
	  var rootDocChild = window.content.document.childNodes[len];
	  if(rootDocChild.nodeType==1){		//is first root doc childNode an element? 
		//if so, then it must be an HTML tag (static or dynamically added by Fx) 
		if(rootDocChild.attributes.length>0){//if this html tag has at least one attribute
			var vrs_htmlAtts = "";
			var vrs_htmlAttsLen = rootDocChild.attributes.length;
				for(var a=0; a<vrs_htmlAttsLen; a++){//get all attribute names/values
				vrs_htmlAtts += " " + rootDocChild.attributes[a].nodeName + "=\"" + rootDocChild.attributes[a].nodeValue + "\"";
				}
			vrs_htmlTag += "&lt;"+rootDocChild.nodeName + "<span style=\"color:#669966;\">" + vrs_htmlAtts + "</span>&gt;";
		}else{//the html tag has no attributes
			vrs_htmlTag += "&lt;"+rootDocChild.nodeName+"&gt;";
		}
	  }else{
		if(rootDocChild.nodeType==10){//it's not an HTML tag, so it must be the doctype dtd	
		  var doc_type = window.content.document.doctype;
		  vrs_doctypeTag += "<span style=\"color:#37A8E9;font-style: italic;\">&lt;!DOCTYPE "+doc_type.name;
		  vrs_doctypeTag += (doc_type.publicId) ? " PUBLIC \""+doc_type.publicId+"\"" : " SYSTEM ";						
		  vrs_doctypeTag += (doc_type.systemId) ? "<br>\""+ doc_type.systemId+"\"&gt;" : "&gt;";
		  vrs_doctypeTag += "</span><BR>";
		}
	  }  //end else
	}//end for
  
	//GOT RID OF encodeURIComponent but now have to replace \n with br tags to preserve formatting. 
	//using escape preserved formatting but destroyed display of non-english characters
	rendered = rendered.replace(/\n/gm,"<br>");
	rendered = rendered.replace(/<br><br>/gm,"<br>");//scripts' whitespace isn't handled, so handle it here
	var VSC_Source="";
	
	VSC_Source += "<script type=\"application/x-javascript\" src=\"chrome://vrs/content/collapse.js\"></script>\n";
	VSC_Source += com.jmadden.style + "";
	
	VSC_Source += "<span style=\"white-space: -moz-pre-wrap;font-family:verdana;font-size:10px;\">";
	VSC_Source += vrs_doctypeTag + vrs_htmlTag + rendered+"&lt;/html&gt;";
	VSC_Source += "</span>";
	VSC_Source += "<!-- "+com.jmadden.vrsOverlay.vrsmotto+" -->";
  
	//
	//  Tue Jul 12 21:05:03 2005 -- Scott R. Turner
	//  Added preferences checkbox with option to view source in new window
	//  Check to see if the user wants to open in a window or
	//  a tab.
	//
	var pref = Components.classes["@mozilla.org/preferences-service;1"].
	getService(Components.interfaces.nsIPrefService).
	getBranch("extensions.vrs.");//components classes code obsolete
	
	contentTitle=window.content.document.title;
	
	if(pref.getPrefType("sourcewin") == pref.PREF_BOOL && pref.getBoolPref("sourcewin") == true) {		//open in a new window	
	  gBrowser.selectedTab=gBrowser.addTab();
	  var newvrsTab=gBrowser.getBrowserForTab(gBrowser.selectedTab);
	  newvrsTab.addEventListener("load", function() { newvrsTab.contentDocument.body.innerHTML = VSC_Source;newvrsTab.contentDocument.title="View Source Chart of: "+ contentTitle;}, true);  //getElementsByTagName("html")[0]
	} else {
	  com.jmadden.vrsOverlay.gVRSwin = window.open("", "", "height=650,width=850,scrollbars=1,menubar=0,status=0,toolbar=0,location=0,resizable=1");
	  com.jmadden.vrsOverlay.gVRSwin.content.document.body.innerHTML = VSC_Source;
	  com.jmadden.vrsOverlay.gVRSwin.content.document.title="View Source Chart of: "+ contentTitle;
	}
  }
};

com.jmadden.vrsOverlay.defineStrings();