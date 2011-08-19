//for jslint 
/*jslint white: false */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false */
/*global addEventListener: false, blur: false, clearInterval: false, clearTimeout: false, close: false, closed: false, defaultStatus: false, document: false, event: false, focus: false, frames: false, getComputedStyle: false, history: false, Image: false, length: false, location: false, moveBy: false, moveTo: false, name: false, navigator: false, onblur: true, onerror: true, onfocus: true, onload: true, onresize: true, onunload: true, open: false, opener: false, Option: false, parent: false, print: false, resizeBy: false, resizeTo: false, screen: false, scroll: false, scrollBy: false, scrollTo: false, setInterval: false, setTimeout: false, status: false, top: false, XMLHttpRequest: false */
/*global keys_m, keys_f, texts, topics, window, unescape, $ */
var displayer, span_displayer, morph_displayer, keys, show_all,
  male_or_female_keys, pick_indexes, make_detail_slide_function,
  make_simple_detail_slide_function, text_indexes_for_topics, 
  string_util, array_util, url_helper, substituter;

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
  "Bob le lapin", "Un certain Gérard", "Bourguiba"];
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
    array_util.remove_all(tops, ordre[i]);
  }
  return tops;

}
function show_all(){
  var i, subs;
  for ( i=0; i < texts.length ; i += 1){
    texts[i].text = i+": "+texts[i].text;
    displayer.display_text(texts[i],protagonistes);
  }

}
//TODO fix deja_utilise
function bio(deja_utilise,indexes) {
  $("#bio").children().detach();
  keys = male_or_female_keys();
  indexes = indexes || pick_indexes(keys,deja_utilise);
  $.each(indexes, function(i,index){
      texts[index].ordre = i;
      displayer.display_text(texts[index], protagonistes);
  });
  //write_to_hash(indexes);
  array_util.add_all(deja_utilise, indexes);

}
function pick_indexes(keys,exclude){
  var  i,  j, sujet, indexes, index, topic_indexes, topic_index;
  indexes = [];
  for (i=0 ; i<ordre.length ; i+=1) {
    topic_indexes = text_indexes_for_topics(i,keys);
    array_util.remove_all(topic_indexes, exclude);
    array_util.remove_all(topic_indexes, indexes);
    if(topic_indexes.length > 0){
      topic_index = 
        topic_indexes[array_util.random_index(topic_indexes)];
      indexes.push(topic_index);
    }
  }
  return indexes;

}
function text_indexes_for_topics(topic_index,keys){
    var indexes, topic, j, topics;
    topics = ordre[topic_index||0]; //||0 pouah
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
function next_text(text_object){
  var next_text_object, indexes;
  indexes = text_indexes_for_topics(text_object.ordre,keys);
  next_text_object = texts[indexes[array_util.random_index(indexes)]];
  next_text_object.ordre = text_object.ordre;
  return next_text_object;

}
substituter = {
  all_substitutions: function(text_object, names) {
    var ph_to_name, placeholder, replacing_name, i, sub, subs_holder;
    subs_holder = {text: text_object.text, subs:[]};
    ph_to_name = this.map_placeholders(text_object.placeholders, names);
    for (i=0 ; i<text_object.placeholders.length ; i += 1){
      placeholder  = text_object.placeholders[i];
      replacing_name = ph_to_name[placeholder[3]];
      subs_holder.subs.push(this.make_sub(placeholder, replacing_name));
    }
    return subs_holder;

  },
  map_placeholders: function(placeholders,names){
   var map, name_index, remaining_names, phname, ph, 
       match, i;
   map = {};
   name_index = 1;
   remaining_names = [];
   for (i = 0; i < placeholders.length ; i += 1) {
     ph = placeholders[i];
     phname = ph[3];
     if(map[phname]){ //on l'a deja
     }else if(string_util.starts_with("litt:",phname)){
       map[phname] = phname.substring(5);
     }else if(phname === "livre_ext"){
       map[phname] = livres[array_util.random_index(livres)];
     }else{
       match = /^(pre)?nom_[a-zA-Z]+(_1)?$/.exec(phname);
       if (match){
 	map[phname] = names[0];
       }else{
         if(remaining_names.length ===0){ 
           remaining_names = names.slice(1); }
         name_index = array_util.random_index(remaining_names);
         map[phname] = remaining_names.splice(name_index, 1)[0];
       }
     }
   }
   return map;

  },
  make_sub: function(ph, replacement){
    //args
    // ph ["#0#", ["l'","la "],"Loana", "nom_feminin_1"]
    // replacement "Oignon"
    //return ["#0#","l'Oignon","la Loana"]
    return [ph[0], this.add_article(ph[1],replacement), this.add_article(ph[1],ph[2])];

  },
  add_article: function(articles, name){
    var i, article = '';
    if(articles){
      i = string_util.starts_with_vowel(name)? 0:1;
      article = articles[i];
    }
    return article+name;

  }
};
span_displayer = {
  display_text: function(text_object, protagonistes){
    var paragraph =  this.make_paragraph(text_object, protagonistes);
    //not in make_paragraph to avoid interference with animate_paragraph_replacement.
    paragraph.mouseenter(make_detail_slide_function(true));
    paragraph.mouseleave(make_detail_slide_function(false));
    $("#bio").append(paragraph);
    this.show(paragraph);

  },
  make_paragraph: function(text_object, protagonistes){
    var text, paragraph, p, substitutions, next_text_object;
    substitutions = substituter.all_substitutions(text_object, protagonistes);
    text = this.apply_spanned_substitutions(substitutions.text, substitutions.subs);
    text = text.replace(/\|/g,'&shy;');
    paragraph = $('<div class="paragraph" style="visibility:hidden"><p>'+text+'</p>'+
       '<p class="detail" style="display:none"><a href="'+text_object.url+
       '">en savoir plus</a> <a class="next">mais encore</a></p></div>');
    $(".detail",paragraph).mouseenter(this.make_parent_hiding_function('r','o')
  	                 ).mouseleave(this.make_parent_hiding_function('o','r'));
    $(".next",paragraph).click(this.make_next_text_function(next_text(text_object)));
    return paragraph;

  },
  show: function(paragraph){
    // this only works when paragraph is in the DOM
    // otherwise widths == 0
    this.init_widths(paragraph);
    paragraph.css("visibility","visible");

  },
  init_widths: function(paragraph){
    // this only works when paragraph is in the DOM
    // and display is not none
    // otherwise widths == 0
    $("span",paragraph).each(function(){
        $(this).data('original_width',$(this).width());
    }).filter(".o").css({width: '0px'});//, display: 'none'});

  },
//TODO fix scope problems: span_displayer, next_paragraph (keys), protagonistes...
// TODO get rid of global variables keys, protagonistes
//TODO make slideDown work http://jsfiddle.net/V4SVt/2/ 
//http://stackoverflow.com/questions/3747683/append-and-slide-together-jquery
//TODO slide sideways http://www.learningjquery.com/2009/02/slide-elements-in-different-directions
//TODO avoid repetition, keep sex
  make_next_text_function: function(next_text_object){
    var disp = this;
    return function(){
       var pbefore, pafter;
       pbefore = $(this).parent().parent();
       pafter = disp.make_paragraph(next_text_object,protagonistes);
       disp.animate_paragraph_replacement(pbefore,pafter);
    };

  },
  make_next_function: function(pbefore,pafter){
    var disp = this;
    return function(){
      disp.animate_paragraph_replacement(pbefore,pafter);
    };  

  },
  animate_paragraph_replacement: function(pbefore,pafter){
      var p_width, p_height, pafter_text;
      //init widths of original/replacement spans
      pbefore.after(pafter);
      this.init_widths(pafter);
      //init css of paragraphs
      p_width = pbefore.width();
      pbefore.css({position:'absolute', width:p_width, overflow:'hidden', zIndex:-1});
      pafter.css({visibility:'visible', width:p_width, overflow:'hidden', 
                  marginLeft: p_width,  background:'white'});
      //make sure mouse state is known at end of animation
      pafter.mouseenter(function(){ $(this).data('down',true);});
      pafter.mouseleave(function(){ $(this).data('down',false);});
      //animate pbefore and pafter
      p_height = pafter.height();
      pafter.css('height',pbefore.height());
      pbefore.animate({height: p_height},{ duration: 1000});
      pafter.animate( 
	{marginLeft: 0, height:p_height},
	{complete: function(){
           pbefore.remove();
           pafter.css({height:''}); //allow detail to appear
           $('.detail', pafter).css('display', 'none');
           if(pafter.data('down')){ $('.detail',pafter).slideDown(); }
           //install sliding at the last moment to keep animation clean
           pafter.mouseenter(make_detail_slide_function(true));
           pafter.mouseleave(make_detail_slide_function(false));
	 },
	 duration: 1000});

  },
  make_parent_hiding_function: function(tohide, toshow){
    return function(){
      var p, delayms, hide, show;
      p = $(this).prev();
      p.data('minheight',p.height());
      delayms = 400;
      hide = p.find("."+tohide).stop(true); //clear queue
      $(hide.get()).each(function(i,e){
		$(this).delay(delayms*(i)).animate({width: '0px'});
      });
      show = p.find("."+toshow).stop(true); //clear queue
      $(show.get()).each(function(i,e){
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

  },
  make_simple_parent_hiding_function: function(tohide, toshow){
    return function(){
     $(this).parent().find("."+tohide).animate({width: '0px'}, 
					  {queue: false});
     $(this).parent().find("."+toshow).each(function(){
        var o_width = $(this).data('original_width');
	$(this).animate({width: o_width});
      });
    };

  },
  apply_spanned_substitutions: function(text, substitutions){
    var i, substitution, replacement;
    for(i=0; i<substitutions.length; i+=1 ){
      substitution = substitutions[i];
      if(substitution[1].toLowerCase() === substitution[2].toLowerCase()){
        replacement = substitution[2];
      }else{
        replacement = this.span(substitution[1],'r')+this.span(substitution[2],'o');
      }
      text = text.replace(substitution[0],replacement);
    }  
    return text;
  
  },
  span: function(to_wrap, claz){
    var clazz = claz ? ' class="'+claz+'"' : '';
    return '<span'+clazz+' style="display:inline-block;">'+to_wrap+'</span>';
  
  },
  span_words: function(text, claz){
    var tokens, token, spl, result, i, inspan;
    spl = string_util.split;
    tokens = spl(spl(spl(text,"<",1)," "),">");
    inspan = false;
    result = "";
    for(i=0; i<tokens.length;i+=1){
      token = tokens[i];
      if(string_util.starts_with("<span", token)){ inspan = true; }
      //result += inspan ? token : this.span(token.replace(" ","&nbsp;"));
      if(inspan || token === '<br>'){
        result += token;
      }else{
        result += this.span(token.replace(" ","&nbsp;"), claz);
      }
      if(token === "</span>"){ inspan = false;  }
    }
    return result;

  }};
function make_simple_detail_slide_function(down){
    if(down){
      return function(){$(".detail",this).slideDown();};
    }
    return function(){$(".detail",this).slideUp();};

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
displayer = span_displayer;
string_util = {
  starts_with: function(start, a_string){
    return a_string && a_string.substring(0, start.length) === start;
  },
  ends_with: function(end, a_string){
  return a_string && a_string.substring(a_string.length-end.length, 
			    a_string.length) === end;
  },
  starts_with_vowel: function(string){
    return /^[aàáâãäåæeèéêëiìíîïoòóôõöœuùúûüyýÿ]/i.exec(string);
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
      result = array_util.flatten(result);
    }  
    return result;
  }};
array_util = {
  random_index: function(array){
    return Math.floor(Math.random() * array.length);

  },
  flatten: function(array){
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

  },
  remove_all: function(array,elements){
   var index, i, element;
   for (i=0 ; i < elements.length ; i += 1){
    element = elements[i];
    index = $.inArray(element,array);
    if(index>=0) { array.splice(index,1); }
   }

  },
  add_all: function(array,elements){
   var i;
   for (i=0 ; i < elements.length ; i += 1){
    array.push( elements[i]);
   }

  },
  safe_index: function(length,index){
   return Math.min(length-1 , Math.max(0,index));

 }};
url_helper = {
  get_protagonist_from_url: function(){
    var match = new RegExp('(\\?|&)([^=]+?)($|&)').exec(location.search);
    if(match){
      protagonistes.unshift(unescape(match[2]));
    }

  },
  get_indexes_from_url: function(){
    var match, regex;
    regex = '_escaped_fragment_=([\\d-]+)($|&)';
    match = new RegExp(regex).exec(location.search);
    if(match){
      return $.map(match[1].split('-'),
  		 function(el){return parseInt(el,10);});
    }
    return null;

  },
  get_indexes_from_hash: function(){
    if(string_util.starts_with("#",location.hash)){
       return $.map(location.hash.substr(1).split('-'),
		    function(el){return parseInt(el,10);});
    }
    return null;

  },
  write_to_hash: function(indexes){
    location.hash = "#"+indexes.join("-");

  }};
