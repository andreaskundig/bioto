//for jslint
/*jslint white: false */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false */
/*global addEventListener: false, blur: false, clearInterval: false, clearTimeout: false, close: false, closed: false, defaultStatus: false, document: false, event: false, focus: false, frames: false, getComputedStyle: false, history: false, Image: false, length: false, location: false, moveBy: false, moveTo: false, name: false, navigator: false, onblur: true, onerror: true, onfocus: true, onload: true, onresize: true, onunload: true, open: false, opener: false, Option: false, parent: false, print: false, resizeBy: false, resizeTo: false, screen: false, scroll: false, scrollBy: false, scrollTo: false, setInterval: false, setTimeout: false, status: false, top: false, XMLHttpRequest: false */
/*global keys_m, keys_f, texts, topics, window, unescape, $ */
var remove_all, replace, display, map_placeholders, 
  make_placeholder_regex, keys, random, show_all,
  fix_apostrophe, reassemble_original, wrap_words_in_span,
  polish_display, make_replacement, span, span_words,
  male_or_female_keys,  build_paragraph, pick_indexes,
  make_hiding_function, text_indexes_for_topics, flatten,
  get_protagonist_from_url, string_util, replace_placeholder,
  get_indexes_from_url, get_indexes_from_hash, write_to_hash;

var ordre = [
  ["nom","presentation", "vie",  "introduction"],
  ["naissance", "origine", "existence", "debut"],
  ["enfance", "jeunesse", "adolescence", "famille",
   "relation","divorce","mariage"],
  ["apparence", "physique", "pouvoir", "sante", "surnom", 
   "age", "alimentation"],
  ["personnalite", "caractere", "reputation", "ondit","rumeur", "faculte"],
  ["oeuvre", "carriere", "style"],
  ["citation", "bof", "opinion", "inexplique", "enseignement", 
   "titre", "chasse"],
  ["retraite", "mort", "legacy"]
];

var protagonistes = ["Ibn Al Rabin", "Andréas Kündig", 
  "Bob le lapin", "un certain Gérard", "Lambert-garou"];
var livres =["'l'autre fin du monde'", "la bible", "'Martine à la plage'",
 "'Cot cot'", "'Figaro Madame'"];

function stats() {
  var sujet, sujets, i, j, tot;
  for (i = 0; i < ordre.length ; i += 1) {
    sujets = ordre[i];
    tot = 0;
    for (j = 0 ; j < sujets.length ; j += 1) { 
        sujet = sujets[j];
        if (sujet && keys[sujet]) { tot += keys[sujet].length; }
    }
    console.log(sujets + " " + tot);
  }
}
function unused_topics(){
  var tops, i ;
  tops = topics.slice(0);
  for (i=0 ; i < ordre.length ; i += 1){
    remove_all(tops, ordre[i]);
  }
  return tops;
}
function show_all(){
  var i, replaced, original;
  for ( i=0; i < texts.length ; i += 1){
    replaced = build_paragraph(texts[i], protagonistes);
    display(i+": "+replaced);
  }
  polish_display();
}

function bio(deja_utilise,indexes) {
  var paragraph;
  $("#bio").children().detach();
  keys = male_or_female_keys();
  indexes = indexes || pick_indexes(keys,deja_utilise);
  $.each(indexes, function(i,index){
      paragraph = build_paragraph(texts[index], protagonistes);
      display(span_words(paragraph));
  });
  polish_display();
  //write_to_hash(indexes);
  return deja_utilise.concat(indexes);
}

function pick_indexes(keys,exclude){
  var  i,  j, sujet, indexes, index, topic_indexes, topic_index;
  indexes = [];
  for (i=0 ; i<ordre.length ; i+=1) {
    topic_indexes = text_indexes_for_topics(ordre[i],keys);
    remove_all(topic_indexes, exclude);
    remove_all(topic_indexes, indexes);
    if(topic_indexes.length > 0){
      topic_index = 
          topic_indexes[Math.floor(Math.random() * topic_indexes.length)];
      indexes.push(topic_index);
    }
  }
  return indexes;
}

