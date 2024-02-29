/***********************************************************************
 * bloco de script que vai conter todas a ações relacionada a um livro 
 * *********************************************************************/

import {livro, autor} from "../models/indexModels.js";
import NaoEncontrado from "../erros/NaoEncontrado.js";
//cria uma classe para ser exportada e trabalhar como ponte na conexão
class LivroController {
  //cria um metodo statico para  não precisar instaciar uma   nova chamada e async por que vai mexer com o banco
  static async listarLivros(req,res,next){
    try{
      //variavel que vai guardar todos os livros retornados   do banco
      const listaLivros = await livro.find({});        
      res.status(200).json(listaLivros);
    } catch(erro) {
      next(erro);
    }
        
  }
  //metodo para buscar 1 livro pelo id
  static async listarLivroPorId(req,res,next){
    try{
      const id = req.params.id;
      const livroEncontrado = await livro.findById(id);        
      if(livroEncontrado !== null){
        res.status(200).json(livroEncontrado);
      }else{
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch(erro) {
      next(erro);
    }
        
  }
  //metodo para cadastrar um livro
  static async cadastrarLivros(req,res,next){
    const novoLivro = req.body;
    try{
      const autoEncontrado = await autor.find(novoLivro.autor);
      //variavel que recebe um objeto com o espalhador de schema do livro e do autor
      const livroCompleto = {...novoLivro, autor: {...autoEncontrado._doc}};
      //variavel   que recebe o livro completo e cria esse novo dado no banco
      const livroCriado = await livro.create(livroCompleto);
      res.status(201).json({
        message: "Criado   com  Sucesso.",
        livro: livroCriado
      });
    }catch(erro){
      next(erro);
    }
  }
  //metodo para atualizar livro
  static async atualizarLivro(req,res,next){
    try{
      const id = req.params.id;
      const livroResultado = await livro.findByIdAndUpdate(id, req.body); 
      if(livroResultado !== null){
        res.status(200).json({message: "Livro atualizado"});
      }else{
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch(erro) {
      next(erro);
    }
  }
  //metodo para deletar um  livro
  static async excluirLivro(req, res,next){
    try{ 
      const id = req.params.id;
      const livroResultado = await livro.findByIdAndDelete(id);
      if(livroResultado !== null){
        res.status(200).json({message: "livro excluido com sucesso"});
      }else{
        next(new NaoEncontrado("Id do livro não localizado."))
      }
    } catch(erro){
      next(erro);
    }
  }
  //metodo de consulta de livros
  static async listarLivrosPorEditora(req, res,next){
    const editora = req.query.editora;
    try{
      const livrosPorEditora = await livro.find({editora: editora});
      res.status(200).json(livrosPorEditora);
    } catch(erro){
      next(erro);
    }
  }
}

export default LivroController;