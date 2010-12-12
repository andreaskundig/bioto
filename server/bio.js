//for jslint
/*jslint white: false */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false */
/*global addEventListener: false, blur: false, clearInterval: false, clearTimeout: false, close: false, closed: false, defaultStatus: false, document: false, event: false, focus: false, frames: false, getComputedStyle: false, history: false, Image: false, length: false, location: false, moveBy: false, moveTo: false, name: false, navigator: false, onblur: true, onerror: true, onfocus: true, onload: true, onresize: true, onunload: true, open: false, opener: false, Option: false, parent: false, print: false, resizeBy: false, resizeTo: false, screen: false, scroll: false, scrollBy: false, scrollTo: false, setInterval: false, setTimeout: false, status: false, top: false, XMLHttpRequest: false */
/*global keys texts $ */
var remove_all, replace, display, map_placeholders, 
    make_placeholder_regex, starts_with;

var ordre = [
    ["presentation", "vie",  "introduction"],
    ["naissance", "origine", "existence", "debut"],
    ["enfance", "jeunesse", "adolescence", "famille"],
    ["apparence", "physique", "pouvoir", "sante", "surnom"],
    ["personnalite", "reputation", "ondit"], 
    ["oeuvre", "carriere", "style"],
    ["citation", "bof", "opinion", "inexplique", "enseignement", "titre", "chasse"],
    ["retraite", "mort", "legacy"]
];

var protagonistes = ["Ibn Al Rabin", "Andréas Kündig", "Bob le lapin", "un certain Gérard", "le cinquantenaire de la victoire"];
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


function bio() {
  var deja_utilise, sujets, sujet, indexes, index, text, i, j;
  deja_utilise = [];
  for (i = 0; i < ordre.length ; i += 1) {
    sujets = ordre[i];
    indexes = [];
    for (j = 0  ; j < sujets.length ; j += 1) {
      sujet = sujets[j];
      indexes = indexes.concat(keys[sujet]);
    }
    remove_all(indexes, deja_utilise);
    index = indexes[Math.floor(Math.random() * indexes.length)];
    deja_utilise.push(index);
    text = replace(texts[index], protagonistes);
    display(text);
  }
}

function replace(text_object, names) {
  var map, result, placeholder, toreplace, replacement, i;
  map = map_placeholders(text_object.placeholders, names);
  result = text_object.text;
  for (i=0 ; i<text_object.placeholders.length ; i += 1){
    placeholder  = text_object.placeholders[i];
    toreplace = make_placeholder_regex(placeholder);
    replacement = map[placeholder[1]];
    result = result.replace(toreplace, replacement);
  }
  return result;
}

function make_placeholder_regex(placeholder) {
    var exp = '<' + placeholder.join(':') + '>';
    exp = exp.replace(/\(/,'\\(').replace(/\)/,'\\)');
    return new RegExp(exp,"g");
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
      map[phname] = livres[Math.floor(Math.random()*livres.length)];
    }else{
      match = /^(pre)?nom_[a-zA-Z]+(_1)?$/.exec(phname);
      if (match){
	map[phname] = names[0];
      }else{
          if(remaining_names.length ===0){ remaining_names = names.slice(1); }
        name_index = Math.floor(Math.random() * remaining_names.length);
        map[phname] = remaining_names.splice(name_index, 1);
      }
    }
  }
  return map;
}

function starts_with(start, a_string){
  return a_string && a_string.substring(0, start.length) === start;
}
function ends_with(end, a_string){
  return a_string && a_string.substring(a_string.length-end.length, 
			    a_string.length) === end;
}

function remove_all(array,elements){
  var index, i, element;
  for (i=0 ; i < elements.length ; i += 1){
   element = elements[i];
   index = array.indexOf(element);
   if(index>=0) { array.splice(index,1); }
  }
}

function display(text){
  $("#bio").before('<p>'+text+'</p>');
}

$(document).ready(function(){
   $("#titre").before('<h1>'+ protagonistes[0] +'</h1>');
   bio();
});
