

codigo do app antes da refatoração:
```
import express from "express";
import conectaNaDatabase from "./config/dbConnect.js";
import livro from "./models/Livro.js";
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
//middleware - utilizado para transformar um um json para podermos utilizar suas propriedades
app.use(express.json());

/*foi usada somente para inicio do desenvolvimento como teste de banco

//variavel do tipo array para utilização de dados do servidor, teste
const livros = [
    {
        id: 1,
        titulo: "O senhor dos Aneis"
    },
    {
        id: 2,
        titulo: "O Hobbit"
    }
]

//função criada para buscar os livros conforme o id passado peço cliente
function buscarLivros(id){
    return livros.findIndex(livros => {
        // como os dados que vem da solicitação vem como uma string precisamos converter para o dados requerido, então foi utilizado o metodo Number() para converter em numero.
        return livros.id === Number(id);
    })
}
*/
/**
 * Os metodos abaixo são para de monstração de CRUD = Create, Read, Update, Delete, de uma aplicação com node lado servidor
 */

//chamando o app com o metodo app para criar um resposta a determinada rota
app.get("/", (req,res)=>{
    res.status(200).send("curso de Node.js");
});
//sempre que se tem o await se tem o metodo async para a função callback funcionar
app.get("/livros", async (req,res)=>{
    //variavel que vai guardar todos os livros retornados   do banco
    const listaLivros = await livro.find({});        
    res.status(200).json(listaLivros);
});
//criando uma requisição para buscar id variavel, mas para falar que o id pode ser váriavel usamos o ":" depois de "/livros/", ler um dados do servidor
app.get("/livros/:id", (req,res)=>{
    //instanciamos uma variavel que vai receber a função de busca de livros e dentro dos paramentros da função utilizamos a request com o metodo "params" que retorna os parametros da requisição, que foi o mesmo passado depois do ":"
    const index = buscarLivros(req.params.id);
    //resposta de status da solicitação
    res.status(200).json(livros[index]);
})
//criando um novo registro no servidor
app.post("/livros", (req, res)=>{
    livros.push(req.body);
    res.status(201).send("Livro cadastrado com sucesso");
});
//criando uma  alteração em um dado do servidor
app.put("/livros/:id", (req,res)=>{
    const index = buscarLivros(req.params.id);
    livros[index].titulo = req.body.titulo;
    res.status(200).json(livros);
})
//deletando um dados do servidor
app.delete("/livros/:id", (req, res)=>{
    const index = buscarLivros(req.params.id);
    livros.splice(index,1);
    res.status(200).send("livro removido com sucesso!");
})

export default app;
```