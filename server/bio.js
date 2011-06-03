//for jslint 
/*jslint white: false */
/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false */
/*global addEventListener: false, blur: false, clearInterval: false, clearTimeout: false, close: false, closed: false, defaultStatus: false, document: false, event: false, focus: false, frames: false, getComputedStyle: false, history: false, Image: false, length: false, location: false, moveBy: false, moveTo: false, name: false, navigator: false, onblur: true, onerror: true, onfocus: true, onload: true, onresize: true, onunload: true, open: false, opener: false, Option: false, parent: false, print: false, resizeBy: false, resizeTo: false, screen: false, scroll: false, scrollBy: false, scrollTo: false, setInterval: false, setTimeout: false, status: false, top: false, XMLHttpRequest: false */
/*global keys_m, keys_f, texts, topics, window, unescape, $ */
var displayer, span_displayer, morph_displayer, keys, show_all,
  male_or_female_keys, pick_indexes, make_detail_slide_function,
  make_simple_detail_slide_function, text_indexes_for_topics, 
  string_util, array_util, url_helper,  Morpher,substituter, substituter1, substituter2;

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
  displayer.polish_display();

}
function bio(deja_utilise,indexes) {
  var subs;
  $("#bio").children().detach();
  keys = male_or_female_keys();
  indexes = indexes || pick_indexes(keys,deja_utilise);
  $.each(indexes, function(i,index){
      displayer.display_text(texts[index], protagonistes);
  });
  displayer.polish_display();
  //write_to_hash(indexes);
  return deja_utilise.concat(indexes);

}
function pick_indexes(keys,exclude){
  var  i,  j, sujet, indexes, index, topic_indexes, topic_index;
  indexes = [];
  for (i=0 ; i<ordre.length ; i+=1) {
    topic_indexes = text_indexes_for_topics(ordre[i],keys);
    array_util.remove_all(topic_indexes, exclude);
    array_util.remove_all(topic_indexes, indexes);
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
substituter = {
  all_substitutions: function(text_object, names) {
    var ph_to_name, placeholder, replacing_name, i, subs, subs_holder;
    subs_holder = {text: text_object.text, subs:[]};
    ph_to_name = this.map_placeholders(text_object.placeholders, names);
    for (i=0 ; i<text_object.placeholders.length ; i += 1){
      placeholder  = text_object.placeholders[i];
      replacing_name = ph_to_name[placeholder[1]];
      this.all_substitutions_for_placeholder(subs_holder, placeholder, replacing_name);
    }
    subs_holder.subs.sort(function(a,b){return a[3]>b[3];});
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
     phname = ph[1];
     if(map[phname]){ //on l'a deja
     }else if(string_util.starts_with("pronom", phname)){
       map[phname] = ph[0]; //on remplace pas les pronoms...
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
  all_substitutions_for_placeholder: function(substitution_holder, placeholder, replacement){
    //returns {text:..., subs: [regex, replacement, original, offset]
    var re1,re2,re3, orig_paren, original, subs, text;
    text = substitution_holder.text;
    subs = substitution_holder.subs;
    original = placeholder[0];
    if(original === replacement){
      substitution_holder.text = text.replace(this.make_placeholder_regex(placeholder),original);
      return substitution_holder;
    }
    orig_paren = original.replace("(","\\(").replace(")","\\)").replace("|"," \\|");
    if (string_util.starts_with_vowel(replacement)){
      re1 =  new RegExp("\\b(d|qu|l)(u\\s+|e\\s+|a\\s+)<"+orig_paren+":(?:pre)?nom[^>]*>","gi");
      text = text.replace(re1, this.subs_function(subs,"'",replacement,original));
    }else{
      re1 = new RegExp("\\b(l)('\\s*)<"+orig_paren+":(?:pre)?nom_feminin[^>]*>","gi");
      text = text.replace(re1, this.subs_function(subs,"a ",replacement,original));
      re2 = new RegExp("\\b(l)('\\s*)<"+orig_paren+":(':pre)?nom_masculin[^>]*>","gi");
      text = text.replace(re2, this.subs_function(subs,"e ",replacement,original));
      re3 = new RegExp("\\b(d|qu)('\\s*)(<"+orig_paren+":(?:pre)?nom[^>]*>)","gi");
      text = text.replace(re3, this.subs_function(subs,"e ",replacement,original));
    }
    re1 = this.make_placeholder_regex(placeholder);
    text = text.replace(re1, this.subs_function(subs,"",replacement,original));
    substitution_holder.text = text;
    substitution_holder.subs = subs;
    return substitution_holder;

  },
  subs_function : function(subs, apo_replacement, replacement, original){
     var pad_number = this.pad_number;
     return function(str){
       var replacement_number,p1,p2,offset,s;
       //args
       p1 = arguments.length > 3 ? arguments[1] : "";
       p2 = arguments.length > 4 ? arguments[2] : "";
       offset = arguments[arguments.length - 2];
       s = arguments[arguments.length - 1];
       //create the substitution array
       replacement_number = pad_number(subs.length, str.length);
       subs.push([replacement_number, p1+apo_replacement+replacement, p1+p2+original, offset]);
       return replacement_number;
     };

  },
  pad_number :  function(number, length){
     var string = '#'+number;
     while(string.length<length){
       string = '#'+string;
     }
     return string;

  },
  make_placeholder_regex: function(placeholder) {
    var exp = '<' + placeholder.join(':') + '>';
    exp = exp.replace(/\(/,'\\(').replace(/\)/,'\\)');
    return new RegExp(exp,"g");

  }};
substituter2 = {
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
     }else if(string_util.starts_with("pronom", phname)){
       map[phname] = ph[2]; //on remplace pas les pronoms...
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
    //ph ["#0#", ["l'","la "],"Loana", "nom_feminin_1"]
    //replacement "Oignon"
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
substituter1 = {
  all_substitutions: function(text_object, names) {
    var ph_to_name, placeholder, replacing_name, i, subs, subs_holder;
    subs_holder = {text: text_object.text, subs:[]};
    ph_to_name = this.map_placeholders(text_object.placeholders, names);
    for (i=0 ; i<text_object.placeholders.length ; i += 1){
      placeholder  = text_object.placeholders[i];
      replacing_name = ph_to_name[placeholder[2]];
      this.all_substitutions_for_placeholder(subs_holder, placeholder, replacing_name);
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
     phname = ph[2];
     if(map[phname]){ //on l'a deja
     }else if(string_util.starts_with("pronom", phname)){
       map[phname] = ph[1]; //on remplace pas les pronoms...
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
  all_substitutions_for_placeholder: function(substitution_holder, placeholder, replacement){
    //returns {text:..., subs: [regex, replacement, original]
   /* original commence par voyelle
        du de da quu que qua lu le la -> d' qu' l'
      sinon
        original f�minin
          l' -> la
        original masculin
          l' -> le
        pour tous
          d' qu' -> que
      !! aucune de ces formes ne doit etre marquee comme unisexe */
    var re1,re2,re3, orig_paren, original, subs, text;
    text = substitution_holder.text;
    subs = substitution_holder.subs;
    original = placeholder[1];
    if(original === replacement){
      substitution_holder.text = text.replace(this.make_placeholder_regex(placeholder),original);
      return substitution_holder;
    }
    orig_paren = original.replace("(","\\(").replace(")","\\)").replace("|"," \\|");
    if (string_util.starts_with_vowel(replacement)){
      if(placeholder[2].match(/nom/)){
        re1 =  new RegExp("\\b(d|qu|l)(u\\s+|e\\s+|a\\s+)("+placeholder[0]+")","gi");
        text = text.replace(re1, this.subs_function(subs,"'",replacement,original));
      }
    }else{//no vowel
      if(placeholder[2].match(/nom_feminin/)){
        re1 =  new RegExp("\\b(l)('\\s*)("+placeholder[0]+")","gi");
        text = text.replace(re1, this.subs_function(subs,"a ",replacement,original));
      }else if(placeholder[2].match(/nom_masculin/)){
        re2 = new RegExp("\\b(l)('\\s*)("+placeholder[0]+")","gi");
        text = text.replace(re2, this.subs_function(subs,"e ",replacement,original));
      }
      if(placeholder[2].match(/nom/)){
        re3 = new RegExp("\\b(d|qu)('\\s*)("+placeholder[0]+")","gi");
        text = text.replace(re3, this.subs_function(subs,"e ",replacement,original));
      }
    }
    re1 = this.make_placeholder_regex(placeholder);
    text = text.replace(re1, this.subs_function(subs,"",replacement,original));
    substitution_holder.text = text;
    substitution_holder.subs = subs;
    return substitution_holder;

  },
  subs_function : function(subs, apo_replacement, replacement, original){
     return function(str,p1,p2,p3,offset,the_whole_string){
       var replacement_number = arguments.length > 5 ? p3 : str;
       replacement_number = replacement_number.replace(/#/g,'~');
       p1 = arguments.length > 3 ? p1 : "";
       p2 = arguments.length > 4 ? p2 : "";
       subs.push([replacement_number, p1+apo_replacement+replacement, p1+p2+original]);
       return replacement_number;
     };

  },
  make_placeholder_regex: function(placeholder) {
    var exp = placeholder[0] ;
    exp = exp.replace(/\(/,'\\(').replace(/\)/,'\\)');
    return new RegExp(exp,"g");

  }};
span_displayer = {
  display_text: function(text_object, names){
    var text, paragraph, p, substitutions;
    substitutions = substituter1.all_substitutions(text_object, protagonistes);
    text = this.apply_spanned_substitutions(substitutions.text, substitutions.subs);
    text = this.span_words(text);
    text = text.replace(/\|/g,''); //no point in using &shy; inside spans
    paragraph = $('<div class="paragraph"><p>'+text+'</p>'+
       '<p class="detail" style="display:none"><a href="'+text_object.url+
       '">en savoir plus</a></p></div>');
    p = paragraph.find('p').first();
    p.data('morpher', new Morpher(text_object,names));
    $("#bio").append(paragraph);

  },
  polish_display: function(){
    //console.time(1);
    $("#bio>div>p>span.r,#bio>div>p>span.o").each(function(){
        $(this).data('original_width',$(this).width());
    });
    $("#bio>div>p>span.o").css({width: '0px'});
    $(".detail").mouseenter(this.make_parent_hiding_function('r','o')
  	     ).mouseleave(this.make_parent_hiding_function('o','r'));
    $(".paragraph").mouseenter(make_detail_slide_function(true)
  	        ).mouseleave(make_detail_slide_function(false));
    //console.timeEnd(1);

  },
  make_parent_hiding_function: function(tohide, toshow){
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
morph_displayer = {
  display_text: function(text_object, names){
    var text, paragraph, p, morpher;
    morpher = new Morpher(text_object,names);
    text = morpher.step(0);
    paragraph = $('<div class="paragraph"><p>'+text+'</p>'+
       '<p class="detail" style="display:none"><a href="'+text_object.url+
       '">en savoir plus</a></p></div>');
    p = paragraph.find('p').first();
    p.data('morpher', morpher);
    $("#bio").append(paragraph);

  },
  polish_display: function(){
    //console.time(1);
    $("#bio>div>p>span.r,#bio>div>p>span.o").each(function(){
        $(this).data('original_width',$(this).width());
    });
    $("#bio>div>p>span.o").css({width: '0px'});
    $(".detail").mouseenter(this.make_parent_hiding_function(true)
  	     ).mouseleave(this.make_parent_hiding_function(false));
    $(".paragraph").mouseenter(make_detail_slide_function(true)
  	        ).mouseleave(make_detail_slide_function(false));
    //console.timeEnd(1);

  },
  make_parent_hiding_function: function(show_original){
   var this_displayer = this;
   return function(){
     var p, i, morpher, display_step, steps, qname;
     p = $(this).prev();
     p.data('minheight',p.height());
     qname = 'morph';
     p.clearQueue(qname);
     morpher = p.data('morpher');
     steps = this_displayer.make_steps(show_original, morpher.last_step_nb, morpher.nb_steps);
     $.each(steps,function(i,step){
        p.queue(qname, this_displayer.make_step_display_function(step, p, morpher));
        p.delay(50, qname);
     });
     p.dequeue(qname);
   };

  },
  make_steps: function(show_original, last_step_nb, nb_steps){
     var i, steps = [];
     if(show_original){
       for(i=last_step_nb; i<nb_steps; i+=1 ){steps.push(i); }
       return steps;
     }else{
       for(i=0; i<last_step_nb; i+=1 ){steps.push(i); }
       return steps.reverse();
     }
  
  },
  make_step_display_function: function(i, p, morpher){ 
   return function(next){
     p.html(morpher.step(i));
     var minheight = Math.max(p.data('minheight'),p.height());
     p.data('minheight',minheight);
     p.css({minHeight: minheight});
     next();
   }; 

  }};
function Morpher(text_object,names){
  var offset_cumul, morpher;
  if(this instanceof Morpher){
    this.sub_holder = substituter2.all_substitutions(text_object,names);
    this.morphs = $.map(this.sub_holder.subs, 
                        function(sub,i){return [Morpher.morph_stages(sub,false)];});
    offset_cumul = 0;
    this.offsets = $.map(this.morphs,
                        function(morph){ offset_cumul += morph.length-1;
                                         return offset_cumul;} );
    this.offsets.unshift(0);
    this.nb_steps = this.offsets[this.offsets.length-1] +1 ;
    //replace white spaces
    $.each(this.morphs, function(i,morph){
       $.each(morph,function(j,step){
           morph[j] = step.replace(/\s+/g,'&ensp;');
       });
     });
    this.last_step_nb = 0;
    return this;
  }else{
    return new Morpher(text_object,names); //new even if called without new
  }

}
Morpher.overlap = function(below,above,chars,cover){
   var maxlength = Math.max(below.length,above.length);
   if(cover){
     return  below.substring(0, Math.max(below.length-chars,0)) +
             above.substring(0, Math.min(above.length,chars));
   }
   return below.substring(0, Math.min(below.length,chars)) + 
          above.substring(0, Math.max(above.length-chars),0);

 };
Morpher.morph_stages = function(sub, cover){
  var nb_steps, i, stages;
  stages = [];
  nb_steps = Math.max(sub[1].length,sub[2].length);
  for(i=0 ; i<= nb_steps; i+=1){
   stages.push(Morpher.overlap(sub[2],sub[1], i, cover));
  }
  return stages;

};
Morpher.prototype.replacements_for_step = function(step_nb){
  var m = this;
  return $.map(this.morphs,function(morph,i){
               return morph[array_util.safe_index(morph.length, step_nb - m.offsets[i])];
   });

};
Morpher.prototype.step = function(step_nb){
  var i, replacements, text, subs;
  text = this.sub_holder.text;
  subs = this.sub_holder.subs;
  replacements = this.replacements_for_step(step_nb);
  for( i=0; i<subs.length; i+=1){
       text = text.replace(subs[i][0],replacements[i]);
  }
  this.last_step_nb = step_nb;
  return text.replace(/\|/g,'&shy;');

};
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
displayer = morph_displayer;
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
