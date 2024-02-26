import mongoose from "mongoose";
import {autorSchema} from "./Autor.js";
//instacia uma variavel com entrada   do  metodo moogose e  Schhema que configura um esquema de entrada de dados, propriedades e etc de livros. ou seja, as propriedades que deve ter nesse objeto

const livrosSchema = new mongoose.Schema({
  id: {type: mongoose.Schema.Types.ObjectId},
  titulo: {
    type: String, 
    require:[true, "O titulo do livro é obrigatório"]},
  editora: {
    type: String,
    required: [true, "O nome da Editora é obrigatório"]},
  preco: {type: Number},
  paginas: {
    type: Number,
    /*
    min: [10,"O número de páginas deve estar entre 10 e 5000. Valor fornecido {VALUE}"],
    max: [5000,"O número de páginas deve estar entre 10 e 5000. Valor fornecido {VALUE}"]
    */
    validate:{
      validator: (valor) => {
        return valor >= 10 && valor <= 5000;
      },
      message: "O número de páginas deve estar entre 10 e 5000. Valor fornecido {VALUE}"
    }
  },
  autor: autorSchema 
},{versionKey: false});
//variavel que recebe a coleção de livros do banco e o schema do modelo
const livro = mongoose.model("livros",livrosSchema);

export default livro;
