//for jslint
/*jslint white: false */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false */
/*global addEventListener: false, blur: false, clearInterval: false, clearTimeout: false, close: false, closed: false, defaultStatus: false, document: false, event: false, focus: false, frames: false, getComputedStyle: false, history: false, Image: false, length: false, location: false, moveBy: false, moveTo: false, name: false, navigator: false, onblur: true, onerror: true, onfocus: true, onload: true, onresize: true, onunload: true, open: false, opener: false, Option: false, parent: false, print: false, resizeBy: false, resizeTo: false, screen: false, scroll: false, scrollBy: false, scrollTo: false, setInterval: false, setTimeout: false, status: false, top: false, XMLHttpRequest: false */
/*global keys_m, keys_f, texts, topics, $ */
var remove_all, replace, display, map_placeholders, 
  make_placeholder_regex, starts_with, keys, random,
  show_all, fix_apostrophe, starts_with_vowel, reassemble_original,
  display_paragraph, add_mouse_behavior, make_replacement, span;


var ordre = [
  ["nom","presentation", "vie",  "introduction"],
  ["naissance", "origine", "existence", "debut"],
  ["enfance", "jeunesse", "adolescence", "famille", "relation"],
  ["apparence", "physique", "pouvoir", "sante", "surnom"],
  ["personnalite", "caractere", "reputation", "ondit"], 
  ["oeuvre", "carriere", "style"],
  ["citation", "bof", "opinion", "inexplique", "enseignement", 
   "titre", "chasse"],
  ["retraite", "mort", "legacy"]
];

var protagonistes = ["Ibn Al Rabin", "Andréas Kündig", 
  "Bob le lapin", "un certain Gérard", 
  "Lambert-garou"];
var livres = ["'l'autre fin du monde'", "la bible", "'Martine à la plage'", "'Cot cot'", "'Figaro Madame'"];

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

function bio() {
  var deja_utilise, sujets, sujet, indexes, index, replaced, i, j,original;
  deja_utilise = [];
  for (i = 0; i < ordre.length ; i += 1) {
    sujets = ordre[i];
    indexes = [];
    for (j = 0  ; j < sujets.length ; j += 1) {
      sujet = sujets[j];
      if (keys[sujet]) { indexes = indexes.concat(keys[sujet]); }
    }
    remove_all(indexes, deja_utilise);
    if(indexes.length > 0){
      index = indexes[Math.floor(Math.random() * indexes.length)];
      deja_utilise.push(index);
      replaced = replace(texts[index], protagonistes);
      display(replaced);
    }
  }
  add_mouse_behavior();

}

function show_all(){
  var i, replaced, original;
  for ( i=0; i < texts.length ; i += 1){
    replaced = replace(texts[i], protagonistes);
    display(replaced);
  }
  add_mouse_behavior();
}

function reassemble_original(text_object){
  return text_object.text.replace(/<([^:]+):[^>]+>/g, "$1");
}

function replace(text_object, names) {
  var map, result, placeholder, toreplace, replacing_name, replacement, i;
  map = map_placeholders(text_object.placeholders, names);
  result = text_object.text;
  for (i=0 ; i<text_object.placeholders.length ; i += 1){
    placeholder  = text_object.placeholders[i];
    replacing_name = map[placeholder[1]];
    result = fix_apostrophe(result, placeholder[0],replacing_name);
    toreplace = make_placeholder_regex(placeholder);
    replacement = make_replacement(placeholder, replacing_name);
    result = result.replace(toreplace, replacement);
  }
  return result;
}

function fix_apostrophe(text, original, replacement){
  var re;
  if (starts_with_vowel(replacement)){
    re =  "\\b(d|qu|l)(e|a)\\s+(<"+original+":(pre)?(nom))";
    text = text.replace(new RegExp(re ,"gi"),
			span("$1$2 ",1) + span("$1'",0)+"$3");
  }else{
    re = "\\bl'\\s*(<"+original+":(pre)?(nom_feminin))";
    text = text.replace( new RegExp(re,"gi"), 
			 span("l'",1)+span("la ",0)+"$1");
    re = "\\bl'\\s*(<"+original+":(pre)?(nom_masculin))";
    text = text.replace( new RegExp(re, "gi"),
			 span("l'",1)+span("le ",0)+"$1");
    re = "\\b(d|qu)'\\s*(<"+original+":(pre)?(nom))";
    text = text.replace( new RegExp(re, "gi"), 
			 span("$1'",1)+span("$1e ",0)+"$2");
  }
  return text;
}

function make_placeholder_regex(placeholder) {
    var exp = '<' + placeholder.join(':') + '>';
    exp = exp.replace(/\(/,'\\(').replace(/\)/,'\\)');
    return new RegExp(exp,"g");
}

function make_replacement(placeholder, replacing_name){
  return span(placeholder[0], 1) + span(replacing_name, 0);
}

function span(to_wrap, original){
  var clazz = original ? 'o hidden' : 'r';
  return '<span class="'+clazz+'">'+to_wrap+'</span>';
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
    }else if(starts_with("pronom", phname)){
      map[phname] = ph[0]; //on remplace pas les pronoms...
    }else if(starts_with("litt:",phname)){
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

function random(max){
  return Math.floor(Math.random() * max);
}

function starts_with(start, a_string){
  return a_string && a_string.substring(0, start.length) === start;
}

function ends_with(end, a_string){
  return a_string && a_string.substring(a_string.length-end.length, 
			    a_string.length) === end;
}

function starts_with_vowel(string){
  var l = string.charAt(0).toLowerCase();
  return l==='a' || l==='e' || l==='i' || l==='o' || l==='u';
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

function add_mouse_behavior(){
    $(".paragraph").mouseover(function(){
      $(this).children(".r").addClass('hidden');
      $(this).children(".o").removeClass('hidden');
      $(this).addClass("grey");
   });
   $(".paragraph").mouseout(function(){
     $(this).children(".r").removeClass('hidden');
     $(this).children(".o").addClass('hidden');
     $(this).removeClass("grey");
   });
}