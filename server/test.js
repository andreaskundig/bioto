
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


test("safe_index", function(){
  var a = [1,2,3];
  equal(a[array_util.safe_index(a.length,-2)], 1);
  equal(a[array_util.safe_index(a.length,-1)], 1);
  equal(a[array_util.safe_index(a.length, 0)], 1);
  equal(a[array_util.safe_index(a.length, 1)], 2);
  equal(a[array_util.safe_index(a.length, 2)], 3);
  equal(a[array_util.safe_index(a.length, 3)], 3);

 });

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

