# -*- coding: iso-8859-1 -*-
require "Formatter"
require "test/unit"
 
class TestFormatter < Test::Unit::TestCase
 
  def test_extract_placeholders
    ph = extract_placeholders "<Hulk:nom_masculin>, le <gros Hulk:nom_masculin1>, le satané <Hulk:nom_masculin>"
    assert_equal(3, ph.size )
    assert_equal(["#0#", "<Hulk:nom_masculin>", nil, "Hulk", "nom_masculin"], ph[0])
    assert_equal(["#1#", "le <gros Hulk:nom_masculin1>", ["l'", "le "], "gros Hulk", "nom_masculin1"], ph[1])
    assert_equal(["#2#", "<Hulk:nom_masculin>", nil, "Hulk", "nom_masculin"], ph[2])

    ph = extract_placeholders "le <raton:nom_masculin_3> mange"
    assert_equal([["#0#", "le <raton:nom_masculin_3>", ["l'","le "], "raton", "nom_masculin_3"]], ph)

    ph = extract_placeholders "le <raton:nom_masculin> mange"
    assert_equal([["#0#", "le <raton:nom_masculin>", ["l'","le "], "raton", "nom_masculin"]], ph)

    ph = extract_placeholders "le <raton (o):nom_masculin> mange"
    assert_equal([["#0#", "le <raton (o):nom_masculin>", ["l'","le "], "raton (o)", "nom_masculin"]], ph)

    ph = extract_placeholders "du <raton:nom_masculin>"
    assert_equal([["#0#", "du <raton:nom_masculin>", ["d'","du "], "raton", "nom_masculin"]], ph)

    ph = extract_placeholders "l'<animal:nom_masculin_3> mange"
    assert_equal([["#0#", "l'<animal:nom_masculin_3>", ["l'","le "], "animal", "nom_masculin_3"]], ph)

    ph = extract_placeholders "vénérable <animal:nom_masculin> mange"
    assert_equal([["#0#", "<animal:nom_masculin>", nil, "animal", "nom_masculin"]], ph)

    ph = extract_placeholders "l'<animale:nom_feminin> mange"
    assert_equal([["#0#", "l'<animale:nom_feminin>", ["l'", "la "], "animale", "nom_feminin"]], ph)

    ph = extract_placeholders "qu'<animale:nom_feminin> mange"
    assert_equal([["#0#", "qu'<animale:nom_feminin>", ["qu'", "que "], "animale", "nom_feminin"]], ph)

    ph = extract_placeholders "qu'<animale:nom_feminin> mange <animale:nom_feminin>"
    assert_equal(["#0#", "qu'<animale:nom_feminin>", ["qu'", "que "], "animale", "nom_feminin"], ph[0])
    assert_equal(["#1#", "<animale:nom_feminin>", nil, "animale", "nom_feminin"], ph[1])

    ph = extract_placeholders "<animale:nom_feminin> mange <animale:nom_feminin>"
    assert_equal(["#0#", "<animale:nom_feminin>", nil, "animale", "nom_feminin"], ph[0])
    assert_equal(["#1#", "<animale:nom_feminin>", nil, "animale", "nom_feminin"], ph[1])

  end
end
