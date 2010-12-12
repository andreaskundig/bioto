#! C:/ruby/bin/ruby
# -*- coding: iso-8859-1 -*-
require 'rubygems'
require "nokogiri"
require 'open-uri'
require 'generator'
require 'set'

def make_generator(filename)
  content = read_content(filename)
  elements = Generator.new(content.children)
end

def read_content(uri)
 doc = Nokogiri::HTML(open(uri)).css('#page-content')
end
def is_para(element)
  element.name == 'p' && element.children.size ==3
end

def is_url(element)
  element.children.size==1 || element.children[0].name == 'a'
end

def read_para(elements)
  element = elements.next
  elements.next while elements.current.children.size==0
  text = element.children[0].text
  {:text => text,
   :placeholders => Set.new(text.scan(/<([^>]+?):([^>]+?)>/)),
   :keys => extract_keys(element.children[2].text)}
end

def extract_keys(key_text)
  return [] unless key_text #&& (key_text.start_with? "clefs:")
  k = key_text.strip[6..-1].gsub(/[,.]/,' ').gsub(/(\w+)s\b/,'\1').gsub(/\?+/,'bof')
  k.gsub("\303\251",'e').gsub("\303\250",'e').split
end

def read_url(elements)
  return elements.next.children[0].text if is_url elements.current
  nil
end

def display_text(t)
  "\n#{t[:text]}\n#{t[:placeholders]}\nclefs:#{t[:keys].join ' '}"
end

def display_person(person)
  s =  person[:url]+"\n\n" || ""
  s += person[:texts].map{|t| 
    display_text t
  }.join("\n")
end

