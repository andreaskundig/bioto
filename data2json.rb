#! C:/ruby/bin/ruby
# -*- coding: iso-8859-1 -*-
#require 'XmlDataReader'
require 'MarkupReader'

def get_elements
 #elements = 'http://biotomatique.wikidot.com/'
 #elements = make_generator 'wiki/data.htm'
 elements = make_generator 'wiki/asmarkup.txt'
end

def display_person(person)
  s =  person[:url]+"\n\n" || ""
  s += person[:texts].map{|t| 
    display_text t
  }.join("\n")
end

def read_person(elements)
 person = {:texts=>[]}
 elements.next while !is_para elements.current
 person[:texts] << read_para(elements)  while is_para elements.current
 person[:url]= read_url(elements) 
 person
end

def text2json(t)
  placeholders = t[:placeholders].map{|p| "[\"#{p.join("\", \"").gsub(/\s+/," ")}\"]"}.join(", ")
  text = t[:text].gsub(/\s+/," ").gsub('"','\"')
  "{text:\"#{text}\",\n placeholders:[#{placeholders}] }"
end

def extract_from_person(person, texts,keys,pronouns)
  person[:texts].each{|text|
    texts << [text,person[:url]]
    pronouns.merge text[:placeholders].map{|p|p[1]}
    text[:keys].each{|key|
      keys[key] = [] unless keys[key]
      keys[key] << texts.size - 1
    }
  }
end

texts = [] # [[{:text :placeholders :keys},url}],[...],...]
keys = {} # {key => text_index}
pronouns = Set.new 

elements = get_elements
#iterate on paragraphs
90.times {|t|
#while elements.next?
  person = read_person elements 
  extract_from_person(person, texts,keys,pronouns)
}

puts "/*jslint white: false */"
puts "var topics = [\"" + keys.keys.join("\", \"") + "\"];"
puts "var keys = {" + keys.to_a.map{|pair| "#{pair[0]}: [#{pair[1].join(", ")}]" }.join(", ") +"};"
puts "var texts = [\n" + texts.map{|t| text2json(t[0])}.join(",\n") + "\n];"



