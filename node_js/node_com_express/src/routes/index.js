/*****************************************************************************
 * Arquivo de entrada das rotas
 *****************************************************************************/

import express from "express";
import livros from "./livroRoutes.js";
import autores from "./autorRoutes.js";

//função que agrupa todas as   rotas recebidas, vai centralizar as  rotas
const routes = (app)=>{
  app.route("/").get((req,res)=> res.status(200).send("Curso de Node.js"));
  //pega todas as rotas que foram definidas em "livroRouts.js e passando para routes, a partir disso o express vai gerenciar todas de uma vez"
  //middleware - utilizado para transformar um um json para podermos utilizar suas propriedades
  app.use(express.json(), livros, autores);   
};

export default routes;