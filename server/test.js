
$(document).ready(function(){

var text = {text: "En 2001, <elle:pronom_feminin> vient avec <Christophe:nom_masculin_2>. La prestation de <Loana:nom_feminin_1> est pas mal.",
 placeholders:[["Loana", "nom_feminin_1"], 
	  ["Christophe", "nom_masculin_2"], ["elle", "pronom_feminin"]] };

test("build_paragraph",function() {
    var text,subs,sub_holder,replaced;
   
    text = {text: "En 2001, <Loana:nom_feminin_1> vient.",
	    placeholders:[["Loana", "nom_feminin_1"]] };
    sub_holder = substituter.all_substitutions(text,["aaa","bb"]);
    equal(sub_holder.text,'En 2001, ####################0 vient.');
    equal(sub_holder.subs.length,1);
    equal(sub_holder.subs[0][0],'####################0');
    equal(sub_holder.subs[0][1],'aaa');
    equal(sub_holder.subs[0][2],'Loana');
    replaced = span_displayer.apply_spanned_substitutions(sub_holder.text, sub_holder.subs);
    equal(replaced,"En 2001, <span class=\"r\" style=\"display:inline-block;\">aaa</span><span class=\"o\" style=\"display:inline-block;\">Loana</span> vient.");

    text = {text: "En 2001, <Loana:nom_feminin_1> vient chez <Bozo:nom_masculin_2>.",
	    placeholders:[["Loana", "nom_feminin_1"],["Bozo","nom_masculin_2"]] };
    sub_holder = substituter.all_substitutions(text,["aaa","bb"]);
    equal(sub_holder.text,'En 2001, ####################0 vient chez ####################1.');
    equal(sub_holder.subs.length,2);
    equal(sub_holder.subs[0][0],'####################0');
    equal(sub_holder.subs[0][1],'aaa');
    equal(sub_holder.subs[0][2],'Loana');
    equal(sub_holder.subs[1][0],'####################1');
    equal(sub_holder.subs[1][1],'bb');
    equal(sub_holder.subs[1][2],'Bozo');
   
    text = {text: "En 2001, <Loana:nom_feminin_1> radote. La <star:litt:dessinatrice> vient chez <Bozo:nom_masculin_2>. <Il:pronom_masculin> dort.",
	    placeholders:[["Loana", "nom_feminin_1"],
                          ["star", "litt:dessinatrice"],
                          ["Bozo","nom_masculin_2"],
			  ["Il","pronom_masculin"]] };
    sub_holder = substituter.all_substitutions(text,["aaa","bb"]);
    equal(sub_holder.text,'En 2001, ####################0 radote. La #######################1 vient chez ####################2. Il dort.');
    equal(sub_holder.subs.length,3);
    equal(sub_holder.subs[0][0],'####################0');
    equal(sub_holder.subs[0][1],'aaa');
    equal(sub_holder.subs[0][2],'Loana');
    equal(sub_holder.subs[0][3],9);
    equal(sub_holder.subs[1][0],'#######################1');
    equal(sub_holder.subs[1][1],'dessinatrice');
    equal(sub_holder.subs[1][2],'star');
    equal(sub_holder.subs[1][3],42);
    equal(sub_holder.subs[2][0],'####################2');
    equal(sub_holder.subs[2][1],'bb');
    equal(sub_holder.subs[2][2],'Bozo');
    equal(sub_holder.subs[2][3],78);


});

test("Morpher.overlap", function(){
    equal(Morpher.overlap("Loana","Bobo",0,true),"Loana");
    equal(Morpher.overlap("Loana","Bobo",1,true),"LoanB");
    equal(Morpher.overlap("Loana","Bobo",2,true),"LoaBo");
    equal(Morpher.overlap("Loana","Bobo",3,true),"LoBob");
    equal(Morpher.overlap("Loana","Bobo",4,true),"LBobo");
    equal(Morpher.overlap("Loana","Bobo",5,true),"Bobo");

    equal(Morpher.overlap("Lo","Bobo",0,true),"Lo");
    equal(Morpher.overlap("Lo","Bobo",1,true),"LB");
    equal(Morpher.overlap("Lo","Bobo",2,true),"Bo");
    equal(Morpher.overlap("Lo","Bobo",3,true),"Bob");
    equal(Morpher.overlap("Lo","Bobo",4,true),"Bobo");

    equal(Morpher.overlap("Fred","centipede", 0,true), "Fred");
    equal(Morpher.overlap("Fred","centipede", 1,true), "Frec");
    equal(Morpher.overlap("Fred","centipede", 2,true), "Frce");
    equal(Morpher.overlap("Fred","centipede", 3,true), "Fcen");
    equal(Morpher.overlap("Fred","centipede", 4,true), "cent");
    equal(Morpher.overlap("Fred","centipede", 5,true), "centi");
    equal(Morpher.overlap("Fred","centipede", 6,true), "centip");
    equal(Morpher.overlap("Fred","centipede", 7,true), "centipe");
    equal(Morpher.overlap("Fred","centipede", 8,true), "centiped");
    equal(Morpher.overlap("Fred","centipede", 9,true), "centipede");

    equal(Morpher.overlap("Loana","Bobo",0,false),"Bobo");
    equal(Morpher.overlap("Loana","Bobo",1,false),"LBob");
    equal(Morpher.overlap("Loana","Bobo",2,false),"LoBo");
    equal(Morpher.overlap("Loana","Bobo",3,false),"LoaB");
    equal(Morpher.overlap("Loana","Bobo",4,false),"Loan");
    equal(Morpher.overlap("Loana","Bobo",5,false),"Loana");
});

test("safe_index", function(){
  var a = [1,2,3];
  equal(a[array_util.safe_index(a.length,-2)], 1);
  equal(a[array_util.safe_index(a.length,-1)], 1);
  equal(a[array_util.safe_index(a.length, 0)], 1);
  equal(a[array_util.safe_index(a.length, 1)], 2);
  equal(a[array_util.safe_index(a.length, 2)], 3);
  equal(a[array_util.safe_index(a.length, 3)], 3);

});
function animate(morpher){
  var display = function(i){ return function(){
     $('#show').html(morpher.step(i));}; };
  for(var i=0; i<morpher.nb_steps; i+=1 ){
      setTimeout(display(i), i*50);
  };
  for(var j=0; j<morpher.nb_steps; j+=1 ){
      setTimeout(display(morpher.nb_steps-j-1), (morpher.nb_steps+j)*50+1000);
  };

}
function say_aaa(length){
  var string = 'a';
  while(string.length<length){
    string += 'a';
  }
  return string;

}
test("playground", function(){
   var s, re, match, i, indexes;
   s  ="ah hello my friend hello how are you";
   re = /hel(lo)/g;
   i = 0;
   equal(s.replace(re,function(){return '#' + (i+=1) + '#';}),"ah #1# my friend #2# how are you");
   indexes = [];
   equal(s.replace(re,function(str,p1,offset,s){
                            indexes.push(offset);
                            return say_aaa(str.length);}),
         "ah aaaaa my friend aaaaa how are you");
   deepEqual(indexes,[3,19]);

   re = /hel(lo)/g; //or ie fails
   indexes = [];
   while((match = re.exec(s))){
     indexes.push(match.index);
   }
   deepEqual(indexes,[3,19]);
   equal(say_aaa(4),'aaaa');
   equal(substituter.pad_number(4,5),'####4');


});
test("morpher", function(){
    var  text, morpher, stages, i, subs;
    text = {text: "En 2001, <Loana:nom_feminin_1> vient chez <Fred:prenom_masculin_2>.",
	    placeholders:[["Loana", "nom_feminin_1"],["Fred","prenom_masculin_2"]] };

    morpher = new Morpher(text,["Bozo","centipede"]);
    subs = morpher.sub_holder.subs;
    equal(subs[0][1],"Bozo");
    equal(subs[0][2],"Loana");
    equal(subs[1][1],"centipede");
    equal(subs[1][2],"Fred");

    stages = Morpher.morph_stages(subs[0],true);
    deepEqual(stages, ["Loana","LoanB","LoaBo","LoBoz","LBozo","Bozo"]);
    
    equal(morpher.morphs.length,2);
    equal(morpher.morphs[0].length,6);
    deepEqual(morpher.morphs[0], ["Bozo", "LBoz", "LoBo", "LoaB", "Loan", "Loana"]);
    equal(morpher.morphs[1].length,10);

    equal(morpher.nb_steps,15);

    equal(morpher.offsets[0],0);
    equal(morpher.offsets[1],5);
    equal(morpher.offsets[2],14);
    
    deepEqual(morpher.replacements_for_step(0),["Bozo", "centipede"]);
    deepEqual(morpher.replacements_for_step(1),["LBoz", "centipede"]);
    deepEqual(morpher.replacements_for_step(5),["Loana", "centipede"]);
    deepEqual(morpher.replacements_for_step(6),["Loana", "Fcentiped"]);
    deepEqual(morpher.replacements_for_step(7)["Bozo","Fredce"]);
    deepEqual(morpher.replacements_for_step(8)["Bozo","Fredcen"]);
    deepEqual(morpher.replacements_for_step(9)["Bozo","Fredcent"]);
    deepEqual(morpher.replacements_for_step(10)["Bozo","Fredcenti"]);
    deepEqual(morpher.replacements_for_step(11)["Bozo","Frecentip"]);
    deepEqual(morpher.replacements_for_step(12)["Bozo","Frcentipe"]);
    deepEqual(morpher.replacements_for_step(13)["Bozo","Fcentiped"]);
    deepEqual(morpher.replacements_for_step(14)["Bozo","centipede"]);

    equal(morpher.step(2),'En 2001, LoBo vient chez centipede.');
    equal(morpher.step(7),'En 2001, Loana vient chez Frcentipe.');
    equal(morpher.step(13),'En 2001, Loana vient chez Fredc.');

    animate(morpher);

 });
 
 test("span_words",function(){
   var text = span_displayer.span_words(
   "En 01, <span class='o'>Loa na</span> vient sf<span> ah ah </span>bof. <br>hop");
   equal(text,
"<span style=\"display:inline-block;\">En&nbsp;</span><span style=\"display:inline-block;\">01,&nbsp;</span><span class='o'>Loa na</span><span style=\"display:inline-block;\">&nbsp;</span><span style=\"display:inline-block;\">vient&nbsp;</span><span style=\"display:inline-block;\">sf</span><span> ah ah </span><span style=\"display:inline-block;\">bof.&nbsp;</span><br><span style=\"display:inline-block;\">hop</span>");
 });
   
 test("map_placeholders", function() {
   var ph, map, nom_m;
   ph = [["Loana", "nom_feminin_1"], ["Christophe", "nom_masculin_2"], 
	  ["elle", "pronom_feminin"]];
   map = substituter.map_placeholders(ph,["a","b"]);
   deepEqual( map["nom_feminin_1"], "a", "");
   deepEqual( map["nom_masculin_2"], "b", "");
   deepEqual( map["pronom_feminin"], "elle", ""); 

   map = substituter.map_placeholders(ph,["a", "b", "c", "d"]);
   deepEqual( map["nom_feminin_1"], "a", "");
   nom_m = map["nom_masculin_2"];
   ok( $.inArray(nom_m, ["b", "c", "d"])>-1, "");
   deepEqual( map["pronom_feminin"], "elle", "");
 });

test("apostrophe_substitutions", function(){
 var fixed = substituter.all_substitutions_for_placeholder({subs:[], text:"le <raton:nom_masculin_3> mange"}, 
 ["raton"], "animal");
 equal(1,fixed.subs.length);
 equal(fixed.subs[0][1], "l'animal");
 equal(fixed.subs[0][2], "le raton");
 equal(fixed.text,"########################0 mange");

 fixed = substituter.all_substitutions_for_placeholder({subs:[],text:"le <raton:nom_masculin> mange"}, 
 ["raton"], "animal");
 equal(1,fixed.subs.length);
 equal(fixed.subs[0][1], "l'animal");
 equal(fixed.subs[0][2], "le raton");

 fixed = substituter.all_substitutions_for_placeholder({subs:[],text:"le <raton (o):nom_masculin> mange"}, 
 ["raton (o)"], "animal");
 equal(1,fixed.subs.length);
 equal(fixed.subs[0][1], "l'animal");
 equal(fixed.subs[0][2], "le raton (o)");

 fixed = substituter.all_substitutions_for_placeholder({subs:[],text:"du <raton:nom_masculin>"},
 ["raton"], "animal");
 equal(0,fixed.subs.length);

 fixed = substituter.all_substitutions_for_placeholder({subs:[], text:"l'<animal:nom_masculin_3> mange"}, 
 ["animal"], "raton");
 equal(1,fixed.subs.length);
 equal(fixed.subs[0][1], "le raton");
 equal(fixed.subs[0][2], "l'animal");
 equal(fixed.text,"########################0 mange");

 fixed = substituter.all_substitutions_for_placeholder({subs:[],text:"vénérable <animal:nom_masculin_3> me"},
                        ["animal"], "raton");
 equal(0,fixed.subs.length);

 fixed = substituter.all_substitutions_for_placeholder({subs:[], text:"l'<animale:nom_feminin> mange"}, 
 ["animale"], "ratonne");
 equal(1,fixed.subs.length);
 equal(fixed.subs[0][1], "la ratonne");
 equal(fixed.subs[0][2], "l'animale");

 fixed = substituter.all_substitutions_for_placeholder({subs:[], text:"qu'<animale:nom_feminin> mange"}, 
 ["animale"], "ratonne");
 equal(1,fixed.subs.length);
 equal(fixed.subs[0][1], "que ratonne");
 equal(fixed.subs[0][2], "qu'animale");
 equal(fixed.text, "#######################0 mange");

 fixed = substituter.all_substitutions_for_placeholder({subs:[], text: "qu'<animale:nom_feminin> mange <animale:nom_feminin>"}, 
 ["animale","nom_feminin"], "ratonne");
 equal(2,fixed.subs.length);
 equal(fixed.subs[0][1], "que ratonne");
 equal(fixed.subs[0][2], "qu'animale");
 equal(fixed.subs[1][1], "ratonne");
 equal(fixed.subs[1][2], "animale");
 equal(fixed.text, "#######################0 mange ####################1");

 fixed = substituter.all_substitutions_for_placeholder({subs:[], text:"<animale:nom_feminin> mange <animale:nom_feminin>"}, 
 ["animale","nom_feminin"], "ratonne");
 equal(2,fixed.subs.length);
 equal(fixed.subs[0][1], "ratonne");
 equal(fixed.subs[0][2], "animale");
 equal(fixed.subs[1][1], "ratonne");
 equal(fixed.subs[1][2], "animale");
 equal(fixed.text, "####################0 mange ####################1");

});

});

