# encoding: utf-8
def testgen
  filepath = 'wiki/asmarkup.txt'
  elements = make_generator filepath
  
  history = []

  # history.push elements.next?
  # history.push elements.current
  # history.push elements.next?
  # history.push elements.current

  history.push elements.next?
  #is_para
  history.push elements.current
  #is_para '<La WBC:nom_unisexe> base son action autour de son slogan le plus connu, qui est aussi l'adresse de son tout premier site internet : « God hates fags » (Dieu hait les tapettes), et exprime l'idée, fondée sur son interprétation de la Bible, qu'à peu près toutes les tragédies dans le monde sont liées à l'homosexualité\n'
  #data_end next?
  history.push elements.next?
  #is_para
  history.push elements.current
  #is_para '<La WBC:nom_unisexe> base son action autour de son slogan le plus connu, qui est aussi l'adresse de son tout premier site internet : « God hates fags » (Dieu hait les tapettes), et exprime l'idée, fondée sur son interprétation de la Bible, qu'à peu près toutes les tragédies dans le monde sont liées à l'homosexualité\n'
  history.push elements.current
  #read_para 
  history.push elements.next
  #extract_keys '\n'
  puts "-" * 15
  puts history
  puts "-" * 15
end

begin
  require 'generator'
  def make_generator(uri)
    Generator.new(open(uri))
  end
rescue Exception => e
  #puts e
  require_relative 'MarkupReader.rb'
end

testgen

