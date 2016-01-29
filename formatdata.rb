#! /usr/bin/ruby
# -*- coding: iso-8859-1 -*-
require 'set'
require 'text/hyphen'
#require 'XmlDataReader'
#filepath = 'wiki/data.htm' 
#filepath = 'http://biotomatique.wikidot.com/'
require_relative 'MarkupReader.rb'
filepath = 'wiki/asmarkup.txt'
require_relative 'Formatter.rb'


texts = [] # [[{:text :placeholders :keys},url}],[...],...]
keys_m = {} # {key => text_index}
keys_f = {} # {key => text_index}

elements = make_generator filepath
#iterate on paragraphs
#70.times {|t|
while elements.alive?
  person = read_person elements
  break unless person
  extract_from_person(person, texts, keys_m, keys_f)
end
#}

if ARGV[0] == 'json'
 puts_json(texts,keys_m,keys_f)
else
  stopwords = Set.new
  output = ""  
  texts.each_with_index do |t,i| 
#    output += "##{i}\n" + display_text(t[0]) +"\n"
#TODO format compatible avec lsa/sentences.txt
    output += "##{i}\n" + t[0][:text].gsub(/<([^>:]*):[^>]+>/, '\1').gsub('<br>','')
    stopwords.merge t[0][:placeholders].to_a.select {|p| p[4] =~ /^nom/ }.map{|p| p[3]}
  end
  puts "#STOPWORDS"
  puts stopwords.to_a.join " "
  puts output
end



