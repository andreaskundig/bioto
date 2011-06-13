
$(document).ready(function(){

var text = {text: "En 2001, <elle:pronom_feminin> vient avec <Christophe:nom_masculin_2>. La prestation de <Loana:nom_feminin_1> est pas mal.",
 placeholders:[["Loana", "nom_feminin_1"], 
	  ["Christophe", "nom_masculin_2"], ["elle", "pronom_feminin"]] };

test("build_paragraph",function() {
    var text,subs,sub_holder,replaced;
    text = {text: "En 2001, #0# radote. La #1# vient chez #2#. Il dort.",
	    placeholders:[["#0#", null, "Loana", "nom_feminin_1"],
                          ["#1#", null, "star", "litt:dessinatrice"],
                          ["#2#", null, "Bozo","nom_masculin_2"]] };
    sub_holder = substituter.all_substitutions(text,["aaa","bb"]);
    equal(sub_holder.text,'En 2001, #0# radote. La #1# vient chez #2#. Il dort.');
    equal(sub_holder.subs.length,3);
    equal(sub_holder.subs[0][0],'#0#');
    equal(sub_holder.subs[0][1],'aaa');
    equal(sub_holder.subs[0][2],'Loana');
    equal(sub_holder.subs[1][0],'#1#');
    equal(sub_holder.subs[1][1],'dessinatrice');
    equal(sub_holder.subs[1][2],'star');
    equal(sub_holder.subs[2][0],'#2#');
    equal(sub_holder.subs[2][1],'bb');
    equal(sub_holder.subs[2][2],'Bozo');

    text = {text: "En 2001, #0# radote. La #1# vient chez #0#. Il dort.",
	    placeholders:[["#0#", null, "Loana", "nom_feminin_1"],
                          ["#1#", null, "star", "litt:dessinatrice"]] };
    sub_holder = substituter.all_substitutions(text,["aaa","bb"]);
    equal(sub_holder.text,'En 2001, #0# radote. La #1# vient chez #0#. Il dort.');
    equal(sub_holder.subs.length,2);
    equal(sub_holder.subs[0][0],'#0#');
    equal(sub_holder.subs[0][1],'aaa');
    equal(sub_holder.subs[0][2],'Loana');
    equal(sub_holder.subs[1][0],'#1#');
    equal(sub_holder.subs[1][1],'dessinatrice');
    equal(sub_holder.subs[1][2],'star');


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

test("make_sub", function(){
    var text, ph, replacement, sub;
    text = {text: "En 2001, #0# vient chez #1#.",
	    placeholders:[["#0#", ["l'","la "],"Loana", "nom_feminin_1"],
                          ["#1#", null, "Fred", "prenom_masculin_2"]] };

    ph = text.placeholders[0];
    replacement = "Oignon";
    equal(substituter.add_article(ph[1],replacement),"l'Oignon");

    deepEqual(substituter.make_sub(ph,replacement),["#0#","l'Oignon","la Loana"]);
    ph = text.placeholders[1];
    replacement = "Asphalte";
    deepEqual(substituter.make_sub(ph,replacement),["#1#","Asphalte","Fred"]);

 });
test("morpher", function(){
    var  text, morpher, stages, i, subs;
    text = {text: "En 2001, #0# vient chez #1#.",
	    placeholders:[["#0#", null, "Loana", "nom_feminin_1"],
                          ["#1#", null, "Fred", "prenom_masculin_2"]] };
    morpher = new Morpher(text,["Bozo","centipede"]);
    subs = morpher.sub_holder.subs;
    deepEqual(subs[0],["#0#","Bozo","Loana"]);
    deepEqual(subs[1],["#1#","centipede","Fred"]);

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
   ph = [["#0#", null,"Loana", "nom_feminin_1"], 
         ["#1#", null, "Christophe", "nom_masculin_2"]];
   map = substituter.map_placeholders(ph,["a","b"]);
   deepEqual( map["nom_feminin_1"], "a", "");
   deepEqual( map["nom_masculin_2"], "b", "");

   map = substituter.map_placeholders(ph,["a", "b", "c", "d"]);
   deepEqual( map["nom_feminin_1"], "a", "");
   nom_m = map["nom_masculin_2"];
   ok( $.inArray(nom_m, ["b", "c", "d"])>-1, "");

 });

});

