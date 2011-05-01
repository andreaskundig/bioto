
$(document).ready(function(){

var text = {text: "En 2001, <elle:pronom_feminin> vient avec <Christophe:nom_masculin_2>. La prestation de <Loana:nom_feminin_1> est pas mal.",
 placeholders:[["Loana", "nom_feminin_1"], 
	  ["Christophe", "nom_masculin_2"], ["elle", "pronom_feminin"]] };

test("build_paragraph",function() {
    var text,subs,replaced;
    text = {text: "En 2001, <Loana:nom_feminin_1> vient.",
	    placeholders:[["Loana", "nom_feminin_1"]] };
    subs = all_substitutions(text,["aaa","bb"]);
    replaced = apply_spanned_substitutions(text.text, subs);
    equal(replaced,"En 2001, <span class=\"r\" style=\"display:inline-block;\">aaa</span><span class=\"o\" style=\"display:inline-block;\">Loana</span> vient.");
   
});

test("overlap", function(){
    equal(overlap("Loana","Bobo",0,true),"Loana");
    equal(overlap("Loana","Bobo",1,true),"LoanB");
    equal(overlap("Loana","Bobo",2,true),"LoaBo");
    equal(overlap("Loana","Bobo",3,true),"LoBob");
    equal(overlap("Loana","Bobo",4,true),"LBobo");
    equal(overlap("Loana","Bobo",5,true),"Bobo");

    equal(overlap("Lo","Bobo",0,true),"Lo");
    equal(overlap("Lo","Bobo",1,true),"LB");
    equal(overlap("Lo","Bobo",2,true),"Bo");
    equal(overlap("Lo","Bobo",3,true),"Bob");
    equal(overlap("Lo","Bobo",4,true),"Bobo");

    equal(overlap("Fred","centipede", 0,true), "Fred");
    equal(overlap("Fred","centipede", 1,true), "Frec");
    equal(overlap("Fred","centipede", 2,true), "Frce");
    equal(overlap("Fred","centipede", 3,true), "Fcen");
    equal(overlap("Fred","centipede", 4,true), "cent");
    equal(overlap("Fred","centipede", 5,true), "centi");
    equal(overlap("Fred","centipede", 6,true), "centip");
    equal(overlap("Fred","centipede", 7,true), "centipe");
    equal(overlap("Fred","centipede", 8,true), "centiped");
    equal(overlap("Fred","centipede", 9,true), "centipede");

    equal(overlap("Loana","Bobo",0,false),"Bobo");
    equal(overlap("Loana","Bobo",1,false),"LBob");
    equal(overlap("Loana","Bobo",2,false),"LoBo");
    equal(overlap("Loana","Bobo",3,false),"LoaB");
    equal(overlap("Loana","Bobo",4,false),"Loan");
    equal(overlap("Loana","Bobo",5,false),"Loana");
});

test("safe_index", function(){
  var a = [1,2,3];
  equal(a[safe_index(a.length,-2)], 1);
  equal(a[safe_index(a.length,-1)], 1);
  equal(a[safe_index(a.length, 0)], 1);
  equal(a[safe_index(a.length, 1)], 2);
  equal(a[safe_index(a.length, 2)], 3);
  equal(a[safe_index(a.length, 3)], 3);

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
test("morpher", function(){
    var  text, morpher, stages, i;
    text = {text: "En 2001, <Loana:nom_feminin_1> vient chez <Fred:prenom_masculin_2>.",
	    placeholders:[["Loana", "nom_feminin_1"],["Fred","prenom_masculin_2"]] };

    morpher = new Morpher(text,["Bozo","centipede"]);
    equal(morpher.subs[0][1],"Bozo");
    equal(morpher.subs[0][2],"Loana");
    equal(morpher.subs[1][1],"centipede");
    equal(morpher.subs[1][2],"Fred");

    stages = morpher.morph_stages(morpher.subs[0],true);
    deepEqual(stages, ["Loana","LoanB","LoaBo","LoBoz","LBozo","Bozo"]);
    
    equal(morpher.morphs.length,2);
    equal(morpher.morphs[0].length,6);
    deepEqual(morpher.morphs[0], ["Loana","LoanB","LoaBo","LoBoz","LBozo","Bozo"]);
    equal(morpher.morphs[1].length,10);

    equal(morpher.nb_steps,15);

    equal(morpher.offsets[0],0);
    equal(morpher.offsets[1],5);
    equal(morpher.offsets[2],14);
    
    deepEqual(morpher.replacements_for_step(0),["Loana", "Fred"]);
    deepEqual(morpher.replacements_for_step(1),["LoanB", "Fred"]);
    deepEqual(morpher.replacements_for_step(5),["Bozo", "Fred"]);
    deepEqual(morpher.replacements_for_step(6),["Bozo", "Frec"]);
    deepEqual(morpher.replacements_for_step(7)["Bozo","Fredce"]);
    deepEqual(morpher.replacements_for_step(8)["Bozo","Fredcen"]);
    deepEqual(morpher.replacements_for_step(9)["Bozo","Fredcent"]);
    deepEqual(morpher.replacements_for_step(10)["Bozo","Fredcenti"]);
    deepEqual(morpher.replacements_for_step(11)["Bozo","Frecentip"]);
    deepEqual(morpher.replacements_for_step(12)["Bozo","Frcentipe"]);
    deepEqual(morpher.replacements_for_step(13)["Bozo","Fcentiped"]);
    deepEqual(morpher.replacements_for_step(14)["Bozo","centipede"]);

    equal(morpher.step(2),'En 2001, LoaBo vient chez Fred.');
    equal(morpher.step(7),'En 2001, Bozo vient chez Frce.');
    equal(morpher.step(13),'En 2001, Bozo vient chez centiped.');

    animate(morpher);

 });
 
 test("span_words",function(){
   var text = span_words("En 01, <span class='o'>Loa na</span> vient sf<span> ah ah </span>bof. <br>hop");
   equal(text,
"<span style=\"display:inline-block;\">En&nbsp;</span><span style=\"display:inline-block;\">01,&nbsp;</span><span class='o'>Loa na</span><span style=\"display:inline-block;\">&nbsp;</span><span style=\"display:inline-block;\">vient&nbsp;</span><span style=\"display:inline-block;\">sf</span><span> ah ah </span><span style=\"display:inline-block;\">bof.&nbsp;</span><br><span style=\"display:inline-block;\">hop</span>");
 });
   
 test("map_placeholders", function() {
   var ph, map, nom_m;
   ph = [["Loana", "nom_feminin_1"], ["Christophe", "nom_masculin_2"], 
	  ["elle", "pronom_feminin"]];
   map = map_placeholders(ph,["a","b"]);
   deepEqual( map["nom_feminin_1"], "a", "");
   deepEqual( map["nom_masculin_2"], "b", "");
   deepEqual( map["pronom_feminin"], "elle", ""); 

   map = map_placeholders(ph,["a", "b", "c", "d"]);
   deepEqual( map["nom_feminin_1"], "a", "");
   nom_m = map["nom_masculin_2"];
   ok( $.inArray(nom_m, ["b", "c", "d"])>-1, "");
   deepEqual( map["pronom_feminin"], "elle", "");
 });

test("apostrophe_substitutions", function(){
 fixed = apostrophe_substitutions("le <raton:nom_masculin_3> mange", 
 "raton", "animal");
 equal(1,fixed.length);
 equal(fixed[0][1], "l'animal");
 equal(fixed[0][2], "le raton");

 fixed = apostrophe_substitutions("le <raton:nom_masculin> mange", 
 "raton", "animal");
 equal(1,fixed.length);
 equal(fixed[0][1], "l'animal");
 equal(fixed[0][2], "le raton");

 fixed = apostrophe_substitutions("le <raton (o):nom_masculin> mange", 
 "raton (o)", "animal");
 equal(1,fixed.length);
 equal(fixed[0][1], "l'animal");
 equal(fixed[0][2], "le raton (o)");

 fixed = apostrophe_substitutions("du <raton:nom_masculin>",
 "raton", "animal");
 equal(0,fixed.length);

 fixed = apostrophe_substitutions("l'<animal:nom_masculin_3> mange", 
                        "animal", "raton");
 equal(1,fixed.length);
 equal(fixed[0][1], "le raton");
 equal(fixed[0][2], "l'animal");

 fixed = apostrophe_substitutions("vénérable <animal:nom_masculin_3> me",
                        "animal", "raton");
 equal(0,fixed.length);

 fixed = apostrophe_substitutions("l'<animale:nom_feminin> mange", "animale",
				"ratonne");
 equal(1,fixed.length);
 equal(fixed[0][1], "la ratonne");
 equal(fixed[0][2], "l'animale");

 fixed = apostrophe_substitutions("qu'<animale:nom_feminin> mange", "animale",
				    "ratonne");
 equal(1,fixed.length);
 equal(fixed[0][1], "que ratonne");
 equal(fixed[0][2], "qu'animale");

});

});

