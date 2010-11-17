if(!com) var com = {};
if(!com.jmadden) com.jmadden = {};
if(!com.jmadden.style) com.jmadden.style = "";

com.jmadden.style = '<style type="text/css">\n'+
	/* NOTE: border declarations must be inline for collapse feature to function */
	'div { padding:5px;margin:7px;font-family:verdana;font-size:10px;word-wrap: break-word;}\n'+
	
	'#headTag { border:dashed 1px #dcdcdc; }\n'+
	'#titleTag { color:#556b2f;font-weight:bold;border:dashed 1px #556b2f; }\n'+
	'#scriptTag { color:#009900;border:dashed 1px #009900; }\n'+
	'#statements { border:1px dashed; }\n'+
	'#styleTag { color:#8b008b;border:dashed 1px #8b008b;background-color:#ffffff; }\n'+
	'#rulesChar { margin:0px 3px 0px 7px; }\n'+
	
	'#bodyTag { font-family:verdana;font-size:10px;border:dashed 1px #000000; }\n'+
	
	'#divTag { background-color:#e6e6fa;border:solid 1px #d8bfd8; }\n'+
	'#spanTag { background-color:#ffffe0;border:solid 1px #FFDF80; }\n'+
	
	'#tableTag { background-color:#E8F0FF;margin:9px;border:solid 1px #99ccff; }\n'+
	'#captionTag { text-align:center; }\n'+
	'#tbodyTag { margin:7px 7px 7px 3px; }\n'+
	'#theadTag { margin:7px 7px 7px 3px; }\n'+
	'#tfootTag { margin:7px 7px 7px 3px; }\n'+
	'#trTag { border:dashed 1px #99ccff;border:dashed 1px #99ccff; }\n'+
	'#thTag { border:dotted 1px #99ccff;border:dotted 1px #99ccff; }\n'+
	'#tdTag { border:dotted 1px #99ccff;border:dotted 1px #99ccff; }\n'+ 
	
	'#framesetTag { margin:7px;background-color:#ffe4ca;border:solid 1px #deb887; }\n'+
	'#iframeTag { background-color:#c2e0ec;border:solid 1px #94c8de; }\n'+
	'#ulTag { background-color:#E6F7DA;border:solid 1px #ADCA98; }\n'+
	'#olTag { background-color:#E6F7DA;border:solid 1px #ADCA98; }\n'+
	'#dlTag { background-color:#E6F7DA;border:solid 1px #ADCA98; }\n'+
	'#dtTag { background-color:#E6F7DA;border:dotted 1px #ADCA98; }\n'+
	'#ddTag { background-color:#E6F7DA;margin:7px 7px 7px 27px;border:dashed 1px #ADCA98; }\n'+
	'#liTag { background-color:#E6F7DA;border:dotted 1px #ADCA98; }\n'+
	
	'#pTag { background-color:#FBF0E9;border:solid 1px #F3D9C7; }\n'+
	'#blockquoteTag { background-color:#e0ffff;border:solid 1px #48d1cc; }\n'+
	'#commTag { color:#999999;border: dashed 1px #999999;border: dashed 1px #999999; }\n'+
	
	'#aTag { color:#000099;margin:0px 3px 0px 7px;}\n'+
	'#emTag { font-style:italic;margin:0px 3px 0px 7px; }\n'+
	'#iTag { font-style:italic;margin:0px 3px 0px 7px; }\n'+
	'#strongTag { font-weight:bold;margin:0px 3px 0px 7px; }\n'+
	'#bTag { font-weight:bold;margin:0px 3px 0px 7px; }\n'+
	'#uTag { text-decoration:underline;;margin:0px 3px 0px 7px; }\n'+
	'#h1Tag { font-weight:bold;;margin:0px 3px 0px 7px; }\n'+
	'#h2Tag { font-weight:bold;;margin:0px 3px 0px 7px; }\n'+
	'#h3Tag { font-weight:bold;;margin:0px 3px 0px 7px; }\n'+
	'#h4Tag { font-weight:bold;;margin:0px 3px 0px 7px; }\n'+
	'#h5Tag { font-weight:bold;;margin:0px 3px 0px 7px; }\n'+
	'#h6Tag { font-weight:bold;;margin:0px 3px 0px 7px; }\n'+
	'img { margin:0px 3px 0px 10px; }\n'+
	'#centerTag { margin:0px 3px 0px 7px; }\n'+
	'#fontTag { margin:0px 3px 0px 7px; }\n'+
	'#formTag { margin:0px 3px 0px 7px; }\n'+
	'#selectTag { margin:0px 3px 0px 7px; }\n'+
	'#fieldsetTag { margin:0px 3px 0px 7px; }\n'+
	'#legendTag { margin:0px 3px 0px 7px; }\n'+
	'#textareaTag { margin:0px 3px 0px 7px; }\n'+
	'</style>';
//FBF0E9