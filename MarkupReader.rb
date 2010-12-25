# -*- coding: iso-8859-1 -*-
require 'rubygems'
require 'open-uri'
require 'generator'
require 'set'

def make_generator(uri)
  Generator.new(open(uri))
end

def is_para(element)
  element.strip.size >0 && !(element =~ /^(http|clefs:|sexe:|----)/)
end

def is_url(element)
  element.start_with? 'http'
end

def data_end(elements)
  !(elements.next?) || elements.current.start_with?('STOP')
end

def para_end(elements)
  elements.current.start_with? 'clefs:'
end

def read_para(elements)
  text = elements.next
  text += "<br>" + elements.next while ! para_end elements
  keys = elements.next
  elements.next while elements.current.strip.size == 0
  placeholders = text.scan(/<([^>]*?):([^>]+?)>/)
  sex = placeholders.select{|e| e[1] =~ /(masculin|feminin|unisexe)(_1)?$/}.map{|e| $1 if e[1]=~ /([^_]+)(_1)?$/}[0]
  {:text => text,
   :placeholders => Set.new(placeholders),
   :keys => extract_keys(keys),
   :sex => sex || 'unisexe'}
end

def extract_keys(key_text)
  return [] unless key_text #&& (key_text.start_with? "clefs:")
  k = key_text.strip[6..-1].gsub(/[,.]/,' ').gsub(/(\w+)s\b/,'\1').gsub(/\?+/,'bof')
  k.gsub("\303\251",'e').gsub("\303\250",'e').split
end

def read_url(elements)
  return elements.next if is_url elements.current
  nil
end

def display_text(t)
  "\n#{t[:text]}\n#{t[:placeholders]}\nclefs:#{t[:keys].join ' '}"
end


