$(document).ready(function(){

var text = {text: "En 2001, <elle:pronom_feminin> vient avec <Christophe:nom_masculin_2>. La prestation de <Loana:nom_feminin_1> est pas mal.",
 placeholders:[["Loana", "nom_feminin_1"], 
	  ["Christophe", "nom_masculin_2"], ["elle", "pronom_feminin"]] };

test("all_substitutions",function() {
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

test("starts_with_vowel", function(){
  ok(string_util.starts_with_vowel("af"));
  ok(string_util.starts_with_vowel("Âze"));
  ok(!string_util.starts_with_vowel("taf"));

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

test("slide",function(){
   var para , o_width, r_width,p_width,p_height, showdiv, showwidth;
   showdiv = $("#show");
   showdiv.css({overflow:'hidden',border: '1px solid #999999',width:'10%'});
   showwidth = showdiv.width();

   para = $('<div class="paragraph" style="visibility:hidden"><p>A <span class="r">Ibn Al Rabin</span><span class="o">Yves</span> a notamment</p></div>');
   
  equal($('.r',para).width(),0);
  equal($('.o',para).width(),0);
  equal(para.width(),0);
  equal(para.height(),0);

  showdiv.append(para);

  r_width = $('.r',para).width();
  o_width = $('.o',para).width();
  p_width = para.width();
  p_height = para.height();
  ok(r_width>0);
  ok(o_width>0);
  ok(p_width>0);
  ok(p_height>0);

  displayer.init_widths(para);
  equal($('.r',para).data('original_width'),r_width);
  equal($('.o',para).data('original_width'),o_width);
  
  equal(para.height(),p_height);

  $('#show .paragraph').css({visibility:'visible', marginLeft:200,width:p_width,background:'grey'});
  $('#show .o').css('display','none');
  
  para.animate( {marginLeft: 0});

 });
});

