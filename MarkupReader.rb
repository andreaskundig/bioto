# -*- coding: iso-8859-1 -*-
require 'rubygems'
require 'open-uri'
require 'fiber'
require 'set'

class FiberWrapper
  def initialize(openable)
    @fib =  Fiber.new do
      openable.each_line do |line|
        puts line
        Fiber.yield line
      end
    end
  end
  def alive?
    @fib.alive?
  end
  def resume
    @current = @fib.resume
  end
  def current
    @current
  end
end

def make_generator(uri)
  #Generator.new(open(uri))
  return FiberWrapper.new(open(uri))
end

def is_para(element)
  element.strip.size >0 && !(element =~ /^(http|clefs:|sexe:|----)/)
end

def is_url(element)
  element.start_with? 'http'
end

def data_end(elements)
  !(elements.alive?) || elements.current.start_with?('STOP')
end

def para_end(elements)
  elements.current.start_with? 'clefs:'
end

def read_para(elements)
  text = elements.resume
  text += "<br>" + elements.resume while ! para_end elements
  keys = elements.resume
  elements.resume while elements.current.strip.size == 0
  keys =  extract_keys(keys)
  [text, keys]
end

def extract_keys(key_text)
  return [] unless key_text #&& (key_text.start_with? "clefs:")
  puts key_text
  k = key_text.strip[6..-1].gsub(/[,.]/,' ').gsub(/(\w+)s\b/,'\1').gsub(/\?+/,'bof')
  k.gsub("\303\251",'e').gsub("\303\250",'e').split
end

def read_url(elements)
  return elements.resume.chomp if is_url elements.current
  nil
end


