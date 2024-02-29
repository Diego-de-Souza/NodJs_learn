/*******************************************************************************
 * Arquivo de rotas da aplicação para autores
 *******************************************************************************/

import express from "express";
import AutorController from "../controllers/autorController.js";

const routes = express.Router();
//rotas para autores
routes.get("/autores", AutorController.listarAutores);
routes.get("/autores/:id", AutorController.listarAutorPorId);
routes.post("/autores", AutorController.cadastrarAutor);
routes.put("/autores/:id", AutorController.atualizarAutor);
routes.delete("/autores/:id", AutorController.excluirAutor);

export default routes;