function text_indexes_for_topics(topics,keys){
    var indexes, topic, j;
    indexes = [];
    for (j=0 ; j<topics.length ; j+=1) {
      topic = topics[j];
      if (keys[topic]) { indexes = indexes.concat(keys[topic]); }
    }
    return indexes;
}

function male_or_female_keys(){
  return Math.random() > 0.5 ? keys_f : keys_m;  
}

function build_paragraph(text_object, names) {
  var ph_to_name, result, placeholder, toreplace, replacing_name,
  replacement, i;
  ph_to_name = map_placeholders(text_object.placeholders, names);
  result = text_object.text;
  for (i=0 ; i<text_object.placeholders.length ; i += 1){
    placeholder  = text_object.placeholders[i];
    replacing_name = ph_to_name[placeholder[1]];
    result = fix_apostrophe(result, placeholder[0],replacing_name);
    result = replace_placeholder(result,placeholder,replacing_name);
  }
  return result;
}

function map_placeholders(placeholders,names){
  var map, name_index, remaining_names, phname, ph, 
      match, i;
  map = {};
  name_index = 1;
  remaining_names = [];
  for (i = 0; i < placeholders.length ; i += 1) {
    ph = placeholders[i];
    phname = ph[1];
    if(map[phname]){ //on l'a deja
    }else if(string_util.starts_with("pronom", phname)){
      map[phname] = ph[0]; //on remplace pas les pronoms...
    }else if(string_util.starts_with("litt:",phname)){
      map[phname] = phname.substring(5);
    }else if(phname === "livre_ext"){
      map[phname] = livres[random(livres.length)];
    }else{
      match = /^(pre)?nom_[a-zA-Z]+(_1)?$/.exec(phname);
      if (match){
	map[phname] = names[0];
      }else{
        if(remaining_names.length ===0){ 
          remaining_names = names.slice(1); }
        name_index = random(remaining_names.length);
        map[phname] = remaining_names.splice(name_index, 1)[0];
      }
    }
  }
  return map;
}

function fix_apostrophe(text, original, replacement){
  var re, orig_paren;
  orig_paren = original.replace("(","\\(").replace(")","\\)");
  if (string_util.starts_with_vowel(replacement)){
    re =  "\\b(d|qu|l)(e|a)\\s+(<"+orig_paren+":(pre)?(nom))";
    text = text.replace(new RegExp(re ,"gi"),
			span("$1'",'r') + span("$1$2 ",'o') + "$3");
  }else{
    re = "\\bl'\\s*(<"+orig_paren+":(pre)?(nom_feminin))";
    text = text.replace( new RegExp(re,"gi"), 
			 span("la ",'r') + span("l'",'o') + "$1");
    re = "\\bl'\\s*(<"+orig_paren+":(pre)?(nom_masculin))";
    text = text.replace( new RegExp(re, "gi"),
			 span("le ",'r') + span("l'",'o') + "$1");
    re = "\\b(d|qu)'\\s*(<"+orig_paren+":(pre)?(nom))";
    text = text.replace( new RegExp(re, "gi"), 
			 span("$1e ",'r') + span("$1'",'o') + "$2");
  }
  return text;
}

function replace_placeholder(text,placeholder,replacing_name){
  var to_replace, replacement; 
  to_replace = make_placeholder_regex(placeholder);
  replacement = make_replacement(placeholder, replacing_name);
  return text.replace(to_replace, replacement);
}

function make_placeholder_regex(placeholder) {
    var exp = '<' + placeholder.join(':') + '>';
    exp = exp.replace(/\(/,'\\(').replace(/\)/,'\\)');
    return new RegExp(exp,"g");
}

function make_replacement(placeholder, replacing_name){
  if(replacing_name.toLowerCase() === placeholder[0].toLowerCase()){
    return replacing_name;
  }
  return  span(replacing_name, 'r') + span(placeholder[0], 'o') ;
}

function span(to_wrap, claz){
  var clazz = claz ? ' class="'+claz+'"' : '';
  return '<span'+clazz+'>'+to_wrap+'</span>';
  //return '<span'+clazz+' style="display:inline-block;">'+to_wrap+'</span>';
}

