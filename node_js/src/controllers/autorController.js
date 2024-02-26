/***********************************************************************
 * bloco de script que vai conter todas a ações relacionada a um autor 
 * *********************************************************************/

import mongoose from "mongoose";
import {autor} from "../models/indexModels.js";
import NaoEncontrado from "../erros/NaoEncontrado.js";
//cria uma classe para ser exportada e trabalhar como ponte na conexão
class AutorController {
  //cria um metodo statico para  não precisar instaciar uma   nova chamada e async por que vai mexer com o banco
  static listarAutores = async (req,res,next) => {
    try{
      //variavel que vai guardar todos os autores retornados   do banco
      const listaAutores = await autor.find({});        
      res.status(200).json(listaAutores);
    } catch(erro) {
      next(erro);
    }
        
  }
  //metodo para buscar 1 autor pelo id
  static listarAutorPorId = async (req,res, next) => {
    try{
      const id = req.params.id;
      const autorEncontrado = await autor.findById(id);   
      if(autorEncontrado !== null){
        res.status(200).json(autorEncontrado);
      } else {
        next(new NaoEncontrado("Id do Autor não encontrado."));
      }     
    } catch(erro) {
      next(erro);      
    }
        
  }
  //metodo para cadastrar um autor
  static cadastrarAutor = async (req,res,next) => {
    try{
      const novoAutor = await autor.create(req.body);
      res.status(201).json({
        message: "Criado   com  Sucesso.",
        autor: novoAutor
      });
    }catch(erro){
      next(erro);
    }
  }
  //metodo para atualizar autor
  static atualizarAutor = async (req,res,next) => {
    try{
      const id = req.params.id;
      const autorResultado = await autor.findByIdAndUpdate(id, {$set: req.body});   
      if(autorResultado !== null) {
        res.status(200).json({message: "Autor atualizado"});
      }else{
        next(new NaoEncontrado("Id do Autor não localizado."));
      }
    } catch(erro) {
      next(erro);
    }
  }
  //metodo para deletar um autor
  static excluirAutor = async (req, res,next) => {
    try{
      const id = req.params.id;
      const autorResultado = await autor.findByIdAndDelete(id);
      if(autorResultado){
        res.status(200).json({message: "Autor excluido com sucesso"});
      }else{
        next(new NaoEncontrado("Id do autor não localizado."))
      }
    } catch(erro){
      next(erro);
    }
  }
}

export default AutorController;