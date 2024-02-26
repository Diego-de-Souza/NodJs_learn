import mongoose from "mongoose";
//função para conectar com o banco de dados, deve ser asyncrona
async function conectaNaDatabase(){
  //dentro do conect se coloca a variavel de ambiente que está dentro arquivo ".env"
  mongoose.connect(process.env.DB_CONNECTION_STRING);
  //metodo do mongoose para se conectar com o banco e retornar um objeto com todos os dados
  return mongoose.connection;
}

export default conectaNaDatabase;

