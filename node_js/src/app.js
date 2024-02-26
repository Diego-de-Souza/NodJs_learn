import express from "express";
import conectaNaDatabase from "./config/dbConnect.js";
import routes from "./routes/index.js";
import manipuladorDeErros from "./middlewares/manipuladorDeErros.js";
import manipulador404 from "./middlewares/manipulador404.js";
//instancia uma variavel para receber os dados da conexao com o banco, como a função é uma async se  usa o metodo await
const conexao = await conectaNaDatabase(); 
//metodo utilizado para capturar qualquer tipo de erro que possa acontecer na conexao
conexao.on("error", (erro)=>{
  //para o erro que aconteceu na conexão
  console.error("erro de conexão", erro);
});
//metodo para olhar se a conexão foi aberta com sucesso e imprimir no console
conexao.once("open", ()=>{
  console.log("Conexão com o banco feita com sucesso");
});
//instanciando a variavel app com o metodo express() para acesso a todas funções do framework
const app = express();

routes(app);

app.use(manipulador404);
//está função é um middlewares de erro, que é uma função que vai ser executada toda vez que houver uma resquisição.
app.use(manipuladorDeErros);

export default app;