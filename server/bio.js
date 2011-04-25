//for jslint
/*jslint white: false */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false */
/*global addEventListener: false, blur: false, clearInterval: false, clearTimeout: false, close: false, closed: false, defaultStatus: false, document: false, event: false, focus: false, frames: false, getComputedStyle: false, history: false, Image: false, length: false, location: false, moveBy: false, moveTo: false, name: false, navigator: false, onblur: true, onerror: true, onfocus: true, onload: true, onresize: true, onunload: true, open: false, opener: false, Option: false, parent: false, print: false, resizeBy: false, resizeTo: false, screen: false, scroll: false, scrollBy: false, scrollTo: false, setInterval: false, setTimeout: false, status: false, top: false, XMLHttpRequest: false */
/*global keys_m, keys_f, texts, topics, window, unescape, $ */
var remove_all, replace, display, map_placeholders, 
  make_placeholder_regex, keys, random, show_all, plain_substitution,
  apostrophe_substitutions,reassemble_original, wrap_words_in_span,
  polish_display, span, span_words, apply_spanned_substitutions,
  male_or_female_keys,  build_paragraph, pick_indexes,
  make_hiding_function, text_indexes_for_topics, flatten,
  get_protagonist_from_url, string_util, replace_placeholder,
  get_indexes_from_url, get_indexes_from_hash, write_to_hash,
  make_parent_hiding_function, make_detail_slide_function;

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
  "Bob le lapin", "Un certain Gérard", "Fanfan"];
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
  var i, subs;
  for ( i=0; i < texts.length ; i += 1){
    subs = all_substitutions(texts[i], protagonistes);
    texts[i].text = i+": "+texts[i].text;
    display_text(texts[i],subs);
  }
  polish_display();

}
function bio(deja_utilise,indexes) {
  var subs;
  $("#bio").children().detach();
  keys = male_or_female_keys();
  indexes = indexes || pick_indexes(keys,deja_utilise);
  $.each(indexes, function(i,index){
      subs = all_substitutions(texts[index], protagonistes);
      display_text(texts[index], subs);
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
function all_substitutions(text_object, names) {
  var ph_to_name, placeholder, replacing_name, i, subs, allsubs;
  allsubs = [];
  ph_to_name = map_placeholders(text_object.placeholders, names);
  for (i=0 ; i<text_object.placeholders.length ; i += 1){
    placeholder  = text_object.placeholders[i];
    replacing_name = ph_to_name[placeholder[1]];
    subs = all_substitutions_for_placeholder(
      text_object.text, placeholder, replacing_name);
    allsubs = allsubs.concat(subs);
  }
  return allsubs;

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
function all_substitutions_for_placeholder(text, placeholder, replacement){
  //returns an array of substitutions [regex, replacement, original]
  var subs, plain_sub;
  subs = apostrophe_substitutions(text, placeholder[0],replacement);
  plain_sub = [make_placeholder_regex(placeholder), replacement, placeholder[0]];
  subs.push(plain_sub);
  return subs;

}
function apostrophe_substitutions(text, original, replacement){
  //returns an array of substitutions [regex, replacement, original]
  var re1,re2,re3, orig_paren, regexes, match;
  regexes = [];
  orig_paren = original.replace("(","\\(").replace(")","\\)");
  if (string_util.starts_with_vowel(replacement)){
    re1 =  new RegExp("\\b(d|qu|l)(e|a)\\s+<"+orig_paren+":(pre)?nom[^>]*>","gi");
    while((match = re1.exec(text))!==null){
      regexes.push([re1, match[1]+"'"+replacement, match[1]+match[2]+" "+original]);
    }
  }else{
    re1 = new RegExp("\\bl'\\s*<"+orig_paren+":(pre)?nom_feminin[^>]*>","gi");
    while((match = re1.exec(text))!==null){
      regexes.push([re1, "la "+replacement, "l'"+original]);
    }
    re2 = new RegExp("\\bl'\\s*<"+orig_paren+":(pre)?nom_masculin[^>]*>","gi");
    while((match = re2.exec(text))!==null){
      regexes.push([re2, "le "+replacement, "l'"+original]);
    }
    re3 = new RegExp("\\b(d|qu)'\\s*(<"+orig_paren+":(pre)?nom[^>]*>)","gi");
    while((match = re3.exec(text))!==null){
      regexes.push([re3, match[1]+"e "+replacement, match[1]+"'"+original]);
    }
  }
  return regexes;

}
function make_placeholder_regex(placeholder) {
    var exp = '<' + placeholder.join(':') + '>';
    exp = exp.replace(/\(/,'\\(').replace(/\)/,'\\)');
    return new RegExp(exp,"g");

}
function apply_spanned_substitutions(text, substitutions){
 var i, substitution, replacement;
 for(i=0; i<substitutions.length; i+=1 ){
   substitution = substitutions[i];
   if(substitution[1].toLowerCase() === substitution[2].toLowerCase()){
     replacement = substitution[2];
   }else{
     replacement = span(substitution[1],'r')+span(substitution[2],'o');
   }
   text = text.replace(substitution[0],replacement);
 }  
 return text;

}
function span(to_wrap, claz){
  var clazz = claz ? ' class="'+claz+'"' : '';
  return '<span'+clazz+' style="display:inline-block;">'+to_wrap+'</span>';

}
function span_words(text, claz){
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
      result += span(token.replace(" ","&nbsp;"), claz);
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
function display_text(text_object, substitutions){
  var text, paragraph, p;
  text = apply_spanned_substitutions(text_object.text, substitutions);
  text = span_words(text);
  paragraph = $('<div class="paragraph"><p>'+text+'</p>'+
     '<p class="detail" style="display:none"><a href="'+text_object.url+
     '">en savoir plus</a></p></div>');
  p = paragraph.find('p').first();
  p.data('text', text_object);
  p.data('subs', substitutions);
  $("#bio").append(paragraph);

}
function polish_display(){
  //console.time(1);
  $("#bio>div>p>span.r,#bio>div>p>span.o").each(function(){
      $(this).data('original_width',$(this).width());
  });
  $("#bio>div>p>span.o").css({width: '0px'});
  $(".detail").mouseenter(make_parent_hiding_function2('r','o')
	     ).mouseleave(make_parent_hiding_function2('o','r'));
  $(".paragraph").mouseenter(make_detail_slide_function(true)
	        ).mouseleave(make_detail_slide_function(false));
  //console.timeEnd(1);

}
function make_detail_slide_function0(down){
    if(down){
      return function(){$(".detail",this).slideDown();};
    }
    return function(){$(".detail",this).slideUp();};

}
function make_parent_hiding_function0(tohide, toshow){
   return function(){
     $(this).parent().find("."+tohide).animate({width: '0px'}, 
					  {queue: false});
     $(this).parent().find("."+toshow).each(function(){
        var o_width = $(this).data('original_width');
	$(this).animate({width: o_width});
      });
   };

}
function make_detail_slide_function(down){
    if(down){
      return function(){
	var elem = $(".detail",this);
	if(elem.queue().length<2){ elem.slideDown();}
      };
    }
    return function(){
      var elem = $(".detail", this).slideUp();
      $("p",this).first().delay(100).animate({minHeight:0},{queue: true});
    };

}
function make_parent_hiding_function(tohide, toshow){
   return function(){
      var p, delayms, hide, show;
     p = $(this).prev();
     p.data('minheight',p.height());
     delayms = 200;
     hide = p.find("."+tohide).stop(true); //clear queue
     //reverse to avoid back of text moving too fast
     $(hide.get().reverse()).each(function(i,e){
		$(this).delay(delayms*(i)).animate({width: '0px'});
     });
     show = p.find("."+toshow).stop(true); //clear queue
     //reverse to avoid back of text moving too fast
     $(show.get().reverse()).each(function(i,e){
        var o_width = $(this).data('original_width');
	$(this).delay(delayms*(i)).animate(
             {width: o_width},
             {step: function(){
	       var minheight = Math.max(p.data('minheight'),p.height());
	       p.data('minheight',minheight);
	       p.css({minHeight: minheight});
	      }
	     });
      });
   };

}
//TODO animate with step and overlap
function make_parent_hiding_function2(tohide, toshow){
   return function(){
      var p, text, subs, i, subindex;
     p = $(this).prev();
     text = p.data('text').text;
     subs = p.data('subs');
     subindex = toshow === 'r'? 1 : 2;
     for( i=0; i<subs.length; i+=1){
       text = text.replace(subs[i][0],subs[i][subindex]);
     }
     p.html(text);
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
function overlap(below,above,chars,cover){
   var maxlength = Math.max(below.length,above.length);
   if(cover){
     return  below.substring(0, Math.max(Math.min(below.length,maxlength-chars),0)) +
             above.substring(0, Math.min(above.length,chars));
   }
   return below.substring(0, Math.min(below.length,chars)) + 
          above.substring(0, Math.max(Math.min(above.length,maxlength-chars),0));

 }
