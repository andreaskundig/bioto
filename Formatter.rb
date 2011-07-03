#! /usr/bin/ruby
# -*- coding: iso-8859-1 -*-
require 'set'
require 'text/hyphen'

@hyphenator = Text::Hyphen.new(:language => "fr", :left => 0, :right => 0)


def format_para(text,keys)
  #placeholder ["#0#", "<Hulk:nom_masculin>", nil, "Hulk", "nom_masculin"]
  placeholders = extract_placeholders text
  sex = placeholders.select{|e| e[4] =~ /(masculin|feminin|unisexe)(_1)?$/ }.map{|e| $1 if e[4]=~ /([^_]+)(_1)?$/}[0]
  placeholders = placeholders.select do |ph| 
    keep = !(ph[4].start_with? 'pronom')
    replacement = keep ? ph[0] : ph[3]
    text = text.sub(ph[1],replacement)
    keep
  end
  {:text => text,
   :placeholders => placeholders,
   :keys => keys,
   :sex => sex || 'unisexe' }
end

# arg text "<Hulk:nom_masculin>, le <gros Hulk:nom_masculin1>"
# return an array of placeholders 
#   ph = [["#0#", "<Hulk:nom_masculin>", nil, "Hulk", "nom_masculin"],
#         ["#1#", "le <gros Hulk:nom_masculin1>", ["l'", "le "], "gros Hulk", "nom_masculin1"]]
def extract_placeholders(text)
  placeholders = text.scan(/(([\w']+\s*)?(<([^>]*?):([^>]+?)>))/)
  placeholders.each.map do |ph| 
    articles = possible_articles(ph[1],ph[4])
    # don't replace article if there is none
    toreplace = articles ? ph[0] : ph[2]
    [toreplace, articles, ph[3],ph[4]]
  end.each_with_index do |ph,index| 
    ph.unshift "##{index}#"
  end
end

def possible_articles(article, type)
  case article
  when /\bl(e|a)\s+/
    ["l'",article]
  when /\bque\s+/
    ["qu'",article]
  when /\bd(e|u)\s+/
    ["d'",article]
  when /\b(d|qu)'/
    [article, "#{$1}e "]
  when /\bl'/ 
    result = nil
    result = [article,'la '] if type =~ /nom_feminin/
    result = [article,'le '] if type =~ /nom_masculin/
    result
  else
    nil
  end 
end

# return person = {:texts => [{:text :placeholders :keys :sex},.. ], :url }
def read_person(elements)
 person = {:texts=>[]}
 elements.next while !is_para(elements.current) && !data_end(elements)
 return nil if data_end(elements)
 person[:texts] << format_para(* read_para(elements))  while is_para elements.current
 person[:url]= read_url(elements) 
 person
end

def display_person(person)
  s =  person[:url]+"\n\n" || ""
  s += person[:texts].map{|t| 
    display_text t
  }.join("\n")
end

def display_text(t)
  "#{t[:text].chomp}\n#{t[:placeholders].join('|').chomp }\nclefs:#{t[:keys].join ' '}\n"
end

def text2json(t,index)
  placeholders = t[0][:placeholders].map{|p| placeholder2json p }.join(", ")
  text = t[0][:text].gsub(/\s+/," ").gsub('"','\"')
  "{i:#{index}, text:\"#{text}\",\n placeholders:[#{placeholders}],\n url:\"#{t[1]}\" }"
end

# arg ph ["#1#", "le <gros Hulk:nom_masculin1>", ["l'", "le "], "gros Hulk", "nom_masculin1"]
# return string '["#1#", ["l'", "le "], "gros Hulk", "nom_masculin1"]'
def placeholder2json(ph)
  articles = ph[2]? '["'+ph[2].join('","')+'"]': 'null'
  "[\"#{ph[0]}\", #{articles}, \"#{ph[3]}\", \"#{ph[4]}\"]"
end

# Fills texts keys and pronouns  passed as arguments
# texts = [[{:text :placeholders :keys},url],[...],...]
# keys_m =  {key => text_index}
# keys_f =  {key => text_index}
def extract_from_person(person, texts, keys_m, keys_f, pronouns=nil)
  person[:texts].each{|text|
    text[:text] = format_text(text[:text])
    texts << [text,person[:url]]
    pronouns.merge text[:placeholders].map{|p|p[3]} if pronouns
    put_text_index_in_keys(keys_m, text, texts.size() - 1) if ["masculin","unisexe"].include? text[:sex]
    put_text_index_in_keys(keys_f, text, texts.size() - 1) if ["feminin","unisexe"].include? text[:sex]
  }
end

def format_text(text)
  words = text.split(/\b/).map do |word|
    if word =~ /<([^:]+)/
      original = $1
      h_original = insert_hyphens original
      word.sub(original,h_original)
    else
      insert_hyphens word
    end
  end
  words.join
end

#insert hyphens, not where there already is a '-', not if the word part is only one letter
def insert_hyphens(word)
      w = word.dup
      counter = 0
      previous_pos = 0
      @hyphenator.hyphenate(w).each do |pos|
        if pos != 0 && (w[pos.to_i + counter -1, 1] != '-') && (pos - previous_pos > 2)
          w[pos.to_i + counter, 0] = '|'
          counter += 1
          previous_pos = pos
        end
      end
     w
end

def put_text_index_in_keys(keys, text, text_index)
    text[:keys].each{|key|
      keys[key] = [] unless keys[key]
      keys[key] << text_index
    }
end

def puts_json(texts, keys_m, keys_f)
 puts "/*jslint white: false */"
 puts "var topics = [\"" + keys_m.merge(keys_f).keys.join("\", \"") + "\"];"
 puts "var keys_m = {" 
 puts keys_m.to_a.map{|pair| "#{pair[0]}: [#{pair[1].join(", ")}]" }.join(", ") 
 puts "}\n"
 puts "var keys_f = {" 
 puts keys_f.to_a.map{|pair| "#{pair[0]}: [#{pair[1].join(", ")}]" }.join(", ") 
 puts "}\n"
 puts "var texts = [\n" + texts.enum_with_index.map{|t,i| text2json(t,i)}.join(",\n") + "\n];"
end