function span_words(text){
  var tokens, token, spl, result, i, inspan;
  spl = string_util.split;
  tokens = spl(spl(spl(text,"<",1)," "),">");
  inspan = false;
  result = "";
  for(i=0; i<tokens.length;i+=1){
    token = tokens[i];
    if(string_util.starts_with("<span", token)){ inspan = true; }
    //result += inspan ? token : span(token.replace(" ","&nbsp;"));
    if(inspan || token === '<br>'){
      result += token;
    }else{
      result += span(token.replace(" ","&nbsp;"));
    }
    if(token === "</span>"){ inspan = false;  }
  }
  return result;
}

string_util = {
  starts_with: function(start, a_string){
    return a_string && a_string.substring(0, start.length) === start;
  },
  ends_with: function(end, a_string){
  return a_string && a_string.substring(a_string.length-end.length, 
			    a_string.length) === end;
  },
  starts_with_vowel: function(string){
    var l = string.charAt(0).toLowerCase();
    return l==='a' || l==='e' || l==='i' || l==='o' || l==='u';
  },
  split: function(str, del, before){
//split(split(split("asfasdf<span> as df</span>b asdfa asdf as","<",1)," "),">")
  var result, i;
  result = [];
  if(typeof str === 'string'){
    if(before){ 
      result = str.split(new RegExp("(?="+del+")"));
    }else{ 
      result = str.split(del);
      for(i=0;i<result.length-1;i+=1){ result[i] = result[i] + del;}
    }
  }else if(str.length){
    for(i=0;i<str.length;i+=1){ 
      result.push(string_util.split(str[i],del)); 
    }
    result = flatten(result);
  }  
  return result;
 }
};

function random(max){
  return Math.floor(Math.random() * max);
}

function flatten(array){
  var newarr, i, j, element;
  newarr = [];
  for(i=0;i<array.length;i+=1){
    element = array[i];
    if((typeof element)!=='string' && element.length){
      for(j=0;j<element.length;j+=1){ 
	if(element[j]){ newarr.push(element[j]); } 
      }
    }else{ if(element){ newarr.push(element); } }
  }
  return newarr;
}

function remove_all(array,elements){
  var index, i, element;
  for (i=0 ; i < elements.length ; i += 1){
   element = elements[i];
   index = $.inArray(element,array);
   if(index>=0) { array.splice(index,1); }
  }
}

function display(text){
  $("#bio").append('<p class="paragraph">'+text+'</p>');
}

function polish_display(){
  //console.time(1);
  $("#bio>p>span.r,#bio>p>span.o").each(function(){
      $(this).data('original_width',$(this).width());
  });
  //console.timeEnd(1);
  //$("#bio>p>span.o").css({width: '0px'});
  $("#bio>p>span.o").css({width: '0px', display: 'inline-block'});
  $("#bio>p>span").css({ display: 'inline-block'});
  /*
  */
  $(".paragraph").mouseenter(make_hiding_function('r','o'));
  $(".paragraph").mouseleave(make_hiding_function('o','r'));
}

function make_hiding_function(tohide, toshow){
   return function(){
     $(this).children("."+tohide).animate({width: '0px'}, 
					  {queue: false});

     $(this).children("."+toshow).each(function(){
        var o_width = $(this).data('original_width');
	$(this).animate({width: o_width});
      });
      
      if(toshow === 'o'){ 
	$(this).addClass("grey");
      }else{ 
	$(this).removeClass("grey");
      }
   };
}

function get_protagonist_from_url(){
  var match = new RegExp('(\\?|&)([^=]+?)($|&)').exec(location.search);
  if(match){
    protagonistes.unshift(unescape(match[2]));
  }
}

function get_indexes_from_url(){
  var match, regex;
  regex = '_escaped_fragment_=([\\d-]+)($|&)';
  match = new RegExp(regex).exec(location.search);
  if(match){
    return $.map(match[1].split('-'),
		 function(el){return parseInt(el,10);});
  }
  return null;
}

function get_indexes_from_hash(){
    if(string_util.starts_with("#",location.hash)){
       return $.map(location.hash.substr(1).split('-'),
		    function(el){return parseInt(el,10);});
    }
    return null;
}

function write_to_hash(indexes){
  location.hash = "#"+indexes.join("-");
}

function reassemble_original(text_object){
  return text_object.text.replace(/<([^:]+):[^>]+>/g, "$1");
}
