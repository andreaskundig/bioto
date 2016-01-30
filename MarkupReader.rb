# encoding: utf-8
require 'rubygems'
require 'open-uri'
require 'fiber'
require 'set'

class FiberWrapper
  def initialize(openable)
    @fib =  Fiber.new do
      openable.each_line do |line|
        Fiber.yield line
      end
    end
    self.next
  end
  def next?
    @fib.alive?
  end
  def next
    former = @current
    @current = @fib.resume
    former
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
  # puts "  #is_para"
  # puts "  history.push elements.current"
  # puts "  #is_para '#{element}'".gsub(/\n/,'\n')
  element.strip.size >0 && !(element =~ /^(http|clefs:|sexe:|----)/)
end

def is_url(element)
  element.start_with? 'http'
end

def data_end(elements)
  # puts "  #data_end next?"
  # puts "  history.push elements.next?"
  !(elements.next?) || elements.current.start_with?('STOP')
end

def para_end(elements)
  elements.current.start_with? 'clefs:'
end

def read_para(elements)
  # puts "  #read_para \n  history.push elements.next"
  text = elements.next
  text += "<br>" + elements.next while ! para_end elements
  keys = elements.next
  elements.next while elements.current.strip.size == 0
  keys =  extract_keys(keys)
  [text, keys]
end

def extract_keys(key_text)
  return [] unless key_text #&& (key_text.start_with? "clefs:")
  # puts "  #extract_keys '#{key_text}'".gsub(/\n/,'\n')
  k = key_text.strip[6..-1].gsub(/[,.]/,' ').gsub(/(\w+)s\b/,'\1').gsub(/\?+/,'bof')
  k.gsub("\303\251",'e').gsub("\303\250",'e').split
end

def read_url(elements)
  return elements.next.chomp if is_url elements.current
  nil
end


