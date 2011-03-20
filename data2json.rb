#! /usr/bin/ruby
# -*- coding: iso-8859-1 -*-
#require 'XmlDataReader'
#filepath = 'wiki/data.htm' 
#filepath = 'http://biotomatique.wikidot.com/'
require 'MarkupReader'
filepath = 'wiki/asmarkup.txt'

def get_elements(filepath)
 elements = make_generator filepath
end

def display_person(person)
  s =  person[:url]+"\n\n" || ""
  s += person[:texts].map{|t| 
    display_text t
  }.join("\n")
end

def read_person(elements)
 person = {:texts=>[]}
 elements.next while !is_para(elements.current) && !data_end(elements)
 return nil if data_end(elements)
 person[:texts] << read_para(elements)  while is_para elements.current
 person[:url]= read_url(elements) 
 person
end

def text2json(t)
  placeholders = t[0][:placeholders].map{|p| "[\"#{p.join("\", \"").gsub(/\s+/," ")}\"]"}.join(", ")
  text = t[0][:text].gsub(/\s+/," ").gsub('"','\"')
  "{text:\"#{text}\",\n placeholders:[#{placeholders}],\n url:\"#{t[1]}\" }"
end

# Fills texts keys and pronouns  passed as arguments
# texts = [[{:text :placeholders :keys},url}],[...],...]
# keys_m =  {key => text_index}
# keys_f =  {key => text_index}
def extract_from_person(person, texts, keys_m, keys_f, pronouns)
  person[:texts].each{|text|
    texts << [text,person[:url]]
    pronouns.merge text[:placeholders].map{|p|p[1]}
    put_text_index_in_keys(keys_m, text, texts.size() - 1) if ["masculin","unisexe"].include? text[:sex]
    put_text_index_in_keys(keys_f, text, texts.size() - 1) if ["feminin","unisexe"].include? text[:sex]
  }
end

def put_text_index_in_keys(keys, text, text_index)
    text[:keys].each{|key|
      keys[key] = [] unless keys[key]
      keys[key] << text_index
    }
end

texts = [] # [[{:text :placeholders :keys},url}],[...],...]
keys_m = {} # {key => text_index}
keys_f = {} # {key => text_index}
pronouns = Set.new 

elements = make_generator filepath
#iterate on paragraphs
#70.times {|t|
while elements.next?
  person = read_person elements
  break unless person
  extract_from_person(person, texts, keys_m, keys_f, pronouns)
end
#}

puts "/*jslint white: false */"
puts "var topics = [\"" + keys_m.merge(keys_f).keys.join("\", \"") + "\"];"
puts "var keys_m = {" 
puts keys_m.to_a.map{|pair| "#{pair[0]}: [#{pair[1].join(", ")}]" }.join(", ") 
puts "}\n"
puts "var keys_f = {" 
puts keys_f.to_a.map{|pair| "#{pair[0]}: [#{pair[1].join(", ")}]" }.join(", ") 
puts "}\n"
puts "var texts = [\n" + texts.map{|t| text2json(t)}.join(",\n") + "\n];"



