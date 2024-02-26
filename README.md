# NodJs_learn
##prendizado de node JS, com aplicação em banco de dados com express e mongoDB

Durante a aula usamos o formato embedding para unirmos os dados de autor ao livro correspondente.
Confira abaixo um exemplo simples do mesmo processo, mas usando o formato referencing.
No arquivo Livro.js:
Ao invés do autorSchema, adicionamos a propriedade autor tendo como valor um ID do tipo ObjectId do MongoDB, fazendo referência à coleção autores.
```javascript
const livroSchema = new mongoose.Schema({
 id: { type: mongoose.Schema.Types.ObjectId },
 titulo: { type: String, required: true },
 editora: { type: String },
 preco: { type: Number },
 paginas: { type: Number },
 autor: {type: mongoose.Schema.Types.ObjectId, ref: 'autores', required: true},
}, { versionKey: false });
```
No arquivo livroController.js:
Quando usamos references o autor não faz mais parte do objeto livro. Assim, cada livro deve ser “populado” com as referências do autor.
Os métodos livro.find({}).populate("autor").exec(); vão utilizar o ID informado no campo autor do livro para buscar a referência desse ID e “popular” a propriedade.
```javascript
 static async listarLivros (req, res) {
   try {
     const listaLivros = await livro.find({}).populate("autor").exec();
     res.status(200).json(listaLivros);
   } catch (erro) {
     res.status(500).json({ message: `${erro.message} - falha na requisição` });
   }
 };
 ```
Já o método de cadastrar livro fica como estava anteriormente, pois agora o schema Livro apenas recebeu a propriedade autor com o tipo de dado ID.
 static async cadastrarLivro (req, res) {
   try {
     const novoLivro = await livro.create(req.body);
     res.status(201).json({ message: "criado com sucesso", livro: novoLivro });
   } catch (erro) {
     res.status(500).json({ message: `${erro.message} - falha ao cadastrar livro` });
   }
 }
COPIAR CÓDIGO
Testes no Postman
Faça um novo teste no Postman com POST em http://localhost:3000/autores adicionando um novo autor:
{
   "nome": "Machado de Assis",
   "nacionalidade": "Brasil"
}
COPIAR CÓDIGO
O objeto adicionado na coleção autores deverá ter a seguinte estrutura:
{
   "nome": "Machado de Assis",
   "nacionalidade": "Brasil",
    "_id": "64c4303f71627bda06635b6f"
   }
COPIAR CÓDIGO
Copie o ID do autor recém-criado e utilize este dado na criação de um novo livro no Postman com POST em http://localhost:3000/livros:
{
   "titulo": "Dom Casmurro",
   "autor": "64c4303f71627bda06635b6f"
}
COPIAR CÓDIGO
O retorno deverá ser um novo livro com a seguinte estrutura:
{
   "message": "criado com sucesso",
   "livro": {
       "titulo": "Dom Casmurro",
       "autor": "64c4303f71627bda06635b6f",
       "_id": "64c4306d71627bda06635b71"
   }
}
COPIAR CÓDIGO
Agora, uma requisição do tipo GET em http://localhost:3000/livros deverá retornar o livro já com o autor “referenciado”:
   {
       "_id": "64c4306d71627bda06635b71",
       "titulo": "Dom Casmurro",
       "autor": {
           "_id": "64c4303f71627bda06635b6f",
           "nome": "Machado de Assis",
           "nacionalidade": "Brasil"
       }
   }
Criando o servidor
Criação de um projeto Node
Com o terminal aberto na pasta criada para a construção do projeto, iniciaremos a criação de um novo projeto Node com o comando de terminal npm init -y, sendo -y de yes.
npm init -y
COPIAR CÓDIGO
Esse comando criará, na raiz do projeto, um novo arquivo chamado package.json com algumas informações padrão, que é o que acontece quando usamos a flag (bandeira) -y.
Feito isso, vamos abrir o Visual Studio Code na pasta do projeto, onde o arquivo JSON foi criado com as informações básicas. Com isso, podemos começar a trabalhar.
package.json:
{
  "name": "3266-express-mongo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1" 
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
COPIAR CÓDIGO
É importante que você utilize a mesma versão do Node.js que a instrutora. Com o terminal limpo, podemos usar o comando node -v para obter a versão, que no caso é v18.16.0.
node -v
COPIAR CÓDIGO
Em Preparando o ambiente, ensinamos a gerenciar as versões do Node.
A única coisa que precisamos fazer neste momento no arquivo package.json é, em qualquer parte do objeto, adicionar uma linha com a propriedade type que será do tipo module.
{
  "name": "3266-express-mongo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",

// código omitido
COPIAR CÓDIGO
É importante lembrar que em JSON tudo é inserido como string, ou seja, entre aspas duplas.
A propriedade type definida como module será usada para importar e exportar as partes, as funções, os módulos do nosso projeto, isto é, da nossa API, utilizando a sintaxe mais moderna do JavaScript.
Também deixaremos material extra para você entender mais sobre como funciona a importação e exportação de módulos no JavaScript, algo que abordamos em cursos anteriores.
Criação do servidor
A primeira coisa que fazemos quando vamos criar uma API que precisa fornecer informações para outras partes do sistema é criar um servidor para justamente fornecer os dados, servindo como ponto de conexão.
O primeiro arquivo que vamos criar, além do package.json, será um arquivo chamado server.js na raiz do projeto. Neste arquivo, criaremos um servidor HTTP local para podermos publicar os dados que a API precisa fornecer.
Existem diversas ferramentas e frameworks que utilizamos no dia a dia para simplificar esse processo de criação de servidor. Nós faremos isso neste projeto, mas para entender o passo a passo, faremos de uma forma um pouco mais nativa do Node, sem utilizar bibliotecas neste momento.
Primeiramente, no topo do arquivo, vamos fazer a importação de http de "http", como string.
server.js:
import http from "http";
COPIAR CÓDIGO
http é uma biblioteca nativa do Node; não é necessário instalação ou download com o comando npm no terminal, pois ao chamar no topo do arquivo, o Node já acessa os dados dessa biblioteca.
Protocolo HTTP
O protocolo HTTP (Hypertext Transfer Protocol, ou seja, Protocolo de Transferência de Hipertexto) é um dos protocolos mais comuns na internet de comunicação.
Existem outros, como o protocolo de transferência de e-mail e de transferência de arquivos. Também deixaremos mais informações para você sobre isso. Porém, o protocolo HTTP é o mais comum, o que utilizamos na internet para nos comunicar, para que nossos sites possam acessar as informações e exibir as coisas na tela.
A comunicação HTTP ocorre entre cliente e servidor. Nesse caso, cliente não é a pessoa usuária, mas sim o computador que faz uma requisição do tipo HTTP para um servidor.
O servidor é um computador onde estão armazenados os arquivos que precisamos receber. No caso, por exemplo, se nosso navegador faz uma comunicação HTTP de uma requisição para "google.com", o Google vai ao servidor, pega o HTML e envia uma resposta para nosso cliente, ou seja, para o computador.
É crucial ter em mente que o protocolo HTTP, que usaremos na API e é utilizado em grande parte da internet, é baseado em requisições feitas de um cliente para um servidor. Nestas requisições, o servidor envia respostas para o cliente.
Vale reforçar que cliente e servidor são computadores que se comunicam através desse protocolo, definindo quais dados serão recebidos e enviados, entre muitas outras informações que vamos explorar durante o curso.
Criando um servidor local HTTP
Após este breve esclarecimento sobre o HTTP, conseguimos retornar ao arquivo server.js e entender melhor o que iremos criar. Vamos criar um servidor local HTTP que simula um servidor na internet fornecendo essas informações. Para isso, usaremos os métodos da biblioteca HTTP, que é uma biblioteca do próprio Node.
Já importamos a biblioteca, então o próximo passo é criar uma constante chamada server, que será o nosso servidor local. Essa const receberá a biblioteca http seguida do método createServer(), que é um método da biblioteca HTTP. Este método requer uma função callback que recebe dois argumentos, denominados req (requisição) e res (resposta).
Feito isso, podemos abrir a função (=>) e adicionar chaves ({}).
server.js:
// código omitido

const server = http.createServer((req, res) => {

});
COPIAR CÓDIGO
Duas coisas vão acontecer quando criarmos um servidor. Primeiro, chamaremos o objeto res, ou seja, o objeto resposta, e dentro dele, a biblioteca HTTP terá um método chamado writeHead(). Este método é referente ao cabeçalho (ou header) da requisição HTTP.
const server = http.createServer((req, res) => {
  res.writeHead();
});
COPIAR CÓDIGO
HTTP headers
Vamos entender um pouco melhor o que é um cabeçalho?
Toda comunicação HTTP, tanto a requisição quanto a resposta, tem cabeçalhos. Os cabeçalhos contêm todas as informações necessárias para que a comunicação funcione corretamente.
GET / HTTP/1.1
Host: www.google.com
User-Agent: curl/7.68.0
Accept: text/javascript
X-Test: hello
COPIAR CÓDIGO
Conforme exibido acima, incluem o protocolo usado (neste caso, o HTTP); o Host para o qual a requisição é feita; o User-Agent, que designa quem faz a requisição, podendo ser um navegador, o Curl (programa de terminal) ou o Postman, por exemplo; e o tipo de dado aceito na requisição (Accept), que nesse caso, pode ser texto ou JavaScript.
As respostas também têm seus próprios cabeçalhos. O cabeçalho da resposta da requisição que fizemos, por exemplo, para www.google.com, trouxe a resposta 200 OK. O número 200 é o código de status HTTP, que significa que a comunicação foi bem-sucedida.
HTTP/1.1 200 OK
Date: Thu, 13 Jul 2023 00:19:01 GMT
Expires: -1
Cache-Control: private, max-age=0
Content-Type: text/html; charset=ISO-8859-1
Content-Security-Policy-Report-Only: object-src
COPIAR CÓDIGO
Você provavelmente conhece o famoso código 404, que aparece quando tentamos entrar em um site que não existe ou digitamos algo errado no endereço. Há uma lista extensa de códigos HTTP, mas o que mais gostamos de receber é o 200, que indica que tudo deu certo.
Vamos criar nossos próprios cabeçalhos durante o curso. Um cabeçalho de requisição é uma das partes mais importantes, pois precisa ser corretamente montado para que a comunicação ocorra sem problemas e não retorne erros.
No exemplo de cabeçalho acima, temos a data em que a requisição foi feita, o controle de cache (Cache-Control), e o tipo de conteúdo (Content-Type) definido como text/html, mas existem muitos outros dados que podem ser enviados e recebidos através de cabeçalhos.
Dando continuidade à escrita da função
Agora que já entendemos o que deve conter em um cabeçalho de requisição, podemos prosseguir para a escrita de nossa função. Após utilizar o método writeHead(), o primeiro parâmetro que ele receberá será o número 200, que corresponde à resposta OK.
O segundo será um objeto JavaScript ({}) que terá um conjunto de chave e valor. Ambos serão strings. A chave será Content-Type e o valor será text/plain, que é o tipo de dado que iremos utilizar na nossa primeira requisição de teste.
server.js:
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
});
COPIAR CÓDIGO
Em seguida, vamos chamar res novamente e utilizar o método end(), onde passaremos o texto que desejamos transmitir. Encerraremos a resposta com o texto "Curso de Node.js".
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Curso de Node.js");
});
COPIAR CÓDIGO
Com isso, na função createServer(), apenas passamos o cabeçalho da resposta, que será 200, e incluímos o tipo de conteúdo enviado nessa resposta. Por fim, passamos o próprio conteúdo, "Curso de Node.js".
Criando uma conexão com o servidor
Finalizada a constante server, temos a variável que armazena todas as informações do servidor que está sendo criado. Em seguida, chamaremos o server na linha de código 8, que será um objeto grande com vários métodos e propriedades, junto ao método listen().
Esse método receberá dois parâmetros. O primeiro será um número, 3000, e falaremos mais sobre ele a seguir. O segundo será uma função callback.
Essa função não precisa receber nenhum parâmetro, então apenas abrimos e fechamos parênteses, passamos a arrow function (=>), e abrimos e fechamos chaves.
No escopo da função callback, vamos incluir somente um console.log() com a string "servidor escutando!". Esta etapa serve apenas para testes.
server.js:
server.listen(3000, () => {
  console.log("servidor escutando!");
});
COPIAR CÓDIGO
O que o nosso server faz com o método listen()? "Listen" ("ouvir" em inglês) é um termo que utilizamos bastante quando trabalhamos com eventos. Um evento que vai acontecer em um servidor, por exemplo, é uma conexão. Alguém se conectou a esse servidor para fazer uma requisição e receber uma resposta.
Nesse caso, o método ouvirá o servidor para conexões que acontecerem nele na porta 3000. Então, o número 3000 é o número da porta lógica onde a conexão vai acontecer.
Para tornar o código mais legível, faremos uma refatoração no início do arquivo, logo após o import. Na linha 3, vamos criar uma constante chamada PORT e atribuir o valor 3000 a ela.
const PORT = 3000;
COPIAR CÓDIGO
Normalmente, usamos esse padrão do nome da variável com todos caracteres maiúsculos quando queremos passar informações fixas, informações estáticas.
Feito isso, dentro de server.listen(), podemos substituir o 3000 por PORT.
server.listen(PORT, () => {
  console.log("servidor escutando!");
});
COPIAR CÓDIGO
A porta 3000 é a porta de comunicação que será utilizada na API. Um computador tem milhares de portas lógicas que podem ser utilizadas. Algumas são padrão para certos tipos de comunicação.
Por exemplo: navegadores usam a 443 ou a 80; bancos de dados também têm suas próprias portas. Algumas portas são de uso geral, sendo a 3000 uma delas.
Falaremos mais sobre portas no material extra!
Resultado do arquivo server.js até o momento:
import http from "http";

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Curso de Node.js");
});

server.listen(PORT, () => {
  console.log("servidor escutando!");
});
COPIAR CÓDIGO
Executando o arquivo
Agora precisamos apenas executar o arquivo e verificar se o nosso servidor está no ar e servindo arquivos. Para isso, vamos retornar ao terminal na pasta correta e pedir para o Node executar server.js com o comando abaixo:
node server.js
COPIAR CÓDIGO
O terminal deverá retornar o console.log() de "servidor escutando!". Mas, além disso, precisamos verificar se algum arquivo é servido.
Para isso, podemos usar o navegador comum para acessar "localhost:3000". Será exibida a informação "Curso de Node.js", único dado transferido no nosso servidor por enquanto.
Agora nosso servidor está ativo, recebe requisições na porta 3000, e retorna para nós a string "Curso de Node.js"!
Criando rotas
Acessaremos a página da Alura no navegador. Ao clicar em qualquer parte da página inicial, por exemplo, em "Escola de Programação", a barra de navegação mostrará "/escola-programacao".
Isso significa que acessamos uma parte específica da "alura.com.br", onde estão as informações que precisamos sobre a escola de programação. Você já deve ter percebido que isso funciona para qualquer site na internet.
Quando construímos APIs, como neste curso, utilizamos um conceito parecido, chamado rotas. É basicamente o mesmo princípio, onde temos endereços. No vídeo anterior, por exemplo, acessamos o endereço localhost:3000. Esse endereço é local, porque nosso servidor é local, mas quando estiver na internet, terá um endereço na internet.
Para a API, precisamos definir o recurso que queremos acessar, que pode ser livros, editoras, admin, e assim por diante. Tudo isso é feito através de rotas. Afinal, o produto final da API é um conjunto de endereços HTTP, um conjunto de links, isto é, de rotas. É isso que começaremos a construir agora.
Conjunto de rotas
Neste primeiro teste, vamos estabelecer no arquivo server.js um conjunto de rotas através de um objeto. Para isso, criaremos abaixo de PORT uma constante chamada rotas, que receberá uma abertura de chaves ({}).
Por enquanto, será apenas um conjunto de chave e valor. Então, entre as chaves, passaremos uma string contendo apenas uma barra (/), e após dois-pontos passaremos a mesma informação anterior ("Curso de Node.js").
server.js:
const rotas = {
  "/": "Curso de Node.js"
};
COPIAR CÓDIGO
Quando usamos apenas /, normalmente, nos referimos à rota base, que não disponibiliza nenhum recurso específico. Nesse caso, declaramos que, ao acessar a rota base, ou seja, a URL base, será exibida a informação "Curso de Node.js".
Agora vamos passar essa informação para o escopo de createServer(). A primeira linha da função writeHead continua a mesma. No entanto, em vez de passarmos a string diretamente para o método res.end(), passaremos rotas[req.url].
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(rotas[req.url]);
});
COPIAR CÓDIGO
A notação de colchetes é usada para passar uma variável como propriedade dentro do objeto rotas. Normalmente, usamos ponto, mas como passamos uma informação variável, usamos a notação de colchetes, que é um recurso próprio de objetos JavaScript.
Porém, o que é req.url? req é um dos argumentos recebidos pela função createServer(). Ou seja, toda vez que uma requisição é recebida, ela traz consigo, entre várias outras informações, uma propriedade chamada url.
Reiniciando o servidor
Para verificar isso na prática, faremos o teste novamente, diretamente no navegador. Mas antes, vamos retornar ao terminal e reiniciar o servidor.
Podemos usar o comando node server.js, da mesma forma que fizemos anteriormente, mas para facilitar o processo de desenvolvimento, instalaremos uma biblioteca para não precisar desativar e ativar o servidor toda vez que alterarmos algo no projeto.
Uma vez que o servidor é iniciado, ele não detecta mais as alterações que fazemos no código. Para resolver esta questão, vamos instalar uma biblioteca muito conhecida para todas as pessoas que trabalham com Node, chamada Nodemon.
Para instalar, utilizamos o comando npm install ou npm i, seguido de nodemon@3.0.1 para instalar exatamente a versão usada no curso.
npm install nodemon@3.0.1
COPIAR CÓDIGO
Esta é uma biblioteca muito leve, que instala rapidamente e já fica disponível no arquivo package.json. Agora vamos editar a parte de scripts do arquivo package.json e adicionar um script para o Nodemon gerenciar o servidor.
Na seção scripts do package.json, adicionaremos um script que chamaremos de dev, que pode ser posicionado tanto antes quanto depois do script test já existente. O valor dele será nodemon server.js. Dessa forma, utilizamos o Nodemon para executar o arquivo server.js.
package.json:
"scripts": {
  "dev": "nodemon server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
COPIAR CÓDIGO
De volta ao terminal, executaremos o script através do comando npm run dev.
npm run dev
COPIAR CÓDIGO
Com isso, o Nodemon está iniciado e irá monitorar todas as nossas alterações. A mensagem "servidor escutando!" foi exibida, que é o console.log() inserido anteriormente.
Fazendo uma requisição
Agora podemos voltar ao navegador e realizar uma nova requisição para localhost:3000. A página deverá carregar com sucesso exibindo a mensagem "Curso de Node.js".
Caso queira confirmar que a informação foi modificada, você pode alterar no objeto rotas de "Curso de Node.js" para "Curso de Express API", salvar e recarregar a página no navegador para visualizar o resultado.
server.js:
const rotas = {
  "/": "Curso de Express API"
};
COPIAR CÓDIGO
A modificação já terá sido feita, ou seja, o servidor está de pé e nossa rota / também está funcionando, porque não inserimos nada depois de localhost:3000, após a URL base.
Dessa forma, concluímos que o navegador fez uma requisição HTTP para o servidor que está em localhost na porta 3000, e esse servidor devolveu a informação referente à rota /. Isso quer dizer que url é uma propriedade do objeto req, ou seja, da requisição que está sendo gerida através do servidor HTTP.
Visualizando outras rotas
Vamos fazer mais um teste no objeto rotas para visualizarmos algumas outras rotas em andamento. Adicionaremos duas rotas após a rota /. A primeira será chamada /livros, que terá como valor a string "Entrei na rota livros". Por fim, a terceira rota será chamada /autores e terá um valor de string "Entrei na rota autores".
const rotas = {
  "/": "Curso de Express API",
  "/livros": "Entrei na rota livros",
  "/autores": "Entrei na rota autores"
};
COPIAR CÓDIGO
Podemos recarregar a página e testar novamente.
No terminal, você pode verificar todas as vezes em que a biblioteca Nodemon foi executada e que o servidor foi reiniciado.
Com o navegador aberto, em vez de localhost:3000, vamos para localhost:3000/livros. Será acessada a rota /livros através de req.url e exibida a string "Entrei na rota livros" na tela. Com a rota /autores acontecerá o mesmo, retornando a string "Entrei na rota autores."
Resultado do arquivo server.js até o momento:
import http from "http";

const PORT = 3000;

const rotas = {
  "/": "Curso de Express API",
  "/livros": "Entrei na rota livros",
  "/autores": "Entrei na rota autores"
};

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(rotas[req.url]);
});

server.listen(PORT, () => {
  console.log("servidor escutando!");
});
COPIAR CÓDIGO
Criando o arquivo .gitignore
Agora que já temos rotas para a nossa API, vamos criar um novo arquivo na raiz e chamá-lo de .gitignore. Dentro dele, vamos inserir a informação node_modules e salvar.
.gitignore:
node_modules
COPIAR CÓDIGO
Fazemos isso porque, ao realizar a primeira instalação de biblioteca no projeto, a pasta "node_modules" é criada, e ela não deve ser enviada para o GitHub.
Dito isso, agora você pode salvar seu projeto no GitHub sabendo que a pasta "node_modules", que ainda vai crescer com outras coisas que instalaremos, não será enviada para seu repositório.
Conclusão
Neste vídeo, criamos rotas locais por extenso para nosso servidor trabalhar com diferentes rotas e exibir informações distintas. Agora temos preparo para evoluir com as bibliotecas que serão utilizadas durante o curso. Vamos lá!
O desafio agora é que o volume de tarefas aumentará consideravelmente tanto para as rotas quanto para o servidor. Mais rotas serão adicionadas interagindo de formas distintas com o servidor. Todo esse esforço que precisamos fazer para construir esta API é uma tarefa comum de requisições HTTP.
E para tudo que é recorrente e repetitivo, nós utilizamos bibliotecas.
As bibliotecas são porções de código predefinidas que facilitam nosso trabalho no desenvolvimento.
No nosso caso, o Express é um framework que vamos utilizar para nos auxiliar no gerenciamento de rotas e do servidor HTTP.
Chamamos de framework um conjunto maior de bibliotecas ou de códigos.
As bibliotecas costumam ser um pouco específicas no que fazem. Então, quando há um grupo maior de código que executa muitas tarefas, nomeamos isso de framework. E o Express é o framework de Node.js para servidores HTTP mais famoso e um dos mais utilizados no mercado.
Para começarmos a utilizar o Express, vamos abrir o Terminal. Preciso pressionar "CTRL + C" para interromper o servidor, pois faremos mais algumas instalações no nosso projeto. Não tem como manter o servidor ativo, pois precisaremos reiniciá-lo.
Já estou na pasta do projeto, agora vou executar npm install express@4.18.1. Essa é a última versão disponível no momento da criação deste curso e gostaria que instalassem exatamente a mesma versão para evitar possíveis problemas com versões futuras.
A instalação é rápida, pois o pacote é leve. Vamos retornar ao Visual Studio Code e começar a utilizar os métodos do Express para aprimorar o nosso código, tornando-o mais eficiente e preparado para futuras ampliações da nossa API.
A primeira coisa que farei é criar uma pasta chamada "src" na raiz do projeto. "src" é a abreviação de source code (código fonte), que é o nome padrão para a pasta onde ficam todos os arquivos da nossa API. Dentro de "src", criarei um arquivo "app.js", onde iniciaremos o Express.
Dentro desse arquivo, a primeira coisa que farei é incorporar o Express com o comando import express from "express";. Essa linha importa toda a biblioteca que instalamos com o npm, nos fornecendo todos os métodos para utilizarmos.
Em seguida, criarei uma constante chamada app. Essa constante será uma instância do Express e receberá como valor o resultado de express(). Portanto, ao executar a função express, todas as funções do Express serão atribuídas à variável app.
import express from "express";

const app = express();
COPIAR CÓDIGO
Com o Express iniciado, conseguiremos realizar alguns testes para entender como os métodos do Express funcionam com as rotas. Criarei nossa primeira rota com app.get().
Esse método get() receberá dois parâmetros, assim como antes. O primeiro será uma string e passarei apenas uma barra ("/"), indicando a URL base da nossa API. O segundo parâmetro será uma função de retorno (ou callback), que também recebe os dois parâmetros que já vimos antes: req e res (abreviações para requisição e resposta). Também criarei uma arrow function, abrindo e fechando chaves em seguida.
Dentro das chaves, chamarei res.status(200).send('Curso de Node.js');. Com essas instruções, o servidor retornará o status 200 e enviará a string "Curso de Node.js". Vamos falar mais sobre o status 200 em breve.
Bloco de código final:
import express from 'express';

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Curso de Node.js");
});
COPIAR CÓDIGO
Estamos passando para o Express a responsabilidade de gerenciar as rotas que estávamos criando manualmente antes, no arquivo server.js com um objeto JavaScript. Então, a partir de agora, quem vai cuidar de ouvir as rotas sendo chamadas, no caso que estamos fazendo via navegador, administrando as requisições e as respostas, é o próprio Express.
O que antes era feito diretamente pela biblioteca interna do Node, o HTTP, será agora responsabilidade do Express: A mesma operação que fizemos no server.js, ao escrever o cabeçalho e passar o status code 200 de OK e o conteúdo da resposta.
Mas antes de testarmos novamente, preciso fazer o módulo app, que acabamos de criar, se comunicar com o servidor. Então, vou exportar no final do arquivo app.js com export default app, para conseguirmos exportar esse módulo.
Agora, retorno ao arquivo "server.js", vou comentar a linha import http from http por enquanto e, em seu lugar, vou importar o módulo app. Fica assim: import app from "./src/app";.
A porta vai permanecer como a 3000, por enquanto.
// import http from "http";
import app from "./src/app";

const PORT = 3000;
COPIAR CÓDIGO
Na parte da criação do servidor, ele vai deixar de ser create server. Não precisamos mais da constante server, porque agora quem vai criar o servidor é app, ou seja, o Express. Então, por enquanto, vou comentar a linha a seguir, apenas para verificar se está tudo funcionando corretamente.
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { "Content Type": "text/plain" })
// });
COPIAR CÓDIGO
No listen, o método que está monitorando as conexões feitas com o servidor, não se conectará mais ao server: a conexão será feita agora com o app, no qual estão todos os métodos do Express.
Portanto, teremos app.listen. Esse método continuará funcionando da mesma forma: o primeiro parâmetro será o número da porta e o segundo será o que desejamos que aconteça quando o servidor escutar qualquer conexão. Então, teremos console.log("servidor escutando!").
app.listen(PORT, () => {
    console.log("servidor escutando!");
});
COPIAR CÓDIGO
Agora podemos retornar ao terminal, reiniciar o servidor com o comando npm run dev. Recebi um erro, que já identifiquei: em server.js, quando importei o app from "./src/app", esqueci de adicionar .js. Então, acrescento apenas .js em app (import app from "./src/app.js"). Não podemos esquecer disso, porque muitas vezes o Visual Studio Code não adicionará isso automaticamente para nós.
Ao salvar o arquivo, o servidor notou a alteração e não está mais mostrando nenhum erro na tela. O servidor está escutando, podemos testar no próprio navegador.
A rota /autores que testamos anteriormente não existe mais, mas a rota / existe. Então, ao recarregar, o curso de node continua funcionando. Ou seja, passamos com sucesso os métodos que estavam sendo executados pela biblioteca HTTP para o Express.
Tudo que já havíamos comentado antes sobre o código HTTP, podemos agora deletar do nosso "server.js". Da mesma forma, o objeto rotas, criado para também criar algumas rotas manualmente e manipular suas solicitações, também não será mais usado porque quem o utilizava era a biblioteca HTTP. Portanto, também podemos deletá-lo.
No entanto, até o momento só temos uma rota "/" que retorna uma string para nós. Agora é a hora de começarmos a criar rotas verdadeiras na nossa aplicação. Vamos lá.
O Express foi instalado com sucesso e já criamos a primeira rota, a rota "/", ou a URL base, como chamamos. No entanto, nossa URL base continua trazendo apenas strings, o que não é o que desejamos. Queremos trazer dados, por exemplo, dos livros da nossa livraria. Então, vamos começar a criar alguns dados para trabalharmos.
Dentro de "app.js", logo abaixo de onde iniciamos o express(), vou criar uma constante chamada livros, que por enquanto será igual a um array. Portanto, vou criar colchetes []. Dentro deste array, vou criar dois livros. Portanto, será um array contendo dois objetos livro, cada um com um id e um titulo. Por exemplo, um com id: 1 e título: "O Senhor dos Anéis", e outro com id: 2 e título: "O Hobbit".
const livros = [
    {
        id: 1,
        título: "O Senhor dos Anéis"
    },
    {
        id: 2,
        título: "O Hobbit"
    }
];
COPIAR CÓDIGO
Agora temos um array que está simulando alguns dados, como se fosse nossa base de dados de livros.
Em relação às rotas, temos a rota que bate na URL base. Podemos adicionar mais uma rota para retornar nossa lista de livros. Então, abaixo do primeiro app.get("/"), vou criar outro app.get() e, agora, o primeiro parâmetro desta função get(), em vez de ser "/", será "/livros".
O segundo parâmetro permanece o mesmo. Ele é uma callback function que recebe dois parâmetros: req e res, que já conhecemos.
Criarei uma arrow function {} e o retorno será res.status(). Novamente, vou passar aqui como valor de status 200, que é o status de OK.
Agora, não estamos mais trabalhando com uma string, mas com um tipo de dado estruturado: um array de objetos. Então, precisamos passar o método json(), em vez do send(), que é usado para dados mais simples. Dentro de json(), vou referenciar nossa variável livros, que é nosso array de livros.
app.get("/", (req, res) => {
  res.status(200).send("Curso de Noje.js");
});

app.get("/livros", (req, res) => {
  res.status(200).json(livros);
});
COPIAR CÓDIGO
Vou verificar no terminal se o nodemon gerou algum erro. Não há nenhum erro, então, nosso servidor está funcionando. Agora, podemos voltar ao navegador e fazer um novo teste, acessando "localhost:3000/livros".
A visualização pode variar um pouco dependendo do navegador que você está usando. No Firefox, por exemplo, já temos um visualizador para objetos do tipo JSON. Mas, se fizermos o mesmo teste no Google Chrome, a visualização fica um pouco diferente.
O que é o JSON?
Vamos voltar um pouco para entender o que é esse .json(). O JSON é uma notação de objeto que se baseia em um objeto JavaScript. Deixarei mais informações detalhadas sobre ele nas atividades (JSON é usado para estruturar dados em um formato que tanto humanos quanto máquinas possam ler).
Mas por que temos que usar o .json()? Para que a resposta seja interpretada corretamente.
Então, nossa resposta é uma resposta 200, ou seja, de sucesso. Agora, com o método JSON, é sinalizado que o que está sendo enviado nesta resposta não é mais uma string, como anteriormente, mas um tipo JSON. Este método pega nosso array simples em JavaScript, o converte para JSON (que é o formato de dados padrão, atualmente, de APIs REST).
Utilizamos os métodos do Express para gerenciar duas rotas: a rota base ("/") e a rota livros ("/livros").
O que é o .get()?
O get() é o método que estamos utilizando, significa que queremos obter dados.
Existem outros métodos para diferentes ações que precisamos executar em nossa API, como enviar ou atualizar dados. A seguir, vamos descobrir quais são as diferentes formas pelas quais podemos interagir com a nossa API usando outros métodos HTTP.
Por enquanto, a nossa API consegue buscar (get) dados. Quem especifica de onde vão vir os dados que vão ser retornados em uma requisição somos nós quando estamos programando a API. Estamos dizendo que os dados que a API vai retornar estão vindo de um array que chamamos de const livros.
Lá no início do curso, comentamos que um sistema, por exemplo, de uma livraria, deve ser capaz não só de consultar livros, mas de adicionar livros também. É isso que vamos fazer agora.
Por enquanto, vamos continuar trabalhando no array local, que é o array da memória que estamos utilizando.
Então, vamos pensar como fazer para criar uma nova rota e conseguir não só buscar itens, mas adicionar itens, criar registros no nosso array, no nosso "banco de dados".
Vou criar uma nova rota para isso. Embaixo de app.get, vou criar app.post, o nome do método HTTP que utilizamos para criar recursos, criar novos recursos.
Qual rota o post vai acessar? Também vai acessar a mesma rota, /livros, já que estamos falando de adicionar livros. E o segundo parâmetro continua sendo os mesmos que estávamos trabalhando, que é req de requisição, res de resposta, criando uma função de seta (arrow function), abrindo e fechando chaves.
app.post("/livros", (req, res) => {

})
COPIAR CÓDIGO
Então, o que vai dentro do post?
Se estamos trabalhando com um array normal do JavaScript, vamos utilizar os métodos do JavaScript para manipulação de array. Então, o nosso app.post em /livros vai fazer um livros.push. E o que vai receber?
De onde vão sair os dados que vão ser utilizados para criar um novo livro? Eles vão sair de req.body, encerrado com ponto e vírgula.
app.post("/livros", (req, res) => {
    livros.push(req.body);
})
COPIAR CÓDIGO
Então, o que é req.body?
Já abordamos anteriormente o req.url. Sempre que falamos de req estamos falando do objeto requisição, que está sendo recebido dentro da função que é chamada em app.post. Todo o gerenciamento de ir na rota, pegar as informações e criar esses dois objetos, tanto o req quanto o res, é responsabilidade do Express.
Assim, o Express cria esse objeto req e dentro dele tem uma propriedade que chama body, ou seja, corpo. Que corpo é esse? É o corpo da requisição.
Vamos fazer novamente uma pausa para entender o body.
Falamos anteriormente sobre cabeçalhos (headers): Toda requisição e toda resposta HTTP tem cabeçalhos com as informações necessárias.
Porém, algumas requisições e respostas HTTP também têm body, também têm corpo. Quando só queremos buscar coisas com get, nossas requisições não precisam ter corpo, só precisam ter cabeçalho com as informações.
Porém, quando queremos enviar dados para serem criados, por exemplo, post cria um novo registro, nossa requisição também tem que ter um body, também tem que ter um corpo. No caso, a requisição HTTP tem que enviar os dados que queremos que sejam armazenados.
Normalmente, fazemos isso no formato de objeto e a resposta da requisição também tem body, que é o corpo, que normalmente é onde mandamos a informação de volta se isso deu certo ou se deu errado. Então, lembre-se sempre de que toda requisição HTTP tem cabeçalho e quando queremos enviar dados, por exemplo, em um post, temos que ter um corpo da requisição.
E esse valor fica guardado dentro do objeto requisição, dentro da propriedade body, criada pelo Express.
Então, voltando para o código, agora sabemos que o Express vai pegar o corpo dessa requisição e vai conseguir fazer um push, porque isso vai ser um objeto de livro, dentro do nosso array.
Antes de testarmos, tem um detalhe bem importante que temos que incluir lá no começo do nosso arquivo app.js, embaixo de onde criamos a const app. Trata-se do app.use, uma função, e vou passar como parâmetro uma outra função, que vai ser express.json.
app.use(express.json());
COPIAR CÓDIGO
Assim, temos aqui uma função executando outra função. Isso se chama middleware.
No caso do Express, esses middlewares são utilizados para ter acesso às requisições e às respostas no momento em que elas estão sendo feitas, e para fazer algumas ações nelas, como por exemplo, modificar o objeto, passar informações extras etc.
Nós conseguimos encadear esses mini programas, esses middlewares, para fazer as alterações nas requisições e respostas conforme necessário. No meu caso, estou utilizando um chamado express.json, que serve para executar esse express.json em todas as requisições manipuladas pelo Express.
Ou seja, qualquer requisição cujo corpo é um objeto compatível com JSON, como um objeto com id e título ou um array de objetos, passará por esse middleware e será convertido e analisado (ou 'parseado') para JSON.
Mas por que precisamos fazer essa conversão? Não estamos já trabalhando com objetos? Sim, estamos.
No entanto, toda vez que recebemos dados via corpo em uma requisição, eles chegam convertidos como string. Embora eles tenham o formato JSON, formato de objeto, com pares de chave-valor, eles viajam na conexão HTTP no formato string. Para conseguirmos utilizar os dados como JSON, ou seja, acessar as propriedades deles, precisamos converter essa string novamente para JSON.
Importante lembrar que toda requisição deve ter uma resposta. Então, abaixo do local onde fizemos o push do novo livro na nossa array livros, precisamos enviar uma resposta de volta para quem fez a requisição.
Portanto, teremos res.status. Agora, ao invés de 200, vou passar 201, que é o código de status HTTP para registro criado. Quando fazemos uma operação com sucesso em qualquer requisição, o código é 200. Quando criamos algo com sucesso, o código é 201.
E utilizarei também .send, porque vou passar uma string dizendo "Livro cadastrado com sucesso". Neste caso, não precisamos de JSON, podemos usar apenas .send.
app.post("/livros", (req, res) => {
    livros.push(req.body);
    res.status(201).send("Livro cadastrado com sucesso");
})
COPIAR CÓDIGO
Agora, não conseguimos mais fazer o teste no navegador, porque o navegador só realiza requisições GET, ele não realiza outros métodos, ou seja, não posso passar um POST via navegador.
Portanto, agora precisaremos do Postman. As instruções de como baixar e instalar estão no começo dessa aula, no "Preparando o ambiente".
Precisaremos de um JSON para fazer uma requisição do tipo POST. Então, vamos lá. Eu já deixei o Postman aberto no meu computador. Vamos criar uma nova requisição com o Postman.
À esquerda, temos um menu com os métodos HTTP que podem ser utilizados. Já conhecemos o GET, que o próprio navegador realiza para nós, mas também podemos fazer pelo Postman. Selecionaremos o segundo, que é o POST.
A URL a ser utilizada é a nossa localhost:3000/livros.
E precisamos enviar um corpo nessa requisição. Então, abaixo do endereço, temos um menu, o "body". Clicarei nele, selecionarei a opção RAW e no último menu, que começa com texto, selecionarei JSON, que é o tipo de dado que queremos enviar na nossa requisição.
Abaixo, temos uma área para escrevermos nosso objeto. Criarei um novo objeto livro aqui, que tem "id": 3 e o "título": "O Silmarillion", outro livro de J. R. R. Tolkien.
Ao trabalharmos com JSON, sempre utilizamos aspas duplas nas chaves, assim como nos conjuntos de chave-valor, e também para as strings.
"id": 3,
"titulo": "O Silmarillion"
COPIAR CÓDIGO
Vou voltar ao terminal para ver se não há nenhum erro, o servidor está de pé.
Agora, no Postman, podemos clicar no botão que está à direita, "Send", e ver se ele retorna uma resposta. O servidor retornou "Livro cadastrado com sucesso".
Mas como saber se o livro foi mesmo cadastrado com sucesso? No Postman, há um botão com o símbolo de soma ('+') para abrir uma nova aba, onde podemos criar uma nova requisição e confirmar se o cadastro ocorreu como esperado.
Podemos ir para /livros em localhost/livros e fazer uma requisição do tipo GET (que é a primeira opção de método). Lembrando que GET não tem body, então apenas necessitamos enviar essa requisição clicando no botão Send.
Agora o Postman já retornou o meu array atualizado, com id 3, título "O Silmarillion". Isso indica que, por enquanto, nossa API está funcionando.
Fizemos uma requisição do tipo POST para /livros, ela adicionou o livro no array de livros, utilizando os dados recebidos pela requisição e manipulados pelo Express.
Ou seja, Express acessou a requisição, acessou a propriedade body, pegou o que havia dentro de body, que é o nosso objeto livro - id 3, título "Silmarillion" - e adicionou com o push no array. Em seguida, retornou apenas com um Send a mensagem "Livro cadastrado com sucesso".
Entretanto, fizemos uma nova requisição GET e o array veio atualizado. Qualquer alteração que fizermos e salvarmos o arquivo, assim que o nodemon reiniciar o servidor, essas alterações vão desaparecer, porque esse array está em memória.
Mas, por enquanto nós vamos ficar com essa configuração. Mais tarde, conseguiremos persistir nossos dados com um banco de dados.
Por enquanto, temos todo o processo funcionando, tanto para obter livros, quanto para criar um novo livro. Se pensarmos um pouco no que normalmente fazemos com dados, nós criamos, recuperamos, deletamos e atualizamos. É isso que nós vamos fazer em seguida, já utilizando o Express e o nosso array de livros. Então, vamos continuar.
Observe o resultado a seguir, onde o array de livros é atualizado após a operação POST:
GET /livros
[
  {
    "id": 1,
    "titulo": "O Senhor dos Anéis"
  },
  {
    "id": 2,
    "titulo": "O Hobbit"
  },
  {
    "id": 3,
    "titulo": "O Silmarillion"
  }
]
COPIAR CÓDIGO
Nota: Lembre-se de que todas as alterações feitas serão perdidas assim que o servidor for reiniciado porque o array de livros é apenas armazenado na memória.
Agora que já sabemos como recuperar uma lista de livros da nossa base de dados em um array e adicionar um novo livro, podemos continuar aprimorando nossa API com outras funcionalidades básicas.
O próximo passo é criar uma nova rota para acessar apenas um livro, que é algo muito comum para quando quero localizar um registro específico.
Nesse sentido, vou criar uma nova rota. Já sabemos que é uma rota do tipo get, pois queremos obter apenas um livro. Portanto, abaixo do último app.get, vou criar um novo app.get. Este será um array, mas a rota que vamos acessar não será mais /livros.
Terá que ser um pouco diferente, pois já temos um get/livros. Portanto, terá que ser /livros, seguido por um parâmetro que permitirá a localização de um livro específico.
No caso de nossa API, temos o título, mas temos uma informação mais precisa: o ID. O ID é um localizador único, que utilizamos para qualquer registro que precise de um localizador sem duplicação. Portanto, o que podemos passar em nossa rota é get("/livros/") com o ID que queremos localizar.
Como posso indicar ao Express que esse dado será variável? Eu prefixo isso com dois pontos. Portanto, teremos /livros/:id. Com esses dois pontos, estou informando ao Express que o ID será uma informação variável, que será processada de acordo com o valor que for passado.
O segundo parâmetro continua o mesmo, é a nossa conhecida callback function, que recebe req e res (requisição e resposta). Abro uma arrow function, seguida por chaves.
app.get("/livros/:id", (req, res) => {

})
COPIAR CÓDIGO
E o que acontecerá aqui dentro desse GET? Lembre-se de que ainda estamos trabalhando com um array normal do JavaScript por enquanto, então continuamos usando os métodos do JavaScript. Portanto, o que o nosso GET livros fará? Ele precisa buscar, usando o JavaScript, um elemento nesse array na propriedade ID.
Para facilitar o processo, vou separar em uma função distinta que possamos chamar dentro do nosso app.get. Depois do array, vou criar uma função normal do JavaScript com a declaração function, eu vou nomear essa função de buscaLivro.
A função buscaLivro vai receber um ID, que é o que vai chegar via requisição, naquela variável que mencionei com dois pontos. Essa função vai procurar dentro do array livros, se existe um livro com esse ID e em qual índice ele está do array, para que possamos recupera-lo.
Portanto, ela vai retornar o resultado de livros.findIndex, que é um método do JavaScript para arrays que retornam o índice onde está o elemento desejado, baseado no que passamos a ele.
Então, findIndex é um método callback também, que vai receber cada livro do nosso array de livros e vai retornar, por sua vez, se livro.id for estritamente igual ao ID recebido no parâmetro.
No entanto, lembre-se de que eu comentei que os dados que trafegam via HTTP, também trafegam no formato string. E nossos IDs no array de livros, são number, ou seja, são números.
Para fazer essa comparação corretamente com os três iguais do JavaScript, primeiro precisamos converter esse ID para number. Então, Number(id), caso contrário, ele vai tentar comparar uma string com um número usando a comparação estrita e não vai dar certo.
function buscaLivro(id) {
    return livros.findIndex(livro => {
        return livro.id === Number(id);
    })
}
COPIAR CÓDIGO
Portanto, após a conversão, ele vai retornar o índice onde está esse livro dentro do array. Já que criamos a nossa função, podemos chamar essa função dentro da nossa requisição, dentro do app.get.
Voltando ao app.get, vamos criar uma const index para buscar esse índice e salvar na variável. Ele será o resultado de buscaLivro, que é a nossa função, recebendo o quê? req.params.id.
app.get("/livros/:id", (req, res) => {
    const index = buscaLivro(req.params.id);
})
COPIAR CÓDIGO
Params é outra propriedade que vem dentro do nosso objeto requisição, montado pelo Express. 'Params', por quê? Porque é um parâmetro. Estamos passando ID como um parâmetro da rota e usamos os dois pontos para indicá-lo como um parâmetro variável. O ID é o nome que nós atribuímos a esse parâmetro.
Então, se nós identificássemos com livros/:id, qualquer outro nome ou identificador, ele seria recebido como essa propriedade do objeto dentro de params. Para esclarecer req.params - porque pode haver mais de um - req.params.id vai puxar a requisição, passar para dentro de buscaLivro e, então, buscaLivro vai retornar algo e guardar esse número na constante index.
A partir disso, podemos acessar o nosso array e passar isso adiante. Então, agora podemos criar a nossa resposta. res.status vai ser 200 (de OK), res.status(200).json e o resultado será o array livros[index], porque index é a posição que foi localizada pela função.
Vamos fazer um teste para esclarecer: Primeiro, vou verificar no terminal se o servidor está funcionando, sem nenhum erro. Com tudo em ordem, podemos voltar ao Postman e acessar a aba da requisição GET.
Agora, o nosso id 3, criado anteriormente, não existe mais porque o servidor já foi reiniciado. Porém, id 1 e id 2 permanecem, pois estão fixados no array.
Lembrando que a nossa rota é /livros/, e precisamos passar algum índice. Vou passar 1, que é o ID para o título "O senhor dos anéis", e, ao enviar, recebemos apenas o objeto com o id 1.
{
"id": 1,
"titulo": "O Senhor dos Anéis"
}
COPIAR CÓDIGO
Ou seja, a requisição recebeu esse ID como parâmetro, ele foi passado para dentro da função buscaLivro, a função buscaLivro localizou a posição no array onde livro.id é igual a 1, retornou esse índice e, provavelmente, nesse momento, temos um livro no índice 0, que é o primeiro do array. Este é retornado para nós no formato JSON na resposta da requisição, tudo certinho.
Vamos aproveitar que estamos aqui e fazer, com mais agilidade agora, um método para alterar o nome de um livro, que é o método put. Utilizamos get para obter, post para criar e put ou patch para alterar um registro que já existe. Deixarei material extra sobre esses dois métodos para você conferir as diferenças entre eles.
Então, app.put, similarmente, vai ser na rota /livros/, mas aqui, novamente, temos que passar qual é o livro que queremos alterar. Também devemos passar o parâmetro para localizar qual é o livro que será alterado.
Segundo parâmetro permanece req, res, abre arrow function, abre chaves e, porque estamos trabalhando com o array de JavaScript, começamos criando uma busca-livro. Podemos até copiar de app.get, nosso const index = buscaLivro, porque da mesma forma que tivemos que buscar um livro para retornar no GET, temos que buscar um livro para alterar.
Iniciamos buscando esse livro na nossa base, encontramos o livro na nossa base e, agora, simplesmente utilizamos um método JavaScript padrão para alterar o objeto. Então, livros[index], por exemplo, não podemos alterar o ID, por padrão. O ID é um identificador único, mas podemos alterar o título. Então, podemos passar livros[index].titulo que será recebido e substituí-lo por req.body.titulo.
Lembrando que esta linha está apenas usando JavaScript padrão para encontrar uma propriedade qualquer de um objeto e substituir o valor dela.
Então, o valor atual está sendo substituído, no índice que está sendo passado, pelo valor de título que vamos receber no corpo da requisição, sem esquecer de enviar a resposta. Portanto, res.status, passaremos, aqui, (200).json. Vou simplificar esse exemplo, e pedir para retornar o array inteiro novamente, para facilitar o retorno nesse teste. Tudo certo?
Vamos fazer mais um teste no Postman. No terminal, está tudo certo, sem nenhum erro. No Postman, podemos criar uma nova requisição. Vou copiar a URL que usamos no GET, clicar no ícone de soma ("+") para criar uma nova requisição do tipo put, que sempre precisa corresponder ao tipo que estamos passando no Express.
Irei fazer uma alteração, por exemplo, no livro, continuando a editar o ID1. O put, por necessitar o envio de dados, deve possuir um corpo. Portanto, no menu de corpo do Postman, seleciono raw, escolho o tipo JSON e aqui passo apenas o título. Logo, crio aqui um objeto, passo título, entre aspas duplas, e aqui vou dizer que errei o título. O título estava errado, o Senhor dos Anéis, só o primeiro episódio. Então, "O Senhor dos Anéis, a Sociedade do Anel".
Pronto. Em seguida, vamos testar nossa requisição com send, put, livros, barra 1, e ele retornou o array novamente, como havíamos solicitado que retornasse o array inteiro como resposta, e ele alterou o título do ID1, "O Senhor dos Anéis, a Sociedade do Anel".
O que fizemos aqui foi praticar como utilizamos o Express para vários métodos, os métodos do HTTP para várias operações que precisamos ser capazes de realizar em uma API. Buscar vários dados, buscar um dado, criar um dado novo, alterar um dado. Só falta conseguirmos excluir um dado, o que faremos em seguida.
E, além do corpo, passamos dados, enviamos dados de uma requisição via corpo da requisição, também conseguimos passar certos tipos de dados específicos de outras maneiras, por exemplo, via param, parâmetro da rota, que utilizamos aqui, assinalando com dois pontos.
Em seguida, o Express pegou esse valor, alterou na rota, e assim conseguiu processar a requisição conforme precisávamos, com o número do ID, com o dado correto.
Portanto, só falta o delete, vamos finalizar aqui nosso primeiro teste com rotas do Express.
Após realizarmos operações para buscar livros, alterar seus registros e criar um novo livro, a última operação bastante comum que vamos realizar é a exclusão de um registro. Seja um livro, uma postagem em uma rede social, uma inscrição, etc.
Já que utilizamos app.put, app.post e app.get para as operações anteriores, para realizar a exclusão, utilizaremos app.delete.
Os métodos delete, post e put são provenientes do Express. Os parâmetros para o app.delete são exatamente os mesmos das outras operações. O primeiro parâmetro será uma string com a rota que será acessada com o método delete. Será algo como "/livros/:id", onde id é o identificador único do livro que desejamos excluir.
O segundo parâmetro é uma função que recebe req e res (requisição e resposta, respectivamente). Como estamos ainda utilizando um array do JavaScript, continuaremos a usar os métodos nativos para manusear esse array.
app.delete("/livros/:id", (req, res) => {
  // código
});
COPIAR CÓDIGO
Exemplo de como a função poderia ser implementada:
app.delete('/livros/:id', (req, res) => {
  const index = buscaLivro(req.params.id);
  livros.splice(index, 1);
  res.status(200).send('Livro removido com sucesso.');
});
COPIAR CÓDIGO
Como você pode observar acima, utilizamos a mesma função buscaLivro que utilizamos nas operações anteriores para localizar o índice do livro pelo id no array. Copiaremos da função app.put a linha que contém a chamada da função buscaLivro(req.params.id) e a inseriremos dentro do app.delete.
Uma vez que temos o índice do livro, podemos deletá-lo utilizando o método nativo do JavaScript splice, que consegue localizar um elemento em qualquer parte do array e deletá-lo.
Como queremos só deletar o registro, passaremos dois parâmetros para o splice: o primeiro será o index e depois 1, pois queremos deletar apenas um elemento do array.
app.delete('/livros/:id', (req, res) => {
    const index = buscaLivro(req.params.id);
    livros.splice(index, 1);
    
})
COPIAR CÓDIGO
No final da operação, precisamos enviar uma resposta, que pode ser um status 200 (OK) ou 204 (Sem conteúdo). Optei por utilizar o status 200 e mandar uma mensagem informando que o livro foi removido com sucesso. A resposta será então res.status(200).
Em seguida, usaremos .send em vez de .json, pois não tem motivo para retornarmos algum objeto nesse caso. Dentro de .send passaremos a mensagem "livro removido com sucesso".
Como sempre, após realizar mudanças no código, é importante testar se elas estão funcionando conforme o esperado. Portanto, primeiro verificaremos se o servidor está funcionando corretamente, e em seguida utilizaremos o Postman para testar a operação que acabamos de criar.
No Postman, faremos um GET para buscar todos os livros e verificar se o array é retornado corretamente. Em seguida, realizaremos um POST para criar um novo livro, e por fim, realizaremos um DELETE para excluir um dos livros.
O método POST é usado para criar um novo livro. Durante este processo, nós utilizamos o corpo da requisição, formatado em JSON, para que o Postman envie um novo registro de livro. Ao clicar em "Send", um novo teste será realizado.
Quando o Postman retorna, ele também mostra o status code utilizado, neste caso foi o 201 ("Created"), usado quando um novo registro é criado. Com isso, o livro foi cadastrado com sucesso.
Em seguida, implementamos o método GET para obter um livro. No exemplo, vou solicitar o livro 3, que acabamos de criar. Então, utilizando o get, combinado com a URL "http://localhost:3000/livros/3", e ao apertar "Send", o Postman retorna apenas o objeto livro criado.
Agora podemos testar rapidamente os dois últimos métodos, PUT e DELETE. Vou solicitar a alteração do livro 1, que já havíamos criado anteriormente, alterando a URL para "http://localhost:3000/livros/1".
No caso de alteração, precisamos enviar, via corpo da requisição, os novos dados que desejamos substituir. Mantenho as informações anteriores e apenas altero o título. Ao clicar em "Send", o título é modificado e retorna o array completo, conforme solicitado quando criamos o método PUT.
Por último, vamos testar o DELETE. Para isso, vou copiar a URL "http://localhost:3000/livros/1" para utilizá-la no método DELETE. Após selecionar o método delete e colar a URL, vamos solicitar a exclusão do livro 1, que é "O Senhor dos Anéis".
Nesse processo, não é necessário enviar nada no corpo da requisição. Ao clicar em "Send", o retorno é "Livro removido com sucesso". Agora, se retornarmos à requisição GET e fizermos uma nova solicitação apenas para /livros, o livro de id 1, "O Senhor dos Anéis", deverá ter sido removido do array. Após o teste, o resultado é o seguinte:
{
    "id": 2,
    "titulo": "O Hobbit"
},
{
    "id": 3,
    "titulo": "O Silmarillion"
}
COPIAR CÓDIGO
O teste foi bem-sucedido, agora no array só contém o livro de id 2 e o livro de id 3.
Portanto, todo o nosso processo foi bem-sucedido e todas as operações que podemos realizar em um registro foram concluídas. O que fizemos nesta aula é conhecido como CRUD, que é um acrônimo que representa as operações básicas que são realizadas em um banco ou com um registro, que são:
•	Criar (Create)
•	Ler (Read)
•	Alterar (Update)
•	Deletar (Delete)
O "C" de criar é realizado pelo POST, o "R" de read (ler) é feito pelo GET, o "U" de update (atualizar) é feito pelo PUT e o "D" de delete (deletar) é feito pelo DELETE. Portanto, o CRUD é uma das bases do back-end, que engloba basicamente tudo o que fazemos com um registro.
Se você pensar bem, quando interage com uma página da internet, é, em essência, o que nós fazemos. Nós obtemos registros, criamos coisas, alteramos o que criamos e deletamos o que também criamos.
Você pode encontrar mais informações sobre o CRUD nas atividades extras. Agora nós vamos continuar evoluindo a nossa API e utilizando mais métodos do Express, agora com um banco de dados, para conseguirmos salvar o que estamos criando.
Vamos em frente!
Agora que o CRUD está completo, é o momento de substituirmos o array em memória e iniciarmos a persistência dos nossos dados.
Persistência de Dados
Quando falamos sobre persistência de dados, estamos nos referindo principalmente à capacidade de gravar, salvar ou armazenar nossos dados em uma base. A persistência de dados envolve alguns outros processos, mas inicia-se com a capacidade de armazenamento.
E afinal, o que são dados? No contexto que estamos trabalhando nesse curso, dados são todas as informações relativas ao nosso produto. Ou seja, são as informações sobre os livros, o preço de um livro, o nome, informações sobre autores, informações sobre editoras, etc.
Começamos lidando com os dados principais utilizando o que chamamos de formatos primitivos no JavaScript, como os formatos string, número e booliano, por exemplo. Contudo, dependendo do tipo de banco de dados, essa abordagem pode variar e hoje em dia trabalhamos com muitos outros tipos de dados.
Se pensarmos no WhatsApp, por exemplo, é possível enviar mensagem de texto, fotografias, GIFs, vídeos, áudios, etc.
Bancos de Dados SQL e NoSQL
Você pode ter ouvido falar sobre alguns tipos de banco de dados nos seus estudos. Mas, como eles funcionam e qual devemos escolher?
Uma das principais divisões entre os tipos de bancos de dados ocorre entre:
•	Os bancos SQL e
•	Os bancos NoSQL.
Bancos SQL incluem o MySQL, PostgreSQL, SQLite, MariaDB, entre outros. Já o MongoDB, que utilizaremos neste curso, é um exemplo de banco de dados NoSQL. Existem outros bancos NoSQL, como Cassandra, Redis, Neo4j, entre outros.
Os bancos SQL são muito antigos, existem desde os anos 70. Este é um dos formatos mais comuns de armazenamento de dados. SQL é uma sigla para Structured Query Language (Linguagem de Consulta Estruturada), e se trata de uma linguagem própria, que nós não veremos aqui.
Bancos SQL, na verdade, são gerenciadores SQL, mas quando falamos de um banco PostgreSQL ou MySQL, geralmente é entendido da mesma forma.
NoSQL pode significar tanto "não SQL" quanto "não apenas SQL". Na verdade, são todos os bancos que não são gerenciadores SQL. Eles têm usos muito diferentes e nem todos são bancos de objetos como o MongoDB.
O SQL se caracteriza pelo uso de tabelas relacionais, por isso também os chamamos de bancos relacionais. Os dados no SQL são estruturados no formato de tabelas, com colunas e linhas, semelhantes a uma planilha do Excel.
Um dos pontos principais do SQL é o relacionamento entre as tabelas. Se pensarmos nos dados de uma livraria, cada registro, por exemplo, um autor, tem seu ID, da mesma forma que foi feito no nosso array.
Mas, se quiséssemos relacionar esses autores aos títulos dos livros que eles escreveram, não repetiríamos o nome do autor, e sim faríamos referência pelo seu ID.
Em relação ao autor de ID 120, por exemplo — no caso do nosso array, este número corresponde a JRR Tolkien —, todos os livros que fossem inseridos na tabela de livros teriam seu autor referenciado pelo número ID.
No caso de Tolkien que possui o ID 120 na coluna id da tabela de autores, ele seria referenciado pelo ID 120 na coluna autor_id presente na tabela de livros. Essa referência entre tabelas evita a repetição de informações e é uma das caraterísticas mais importantes do SQL.
Nas atividades desta aula, disponibilizaremos materiais sobre SQL para que possam ser consultados.
Portanto, se um autor possui o ID 121 na tabela de autores, ele estará associado aos livros de sua autoria na tabela de livros, referenciados pelo ID 121.
Já no âmbito do NoSQL, os bancos de objetos como o MongoDB, por exemplo, são bancos de documentos. Nesse caso, a duplicação de dados não é problema, podemos repetir dados, o que será explorado ao longo do curso.
O ponto mais importante em bancos de objetos como o MongoDB é facilitar o manejo de estruturas mais complexas e ser mais rápido. Ou seja, armazenamos todas as informações juntas. Ao invés de estarem em várias tabelas diferentes, todas as informações de um livro são armazenadas juntas para serem consultadas de uma maneira mais rápida.
Portanto, neste contexto, não temos tabelas separadas que precisam ser consultadas para construir um objeto livro toda vez que precisamos trazer um registro de livro do banco.
Tanto os bancos de objetos quanto o SQL têm vantagens e desvantagens. Disponibilizaremos mais informações sobre isso nas atividades do curso. Neste momento, precisamos saber que vamos utilizar um banco de objeto e de documentos, neste caso, o MongoDB.
Agora que conhecemos um pouco mais sobre os tipos de banco e aspctos de cada um deles, vamos criar a primeira instância do MongoDB.
Neste curso, vamos utilizar um serviço do MongoDB chamado Atlas, ou Mongo Atlas. Este é um serviço de armazenamento de bancos de dados Mongo na nuvem. Dessa forma, não precisaremos instalar o banco de dados localmente, nem hospedá-lo em um servidor local.
Entre os materiais deste curso, há algumas instruções iniciais para a criação de sua conta no site do MongoDB. Agora, vamos criar uma instância gratuita.
Criando uma Instância do MongoDB
Vamos ao navegador, no qual devemos estar conectados à conta, na qual criamos uma organização chamada Alura. Contudo, você pode nomeá-la como preferir.
Vamos acessar essa organização. Na página "Projects", daremos início ao primeiro projeto ao clicar em "New Project", botão localizado à direita do título da página. Recomendamos que você acompanhe o processo.
Depois do vídeo, haverá uma atividade explicativa em texto para ser consultada, caso tenha alguma dificuldade, ou caso a interface do Atlas tenha sido modificada após a gravação do curso.
Ainda assim, é importante acompanhar o vídeo, pois o procedimento deverá ser igual.
Ao clicar em "New Project", veremos a página "Create a Project" com duas guias: "Name your Project" (Nomeie seu projeto) e "Add members" (Adicione membros). Na primeira, haverá um campo de texto para o nome do projeto. Vamos nomeá-lo de "Livraria" e, em seguida, clicaremos em "Next" (Próximo), o que nos levará para a segunda guia.
No que diz respeito à adição de membros, não será necessário adicionar ninguém para o contexto deste projeto, pois trata-se de um exemplo para nosso aprendizado. Portanto, apenas vamos prosseguir clicando no botão "Create Project" (Criar Projeto), no canto inferior direito da página.
Após criado o projeto, será direcionada para a tela "Database Deployments" (Implantação da Base de dados) para criar uma nova base de dados. Vamos clicar no botão "Build a Database", no centro da página.
Seremos direcionados à página "Deploy your database" (Implante sua base de dados), na qual haverá uma seção com algumas opções de custo apresentadas. Vamos escolher a última opção à esquerda: "Free", que é gratuita.
Na seção "Provider" (Provedor), abaixo da anterior, manteremos o Provider, como AWS, que já estará selecionado. Não é necessário realizar nenhuma alteração. No campo "Name", é possível nomear o cluster (grupo de dados), mas manteremos o nome padrão, que é "Cluster0".
Manteremos o campo da seção "Tag" vazio, sem adicionar nenhuma tag. No final da página haverá a seção "Free", com o botão "Create". Clicaremos nele para seguir adiante e sermos direcionados para a página "Security Quickstart" (Inicialização Rápida de Segurança".
Nesta página, forneceremos os dados de acesso a esse banco de dados. Existe mais de uma forma de fazer isso.
Optaremos pelo acesso mais simples, que é somente com Username (nome de pessoa usuária) e Password (senha). Para isso, na seção 1, clicaremos na opção "Username and Password" à esquerda da opção "Certificate" (certificado).
No campo Username, escreveremos "admin" e em Password, escreveremos "admin123", para lembrarmos facilmente. Este banco será usado apenas localmente e, provavelmente, quando você estiver assistindo a este curso, ele já terá sido excluído.
Por fim, clicaremos no botão verde "Create User" para criar o login com esses dados e desceremos para a seção 2, que inicialmente nos indaga por onde queremos nos conectar.
A conexão ao banco de dados será feita através do meu ambiente local. Portanto, manteremos a seleção da opção "My Local Environment" (meu ambiente local), à esquerda de "Cloud Environment" (ambiente em nuvem).
A última parte de configuração na seção 2 consiste em selecionar os IPs que terão acesso ao banco. Será adicionado automaticamente o IP "177.8.171.44/32" na lista, contudo, adicionaremos outro, escrevendo "0.0.0.0/0" e clicando no botão "Add Entry" (adicionar entrada).
Este número de IP permite o acesso ao banco de qualquer lugar. Vamos manter esse acesso livre, por enquanto. Este não é um procedimento recomendado para produção, mas é comum em bases de dados para estudos, e serve para facilitar a configuração do banco. Posteriormente,você pode deletar o seu banco.
Após a adição deste IP, clicaremos no botão "Finish and Closed" (Finalizar e Fechar), no canto inferior direito da página.
Após o clique, seremos parabenizados pela criação do primeiro banco de dados em uma janela modal, na qual clicaremos em "Go to Database" (Ir para a Base de dados) para voltar à página "Database Deployments", onde deverá aparecer o "Cluster0".
O que criamos no processo anterior consiste em um banco de dados do MongoDB, hospedado em um serviço em nuvem fornecido gratuitamente pela própria empresa. Precisamos agora conectar esse banco à API.
Conectando o Banco à API
À direita do nome "Cluster0", vamos clicar no botão "Connect" (Conectar). Ele abrirá uma janela modal com algumas opções para conectar a API ao banco de dados que acabamos de criar na nuvem.
Clicaremos na primeira opção, chamada "Drivers", para fazer a conexão por meio das bibliotecas do MongoDB em nosso projeto e através da connection string (string de conexão).
Após o clique, iremos para a etapa "Connecting with MongoDB Driver" (Conectando-se com o Driver do MongoDB). A primeira coisa que vamos fazer é selecionar o driver e a versão nos campos de lista selecionáveis "Driver" e "Version". Nesse caso, vamos usar o Node.js na versão 5.5 ou posterior, que é a mais recente, portanto, selecionaremos "Node.js" no primeiro campo e "5.5 or later" no segundo.
Agora, vamos instalar o Driver do MongoDB. Basicamente instalaremos a biblioteca ou dependência do MongoDB em nosso projeto com o conhecido comando npm install. Para isso, copiaremos a linha que a plataforma fornece na seção 2, "Install your driver" (Instale seu driver):
npm install mongodb
COPIAR CÓDIGO
Acessando novamente o terminal do computador, faremos um "Ctrl+C" para derrubar o servidor local. Lembrando que ao fazer instalações, precisamos necessariamente derrubar o servidor e reativá-lo.
Vamos colar e rodar no terminal o comando npm install mongodb para instalar. Após a conclusão desse processo, voltaremos à janela modal da plataforma do MongoDB, onde já completamos a etapa 2 de instalar a dependência do MongoDB em nosso projeto.
A última etapa, a 3, envolve a connection string (string de conexão) que o Atlas fornece. Uma connection string é basicamente o endereço que usaremos para conectar nossa base de dados à aplicação. Esse tipo de abordagem é muito comum para conexões de bancos de dados, não apenas para o Mongo.
Vamos copiar a linha que o Mongo Atlas está fornecendo na seção 3 e fechar a janela modal pressionando o botão "Close" (Fechar), no canto inferior direito.
mongodb+srv://admin: <password>@cluster0.uvmwiwx.mongodb.net/?retryWrites=true&w=majority
COPIAR CÓDIGO
Vamos voltar ao projeto pelo Visual Studio Code. Podemos colar esta connection string no arquivo app.js, abaixo do export default app. Vamos comentá-la, apenas para salvá-la e podermos usar mais tarde.
// Código omitido

export default app

// mongodb+srv://admin: <password>@cluster0.uvmwiwx.mongodb.net/?retryWrites=true&w=majority
COPIAR CÓDIGO
Por enquanto, não iremos à API. Voltando à página do MongoDB no navegador, vamos criar pelo próprio Mongo Atlas um primeiro registro, para termos acesso ao nosso banco com pelo menos um documento e seu registro.
Nossa base de dados "Livraria" existe, mas ainda não contém nenhuma coleção. O que é uma coleção?
Um banco MongoDB é composto por coleções de documentos. Em uma livraria, "Livros" é uma coleção de livros, "Autores" é uma coleção de autores. Vamos criar a nossa primeira coleção.
Para isso, vamos clicar na opção "Browse Collections" (navegar por coleções), à direita do nome "Cluster0" e dos botões "Connect" e "View Monitoring". Essa ação nos redirecionará para a página do "Cluster0" e acessará a guia "Collections".
Ainda não temos nenhuma coleção, mas se descermos a página da guia "Collections", temos um botão que diz "Add My Own Data" (Adicionar meus próprios dados). Vamos clicar nele para abrir a janela modal "Create Database" (Criar Base de dados), que possui três campos digitáveis: "Database name" (Nome da Base de dados), "Collection name" (Nome da coleção) e "Additional Preferences" (Preferências adicionais).
O nome da base de dados será "livraria" e o nome da coleção, por se tratar de uma coleção de livros, será "livros". Não necessitamos de nenhuma preferência adicional, portanto manteremos esse campo vazio. Por fim, clicaremos em "Create", no canto inferior direito do modal.
Aguardaremos um momento para carregar a guia "Collections". Após esse processo, vemos agora a nossa coleção "livraria.livros". Se trata de um nome de objeto, portanto, vemos a estrutura de objetos, separando o banco e a coleção por um ponto.
Ainda não temos nenhum documento, portanto, clicaremos no botão "Insert Document" (Inserir Documento), no canto direito da página. O clique abrirá a janela modal "Insert Document", na qual veremos uma estrutura de objeto.
#	#	#
1	_id: 64c2a45ad5a0d7f958add9e0	ObjectId
2	: " "	String
Por meio dessa janela, o MongoDB nos permite criar e adicionar um livro na nossa base. Como se trata de um livro, começaremos adicionando um titulo do tipo String na linha 2, à esquerda dos dois pontos. Esse título será "O Senhor dos Anéis".
#	#	#
1	_id: 64c2a45ad5a0d7f958add9e0	ObjectId
2	titulo: "O Senhor dos Anéis "	String
Além do título, um livro pode ter um autor, mas não vamos adicionar neste momento. Vamos clicar no botão "+" abaixo do número das linhas para criar a linha 3, na qual vamos dizer que esse livro tem uma editora, que chamaremos de "Editora Clássicos", apenas para não mencionar um nome real.
Criaremos a linha 5, na qual definiremos um preço de 10reais, para que o livro seja bem acessível.
Por fim, podemos também definir o número de páginas. Criaremos mais uma linha com o campo paginas, que receberá o valor de 200 páginas.
Vamos clicar nos campos de tipos correspondentes aos campos de preço e de páginas, inicialmente marcados como String, e alterá-los para Int32, que representa um tipo numérico. Isso permite que possamos fazer operações com esses números.
#	#	#
1	_id: 64c2a45ad5a0d7f958add9e0	ObjectId
2	titulo: "O Senhor dos Anéis "	String
3	editora: "Classicos"	String
4	preco: 10	Int32
5	paginas: 200	Int32
Portanto, teremos duas informações em formato de String, sendo elas Título e Editora, e outras duas em formato numérico, Preço e Páginas.
Clicaremos no botão "Insert", no canto inferior direito do modal, e um novo livro será criado em nossa base de dados. Veremos na seção da coleção "livraria.livros" o seguinte documento:
_id: ObjectId('64c2a45ad5a0d7f958add9e0')
titulo: "O Senhor dos Anéis"
editora: "Classicos"
preco: 10
paginas: 200
COPIAR CÓDIGO
Ao criar um novo livro, é gerado automaticamente um documento correspondente dentro da coleção de livros. Cada documento consiste em um livro único com um ID próprio, um título, uma editora, preço e número de páginas.
Criamos um banco de dados do MongoDB na nuvem. Já inserimos até mesmo um registro, de modo que, ao conectarmos o banco à nossa API, já devemos conseguir recuperar esse registro do banco de dados e fazê-lo aparecer no Postman.
Agora, vamos aprender como conectar as duas partes.
Temos agora uma API e um banco MongoDB criado na nuvem. O próximo passo é conectar estas duas partes.
Conectando o Banco MongoDB à API
Como funciona essa integração? Para utilizarmos qualquer tipo de banco de dados, seja SQL, NoSQL, normalmente precisamos realizar algumas instalações, como instalar os drivers do banco, arquivos necessários, etc. A menos que estejamos usando Docker, o que não abordaremos neste curso.
No nosso caso, utilizamos o MongoDB Atlas, que cuidou da parte de instalação do banco, portanto não precisamos nos preocupar com isso. No entanto, ainda precisamos utilizar uma biblioteca que atue como intermediário entre o NodeJS e o MongoDB.
Pode surgir a pergunta: "Mas nós não já instalamos o MongoDB?" Sim, instalamos as dependências do banco. Porém, o que faremos agora é instalar outra biblioteca que será responsável por conversar com o MongoDB e realizar as operações de banco para nossa aplicação Node, assim como o Express age como biblioteca responsável pelas rotas e pelas requisições.
O nome desta biblioteca já apareceu no navegador, é Mongoose. Existem outras bibliotecas que também desempenham esse papel de conectar bancos com APIs Node, mas vamos usar esta, pois é bem enxuta. Portanto, para esse momento em que o foco está na API, será mais tranquilo.
Instalando o Mongoose
Como instalamos uma nova biblioteca? Vamos ao terminal, rodar npm install, ou npm i junto ao nome mongoose, e para instalar exatamente a versão que usada neste curso, escreveremos mongoose@7.3.4, que é a última versão no momento atual.
É uma biblioteca pequena, portanto, deve ser instalada rapidamente. Após esse processo, podemos voltar para nossa aplicação no VS Code e fazer a conexão usando a string de conexão abaixo trazida do MongoDB Atlas e que deixamos pronta no arquivo app.js.
// mongodb+srv://admin: <password>@cluster0.uvmwiwx.mongodb.net/?retryWrites=true&w=majority
COPIAR CÓDIGO
Para isso, vamos acessar o explorador lateral esquerdo e criar, na pasta "src", uma nova pasta chamada "config" para armazenar os arquivos de conexão. Dentro desta, criaremos um arquivo chamado dbConnect.js.
No interior deste arquivo, utilizaremos a string de conexão. Vamos cortá-la do arquivo app.js, onde estava apenas guardada, e colá-la no dbConnect.js com "Ctrl+V".
Antes de mais nada, precisamos importar os métodos do Mongoose que acabamos de instalar. Para isso, escrevemos o comando abaixo na primeira linha do arquivo.
import mongoose from "mongoose";

// mongodb+srv://admin: <password>@cluster0.uvmwiwx.mongodb.net/?retryWrites=true&w=majority
COPIAR CÓDIGO
Com isso, podemos utilizar os métodos da biblioteca. Entre o import e o comando do MongoDB, vamos utilizar mongoose.connect(), que recebe como parâmetro a nossa string de conexão, que deve estar entre aspas, pois se trata de uma string.
Para isso, vamos recortar essa string e colá-la entre os parênteses do método.
import mongoose from "mongoose";

mongoose.connect("mongodb+srv://admin: <password>@cluster0.uvmwiwx.mongodb.net/?retryWrites=true&w=majority")
COPIAR CÓDIGO
Se observarmos esta string de conexão, ela contém algumas informações. Uma delas é admin:, o nome de usuário que definimos quando criamos o banco, e a outra é <password>. No lugar de <password>, inseriremos o admin123. O Atlas não fornece a senha na string de conexão por segurança, portanto precisamos adicioná-la.
import mongoose from "mongoose";

mongoose.connect("mongodb+srv://admin: admin123@cluster0.uvmwiwx.mongodb.net/?retryWrites=true&w=majority")
COPIAR CÓDIGO
Adicionando essa informação no dbConnect.js ela irá para o GitHub. Se preferir, você pode omitir o arquivo dbConnect.js, do GitHub e adicionar ao .gitignore. Mas, por enquanto, vamos deixá-lo dessa forma para facilitar as configurações.
Existem formas de proteger esses dados, impedindo que eles sejam enviados para o GitHub ou para o repositório. Porém, vamos abordar isso posteriormente. Por enquanto, esses dados podem ficar como estão, pois vamos fazer nossa primeira conexão.
Na string de conexão, há o cluster cluster0, que criamos. Temos também IDs criadas pelo MongoDB. Depois do trecho mongodb.net/, devemos adicionar livraria, que é o nome da nossa base de dados criada anteriormente. No final dessa instrução, temos que adicionar um ponto e vírgula.
import mongoose from "mongoose";

mongoose.connect("mongodb+srv://admin: admin123@cluster0.uvmwiwx.mongodb.net/livraria?retryWrites=true&w=majority");
COPIAR CÓDIGO
Para exportar tudo isso, acima dessa linha, vamos adicionar nosso método connect() dentro de uma função. Então, vamos criar uma function.
Uma parte interna dessa função servirá para conectar-se com o banco de dados. Portanto, ela deve ser uma função assíncrona.
Portanto, antes da palavra function, vamos passar a palavra-chave async. As operações assíncronas já foram abordadas nos cursos disponíveis como pré-requisitos para este. É essencial não esquecer dessa palavra-chave.
Vamos chamar essa função de conectaNaDatabase(). Não há necessidade de passar nenhum parâmetro nessa função, então simplesmente adicionaremos um par de parênteses e um par de chaves.
import mongoose from "mongoose";

async function conectaNaDatabase() {

}

mongoose.connect("mongodb+srv://admin: admin123@cluster0.uvmwiwx.mongodb.net/livraria?retryWrites=true&w=majority");
COPIAR CÓDIGO
Entre as chaves dessa função, a primeira linha será o nosso mongoose connect(), portanto, vamos movê-lo para este local. Abaixo dele, temos que retornar return mongoose.connection, que são métodos internos do mongoose. Ele vai se conectar com a string de conexão e devolver um objeto com todas as informações que precisamos para nos conectar com o banco e realizar as operações.
Por fim, abaixo dessa função assíncrona, vamos realizar um export default da nossa função conectaNaDatabase para que possamos chamar ela em outros pontos da aplicação.
async function conectaNaDatabase() {
  mongoose.connect("mongodb+srv://admin: admin123@cluster0.uvmwiwx.mongodb.net/livraria?retryWrites=true&w=majority");
    
  return mongoose.connection;
}

export default conectaNaDatabase;
COPIAR CÓDIGO
Agora, podemos voltar para o nosso arquivo app.js e importar o nosso conectaNaDatabase. No topo do arquivo, abaixo de import express, vamos colocar import conectaNaDatabase from. Ao digitar esse trecho, o próprio VSCode completará o comando com o caminho /.config/dbConnect para nós, mas sem o .js no final. Não podemos esquecer de acrescentar esse .js, pois o VSCode, apesar de ser bastante proativo, pode não acrescentar isso.
import express from "express";
import conectaNaDatabase from "./config/dbConnect.js";

// Código omitido
COPIAR CÓDIGO
Faremos a conexão abaixo da linha da importação. Para isso, vamos criar uma constante chamada conexao. Ela receberá um await, lembrando que o conectaNaDatabase() é async, e por isso precisa de um await para funcionar corretamente. Assim, temos await conectaNaDatabase().
import express from "express";
import conectaNaDatabase from "./config/dbConnect.js";

const conexao = await conectaNaDatabase();

// Código omitido
COPIAR CÓDIGO
Com isso, temos uma instância dessa conexão e os dados dela estarão salvos na nossa constante conexao. Para gerenciar essa conexão, vamos criar dois métodos abaixo da nossa constante conexao. O primeiro será conexao.on().
Normalmente, em JavaScript, os métodos que têm o nome on estão relacionados a algum evento. Portanto, podemos esperar que o primeiro parâmetro desse método seja algum tipo de evento, como um evento de conexão aberta, um evento de conexão fechada ou um evento de erro.
O primeiro parâmetro desse método será uma string com a palavra error entre aspas duplas, para que, antes de tratarmos o sucesso da conexão, possamos receber algum aviso caso a conexão não dê certo.
O segundo parâmetro será a arrow function (função seta) (erro) => {}. Essa função vai receber um parâmetro chamado erro entre parênteses para capturar qualquer erro que seja recebido na nossa conexão.
Entre as chaves, informaremos um console.error() para verificar no terminal qual foi o erro ocorrido. Entre os parênteses deste, adicionaremos a string erro de conexão entre aspas duplas e seguida, adicionar vírgula e solicitar a impressão do conteúdo de erro no console.
const conexao = await conectaNaDatabase();

conexao.on("error", (erro) => {
  console.error("erro de conexão", erro);
});
COPIAR CÓDIGO
Portanto, a função on será acionada se o evento que ocorrer na conexão for um erro. Lembrando que error é uma string que está em uma lista de eventos possíveis oriunda do mongoose.
Se ocorrer algum erro na conexão, este será recebido como parâmetro pela função e será impresso no console.error() com uma mensagem em português.
É interessante usar mensagens em português nos consoles para facilitar a localização no terminal.
Em seguida, o erro será retornado. Este será um erro em inglês, com mais detalhes.
Abaixo de conexao.on(), precisamos adicionar mais um método, que será conexao.once().
conexao.once() é um método que também aguarda por um evento específico. Neste caso, o evento será de conexão e o nome desse evento é "open", que indica uma conexão aberta.
Portanto, o primeiro parâmetro será uma string "open" e o segundo será uma arrow function que não precisa receber qualquer parâmetro.
Entre as chaves desse método, ao invés de console.error(), vamos usar o console.log("Conexão com o banco feita com sucesso") para sinalizar que a conexão com o banco foi bem-sucedida..
const conexao = await conectaNaDatabase();

conexao.on("error", (erro) => {
  console.error("erro de conexão", erro);
});

conexao.once("open", () => {
    console.log("Conexão com o banco feita com sucesso");
})
COPIAR CÓDIGO
Agora, podemos retornar ao terminal para testar tudo o que foi criado e verificar se esta realmente se conectando ao banco de dados.
Lembre-se, para iniciar nosso servidor local, usamos o comando npm run dev.
npm run dev
COPIAR CÓDIGO
Veremos a mensagem "servidor escutando", indicando que o servidor foi iniciado. Abaixo dela, será impressa a mensagem "Conexão com o banco feita com sucesso".
servidor escutando!
Conexão com o banco feita com sucesso
Isso significa que nossa biblioteca Mongoose conseguiu se conectar à string através do nosso método dbConnect() e passar essas informações para o app.js. Isso também significa que a conexão foi aberta sem erros.
Para confirmar se tudo está funcionando corretamente, podemos acessar o arquivo dbConnect.js e alterar qualquer informação na nossa string de conexão. Por exemplo, vamos remover o "123" da senha, salvar as alterações e tentar novamente no terminal.
async function conectaNaDatabase() {
  mongoose.connect("mongodb+srv://admin: admin@cluster0.uvmwiwx.mongodb.net/livraria?retryWrites=true&w=majority");
    
  return mongoose.connection;
}
COPIAR CÓDIGO
Com isso, veremos no terminal que ocorreu um erro na conexão imediatamente após salvar o arquivo.
Se subirmos o terminal para o início das mensagens de erro, veremos que o comando lançou o método conexao.on() que havíamos definido, pois a mensagem em português "erro de conexão" foi exibida junto ao erro interno do MongoDB autentication failed, indicando que a autenticação falhou.
erro de conexão MongoServer Error: bad auth: authentication failed
Em seguida, foi apresentado o stack trace, o qual não precisamos, uma vez que já sabemos o que ocorreu.
Voltando ao VS Code, vamos retornar à string de conexão, reverter as alterações com "Ctrl+Z" e salvar novamente. Com isso, a mensagem de sucesso é reexibida no terminal e tudo volta a funcionar como o esperado.
servidor escutando!
Conexão com o banco feita com sucesso
Devemos lembrar que o MongoDB é o nosso banco de dados e o Mongoose é a biblioteca que está criando essa interface entre o MongoDB e a nossa API. Ou seja, os métodos utilizados para conectá-los são internos da biblioteca do Mongoose – mongoose.connect() via conexao, mongoose.on() e mongoose.once().
Portanto, qualquer conexão com diferentes tipos de bancos de dados dependerá dessa interface, ou seja, da biblioteca que estamos usando para fazer essa conexão.
A seguir, poderemos finalmente deixar de lado o array local de const livros e começar a salvar dados de verdade no banco de dados.
Agora que a conexão entre o banco de dados e a API foi estabelecida com sucesso, vamos manipular esses dados na API. Vale lembrar que já temos um livro na nossa coleção de livros.
Neste vídeo, vamos alterar bastante código no app.js e criar alguns outros códigos para substituir o que fizemos anteriormente para lidar com o array local, que agora será tratado pelo Mongoose e pelo MongoDB.
Para começar, antes de alterarmos o app.js, criaremos um modelo do livro com o qual desejamos trabalhar. Por meio do explorador, vamos selecionar a pasta source e criar outra pasta dentro dela, chamada "models". Dentro da pasta nova, criaremos um arquivo chamado Livro.js, com "L" maiúsculo.
No interior desse arquivo, criaremos literalmente um modelo para qualquer livro que entre no banco, baseando-nos também nos métodos do Mongoose.
No topo do arquivo, como sempre, vamos importar o mongoose from "mongoose".
import mongoose from "mongoose"
COPIAR CÓDIGO
Abaixo dessa linha, vamos criar o modelo. Além dele, também criaremos algo que chamamos de schema (esquema).
Primeiro, vamos criar nossa constante chamada livroSchema e atribuí-la como igual a new Mongoose.Schema(), com "S" maiúsculo. Ela é uma função que vai receber alguns parâmetros.
Antes de começarmos a preencher o método Schema(), com parâmetros, devemos entender: o que é um esquema nesse contexto?
Definindo o Schema
Um Schema é um objeto de configuração que será usado para o Mongoose definir internamente a estrutura e as propriedades de um livro, um autor ou qualquer outro documento.
Neste caso, vamos passar para o Mongoose quais as propriedades que um livro precisa ter: autor, título, preço, descrição, o que quisermos. Ou seja, a descrição de um documento livro numa coleção de livros.
O parâmetro que passaremos dentro da função Schema() é um objeto, ou seja, um par de chaves ({}). Este possuirá as propriedades do nosso objeto livro, ou seja, entre as chaves, vamos adicionar as propriedades, começando pelo id, que receberá outro par de chaves.
Dentro do objeto de id, informaremos especificações do Mongoose. A primeira será a propriedade type, que se refere ao tipo do dado. Ela receberá um mongoose.Schema.Types.ObjectId, onde ObjectId é um tipo do MongoDB, usado para a criação de IDs únicos.
import mongoose from "mongoose"

const livroSchema = new mongoose.Schema ({
    id: { type: mongoose.Schema.Types.ObjectId },

});
COPIAR CÓDIGO
Abaixo de id, adicionaremos as propriedades do livro em si. O livro possui um titulo, que é normalmente uma string. Portanto, ele receberá um objeto por meio de um par de chaves e dentro deste, um type que será mongoose.Schema.Types.String. Neste caso, podemos passar somente String, com "S" maiúsculo, para simplificar.
No mesmo objeto, definiremos também a propriedade required: true, o que significa que a propriedade titulo é obrigatória. Ou seja, não conseguimos criar um livro sem passar o título dele.
Existem propriedades que não precisam ser obrigatórias, por exemplo, o número de páginas. Contudo, o título é fundamental.
Abaixo de titulo, definiremos as propriedades de editora, preço e número de páginas. Em todas elas, adicionaremos um par de chaves e um type: entre elas. a editora será do tipo String, enquanto as duas últimas são do tipo Number.
Abaixo, temos o código completo deste arquivo até agora.
import mongoose from "mongoose"

const livroSchema = new mongoose.Schema ({
    id: { type: mongoose.Schema.Types.ObjectId },
    titulo: { type: String, required: true },
    editora: { type: String },
    preco: { type: Number },
    paginas: { type: Number }
});
COPIAR CÓDIGO
Com isso, temos um esquema de um livro, ou seja, uma estrutura com todas as propriedades de um livro.
À direita do objeto livroSchema delimitado pelo bloco de chaves, adicionaremos o outro parâmetro do nosso mongoose.schema, que também será um objeto e, portanto, terá um par de chaves, entre as quais informaremos apenas uma propriedade, que será versionKey: false.
Esta versionKey está relacionada ao versionamento do MongoDB, que é uma funcionalidade um pouco mais avançada e que nós não configuraremos aqui. Ela foi adicionada apenas para informar que não desejamos versionar o nosso esquema.
import mongoose from "mongoose"

const livroSchema = new mongoose.Schema ({
    id: { type: mongoose.Schema.Types.ObjectId },
    titulo: { type: String, required: true },
    editora: { type: String },
    preco: { type: Number },
    paginas: { type: Number }
}, { versionKey: false });
COPIAR CÓDIGO
A partir deste esquema, podemos criar o nosso modelo Livro.
Criando um Modelo do Livro
Abaixo da definição do esquema, vamos criar uma nova constante, chamada simplesmente de livro, com "l" minúsculo, que será igual a mongoose.model, com "m" minúsculo.
Esse método vai receber dois parâmetros:"livros" e livroSchema. O primeiro será uma string referente à coleção. Criamos uma coleção livros no banco de dados, a qual iremos referenciar como string.
O segundo parâmetro informará para o modelo qual é a coleção a que ele se refere e qual é o esquema deste livro, ou seja, quais são suas propriedades.
No final do arquivo, adicionaremos o export default livro, que exporta o modelo livro para que possa ser usado pelo restante da aplicação.
import mongoose from "mongoose"

const livroSchema = new mongoose.Schema ({
    id: { type: mongoose.Schema.Types.ObjectId },
    titulo: { type: String, required: true },
    editora: { type: String },
    preco: { type: Number },
    paginas: { type: Number }
}, { versionKey: false });

const livro = mongoose.model("livros", livroSchema);

export default livro;
COPIAR CÓDIGO
Models (modelos) e Schemas (esquemas) são conceitos que não são exclusivos do Mongoose. Eles estão relacionados a APIs e bancos de dados. Você encontrará muitos tipos diferentes de modelos e esquemas para vários tipos de conexão com o banco enquanto estiver criando suas APIs.
No caso do Mongoose, isso é a maneira que ele tem de definir um esquema e um modelo.
Mas, afinal, o que é um modelo?
Neste caso, o modelo é um objeto que representa uma coleção e um banco de dados. O modelo em si é uma interface que permite à API interagir com os documentos de uma coleção. Ou seja, temos um modelo Livro como uma interface para que nossa API interaja com a coleção de livros que está no MongoDB.
Portanto, é o modelo que fornece para a API todos os métodos de que nós conseguiremos executar com o CRUD. O modelo é quem dirá à API que ela pode realizar o GET, o POST e a deleção de um livro.
A partir de agora, vamos usar o modelo e combiná-lo com o outro componente da API para finalmente acessar o nosso banco e trazer algum registro.
Vamos lá.
Agora que já temos o nosso modelo de livro criado, podemos alterar o arquivo app.js para que a rota se conecte com o MongoDB, ao invés de se conectar com o arranjo.
Conectando a Rota ao MongoDB
Vamos iniciar adicionando uma importação no topo do arquivo para importar o modelo livro, informando o caminho do arquivo Livro.js que está localizado dentro da pasta models.
import express from "express";
import conectaNaDatabase from "./config/dbConnect.js";
import livro from "./models/Livro.js";|
COPIAR CÓDIGO
Não precisamos mais do array const livros que utilizávamos anteriormente, então vamos excluí-lo. Também não utilizaremos mais a função buscaLivro(id) que estava relacionada a esse array, então também a excluiremos.
Agora, vamos refatorar a primeira rota, ou seja, o get que recolhe livros será modificado para retornar os livros que inserimos no banco.
Vamos acessar o segundo método app.get() de cima para baixo, que trabalha com a rota "/livros". Vamos manter o trecho app.get("/livros", (req, res) => como está, pois está sendo manipulado pelo Express. Já entre as chaves do método, chamaremos o modelo.
Como mencionado anteriormente, o modelo será responsável por definir como nós poderemos nos conectar e interagir com o banco de dados.
Entre as chaves do método, acima do res.status(), vamos criar uma const chamada listaLivros, que armazenará todos os livros que retornamos do banco. Ela será igual a um await livro.find(), onde livro é o modelo que importamos e find() é uma função que nesse caso receberá apenas um objeto vazio ({}).
app.get("/livros", (req, res) => {
    const listaLivros = await livro.find({});
    res.status (200).json (livros);
});
COPIAR CÓDIGO
Na linha de res.status(), a resposta que precisamos sempre enviar será a mesma, com status 200, mas o JSON agora retornará listaLivros ao invés do array livros.
app.getLivros = async (rec, res) => {
    const listaLivros = await livro.find();
    res.status(200).json(listaLivros);
}
COPIAR CÓDIGO
Devemos lembrar que, ao adicionar um await dentro de uma função, ela deverá se conectar com um async do lado de fora para que a função assíncrona funcione. Neste caso, adicionaremos o async à esquerda do (req, res), pois ele se referirá à função callback (função passada a outra como argumento) chamada dentro de app.get().
Nesse contexto, o .find() é um método do Mongoose que vai se conectar com o banco de dados MongoDB no Atlas que fará uma busca (find) e como nenhuma especificação foi passada, buscará tudo o que encontrar na coleção livros.
Vale lembrar que a coleção livros também está sendo passada dentro do modelo Livros, como mencionado anteriormente, e este modelo é responsável pela conexão com o banco e determina o que podemos fazer com ele.
Vamos examinar se tudo está funcionando corretamente. Para isso, vamos ao terminal para verificar se não há nenhum erro. Tudo parece estar bem, pois a conexão foi feita com sucesso.
Vamos ao Postman para realizar um GET em /livros. O endereço é o mesmo, "http://localhost:3000/livros" o método é o mesmo get, e ele não precisará receber nada na requisição, somente na resposta. Portanto, vamos clicar no botão "Send", no topo da página, à direita do endereço.
[
{

   "_id":"64c2a45ad5a0d7f958add9e0",
   
   "titulo": "O Senhor dos Anéis",
   
   "editora": "Classicos",
   
   "preco": 10,
   
   "paginas": 200
   
 }
 
COPIAR CÓDIGO
]
Na guia "Body", veremos que resultado está correto. Agora, ao invés de retornar o array, o get em localhost:3000/livros retornou exatamente o que inserimos manualmente no Atlas, no qual temos um id especificado pelo MongoDB.
Por enquanto, os métodos não funcionarão, pois ainda estão ligados ao array excluído. Mas não tem problema, pois vamos analisar esse caso posteriormente.
Antes de finalizar, temos um pequeno problema a abordar no VS Code. Como mencionado antes, a senha do nosso banco de dados está explícita no código e isso não pode ser carregado para o GitHub. Vamos refatorar o código e resolver isso agora?
Para isso, vamos acessar o arquivo dbConnect.js, no qual utilizaremos um recurso chamado variável de ambiente.
Refatorando com Dotenv e Variáveis de Ambiente
As variáveis de ambiente são utilizadas para separar informações variáveis sensíveis, como senhas e strings de conexão. Esses dados não podem ser compartilhados nem acessados livremente através de um repositório no GitHub.
Para resolver o problema em um projeto Node, primeiramente, vamos acessar o terminal e interromper a execução do nosso servidor. Em seguida, vamos executar o comando abaixo e fazer a instalação da biblioteca Dotenv, utilizada para gerenciar as variáveis de ambiente.
npm instal dotenv
COPIAR CÓDIGO
Essa biblioteca é de dimensão compacta e pode ser utilizada em sua última versão.
Após a sua instalação, como o utilizamos?
Voltando ao VS Code, criaremos um arquivo na pasta "src", raiz do projeto, que se chamará .env, com um ponto no início e sem .js, da mesma forma que o .gitignore.
No interior desse arquivo, estabelecemos as variáveis de ambiente, ou seja, as variáveis que representam todas as informações sensíveis que não podemos compartilhar. No nosso caso, a string de conexão.
Vamos voltar para o arquivo dbconnect.js e recortar a string de conexão inteira, removendo-a de mongoose.connect().
Voltando ao interior do arquivo .env, vamos criar o nome dessa variável. O padrão é escrever tudo em letras maiúsculas e com underline (_), portanto, criaremos a DB_CONNECTION_STRING. Ela receberá a string de conexão que vamos colar, sem a necessidade das aspas duplas.
DB_CONNECTION_STRING=mongodb+srv://admin: admin123@cluster0.uvmwiwx.mongodb.net/livraria?retryWrites=true&w=majority
COPIAR CÓDIGO
Após salvar o .env, vamos fechá-lo e abrir o arquivo .gitignore, pois é importante lembrar de incluir nele o .env no mesmo, abaixo de node_modules. Caso contrário, este arquivo acabará sendo enviado para o repositório do GitHub, invalidando o propósito de sua criação.
node_modules
.env
COPIAR CÓDIGO
Após essas etapas, precisamos iniciar o .env no ponto mais externo da aplicação, ou seja, o primeiro a ser acessado. No nosso caso, o ponto mais externo da aplicação é o server.js, que está na pasta raiz "src". No início desse arquivo, acima da linha de importação do app, vamos importar o .env utilizando o comando abaixo.
import "dotenv/config".
COPIAR CÓDIGO
Essa linha é suficiente para importar e iniciar o .env em nossa aplicação.
Vamos voltar ao dbConnect.js e acessar o entremeio dos parênteses do mongoose.connect(). Vamos substituir o seu conteúdo (que antes era a string de conexão) pela variável de ambiente. Para fazer isso, iremos nos referir a essa variável por process.env.DB_CONNECTION_STRING. O restante do código continuará igual.
async function conectaNaDatabase() {
    mongoose.connect(process.env.DB_CONNECTION_STRING);
    return mongoose.connection;
};
COPIAR CÓDIGO
Desse modo, protegemos as informações sensíveis usando variáveis de ambiente.
Essa variável ficará armazenada apenas localmente em nosso computador. Portanto, ela não será enviada para o GitHub e não precisamos mais nos preocupar com a string de conexão do banco sendo compartilhada.
Tudo pronto! Agora podemos enviar o projeto para o GitHub se quisermos. Já está tudo associado: o Mongo Atlas, o MongoDB através do Mongoose com a nossa API e o NodeJS.
A seguir, poderemos voltar à nossa aplicação e fazer os outros métodos - GET, POST, PUT e DELETE - funcionarem corretamente com o banco. Vamos lá!
Nesse momento da nossa aplicação, continuar desenvolvendo significa que precisamos parar um pouco e organizar nossa estrutura para que a aplicação possa crescer de forma organizada.
Olhando para o arquivo app.js, percebemos que ele já está bem comprido e fazendo muita coisa. Todas as rotas estão dentro dele e, neste momento, você deve ter percebido que isso está um pouco desorganizado.
É difícil expandir essa aplicação sem acentuar ainda mais a desorganização se continuarmos desta forma. Torna-se complicado alterar coisas no futuro, encontrar quais partes da aplicação estão realizando determinadas tarefas, e assim por diante. Portanto, nosso foco aqui é aliviar um pouco a responsabilidade do app.js e deixá-lo responsável apenas pela criação da nossa aplicação com o Express.
A primeira coisa que faremos é focar nas rotas, separar nossas rotas e extrair nossos apps.get e apps.post do app.js. No entanto, antes de se concentrar nas rotas em si, nós vamos organizar um pouco melhor a parte de requisição e resposta, ou seja, a parte que recebe a requisição e monta as respostas via Express.
Para isso, nós vamos utilizar uma estrutura que chamamos de controller (controladores).
Antes de aprofundarmos no que são controladores, vamos observar um pouco na prática.
Na nossa pasta "src", vou criar uma nova pasta chamada "controllers" e, dentro dela, vou criar nosso primeiro controller que será livroController.js.
Dentro do controller, nós centralizaremos toda a lógica que está relacionada às ações que podem ser feitas em um livro, ou seja, o que as rotas vão chamar para executar as operações e o manuseio das requisições e respostas correspondentes.
No livroController.js, vamos criar nosso primeiro controller.
Como ele fará uma interface entre as requisições e o que acontecerá em cada requisição, significará que vamos transferir nossa importação do modelo Livro para cá. Começando na primeira linha, realizaremos a importação do nosso modelo Livro.
import livro from "../models/Livro.js";
COPIAR CÓDIGO
Não se pode esquecer do .js, já mencionei isso várias vezes.
O controller será uma classe com vários métodos. Vou utilizar a palavra-chave class para criar o LivroController. Lembrando que as classes sempre começam com letra maiúscula. A classe em si não recebe parâmetros, apenas abre e fecha chaves. E já vamos exportar essa classe. Portanto, no final do arquivo, export default LivroController:
import livro from "../models/Livro.js";

class LivroController {

};

export default LivroController;
COPIAR CÓDIGO
Agora, temos uma classe que terá vários métodos, um para cada coisa, para cada operação que conseguiremos fazer no Livro. Incluindo o recebimento e manuseio das requisições e respostas. Vamos começar criando o primeiro método da nossa classe LivroController.
Criaremos um método para listar livros. Nosso primeiro get, o getAll, que nós chamamos. Criarei com a palavra-chave static e a palavra-chave async. Portanto, static async, chamarei esse método de ListarLivros. Agora sim, ele vai receber dois parâmetros.
Quais serão esses parâmetros? Como o controller vai manusear as requisições e as respostas, esses serão os parâmetros que ele vai receber. Portanto, req, res, e então vou abrir e fechar chaves. Isso aqui não é uma arrow function.
import livro from "../models/Livro.js";

class LivroController {
 
    static async ListarLivros (req, res) {
    
    }

};

export default LivroController;
COPIAR CÓDIGO
E o que é static async? Async nós já sabemos, porque esse método terá que se conectar com o banco, então será uma operação assíncrona. O static é uma palavra-chave que usamos quando queremos usar métodos de uma classe sem ter que, antes, instanciar essa classe. Ou seja, eu não quero criar um new LivroController e só, então, conseguir usar os métodos. Eu quero poder chamar eles de forma estática. Portanto, é para isso que essa palavra-chave está aí.
Vamos ver esse método sendo chamado em breve, e tudo fará mais sentido.
Então, o que o método ListarLivros() faz? Vamos criar aqui uma constante listaLivros... Na verdade, não precisamos criar esta constante, porque o que vai acontecer aqui é exatamente o que ocorre no arquivo app.js, dentro do nosso método getLivros.
Portanto, vamos acessar o app.js e copiar as duas linhas que representam a implementação da função.
const listaLivros = await livro.find({});
res.status(200).json(listaLivros);
COPIAR CÓDIGO
Por enquanto, podemos comentar nosso método app.get que está no app.js. Vamos voltar ao arquivo livroController e colar essas duas linhas doconst listaLivros. Nosso código vai ficar assim:
import livro from "../models/Livro.js";

class LivroController {
 
    static async ListarLivros (req, res) {
      const listaLivros = await livro.find({});
    res.status(200).json(listaLivros);
    }

};

export default LivroController;
COPIAR CÓDIGO
Agora, começamos a reorganizar, estamos removendo algumas implementações do arquivo app.js e separando isso em um controlador separado. E por fim, podemos focar na parte restante do app.get, que é criar as rotas que também serão removidas do app.js.
Também vamos separar as rotas, criando diretórios para elas. Dentro deste diretório, vou criar um arquivo que chamaremos de livrosRoutes, onde "routes" é a tradução para "rotas" em inglês.
Aqui, começamos a organizar a parte das rotas, responsabilidade que também é do Express.
No arquivo livrosRoutes, vou importar o express. E já que a rota precisa se conectar ao controlador, vou importar também nosso controlador.
import express from "express";
import LivroController from "../controllers/livroController.js";
COPIAR CÓDIGO
Agora, podemos começar a definir as rotas. O Express tem um método específico para lidar com as rotas, e vamos chamá-lo agora. Então, vamos criar uma constante que será chamada routes, igual a express.Router().
Abaixo, vamos chamar o routes que criamos e chamar o método .get(). Agora, vamos abrir e fechar parênteses e podemos passar para ele a nossa rota, da mesma maneira que estávamos fazendo no arquivo app.js. Assim, o primeiro parâmetro será uma string /livros. Se voltarmos ao app.js, o segundo parâmetro era uma função que estava sendo chamada diretamente aqui, uma função callback.
Entretanto, agora, já temos essa função definida dentro do livroController. Dessa forma, no nosso livrosRoutes, o primeiro parâmetro fica como está, e o segundo parâmetro, ao invés da função callback, será agora LivroController.listarLivros, sem abrir e fechar parênteses, pois só estamos passando aqui uma referência ao método que deve ser chamado.
import express from "express";
import LivroController from "../controllers/livroController.js";

const routes = express.Router();

routes.get("/livros", LivroController.listarLivros);
COPIAR CÓDIGO
Portanto, agora nós podemos regressar ao app.js e excluir o seguinte trecho:
app.get("/livros", async (req, res) => {
  const listaLivros = await livro.find({});
  res.status(200).json(listaLivros);
});
COPIAR CÓDIGO
Porque já separamos as duas partes: a parte do controlador, que administra a requisição e a resposta, e a parte das rotas, que é o método .get e a função que é executada quando essa rota é chamada. Essencialmente é o que o nosso routes.get está fazendo através do Express.
Conclusão
Sabemos que uma aplicação pode ter inúmeras rotas, portanto, apenas para Livros já criamos cinco rotas diferentes. Além disso, vamos continuar criando rotas e organizando essas partes para que as rotas sejam chamadas de uma maneira mais eficiente pela aplicação. Em seguida, veremos como isto funcionará!
Agora que criamos o primeiro método no nosso controlador, nosso LivroController, vamos continuar aprimorando e criando mais métodos para tirar do app.js toda a parte de rotas e a parte de requisição e resposta, que é tudo para o Express resolver junto com o Mongoose.
Vamos trabalhar aqui no nosso app.post, que ainda está no app.js. Primeiramente, no LivroController, vamos adicionar um método para realizar os cadastros de livros.
Vamos criar um método static async que vou chamar de cadastrarLivro. Esse método, que cadastra um livro por vez, também vai receber requisição e resposta do Express.
  static async cadastrarLivro (req, res) {

  }
COPIAR CÓDIGO
No app.js podemos copiar apenas a linha de resposta res.status do app.post, pois a linha anterior livros.push ainda faz referência ao array que nem existe mais.
Dentro do LivroController, antes de implementar toda a lógica interna de ir no banco de dados, buscar um livro, etc., faremos o seguinte: dentro do método cadastrarLivro, vamos criar um bloco try/catch.
  static async cadastrarLivro (req, res) {
     try {
    
     } catch (erro)

  }
COPIAR CÓDIGO
Pequena observação sobre o try-catch: essa estrutura é utilizada quando queremos fazer manejo de erros e sucessos. Vou compartilhar mais material sobre esse tópico nas atividades, e durante o preenchimento do bloco, entenderemos melhor sua aplicação dentro do nosso método.
Dentro do try, vamos inserir a resposta que copiamos do app.js, que é o res.status(201).send(). No entanto, antes disso, precisamos entender como o Mongoose vai realizar o processo de post, de cadastrar um livro.
Vamos criar uma const novoLivro igual a await livro.create(). livro é o que está chamando o modelo do Mongoose e create() é o nome do método que o Mongoose utiliza para criar um registro no banco.
Como passamos o objeto que será criado para dentro do create()? Passaremos através da requisição req.body. O Express continua trazendo a requisição para nós, dentro da requisição tem a propriedade body e é essa propriedade que vamos passar pra dentro do create() que está fazendo toda interação com o banco.
O res.status(201) continua, mas agora precisamos substituir o .send por .json e podemos mandar uma resposta um pouco mais elaborada. Vamos mandar uma resposta mais clara do que está acontecendo.
Vamos abrir chaves para criar um objeto, a primeira propriedade será message, em seguida passaremos a string "criado com sucesso" e passaremos a propriedade livro: novoLivro. Porque novoLivro será o retorno do método create(). O Mongoose vai chamar o create() e esse método, por definição, vai retornar o objeto que foi criado, será guardado em novoLivro.
No catch, vamos criar uma resposta de erro mais genérica, vai ter um res.status com código 500, que é um código HTTP para erros internos no servidor, ou seja, indica que houve algum problema genérico que não é do cliente, mas do servidor. Isso é seguido por um .json que retorna um objeto com uma mensagem de erro estruturada.
Neste momento, criarei uma template string usando acento grave. Vou digitar cifrão e chaves e, nesta mensagem de erro, inserir a propriedade erro.message. E a mensagem será "falha ao cadastrar livro".
  static async cadastrarLivro (req, res) {
    try {
      const novoLivro = await livro.create(req.body);
      res.status(201).json({ message: "criado com sucesso", livro: novoLivro });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao cadastrar livro` });
    }
  }
COPIAR CÓDIGO
Mas, você deve estar se perguntando, o que faz o erro.message?
O bloco catch será executado se qualquer parte do código dentro do try retornar um erro em vez de sucesso. Portanto, se ocorrer qualquer instância de erro dentro do bloco try, automaticamente um objeto de erro será criado e transferido para dentro do bloco catch, podendo ser acessado por este parâmetro que chamei de erro. Normalmente, este parâmetro vem nomeado como error ou e, porém optei por erro, em português.
A partir desse momento, podemos capturar, dentro do parâmetro, qual foi o erro e este erro possui uma propriedade interna chamada message. Então, posso passar erro.message como uma string na minha mensagem.
Esta é a nossa primeira tratativa de erro para que possamos criar um código que erra de uma forma esperada. Isto é, os erros não derrubam nossa aplicação - se for possível - e nem permanecem desconhecidos. Podemos descobrir com mais clareza onde os erros estão ocorrendo.
Agora, devemos adicionar a rota do post no nosso arquivo de rotas, que criamos no livrosRoutes. Mas antes de atualizar as rotas, faremos uma pequena refatoração. Vou usar aqui um padrão, que podemos chamar de barril ou "barrel", que é um ponto de entrada para uma parte da aplicação.
No caso, como teremos bastante rotas, depois teremos rotas de autores, rotas de editoras e possivelmente muitas outras - cada uma podendo ter 5 ou mais rotas – faremos o seguinte: Dentro da pasta routes, criarei um arquivo que chamarei de index.js.
Esse index será, literalmente, o ponto de entrada das rotas, e é esse ponto de entrada que o resto da aplicação acessará.
Como isso funcionará?
No topo do arquivo index.js, vamos importar o express, pois é ele que gerencia nossas rotas.E também importarei livros:
import express from "express";
import livros from "./livrosRoutes.js";
COPIAR CÓDIGO
Em seguida, criaremos uma função para agrupar todas as rotas que receberemos. Chamada de const routes e criaremos uma arrow function aqui. Dentro desse parâmetro, passarei app. Veremos o que esse app fará mais tarde.
Para não me esquecer, já vou exportar no final do arquivo, antes de prosseguir, com export default routes.
import express from "express";
import livros from "./livrosRoutes.js";

const routes = (app) => {
};

export default routes;
COPIAR CÓDIGO
Essa função que vamos criar será no Express. Lembra quando falamos sobre middleware, esses mini programas que colocamos para o Express executar em determinados pontos da aplicação e que conseguem capturar nossas requisições e respostas, e as manipular? Temos que centralizar nossas rotas.
Então, escreveremos a função app.route(). Aqui dentro, vou passar a rota como string. Para criarmos nossa URL base, vamos usar app.route('/').
import express from "express";
import livros from "./livrosRoutes.js";

const routes = (app) => {
  app.route("/").get((req, res) => res.status(200).send("Curso de Node.js"));

};

export default routes;
COPIAR CÓDIGO
Agora, começaremos a incluir as rotas que estamos criando para livros. Futuramente, podemos criar rotas para autores e assim por diante.
Então, abaixo do nosso app.route, adicionaremos app.use. Lembrando que use é o método que nós usamos para incluir middlewares em nossa instância do Express. Com a sintaxe express.json(), incluiremos mais um parâmetro aqui, que será livros.
import express from "express";
import livros from "./livrosRoutes.js";

const routes = (app) => {
  app.route("/").get((req, res) => res.status(200).send("Curso de Node.js"));

  app.use(express.json(), livros);
};

export default routes;
COPIAR CÓDIGO
E o que é livros nesse caso? São as nossas rotas que estão sendo exportadas e importadas de livrosRoutes. Assim, app.use está pegando nosso middleware .json e todas as rotas de livros que estão sendo definidas dentro de livrosRoutes, passando para dentro de routes. A partir disso, o Express conseguirá gerenciar tudo de uma vez.
Agora, podemos voltar para app.js. No topo de app.js, não precisaremos mais importar livro do model, pois essa responsabilidade passou para o controller.
Sendo assim, podemos deletar essa linha. Em seu lugar, teremos que importar nossas rotas. Portanto, usamos import routes from routes/index.js. Ele já identificou e trouxe para nós com o JS no final desta vez.
Os primeiros gets que criamos anteriormente, o app.get na barra, que retorna "curso de Node", pode ser deletado. Podemos também deletar app.use express.json, porque passamos a responsabilidade desse middleware para nosso ponto de entrada das rotas. Por enquanto, vamos manter as outras rotas que criamos (get-livros-e-por-id, get-post), para assim podermos ir deletando-as com calma.
O que precisamos fazer agora é iniciar nossas rotas, que importamos. Aqui, routes é uma função, portanto, precisamos executar essa função. Abaixo, em nossa atribuição const app="express", sob app, simplesmente chamaremos a função routes que importamos. O que passaremos para dentro dela? O app. Agora, o app que definimos como parâmetro em nossas rotas, lá no index.js das rotas, sabemos de onde ele está vindo e o que ele é: essa é nossa instância do express.
Assim, criamos a função routes em routes-barra-index e executamos routes em app.js, passando nosso servidor express como parâmetro. Agora, tudo está fazendo mais sentido.
Finalmente, podemos testar no Postman para ver se conseguimos pelo menos trazer um livro do Atlas.
Ao ir para o terminal, ele está indicando um erro em import livros from livros-routes.js. Desta vez, a mensagem é tranquila, dizendo que não existe um export default. Portanto, provavelmente, quando escrevi o código de livros-routes.js, me esqueci de exportar as rotas. Então, no final do arquivo, daremos um export default em routes. Agora, tudo deve funcionar.
Com a mensagem "conexão com o banco feita com sucesso", meu erro já passou. Podemos voltar ao Postman. Já tínhamos feito alguns testes com o get em barra-livros que estava funcionando. Vou enviar novamente para ver se continua funcionando - está tudo ok, continua conectando com o banco e trazendo o nosso único livro.
Refatoramos bastante coisa. Se algo não estiver funcionando, dê uma olhada no repositório, compare o seu código para ver se não passou nada despercebido. Mas, por aqui, tudo certo. Podemos continuar, evoluindo a API e criando o restante das rotas. Vamos lá.
Continuando então a refatoração, verificamos que fizemos o GET para todos os livros e o POST para cadastrar um livro. Agora, precisamos lidar com funcionalidades para pegar um livro, atualizar um livro e deletar um livro.
Vamos começar criando uma função para listar um único livro. No nosso controller, vamos criar um método para pegar um livro por ID.
Porém, antes de continuar, vamos realizar uma pequena refatoração no primeiro método que criamos - o de listar livros. Vamos adicionar um bloco try-catch no método listarLivros.
No bloco try, colocamos todo o código que potencialmente pode gerar um erro e lidamos com as exceções. Assim, dentro do try, vamos inserir as duas linhas que foram criadas anteriormente para listar os livros.
Em seguida, dentro do bloco catch, criamos uma resposta genérica para os erros.
  static async listarLivros (req, res) {
    try {
      const listaLivros = await livro.find({});
      res.status(200).json(listaLivros);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha na requisição` });
    }
  };
COPIAR CÓDIGO
Agora, que fizemos essa refatoração, vamos continuar criando um método para pegar um único livro.
No controller, abaixo do método listaLivros(), vamos copiar o método recém-refatorado e modificar alguns aspectos para que ele passe a buscar um livro específico pelo ID.
Como vamos pegar um livro por id, já sabemos que devemos ter esse id referenciado na nossa rota. Como fizemos isso lá no app.js? Nós buscamos um livro recebido via req.params.id. Vamos manter isso igual, porque essa parte de pegar requisições e manejar pelo Express também vai continuar igual.
Em vez de usar o método find(), usaremos findById() que recebe o id que está vindo dos parâmetros. Então vamos criar uma const id onde guardaremos o resultado de req.params.id.
Podemos passar o id para dentro do livro.findById(). É o id do registro que ele vai pegar lá no banco. Após pegar esse id, ele vai salvar esse id dentro da variável livroEncontrado.
Na resposta continua sendo status 200, mas agora o JSON vai mandar apenas o livro encontrado.
  static async listarLivroPorId (req, res) {
    try {
      const id = req.params.id;
      const livroEncontrado = await livro.findById(id);
      res.status(200).json(livroEncontrado);
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha na requisição do livro` });
    }
  };
COPIAR CÓDIGO
Por enquanto, estamos usando mensagens de erro genéricas. No futuro, vamos avançar para usar formas mais sofisticadas de manejar e tratar erros.
Já temos um método para captar um livro do banco e mandar para nós via requisição.
Agora, podemos fazer a parte de atualizar livro, que será bem parecida com o que fizemos anteriormente. A atualização será semelhante à obtenção do livro por ID, mas terá uma pequena diferença. Vamos criar então este método.
Primeiramente, vou copiar o método listarLivroPorId, pois a atualização de um livro também necessitará do ID do livro (ou seja, req.params.id). Vou colar esse método ao final da nossa classe, abaixo do método cadastrarLivro. Em vez de chamar esse método de listarLivroPorId, vou nomeá-lo atualizarLivro. Ele também recebe req e res, possui o bloco try e precisa do ID do livro, que chega pelos parâmetros da rota.
No entanto, o método para atualizar o livro não será mais findById. Vou remover a parte const livroEncontrado e manter apenas a chamada da função, que será await livro.. Qual será o método aqui? O nome desse método será findByIdAndUpdate. Este método vem do Mongoose, que cuida internamente de toda essa operação.
Mas qual a diferença? O que precisamos para atualizar um livro? Precisamos de duas informações: a primeira é o identificador único para identificar e alterar o livro correto e a segunda são os dados atualizados do livro. E essa informação, assim como fizemos anteriormente, virá de req.body. Ou seja, nossa requisição de atualização precisará passar duas informações: o ID do livro, que vem do parâmetro da rota, e os novos dados deste livro, ou seja, o objeto com o livro atualizado que vem de req.body.
E como sabemos que a função findByIdAndUpdate precisa receber esses dois parâmetros nessa ordem? Isso vem do próprio Mongoose. A documentação do Mongoose nos esclarece como esta função funciona. Vamos precisar passar o ID e o update (ou seja, na mesma ordem que passamos aqui: o ID do objeto que será atualizado e o update deste objeto).
E o que retornaremos na resposta? Cada método tem um retorno específico. No caso da criação de um objeto, ele retorna o objeto criado, etc. Nesse caso, ele não retorna o objeto criado, pois o próprio método cuida disso. Por isso, removi a parte de salvar o retorno de Livro.findUpdate. Estamos simplesmente chamando a função aqui com await.
Na nossa resposta, mantemos res.status(200), mas agora na mensagem, dentro de JSON, podemos simplesmente passar um objeto com message, e nessa message pode ser apenas uma string com "Livro atualizado".
Aqui no catch, ficará bem semelhante, só precisaremos trocar o texto de "Falha na requisição do livro" para "Falha na atualização". E a parte de atualizarLivro, cadastrarLivro, listarTodosOsLivros e listarLivroPorId parece estar tudo correto.
  static async atualizarLivro (req, res) {
    try {
      const id = req.params.id;
      await livro.findByIdAndUpdate(id, req.body);
      res.status(200).json({ message: "livro atualizado" });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha na atualização` });
    }
  };
COPIAR CÓDIGO
A única coisa que não podemos esquecer de fazer é, no arquivo app, remover o que não estamos mais utilizando. Portanto, não estamos mais utilizando nenhum desses app.get, app.post, nem app.put. Vou aproveitar para remover também o app.delete, embora eu deixe um ponto de referência do que foi feito antes. Mas os outros, não estamos mais usando. Na nossa parte de rotas, no arquivo livrosRoutes, precisamos atualizar com todas essas rotas que criamos:
import express from "express";
import LivroController from "../controllers/livroController.js";

const routes = express.Router();

routes.get("/livros", LivroController.listarLivros);
routes.get("/livros/:id", LivroController.listarLivroPorId);
routes.post("/livros", LivroController.cadastrarLivro);
routes.put("/livros/:id", LivroController.atualizarLivro);

export default routes;
COPIAR CÓDIGO
Agora, as rotas estão atualizadas. Já sabemos qual função será chamada no momento em que uma requisição for feita para cada uma dessas rotas, baseando-se no método. É interessante ressaltar que a rota é a mesma, mas os métodos são diferentes. Assim, ao fazer uma chamada para /livros com GET, uma função será chamada. Fazendo uma chamada para a mesma rota /livros, mas com outro método, como POST, outra função correspondente será chamada. Ou seja, a rota permanece a mesma, e apenas o método muda.
Chegamos então à última parte, que sabemos ser a remoção de um registro. Vamos fazer o seguinte: vamos, em seguida, deletar, completar nosso CRUD e fazer todo o teste de uma só vez. Vamos lá.
Agora vamos finalizar nosso CRUD básico. Neste momento, não há surpresas, vamos criar o último método do controller, que é para excluir um livro.
Se quiser, você pode pausar o vídeo agora e tentar criar o método. Verifique se tudo está correto e depois continue assistindo. Então vamos lá.
No final do arquivo, vamos criar o último método. Posso até copiar o método anterior, de atualização de livro, pois a exclusão será muito similar. Assim como para atualizar um livro, para excluí-lo também preciso de sua informação de ID, que já estamos pegando aqui.
O último método será chamado de excluirLivro. Aqui também obtemos req.params.id e o salvamos em uma variável chamada id. Se preferir, pode passar req.params.id diretamente dentro do método do Mongoose, mas preferi deixar um pouco mais explícito em nosso código.
Com const id, estamos armazenando nosso id que recebeu pelo parâmetro. Agora o método não será mais o findByIdAndUpdate, e sim o findByIdAndDelete, que é um método do Mongoose.
Como estamos apenas excluindo, não existe o segundo parâmetro anterior, que passava o req.body. Ele só receberá um parâmetro que é o id que trouxemos lá da requisição.
O retorno, a resposta da requisição, permanece a mesma, status 200, lembrando que pode ser tanto 200 quanto 204. A mensagem será "Livro excluído com sucesso".
O lançamento da exceção também segue o mesmo modelo, só que ao invés de "Falha na atualização", podemos escrever que houve uma "Falha na exclusão", caso algo ocorra aqui e nossa operação de exclusão não dê certo.
Aqui, sem novidades, não retornarei nada com o meu findByIdAndDelete, é só executar a mesma função.
  static async excluirLivro (req, res) {
    try {
      const id = req.params.id;
      await livro.findByIdAndDelete(id);
      res.status(200).json({ message: "livro excluído com sucesso" });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha na exclusão` });
    }
  };
COPIAR CÓDIGO
A última coisa que devemos fazer é ir no arquivo livrosRoutes.js e adicionar a última rota:
routes.delete("/livros/:id", LivroController.excluirLivro);
COPIAR CÓDIGO
É igual ao que já estávamos usando anteriormente, também recebe livros, também recebe um id de livro e o método que será chamado quando a requisição atingir essa rota será excluirLivro.
Agora o CRUD de Livro está completo, tem todos os métodos, está associado a um banco de dados, agora o que precisamos fazer é testar o processo lá no Postman.
Vamos verificar o servidor, no terminal, o servidor está de pé, a conexão está conectada, e agora vamos para o Postman vou fazer o teste do fluxo completo.
Primeiro, vamos testar /livros para ver se o nosso "Senhor dos Anéis", que já estava no banco, aparece corretamente. Tendo sucesso no teste, vou copiar o id e passar aqui para fazer a busca por id.
Então, localhost:3000/livros/id, e veremos que nosso objeto com o livro retornado lá do banco. Agora falta testar os outros métodos.
Vamos abrir uma nova aba para testar a operação de POST. Lembrando, ela não tem id, mas precisamos passar um corpo da requisição com as informações que queremos inserir no banco.
vamos selecionar a opção "Body" e, no menu "Text", a opção "JSON". Para facilitar, podemos voltar à aba do GET e vou copiar o objeto livro que foi retornado a fim de apenas alterarmos algumas informações, evitando ter que digitar tanto.
Não passamos o id ao criar um novo registro, a geração do id é sempre responsabilidade do banco.
O título do livro será "O Hobbit", publicado pela editora Clássicos, com o preço estabelecido em 6 reais, tornando-o bem acessível. Esse é um livro mais fino do que "O Senhor dos Anéis", por isso vou percorrer apenas suas 100 páginas aqui.
POST http://localhost:3000/livros/
"titulo": "O Hobbit",
"editora": "Classicos",
"preco": "6",
"páginas": "100"
COPIAR CÓDIGO
Nosso corpo de mensagem está aqui. Após clicar em "Send, recebemos o retorno com status "201 created", o que era esperado, e o retorno veio corretamente.
{
    "message": "criado com sucesso",
        "livro":  {
        	"titulo": "O Hobbit",
        	"editora": "Classicos",
        	"preco": "6",
        	"páginas": "100",
                "_id": "64c2cd91bcd4d28e0209ed76"
        }
}
COPIAR CÓDIGO
Recuperou-se o objeto que nós solicitamos, com a mensagem "criado com sucesso". Em seguida, uma propriedade "livro" com o livro que foi criado. Isto é similar ao que vimos quando revisamos o método cadastrarLivro do nosso LivroController.
No caso deste método, ele retorna exatamente o que nós pedimos: uma mensagem "criado com sucesso" e uma propriedade "livro" que tem como valor um novo livro. novoLivro é a constante onde salvamos o retorno do método create().
Este método, por padrão, sempre retorna o objeto que foi criado. Contudo, nem todo método funciona assim. Como já discutimos antes, métodos retornam coisas diferentes, dados diferentes ou, às vezes, não retorna nada. Neste caso, ele retornou corretamente o objeto criado.
Agora, o que falta testarmos? O método PUT. Vamos usar como base o "O Hobbit", que já foi criado aqui no POST.
Podemos copiar o id dele e alterar o método da nossa requisição para PUT. Em /livros, acrescento o id do "O Hobbit" que acabamos de criar.
Lembre-se de que, para fazer uma atualização, devemos passar, via corpo da requisição, o que queremos alterar. Por exemplo, quero mudar o preço. O preço não é de seis reais, mas sim cinco reais.
PUT http://localhost:3000/livros/64c2cd91bcd4d28e0209ed76
{
    "preco": 5
}
COPIAR CÓDIGO
Depois de passar todas as alterações necessárias, clicaremos no botão "Send".
O retorno informa "livro atualizado", mas precisamos confirmar se tudo ocorreu como esperado.
Podemos fazer essa confirmação na mesma aba, trocando de PUT para GET. Então, agora vou fazer um GET em /livros/ mais o id do livro que acabamos de atualizar.
Após pressionar o botão "Send", o retorno confirma que nosso "O Hobbit" está com o preço atualizado. Portanto, PUT está correto.
Aproveitando, vamos usar o id do livro que acabamos de criar para deletá-lo. Na mesma aba, na mesma requisição, só precisamos trocar o método para DELETE em /livros/ mais o id que queremos deletar. Após clicar em "Send", temos a confirmação de "livro excluído com sucesso".
Para confirmar que de fato ele foi excluído, trocamos para GET em /livros/ para ver se "O Hobbit" realmente desapareceu.
Após realizar o GET em localhost 3000/livros, o único livro que resta é "O Senhor dos Anéis".
Portanto, nosso fluxo CRUD (Create, Read, Update, Delete) está completo. A partir de agora, evoluiremos essa API cada vez mais, com erros, autenticação, paginação, outras validações e muito mais. Alguns desses conceitos serão abordados nas próximas aulas, enquanto outros serão vistos em outros cursos de formação. Vamos em frente!
Até agora, talvez você tenha percebido que nosso modelo de livro está bastante simplificado, pois nosso objetivo é entender uma API REST e o CRUD. Esses dois elementos formam, basicamente, a base do trabalho de Back-end em desenvolvimento web.
Há uma propriedade ausente em nosso modelo de livro, que é a propriedade autor. Intencionalmente a deixei de fora para facilitar nossos primeiros desenvolvimentos, sabendo que abordaríamos isso mais adiante. Precisamos começar a pensar o que compõe um livro, mas que também são partes independentes de um produto de livraria, como por exemplo: autores, editoras, as pessoas que trabalham nesta livraria e etc.
Nesse curso, vamos nos concentrar em outra entidade que faz parte do livro, mas que é uma entidade separada: a pessoa autora, mas deixaremos como autor. Vamos entender como adicionamos a propriedade autor no nosso modelo livroSchema e como essas partes se relacionarão.
Conforme mencionado na discussão sobre SQL e não SQL, um autor pode escrever vários livros, assim como um livro também pode ser escrito por mais de uma pessoa. No SQL, é muito importante garantirmos que uma informação de um autor exista apenas uma vez no banco de dados, ou seja, não podemos ter mais de um registro do mesmo autor. Isso faz parte de uma série de regras do SQL, que chamamos de normalização de banco.
Essa relação é estabelecida através de chaves, como a chave primária, que é o identificador primário de uma tabela, geralmente por ID. Ou através de chaves estrangeiras, que servem para referenciar o identificador de uma tabela dentro de outra.
No Mongo, isso é um pouco diferente da forma que ocorre no SQL. Naturalmente, a forma de o Mongo fazer essa junção de informações é baseada em um conceito: dados visualizados que devem ser trazidos do banco juntos, devem ser armazenados juntos.
Observação: Nas atividades vocês encontram materiais deixados pela instrutora que explicam o conceito do Mongo, assim como as diferenças entre o banco de objeto e o banco de tabela.
O que é relevante nesse curso é que o Mongo tem uma forma nativa de criar um registro com todas as informações dentro, no formato de um grande objeto com essas propriedades. Chamamos essa forma de embedding (incorporação). Esse é um termo bastante usado em programação. Já a forma de fazer referências entre tabelas, ou no caso entre coleções, é conhecida como referencing (referência).
Neste curso, mostrarei a forma "nativa", entre aspas, do Mongo, a do banco de objetos, ou seja, essa forma de incorporar as informações que devem estar juntas em um objeto. Também deixarei um material extra explicando como fazer essa parte via referência, que é mais comumente usada no SQL. Nele haverá exemplos de código, porque eu não demonstrarei na aula.
Já temos um modelo de livro com suas propriedades. Para adicionarmos um autor, precisamos pensar que ele faz parte de um livro, mas também é uma entidade em si. Então começaremos criando mais um modelo para o autor.
Dentro da pasta "model", criaremos um novo arquivo JavaScript, clicando no botão "New File" (Novo arquivo) da parte superior ou clicando na pasta com o botão direito do mouse e selecionando "New File". Chamaremos o arquivo de Autor.js (com A maiúsculo).
Nesse arquivo, definiremos nosso esquema e nosso modelo de uma forma muito similar ao que fizemos para o livro. Para começar, importamos o Mongoose, codando import mongoose from "mongoose";.
Em seguida, definimos nosso esquema de autor como uma constante, que chamaremos de autorSchema, atribuindo a ela new mongoose.Schema(). Essa é uma função que recebe como parâmetro um objeto, onde definiremos as propriedades do nosso Autor.
import mongoose from "mongoose";

const autorSchema = new mongoose.Schema({

})
COPIAR CÓDIGO
Toda informação enviada para o banco necessita de um identificador (ID) único, que será do mesmo tipo que usamos no livro. Então, criaremos a propriedade id que tem como valor um objeto contendo a propriedade type: Mongoose.Schema.Types.ObjectId, da mesma forma que fizemos no livro.
import mongoose from "mongoose";

const autorSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
})
COPIAR CÓDIGO
Para simplificar, adicionaremos apenas mais duas propriedades nesse esquema de autor: nome e nacionalidade, ambas strings. Para o nome adicionaremos também a propriedade required: true, indicando que é uma propriedade obrigatória e não será possível adicionar um autor ao banco sem especificar ao menos o nome. Já a propriedade nacionalidade não é obrigatória.
Depois das propriedades, fecharemos as chaves (}) e escreveremos outro objeto: { versionKey: false }. Essa é aquela ferramenta de versionamento do MongoDB que não usaremos nesse curso.
As duas últimas linhas desse modelo serão iguais a do Livro.js. Portanto, criaremos a const autor = const autor = mongoose.model(), passando como argumentos de model() a string "autores" e o objeto autorSchema.
No final, faremos a exportação do modelo, mas de uma forma diferente da que fizemos em Livro.js, onde só precisamos exportar o modelo. No caso do Autor.js, precisamos exportar o autor e o autorSchema, e para isso codamos export { autor, autorSchema }.
Fizemos isso porque o autor faz parte de livro, mas também precisa ser referenciado em livro. Com a exportação do autorSchema, poderemos importar o autor como propriedade de livro.
import mongoose from "mongoose";

const autorSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  nome: { type: String, required: true },
  nacionalidade: { type: String }
}, { versionKey: false });

const autor = mongoose.model("autores", autorSchema);

export { autor, autorSchema };
COPIAR CÓDIGO
Por enquanto, não faremos adicionaremos autor como propriedade de livro, porque precisamos fazer algumas etapas antes. Para o Livro.js funcionar na API, precisará de rotas e de um controlador. Além disso, temos que criar também um controlador e rotas para Autor.js.
Nossa API tem para livro quase as mesmas funcionalidades que queremos adicionar para autor. Queremos poder listar pessoas autoras, adicionar um novo autor, alterar um autor, deletar um autor e trazer um autor por ID.
Em outras palavras, os métodos no controlador de autor serão os mesmos que temos para Livros. As rotas que vamos ter para autores (/autores e /autores/:id) também serão as mesmas.
Então, vamos duplicar o livroController.js e renomeá-lo como autorController.js. Portanto, navegaremos para "src > controllers > livroController.js".
Com o arquivo livroController.js selecionado, pressionaremos "Ctrl + C", para copiar, e "Ctrl + V", para colar a cópia na pasta. Selecionamos a cópia criada e depois clicamos novamente no nome para renomeá-lo como autorController. Após a alteração, pressionamos "Enter". Faremos o mesmo para a rota, duplicando livroRoutes.js e criando autorRoutes.js.
Para fazermos as substituições, todas as referências que estão sendo feitas aos livros serão direcionadas às pessoas autoras. Por exemplo, LivroController passa a ser AutorController e as rotas mudam de /livros para /autores.
O mesmo acontece no autorController.js, onde listarLivros se torna listarAutores e livroEncontrado será autorEncontrado, e assim por diante. Para facilitar o processo, vou disponibilizar o link do repositório com essas alterações. Caso deseje, você pode acessar o repositório atualizado e copiá-lo para o seu projeto.
Se preferir fazer um passo a passo, pause este vídeo agora e vá realizando essas substituições. Isso é interessante para você, como uma pessoa desenvolvedora, porque permite que leia o código e revise cada parte dele.
Dica: Você pode revisar com calma, e até usar o atalho "Ctrl + D", do VS Code, para capturar todas as palavras iguais, mas tenha cuidado! A substituição automática pode resultar em alguns erros, já que existem palavras cuja escrita varia entre maiúsculas e minúsculas. Por exemplo, existem campos com livro, com "l" minúsculo, e outros com Livros com "L" maiúsculo.
Tenha cautela nesse processo de substituição, ou acesse diretamente o repositório para fazer a substituição, se preferir. De toda forma, precisamos realizar essa alteração para conseguirmos unir as duas partes na API.
Vamos parar para fazer essa substituição. Depois revisaremos como ficou e continuaremos a união os livros e autores, obtendo uma API mais desenvolvida.
Neste momento, nosso projeto precisa ter o modelo Autor.js, o arquivo de rota autoresRoutes.js, substituindo todas as ocorrências de "livro" por "autor", e o autorController.js, também com a substituição de "livro" por "autor". Lembrando que o autorController.js importa o modelo de Autor.js, com import autor from "../models/Autor.js";.
Antes de continuarmos, existem duas correções importantes que precisamos fazer. A primeira é no arquivo autorController.js. No caso de livroController.js, que foi o arquivo que copiamos, ao importamos o modelo, havia apenas uma exportação, que era de livro. Já no modelo Autor.js, exportamos dois módulos: autor e autorSchema.
Isso reflete a maneira como importamos o modelo em autorController.js. Na importação que fizemos na primeira linha do arquivo, ao invés de utilizarmos import autor from, precisamos importar o autor chaves ({}). Portanto temos import { autor } from "../models/Autor.js";.
Isso porque, neste caso, não se trata de uma exportação padrão de um módulo único (export default), e sim a exportação de uma lista de módulos. Portanto, precisamos especificar qual módulo desejamos importar, colocando-o entre chaves. Sem fazer isso, provavelmente o código resultará em um erro no terminal.
A segunda correção é nas rotas. Criamos as rotas de autores, mas nossas rotas têm um ponto de entrada que é o "routes > index.js". No momento, fizemos apenas a referência de livros nesse arquivo. Precisamos referenciar também todas as rotas de autores, então, na linha abaixo de import livros, escreveremos import autores from "./autoresRoutes.js".
Além disso, dentro da função que cria todo o middleware de rotas, adicionaremos um terceiro parâmetro ao app.use(): o autores, que importamos. Esse parâmetro engloba todas as rotas de autor.
import express from "express";
import livros from "./livrosRoutes.js";
import autores from "./autoresRoutes.js";

const routes = (app) => {
  app.route("/").get((req, res) => res.status(200).send("Curso de Node.js"));

  app.use(express.json(), livros, autores);
};

export default routes;
COPIAR CÓDIGO
Após essas duas importantes correções, podemos fechar as abas de autorController.js e livroController.js. Assim focaremos no modelo Livro.js, que é onde precisamos fazer a referência à entidade autor.
Dentro do livroSchema, onde definimos todas as propriedades de livros, adicionaremos as propriedades de autor. Portanto, ao final da linha paginas: { type: Number }, escreveremos uma vírgula e pressionaremos "Enter". Na linha abaixo, adicionaremos a propriedade autor.
A propriedade autor fará referência ao esquema de autor que criamos anteriormente, e que também foi exportado em Autor.js para ser usado com o modelo de livro. Então, abaixo da importação do mongoose, escreveremos import {autorSchema} from './autor.js'. Em seguida, adicionaremos essa informação do autorSchema dentro da propriedade autor em livroSchema.
import mongoose from "mongoose";
import { autorSchema } from "./Autor.js";

const livroSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  titulo: { type: String, required: true },
  editora: { type: String },
  preco: { type: Number },
  paginas: { type: Number },
  autor: autorSchema
}, { versionKey: false });

const livro = mongoose.model("livros", livroSchema);

export default livro;
COPIAR CÓDIGO
Lembrando que a forma que estruturamos nossos modelos depende do tipo de banco de dados que estamos usando e da biblioteca que usamos para a integração. No caso, o Mongoose é a biblioteca instrui essa forma de criarmos essa integração (embedding) de informações, juntando dois esquemas.
Portanto, referenciamos autorSchema dentro de livroSchema para termos essa integração. Se você deseja criar também uma entidade de editora como estudo, será o mesmo processo. Então você cria um esquema e um modelo para editoras e passar o esquema para propriedade editora dentro de livroSchema, fazendo a referência junto às informações de livro.
Finalmente entenderemos como fazer a API funcionar e trazer as informações juntas. Como são nossos primeiros passos na criação de uma API, que eventualmente irá crescer e ganhar muitos requisitos e detalhes, partiremos do princípio de que já possuímos uma coleção de autores no banco. Aproveitaremos para testar se a inserção de autores pela rota /autores está funcionando.
Abrindo o Postman, criamos uma requisição POST para localhost:3000/autores. Clicaremos na aba "Body", onde marcaremos a requisição do tipo "raw" no formato JSON.
Na área de criação do corpo da requisição, criamos um objeto. Lembrando que, ao criarmos o autor, não passamos o ID, apenas as demais propriedades que são nome e nacionalidade.
{
"nome": "JRR Tolkien",

"nacionalidade": "África do Sul"
COPIAR CÓDIGO
}
Começamos registrando o autor Tolkien, porque já temos livros dele registrados, cuja nacionalidade é a África do Sul. Fica como curiosidade, Tolkien era sul-africano.
Pode aparecer uma janela no centro da tela para salvarmos essa requisição, mas não desejamos fazer isso, então podemos clicar no botão "Cancel", no canto inferior direito da janela. Em seguida, podemos clicar no botão "Send" (Enviar), que fica ao final da barra de endereço da requisição.
Aparentemente nossa requisição está funcionando, pois tivemos o retorno do status 201 Created (Criado). Isso indica a criação de um autor no banco. Agora, já temos um autor para relacionar com nosso livro.
Vamos entender como solicitamos ao Mongo para localizar os registros e criar referências. Teoricamente, conseguimos fazer a referência por qualquer campo. No nosso caso, faremos por ID, que é um campo bastante comum por ser um identificador único. Inclusive, aproveitaremos que o método POST retornou o ID do autor que criamos e copiar esse registro.
Como podemos criar um livro com um autor? Precisamos informar ao Mongo que ele precisa obter um autor e o inserir no registro do livro. Para isso, criaremos um novo livro pelo Postman para visualizarmos como ficará essa estrutura.
Na parte superior do Postman, clicaremos no botão de "+" ao lado da aba da requisição, criando assim uma nova requisição. Depois, na lista suspensa do lado esquerdo da barra de endereços, escolheremos a requisição POST para localhost:3000/livros.
Em seguida, clicamos na aba "Body", abaixo da barra de endereços, e selecionamos a opção "raw" e escolhemos o formato JSON. Nesse corpo, criaremos o objeto livro, e podemos começar colando o ID que copiamos na propriedade "autor". Além disso, precisamos passar todas as outras propriedades do livro.
Verificando a propriedade Livro.js, no VS Code, percebemos que a única obrigatória é titulo. Sendo assim, para simplificar nosso teste, criaremos um livro apenas com o título e um autor. Nosso título será "O Similarillion".
{
"titulo": "O Similarillion",

"autor": "64c3fe0308aa256fb8c45d20"
COPIAR CÓDIGO
}
Ainda não enviaremos essa requisição, porque nosso controlador ainda não está preparado para lidar com essa informação do autor. Temos uma rota existente que recebe essa requisição e temos esse esquema definido, mas é necessário que o controlador processe essa requisição e passe para o modelo gravar no banco da maneira correta.
Então, voltaremos para o arquivo livroController.js no VS Code, onde faremos alterações no método cadastrarLivros(), que é equivalente ao método do POST. Primeiro, vamos guardar os dados que vão no body dessa requisição na const novoLivro e, para isso, removeremos essa constante do try{}.
A novoLivro deixará de ser o resultado de livro.create e será apenas o req.body. Dessa forma, salvamos o corpo da requisição, incluindo o ID do autor que referenciamos.
Para o ID do autor, criaremos a const autorEncontrado dentro do bloco try{}, porque agora começaremos a fazer uma integração com o banco. Atribuiremos para essa constate o await autor.findById(), nossa função já conhecida.
Com ela, queremos que vá ao banco da coleção de autores, procure um autor pelo ID que passarmos e traga as informações desse autor, como nome, nacionalidade, entre outros. Por isso, passaremos o novoLivro.autor como parâmetro da função.
const autorEncontrado = await autor.findById(novoLivro.autor);
COPIAR CÓDIGO
A partir desse ponto, podemos começar a montar o objeto livro completo, que será enviado para o banco de dados. Para deixar mais claro, criaremos uma constante chamada livroCompleto, que será um objeto composto pelos dados do novoLivro e os dados de autorEncontrado.
Para unir os dados do novoLivro com a propriedade adicional autor em um objeto único, usaremos operador de propagação, conhecido como Spread Operator em JavaScript, representado pelos três pontos consecutivos (...). O valor de autor será um objeto contendo os dados do autor encontrado. Logo, usarei novamente um Spread Operator para autorEncontrado, ou seja, autor: {...autorEncontrado }.
Você pode se perguntar: "Por que eu preciso desmembrar autor aqui? Não era só colocar na propriedade autor o nosso objeto autorEncontrado?". Não, porque o autorEncontrado vem do banco de dados no formato do Mongo com algumas outras propriedades.
Na verdade, queremos acessar autorEncontrado e obter a propriedade _doc. Dessa forma, o MongoDB está trazendo algumas informações extras além dos dados que solicitamos para o banco.
const livroCompleto = { ...novoLivro, autor: { ...autorEncontrado._doc }};
COPIAR CÓDIGO
Portanto, precisamos entrar no objeto autorEncontrado, acessar _doc, que é onde se encontram os dados do autor, e registrar como outro objeto dentro da propriedade autor. Isso é, basicamente, o nosso Spread Operator do JavaScript funcionando sem muita alteração.
Agora sim podemos criar uma constante chamada livroCriado no banco de dados, atribuindo o await livro.create(). Como parâmetros da função, passamos os dados do objeto livroCompleto.
//código omitido

  static async cadastrarLivro (req, res) {
    const novoLivro = req.body;
    try {
      const autorEncontrado = await autor.findById(novoLivro.autor);
      const livroCompleto = { ...novoLivro, autor: { ...autorEncontrado._doc }};
      const livroCriado = await livro.create(livroCompleto);
      res.status(201).json({ message: "criado com sucesso", livro: livroCriado });
    } catch (erro) {
      res.status(500).json({ message: `${erro.message} - falha ao cadastrar livro` });
    }
  }
    
//código omitido
COPIAR CÓDIGO
Antes de realizarmos testes no Postman, passaremos pelo terminal para verificar se está tudo funcionando apropriadamente. Atenção ao erro comum de esquecer de colocar autor entre chaves ao importá-lo no controlador, ou pode acontecer um erro. Eu mesma fiz essa correção no começo do vídeo, entretanto, esqueci de aplicá-lo novamente.
Começo do código do livroControlador.js
import livro from "../models/Livro.js";
import { autor } from "../models/Autor.js";

//código omitido
COPIAR CÓDIGO
Com essa correção, o terminal indicou que está tudo certo. Agora podemos criar o novo livro que deixamos pronto no Postman. Ao clicarmos no botão Send da requisição POST que havíamos preparado, a criação for bem sucedida e o Postman retornou o código de status 201,
Recebemos a mensagem de livro criado com sucesso e o objeto livro. O objeto contém o título do livro e o autor, sendo que, na propriedade autor, ele já retornou o nome e a nacionalidade.
{
     "message": "criado com sucesso",
     "livro": {
         "titulo": "O Similarillion",
         "autor": {
             "nome": "JRR Tolkien",
             "nacionalidade": "África do Sul"
         },
         "_id": "64c40881fd1716 fabee1749
     }
}
COPIAR CÓDIGO
Assim aprendemos a juntar entidades, como livros, autores, editoras etc. O autor se une ao livro e o livro ao autor.
Esse foi nosso primeiro passo referente a unir entidades. A partir de agora, todas as alterações que fazemos no autor permanecem em suas próprias rotas e podemos seguir fazendo os testes de criação de pessoas autoras, novos livros e outras entidades que desejarmos no nosso sistema de livraria.
No entanto, algumas verificações são importantes. Por exemplo, se o autor existente no banco de dados, ou se o autor não existe. Lembrando que, a partir de agora, todos os casos de uso, como chamamos, vão crescer indefinidamente.
E o MongoDB é mais flexível do que o SQL. Por exemplo, podemos simplesmente criar uma nova propriedade, como criamos autor em livroSchema, sem precisarmos de muito planejamento prévio ou de muita alteração de código, como é o caso do SQL. No entanto, essa parte do SQL fica para outro curso.
Agora realizaremos mais uma pequena adição em nossa API antes de encerrarmos.
O CRUD já está completo. Nós já temos uma API funcional que armazena dados no banco de dados. Já temos, inclusive, a união de duas entidades diferentes, que fizemos através dos esquemas, unindo autor e livro.
Mencionei anteriormente que uma API cresce em funcionalidades. Então, vamos descobrir como adicionar uma dessas novas funcionalidades. Para isso, implementaremos uma funcionalidade de busca para encontrarmos um livro através da editora. A editora é uma propriedade que já temos em livros e temos o registro da editora "Clássicos".
Precisamos passar um parâmetro de busca para a rota e o usar para ser processado pela API. E se vamos procurar os livros através de uma editora, significa que este processamento será realizado pelo controlador de livros, por ser uma requisição originada dos livros. Portanto, nossa busca ocorre dentro de livroController.js, onde criaremos um novo método para esse processamento específico.
Ao final do código de livroController.js, escreveremos o novo método, que será static (estático) e async (assíncrono), pois consultará o banco de dados. Chamaremos o método listarLivrosPorEditora() e, como sempre, ele receberá uma requisição e uma resposta, ou seja, (req e res).
Arquivo livroController.js
    //código omitido

    static async listarLivrosPorEditora (req, res) {
        
    }
};

export default LivroController;
COPIAR CÓDIGO
Essa informação da editora será recebida através de um parâmetro. Se acessarmos "src > routes > livroRoutes.js", observamos que já temos alguns parâmetros, como o parâmetro id, que referenciamos com dois pontos (:id). Mas agora trabalharemos com outro tipo de parâmetro que pode ser passado por uma rota, o chamado de parâmetro de query (consulta).
Portanto, temos o tipo de informação variável, que passamos por parâmetro da rota, e agora passaremos outro tipo de parâmetro. Antes, vamos entender como funciona o parâmetro de consulta.
Por exemplo, ao acessarmos o dashboard da Alura, em cursos.alura.com/dashboard, e clicarmos no botão de lupa, que fica no canto superior esquerdo, ao lado da logo, abrimos uma barra de busca. Se fizermos uma busca por "express" e clicarmos no botão "Pesquisar", ao final da barra, notaremos informações adicionais na URL na barra de endereço do navegador.
Vamos copiar essa URL, colar ao final do arquivo livrosRoutes.js, no Visual Studio Code (VSC), e analisá-la melhor. O endereço começa com cursos.alura.com.br. Da mesma forma que temos /alunos, /livros e /autores, durante uma busca, o site da Alura adiciona o /search. Depois temos ?query=express, ou seja, o nome do parâmetro que comentamos e o termo consultado.
Portanto, o query é um parâmetro de consulta que, ao passarmos uma rota com a estrutura interrogação, chave, sinal de igual e valor (?chave=valor), conseguimos passar esses parâmetros de consulta (query parameters) para a rota. Essa informação será enviada junto com a rota e o Express conseguirá capturá-la.
Deixaremos esse endereço em forma de comentário ao final do arquivo e voltaremos para livroController.js, onde começamos a criar nosso método. Dentro do método, escreveremos const editora = req.query, para obtermos o resultado da requisição.
Assim como req.params.id fazia referência a um valor variável que chamamos de id na rota, após o .query, passaremos o nome do parâmetro query. No caso da página da Alura, a query foi chamada de query. No nosso caso, chamaremos esse parâmetro de editora. Então, ao passarmos req.query.editora.
    //código omitido

    static async listarLivrosPorEditora (req, res) {
        const editora = req.query.editora;
    }
};

export default LivroController;
COPIAR CÓDIGO
Dessa forma, sempre que recebermos uma rota com estrutura na forma de ?editora=algumaInformação, essa informação pode ser capturada através da propriedade req.query.editora. Assim podemos encadear parâmetros de query.
Por exemplo, se fizermos qualquer busca no Google e analisarmos a URL, encontraremos várias sequências de chave e valor separados por igual, que estão encadeadas e separadas por um "E" comercial (&). A interrogação (?) inicia essa sequência de parâmetros e conseguimos adicionar vários parâmetros de uma vez só em uma URL, sempre separados por &.
No nosso exemplo, precisamos apenas de um parâmetro, que é o nosso parâmetro de busca chamado editora. Na Alura, chamaram de query e pode ser chamado de q, ambos os nomes bastante comuns.
Agora, vamos iniciar o processo para fazer a busca funcionar. Já criamos a constante editora e criaremos o bloco try-catch para implementarmos o restante do código. Criaremos da forma que já sabemos, com o catch() recebendo o (erro).
    //código omitido

    static async listarLivrosPorEditora (req, res) {
        const editora = req.query.editora;
        try {
            
        } catch(erro){
            
        }
    }
};

export default LivroController;
COPIAR CÓDIGO
Para encontrarmos o livro, criaremos a const livrosPorEditora dentro do try. Escreveremos um await e usaremos métodos do Mongoose para a busca, inclusive um método que já usamos: o livro.find().
No nosso primeiro find, passamos apenas um objeto vazio, porque queríamos todos os livros sem nenhum filtro. Nesse caso, queremos passar um objeto com um parâmetro de busca, que será {editora: editora}.
    //código omitido

static async listarLivrosPorEditora (req, res) {
    const editora = req.query.editora;
    try {
        const livrosPorEditora = await livro.find({ editora: editora });
    } catch(erro){

    }
}
COPIAR CÓDIGO
A primeira editora, que é a chave desse conjunto de chave e valor, é a propriedade editora do model livroSchema. Já a segunda editora refere-se à variável com a informação que chegará via parâmetro de consulta.
O JavaScript tem um padrão no qual se a chave e o valor forem o mesmo dado, podemos passar apenas um deles, ou seja, poderíamos escrever apenas .find({editora}). Entretanto, deixaremos por extenso para deixar claro que uma é a propriedade de livro e a outra é a informação da variável.
Agora, precisamos montar a resposta (res), codando res.status(200).json(livrosPorEditora). Consideramos o status 200, de que deu tudo certo, e estamos retornando o resultado de livrosPorEditora. O Mongoose vai resolver o restante para nós.
No bloco catch de erro, deixaremos igual aos outros, pois não estamos trabalhando com manipulação de erros neste primeiro curso. Mudaremos apenas a mensagem, que será "falha na busca".
//código omitido

try {
    const livrosPorEditora = await livro.find({ editora: editora });
    res.status(200).json(livrosPorEditora);
} catch (erro) {
    res.status(500).json({ message: `${erro.message} - falha na busca` });
}

//código omitido
COPIAR CÓDIGO
Agora, da mesma forma como a Alura tem uma rota /search, precisamos criar nossa rota, que entrará em livrosRoutes.js. Criaremos uma nova rota do tipo get, que vai ser rotaLivros.
Ressalva importante: O Express trabalha com precedência de rota, ou seja, as rotas são chamadas em sequência. Por exemplo, todas as rotas de livros serão chamadas na sequência que forem declaradas no nosso livrosRoutes.js. Isso significa que temos que adicionar essas rotas em uma ordem de complexidade, da maior para a menor.
Ao final da rota routes.get("/livros", LivroController.listarLivros);, pressionaremos "Enter" e, antes da rota .get("/livros/:id",, adicionaremos nossa nova rota. Para isso, escrevemos routes.get("/livros/busca").
Assim como o recurso de busca no site do Alura, chamaremos esta nova rota de "busca". Também designaremos qual será o método chamado nesse contexto, que será o método listarLivrosPorEditora do LivroController.
Arquivo livrosRoutes.js
//código omitido

routes.get("/livros", LivroController.listarLivros);
routes.get("/livros/busca", LivroController.listarLivrosPorEditora);
routes.get("/livros/:id", LivroController.listarLivroPorId);
routes.post("/livros", LivroController.cadastrarLivro);
routes.put("/livros/:id", LivroController.atualizarLivro);
routes.delete("/livros/:id", LivroController.excluirLivro);

export default routes;
COPIAR CÓDIGO
Nesse caso, como ficará a questão da precedência de rotas no Express? Se invertermos a ordem para /livros/:id aparecer antes de /livros/busca e chamarmos uma rota que é /livros/busca/parâmetro, como o Express busca as rotas em ordem, ele vai parar na rota /livros:id. Assim ele considera tanto o termo "busca", quanto tudo que aparecer em seguida, como algum tipo de id, e ficará confuso.
Por isso que colocamos as rotas em ordem decrescente de complexidade. Então, se eu tivesse, por exemplo, /busca/autores/outroParâmetro, esta rota deveria ser inserida antes de livros/:id.
Essa é uma regra do Express. Logo, se você inverter, não vai funcionar. Essa informação é crucial quando o número de suas rotas começa a crescer, mas, por enquanto, nós só temos essa nova rota. Depois de a incluirmos, podemos realizar um teste no Postman.
Antes, verificamos no terminal se aconteceu algum erro. Estando tudo certo, podemos acessar o Postman.
No Postman, faremos uma requisição GET para "localhost:3000/livros/busca" e utilizarmos a estrutura que adotamos para passar parâmetros de consulta. Primeiramente usamos o símbolo de interrogação (?) e passaremos editora=Classicos, sendo "editora" é o nome do nosso parâmetro de busca, e "Classicos" é o valor do parâmetro.
GET http://localhost:3000/livros/busca?editora=Classicos
COPIAR CÓDIGO
Dica: Se esquecemos algum dado que atribuímos, como o nome da editora, podemos abrir outra aba de requisição no Postman e fazer uma requisição GET para "localhost:3000/livros".
Funcionou! A busca retornou apenas "O Senhor dos Anéis", da editora "Classicos". Lembrando que já fizemos algumas alterações no banco de dados e deletamos o outro livro.
Se você quiser fazer mais testes, crie outros livros com a editora "Classicos", ou com outras editoras, e faça sempre a busca seguindo esse modelo de parâmetro: ?editora=Nome. Caso algo não funcione, você sempre pode pedir ajuda no fórum.
Com isso, concluímos nossa primeira API REST com Node.js, utilizando o Express, que é uma das ferramentas mais usuais no mercado. Essa ferramenta é capaz de realizar muito mais. Nós apenas utilizamos rotas e requisição-resposta, mas o servidor local do Express oferece outros recursos.
A tendência é que essa API cresça, e temos mais cursos que lidarão com mais funcionalidades que você poderá adicionar a essa mesma API. Então não esqueça de continuar estudando!
Livros e livrarias são excelentes para praticar com APIs. Você também pode praticar, por exemplo, com blogs e posts de blog. Enfim, é hora de praticar e adicionar funcionalidades sempre, pois essa é basicamente a nossa principal função no Back-end.
Tratando erros de busca por id
Já refatoramos o nosso projeto usando Async/await, e colocamos ele nos métodos dos arquivos autoresController.js e livrosController.js.
Arquivo autoresController no GitHub
Clicando em autoresController.js, temos os métodos listarAutores e de listarAutorPorId, por exemplo. Todos já com Async/await em conjunto com o Try/catch.
Arquivo livrosController no GitHub
Clicando em livrosController, também podemos visualizar que estamos já usando o Async/await e o Try/catch nos métodos dos controladores.
Falando em Try/catch e tratamento de erros, vamos pensar: é importante que a nossa API faça um tratamento de erros correto, para que as mensagens de erro cheguem de forma consistente no front-end.
Por exemplo, perceba que em listarAutorPorId o único tratamento de erro que estamos aplicando é referente Id do autor não localizado; até enviamos um código de status 404.
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

      res.status(200).send(autoresResultado);
    } catch (erro) {
      res.status(404).send({ message: `${erro.message} - Id do Autor não localizado` });
    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
O código no status do instrutor consta como 400, e não 404. Mais adiante neste vídeo, ele irá ajustar isso.
Porém, não está tratando o caso de erro interno no servidor, onde ele pode estar fora do ar. É importante enviarmos essas informações de maneira coerente para o front-end, para conseguirem informar ao usuário o que aconteceu.
Há outro caso, que inclusive vamos analisar no Postman. Nele, copiamos o ID do Antônio Evaldo, sendo o 63ceeb2491ad5e9832ce3700.
Você pode copiar o ID de qualquer autor que for exibido.
Retorno no Postman
{
    {
        "_id": "63c95c9a03030abb06dd29b",
        "nome": "Jaqueline Magalhães",
        "nacionalidade": "brasileiro"
    },
    {
        "_id": "63ceeb2491ad5e9832ce3700",
        "nome": "Antônio Evaldo",
        "nacionalidade": "brasileiro"
    },
}COPIAR CÓDIGO
Feito isso, colamos ao final da URL no Postman. Isso para especificarmos o autor que desejamos acessar, usando o método get.
http://localhost:3000/autores/63ceeb2491ad5e9832ce3700COPIAR CÓDIGO
Logo após, selecionamos "Send". Como retorno, temos:
    {
        "_id": "63ceeb2491ad5e9832ce3700",
        "nome": "Antônio Evaldo",
        "nacionalidade": "brasileiro"
    }COPIAR CÓDIGO
Deu certo. Porém, o que acontece se alterarmos uma letra da URL? Por exemplo, ao invés do último número do ID ser zero, colocamos um.
http://localhost:3000/autores/63ceeb2491ad5e9832ce3701COPIAR CÓDIGO
Observe que não foi exibido nenhum autor no retorno do Postman, porque não temos nenhum autor correspondente ao id que colocamos. Contudo, não estamos informando o front-end que o autor não foi encontrado. Vamos tratar isso.
Vamos voltar ao VS Code, no arquivo autoresController. A constante autorResultado que recebemos de await autores.find(id) possui um valor nulo quando o autor não é encontrado. Podemos usar uma lógica usando if para tratarmos esse caso.
Trecho de código que vamos usar do arquivo autoresController
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

      res.status(200).send(autoresResultado);
    } catch (erro) {
      res.status(404).send({ message: `${erro.message} - Id do Autor não localizado` });
    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
Após a constante autoresResultado, escrevemos "if (autorResultado !== null) {}" para vermos se é diferente de nulo.
autoresController
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

            if (autorResultado !== null) {

            }

      res.status(200).send(autoresResultado);
    } catch (erro) {
      res.status(404).send({ message: `${erro.message} - Id do Autor não localizado` });
    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
Se for diferente de nulo, aplicamos o res.status(200).send(autoresResultado). Logo, copiamos essa linha e colocamos dentro das chaves do if; e após o fechamento de chaves colocamos else{}.
autoresController
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

            if (autorResultado !== null) {
                res.status(200).send(autoresResultado);
            } else {

            }

    } catch (erro) {
      res.status(404).send({ message: `${erro.message} - Id do Autor não localizado` });
    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
Dentro do else{}, colocamos o status 400 com a mensagem informando que o Id não foi localizado. Isso está dentro do catch de erro.
autoresController
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

            if (autorResultado !== null) {
                res.status(200).send(autoresResultado);
            } else {
                res.status(404).send({ message: `${erro.message} - Id do Autor não localizado` });
            }

    } catch (erro) {

    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
Observe que o VS Code sublinha na cor vermelha o ${erro.message}, isso porque não existe mais e podemos removê-lo deixando somente a frase.
res.status(404).send({ message: `Id do Autor não localizado` });COPIAR CÓDIGO
Depois alteramos de crase para aspas duplas, dado que é uma string.
res.status(404).send({ message: "Id do Autor não localizado" });COPIAR CÓDIGO
Assim, ficará:
autoresController
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

            if (autorResultado !== null) {
                res.status(200).send(autoresResultado);
            } else {
                res.status(404).send({ message: "Id do Autor não localizado." });
            }

    } catch (erro) {

    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
No catch, podemos tratar um erro interno de servidor. Para isso, escrevemos "res.status(500).json({ message: "Erro interno no servidor" });".
autoresController
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

            if (autorResultado !== null) {
                res.status(200).send(autoresResultado);
            } else {
                res.status(404).send({ message: "Id do Autor não localizado." });
            }

    } catch (erro) {
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
Salvamos o arquivo e vamos testar para verificar se conseguimos visualizar essas frases.
No Postman, estamos com o seguinte endereço:
http://localhost:3000/autores/63ceeb2491ad5e9832ce3701COPIAR CÓDIGO
Lembrando que alteramos o último número do Id. Clicamos no botão "Send"; e no retorno, obtemos:
    {
        "message": "Id no Autor não localizado."
    }COPIAR CÓDIGO
Exibiu o objeto com a propriedade message, com a frase "Id no Autor não localizado.". Com isso, conseguimos tratar esse erro, mas ainda temos mais um, que exige um certo tipo de conhecimento em como o mongoose lida com os dados informados na URL.
Quando passamos um Id criado pelo MongoDB, nesse caso são 24 caracteres hexadecimais, ele é gerado quando criamos um documento de autor.
Os caracteres hexadecimais permitem números e letras de A até o F; e ao passarmos uma string que não corresponde ao formato de 24 caracteres, ele informa um erro específico. Por exemplo, ao invés de passarmos o número um no final do Id, passamos a letra Z.
A letra Z é um caractere que não é aceito pelo tipo ObjectId, sendo o formato de 12 ou 24 caracteres hexadecimais.
http://localhost:3000/autores/63ceeb2491ad5e9832ce370zCOPIAR CÓDIGO
Logo após, clicamos em "Send".
No retorno, obtemos:
    {
        "message": "Erro interno no servidor"
    }COPIAR CÓDIGO
Realmente foi um erro interno no servidor, porque passamos uma string inválida e não corresponde ao que o mongoose esperava. Contudo, podemos deixar esse erro mais específico.
Como mencionado, quanto mais específicos são os erros que enviamos para o time de front-end, melhor será para a equipe tratar e exibir as mensagens corretas para as pessoas usuárias, melhorando, assim, a experiência.
Como vamos tratar o caso de informação enviada de forma incorreta?
Voltando ao VS Code, no arquivo autoresController, no catch do erro escrevemos "if (erro instanceof mongoose)". Note que ao escrever mongoose já é exibido uma sugestão de autocomplete do VS Code, basta selecionar "Enter" para aceitá-la.
Podemos subir no topo do código para verificar se foi importado da maneira correta.
import mongoose from "mongoose";COPIAR CÓDIGO
Se tiver com esse import, significa que foi feito com sucesso. Logo após, voltamos ao if e na sequência colocamos ".Error.CastError".
autoresController
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

            if (autorResultado !== null) {
                res.status(200).send(autoresResultado);
            } else {
                res.status(404).send({ message: "Id do Autor não localizado." });
            }

    } catch (erro) {
            if (erro instanceof mongoose.Error.CastError) {

            }

      res.status(500).send({ message: "Erro interno no servidor" });
    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
O CastError é um erro interno do Mongoose que podemos acessar e verificar se o erro que obtemos é uma instância de CastError. Porque, no caso, esse é o erro específico lançado quando a pessoa passa um dado não esperado pelo mongoose.
Esse detalhe exige alguns conhecimentos mais específicos da ferramenta Mongoose.
Seguindo, se entrar no if (ou seja, se o erro é uma instância de CastErrorr) escrevemos "res.status(400)" e na sequência colocamos ".send({message: "Um ou mais dados fornecidos estão incorretos."});".
O código do status do CastError é 400, porque esse código é referente a uma requisição inválida.
// trecho de código suprimido

    } catch (erro) {
      if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."});
      }

// trecho de código suprimidoCOPIAR CÓDIGO
Mais para frente, vamos aprender como especificar melhor essa mensagem, mas iniciamos com algo mais genérico, isso porque depois aplicamos a refatoração.
Após o fechamento de chaves do if, escrevemos "else{}", e nele colocamos: "res.status(500).send({message: "Erro interno de servidor."});".
autoresController
// trecho de código suprimido

  static listarAutorPorId  = async (req, res) => {
    try {
      const id =  req.params.id;

            const autoresResultado = await autores.findById(id);

            if (autorResultado !== null) {
                res.status(200).send(autoresResultado);
            } else {
                res.status(404).send({ message: "Id do Autor não localizado." });
            }

    } catch (erro) {
      if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."});
      } else {
        res.status(500).send({message: "Erro interno de servidor."});
      }
    }
  };

// trecho de código suprimidoCOPIAR CÓDIGO
Agora, salvamos o arquivo e no Postman clicamos no botão "Send" com a string do Id errada (lembrando que inserimos a letra Z no final do Id do endereço).
No retorno, obtemos:
    {
        "message": "Um ou mais dados fornecidos estão incorretos."
    }COPIAR CÓDIGO
Bem interessante, conseguimos visualizar que existem vários casos que conseguimos tratar em uma única rota. Pode ser que nós tenhamos uma string bem formatada, por exemplo, a letra B ao invés da Z no final.
http://localhost:3000/autores/63ceeb2491ad5e9832ce370bCOPIAR CÓDIGO
E clicarmos no botão "Send", obtemos o seguinte retorno:
    {
        "message": "Id no Autor não localizado."
    }COPIAR CÓDIGO
Apareceu essa mensagem porque o mongoose identificou que a string estava bem formatada, porém, não há nenhum autor com esse Id cadastrado no banco de dados. Logo, a requisição foi feita para o banco de dados, mas o autor resultou em nulo no código e informou que o Id não foi localizado.
Há também o caso se passarmos mais de 24 caracteres, vamos inserir alguns caracteres aleatórios na rota e clicar em "Send".
Como retorno, obtemos:
    {
        "message": "Um ou mais dados fornecidos estão incorretos."
    }COPIAR CÓDIGO
Portanto, há diversos casos para tratarmos em uma única rota.
Com isso, você se pergunta: "Nós aumentamos bastante o código dos métodos desse controlador. Precisamos fazer isso para os demais métodos? O código vai ficar enorme". A resposta é que vai mesmo.
Por isso, vamos precisar de um recurso que vai nos auxiliar na reutilização do código para tratarmos melhor esses erros, de uma forma mais automatizada.
É isso que faremos no próximo vídeo. Te espero lá!
Middlewares do Express
Nós já demos início ao tratamento de erros da nossa API, em uma rota específica: a de listar autor por ID, passando um ID na URL do Postman.
Tratamos os casos, por exemplo, de quando o ID do autor não é localizado mas a string passada está bem formatada. Também tratamos os casos em que a string não estava bem formatada e passamos a mensagem dizendo que um ou mais dados fornecidos estão incorretos.
Além disso, tratamos até o caso de erro interno do servidor: quando há um erro que não se encaixa nos outros mais específicos.
No entanto, podemos perceber que o código desse método sozinho já está aumentando bastante, e teremos que realizar tratativas semelhantes em todos os outros métodos das nossas rotas! Com isso, o código ficaria bem repetitivo e isso seria também bastante trabalhoso.
Para evitar isso, há uma forma de tratar esses erros de forma mais automatizada! Utilizaremos um recurso do Express que nos ajudará bastante.
Middlewares
Para conhecer esse recurso, vamos clicar nos arquivos do projeto, no ícone de arquivos do menu lateral direito do VSCode. Em seguida, abrimos o arquivo app.js dentro da pasta "src".
Nesse arquivo, faremos o seguinte: depois da linha de routes(app), escreveremos app.use, abrir e fechar parênteses e passar como parâmetro uma função callback.
Então, escreveremos uma arrow function (() => {}) que receberá quatro parâmetros: erro, req, res e next:
app.js
app.use((erro, req, res, next) => {

});COPIAR CÓDIGO
Isso que estamos criando agora se chama Middleware: uma função especial do Express que será executada em toda requisição feita para a API, ou então em determinadas requisições.
Esse middleware que criamos, especificamente, é um middleware de erro - perceba que até chamamos o primeiro parâmetro de "erro". Ele é caracterizado por receber sempre quatro parâmetros.
Essa função que estamos escrevendo, basicamente, interceptará qualquer erro lançado e identificado pela nossa aplicação. Ou seja, essa função será utilizada para tratar esses erros, e será aqui dentro que reutilizaremos o código para não precisar repeti-lo nos controladores.
Então, vamos escrever o código desse middleware para vermos como ele funciona e o que acontecerá quando fizermos as requisições para o Postman.
Middleware de erro
Primeiramente, escreveremos res.status(500).send() para fazer um teste. Passaremos message dizendo "Erro interno do servidor":
app.use((erro, req, res, next) => {
    res.status(500).send({message: "Erro interno do servidor"});

});COPIAR CÓDIGO
Por enquanto é só. Conforme dito, é importante que o nosso middleware receba exatamente quatro parâmetros, mesmo que não utilizemos todos eles. Inclusive, temos a reclamação de que o nosso next, sublinhado em vermelho, não está sendo utilizado.
Podemos até desativar os sublinhados em vermelho, passando o cursor por cima do termo sublinhado e, na janela contextual, clicar em "Correção Rápida" (ou pressionar "Ctrl + . (ponto final)"). No menu de opções que surgir, selecionamos a opção "Disable non-unused-vars for this line".
Com isso, surgirá um comentário no código:
// eslint-disable-next-line no-unused-vars
app.use((erro, req, res, next) => {
    res.status(500).send({message: "Erro interno do servidor"});

});COPIAR CÓDIGO
Com isso, explicitamos no código que realmente não utilizaremos essa variável dentro dessa função.
Lembrete: é importante sempre declarar os quatro parâmetros, porque o Express identificará que esse middleware é de tratamento de erros.
Vamos continuar.
O app.use() sozinho não fará nada. Para fazer o código desse middleware ser executado, salvamos app.js e, voltando para o arquivo autoresController.js, damos um "Ctrl + X" em todo o if... else dentro de catch (erro):
autoresController.js
catch (erro) {
    if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."})
    } else { 
        res.status(500).send({message: "Erro interno de servidor."})
    }
}COPIAR CÓDIGO
Em seguida, no mesmo arquivo, receberemos um terceiro parâmetro no método listarAutorPorId, que será next:
static listarAutorPorId = async (req, res, next) => { 
// código omitidoCOPIAR CÓDIGO
Todo método de controlador pode receber o parâmetro next, e daqui a pouco entenderemos para que ele serve.
De volta em catch (erro), escreveremos next(), passando o erro do catch como parâmetro:
catch (erro) {
    next(erro);
}COPIAR CÓDIGO
Por fim, como não estamos mais usando o import do mongoose (import mongoose from "mongoose"), então podemos removê-lo do início do código. Agora, salvamos esse arquivo.
O next vai encaminhar o erro obtido no controlador para o middleware de tratamento de erros em app.js.
Teste de tratamento de erros internos
Vamos ver se a mensagem de "Erro interno de servidor." vai aparecer quando acionarmos qualquer erro do servidor.
No campo de URL do Postman, vamos mandar uma string mal formatada em "autores/..."; ou seja, caracteres inválidos para um Object ID do MongoDB. Lembre-se de usar o método GET.
http://localhost:3000/autores/63ceeb2491ad5e9832ce370bjfiefjiCOPIAR CÓDIGO
Clicando em "Send", recebemos:
Retorno do Postman
{
    "message": "Erro interno do servidor."
}COPIAR CÓDIGO
Isso prova que o código do middleware está sendo realmente executado.
Tratamento de erros específicos
Agora, vamos voltar ao código em app.js. No lugar de res.status(500).send({message: "Erro interno do servidor"}), vamos colar o código que estava antes no controlador:
app.js
// eslint-disable-next-line no-unused-vars
app.use((erro, req, res, next) => {
    if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."})
    } else { 
        res.status(500).send({message: "Erro interno de servidor."})
    }
});COPIAR CÓDIGO
Então, perceba: estamos colocando a responsabilidade de tratamento de erros nesse middleware.
Também precisamos importar o mongoose nesse arquivo. Posicionamos o cursor no final dessa palavra, pressionamos "Ctrl + Espaço" e aceitamos a sugestão de importação do mongoose. Pronto!
Agora podemos salvar o arquivo e testar se esse middleware realmente tratará erros mais específicos como o catch(error).
Voltando ao Postman, vamos dar "Send" naquela URL inválida novamente. Recebemos:
Retorno do Postman
}
    "message": "Um ou mais dados fornecidos estão incorretos."
}COPIAR CÓDIGO
Bacana! Esse é o retorno esperado.
Agora, vamos passar um ID válido. Vamos passar apenas "/autores" para consultar todos os autores e, em seguida, copiar o ID de Antônio Evaldo novamente. Colamos na URL:
http://localhost:3000/autores/63ceeb2491ad5e9832ce3700COPIAR CÓDIGO
Ao dar "Send", o Postman retorna o autor com sucesso:
{
    "_id": "63ceeb2491ad5e9832ce3700",
    "nome": "Antônio Evaldo",
    "nacionalidade": "brasileiro"
}COPIAR CÓDIGO
Agora, vamos passar um ID bem formatado, mas que não corresponde a nenhum autor do banco de dados. Por exemplo, adicionando o número 1 ao final do ID de Antônio Evaldo, no lugar do último zero:
http://localhost:3000/autores/63ceeb2491ad5e9832ce3701COPIAR CÓDIGO
Receberemos como retorno:
{
    "message": "id do Autor não localizado."
}COPIAR CÓDIGO
Ou seja: tudo funciona de forma idêntica a antes.
Refatoração em autoresController
Para fechar, vamos voltar ao VS Code. Se já conseguimos realizar esse tratamento de erros de forma mais centralizada no middleware, podemos agora retornar a autoresController.js e fazer o next(erro) nos outros métodos.
Em cadastrarAutor, vamos remover o res.status(500).send({message: '${erro.message} - falha ao cadastrar Autor.'}). No lugar, vamos colocar next(), passando erro como parâmetro.
Também precisamos receber o next como terceiro parâmetro da função assíncrona do método cadastrarAutor. Teremos, então:
autoresController.js
  static cadastrarAutor = async (req, res, next) => {
    try {
      let autor = new autores(req.body);

      const autorResultado = await autor.save();

      res.status(201).send(autorResultado.toJSON());
    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
Repetiremos o procedimento no método atualizarAutor: receber o next como terceiro parâmetro, apagar o res.status e substituir por next(erro):
 static atualizarAutor = async (req, res, next) => {
    try {
      const id = req.params.id;

      await autores.findByIdAndUpdate(id, {$set: req.body});

      res.status(200).send({message: "Autor atualizado com sucesso"});

    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
O mesmo para o método excluirAutor:
  static excluirAutor = async (req, res, next) => {
    try {
      const id = req.params.id;

      await autores.findByIdAndDelete(id);

      res.status(200).send({message: "Autor removido com sucesso"});
    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
Agora, salvamos autoresController.js.
Conseguimos deixar o código mais limpo, atribuindo novamente a responsabilidade de tratar erros à função especial do app.use.
Refatoração em livrosController
Vamos aproveitar e fazer o mesmo em livros.Controller.js. Abrimos esse arquivo e, no método listarLivros, vamos substituir o conteúdo de catch(erro) para next(erro) e receber next como terceiro parâmetro:
livros.Controller.js
  static listarLivros = async (req, res, next) => {
    try {
      const livrosResultado = await livros.find()
        .populate("autor")
        .exec();

      res.status(200).json(livrosResultado);
    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
O mesmo em listarLivrosPorId, que ficará assim:
  static listarLivroPorId = async (req, res, next) => {
    try {
      const id = req.params.id;

      const livroResultado = await livros.findById(id)
        .populate("autor", "nome")
        .exec();

        res.status(200).send(livroResultado);
    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
Em cadastrarLivro:
  static cadastrarLivro = async (req, res, next) => {
    try {
      let livro = new livros(req.body);

      const livroResultado = await livro.save();

      res.status(201).send(livroResultado.toJSON());
    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
Em atualizarLivro:
  static atualizarLivro = async (req, res, next) => {
    try {
      const id = req.params.id;

      await livros.findByIdAndUpdate(id, {$set: req.body});

      res.status(200).send({message: "Livro atualizado com sucesso"});
    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
Em excluirLivro:
  static excluirLivro = async (req, res, next) => {
    try {
      const id = req.params.id;

      const livroResultado = await livros.findByIdAndDelete(id);

      console.log(livroResultado);

      if (livroResultado !== null) {
        res.status(200).send({message: "Livro removido com sucesso"});
      } else {
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
Por fim, em listarLivroPorEditora:
  static listarLivroPorEditora = async (req, res, next) => {
    try {
      const editora = req.query.editora;

      const livrosResultado = await livros.find({"editora": editora});

      res.status(200).send(livrosResultado);
    } catch (erro) {
      next(erro);
    }
  };COPIAR CÓDIGO
Essa é uma refatoração que deixa o nosso código mais limpo e a nossa API cada vez mais resiliente!
Separando o middleware
Há algo que ainda podemos fazer em app.js. Perceba que o código de tratamento de erros já está aumentando o arquivo. Por isso, criaremos uma pasta dentro de "src" chamada "Middlewares", inserindo nela a função callback de tratamento de erros.
Então, no explorador de arquivos na lateral esquerda da tela, selecionamos "src" e clicamos no ícone de "Criar pasta". Vamos nomeá-la como "middlewares".
Nela, criaremos um arquivo que chamaremos de manipuladorDeErros.js e, dentro dele, vamos escrever uma função de mesmo nome: function manipuladorDeErros().
Ela será exatamente a função callback que passamos para app.js. Então, ao final do arquivo manipuladorDeErros.js escrevemos export default manipuladorDeErros.
Em seguida, no arquivo app.js damos um "Ctrl + X" na função callback e, no lugar, importamos a função manipuladorDeErros em app.use:
app.js
// eslint-disable-next-line no-unused-vars
app.use(manipuladorDeErros);COPIAR CÓDIGO
Nesse mesmo arquivo, também removemos a importação do mongoose, porque já não estamos mais o utilizando nesse arquivo.
Podemos salvar app.js.
De volta ao manipuladorDeErros.js, colamos a função callback que recortamos de app.js, tirando a arrow function, porque será uma detalhação de função normal.
Também precisamos colocar o comentário que desativa a verificação do uso do parâmetro. Para isso, damos um "Ctrl + . (ponto final)" em cima de next e selecionamos a opção "Disable no-unused-vars for this line".
Por fim, também importaremos o mongoose.
Teremos, então:
manipuladorDeErros.js
import mongoose from "mongoose";

// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next) {
    if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."})
    } else { 
        res.status(500).send({message: "Erro interno de servidor."})
    }
}

export default manipuladorDeErros;COPIAR CÓDIGO
Pronto! Vamos salvar o arquivo e verificar se tudo ainda funciona.
De volta ao Postman, vamos dar "Send" naquele mesmo ID inexistente:
 http://localhost:3000/autores/63ceeb2491ad5e9832ce3701COPIAR CÓDIGO
O retorno continua o mesmo:
{
    "message": "id do Autor não localizado."
}COPIAR CÓDIGO
Vamos passar um "z" ao final da string, no lugar do número 1, tornando a URL inválida:
http://localhost:3000/autores/63ceeb2491ad5e9832ce370zCOPIAR CÓDIGO
Ao apertar "Send", a resposta é:
{
    "message": "Um ou mais dados fornecidos estão incorretos."
}COPIAR CÓDIGO
Conclusões
Falamos bastante sobre middlewares, mas, afinal, o que realmente é um middleware no Express?
Middleware é um termo técnico utilizado para essas funções especiais que passamos para esse método do app.use.
Os middlewares são funções que, basicamente, interceptam alguma ação; mais especificamente, interceptam alguma requisição feita para a nossa API.
Nesse caso, criamos um middleware de manipulador de erros. Ou seja, sempre que um erro for lançado na nossa aplicação, esse middleware vai interceptá-lo e tratá-lo da forma correta.
Existem vários outros tipos de middlewares no Express além do de tratamento de erros, que normalmente recebem apenas três parâmetros, por exemplo.
A palavra "middle" significa "meio" em inglês. É como se essa função entrasse no meio de uma ação e a interceptasse de alguma forma. Foi isso o que fizemos com os erros.
Agora que já temos uma base de tratamento de erros pronta, com um arquivo separado para isso, estamos preparados para tratar mais alguns casos de erros mais específicos da nossa API. Faremos isso a partir do próximo vídeo.
Até lá!
Erros de validação
Anteriormente, criamos um middleware de manipulador de erros para centralizar a parte de tratamento de erros.
Em app.js, escrevemos app.use(manipuladorDeErros) e, no arquivo manipuladorDeErros.js, fazemos as verificações de erros mais específicos, que é um CastError.
Assim, no arquivo dos controladores, não precisamos nos preocupar em fazer essas verificações mais específicas em cada método.
Erro de validação
Com essa base de tratamento de erros pronta, podemos verificar mais um caso interessante em cadastrarAutor. Nesse método, estamos recebendo uma informação da URL - no caso, a pessoa coloca alguns campos do autor, sendo nacionalidade e nome.
Se verificarmos o modelo de autor no VSCode, abrindo a pasta "models" e clicando no arquivo Autor.js, observamos que o nome é obrigatório (required: true):
Autor.js
const autorSchema = new mongoose.Schema(
  {
    id: {type: String},
    nome: {type: String, required: true},
    nacionalidade: {type: String}
  },
  {
    versionKey: false
  }
);COPIAR CÓDIGO
Então, o que acontece se a pessoa não passar esse nome no corpo da requisição? Vamos testar no Postman.
Vamos alterar a requisição de "GET" para "POST" no campo de seleção na barra superior da tela e terminar a URL em "/autores".
POST http://localhost:3000/autores
Em seguida, clicamos na aba "Body" logo abaixo do campo de URL e, no campo de código, abrimos um objeto vazio:
{

}COPIAR CÓDIGO
Em seguida, clicamos em "Send" no canto superior direito da tela para enviar a requisição. Ao fazer isso, surge a seguinte mensagem no campo de retorno:
{ 
    "message": "Erro interno de servidor."
}COPIAR CÓDIGO
Ou seja, tivemos um erro de validação porque não passamos um dado obrigatório, mas esse erro não está especificado. É interessante deixar essas mensagens de erro mais coerentes para o Front-End. Então, vamos voltar para o VSCode.
Tratamento do erro de validação
Faremos esse tratamento de erro de validação de campo obrigatório no manipulador de erros, no arquivo manipuladorDeErros.js. Apenas esse código aumentará de tamanho, deixando essa parte de erros mais centralizada.
Então, no código de manipuladorDeErros, antes do else, vamos escrever else if() {}. Dentro dos parênteses, escrevemos erro instanceof mongoose.Error.ValidationError. Sabemos que esse tipo de erro será lançado justamente quando houver um erro de validação, sendo o que significa "validation error" em inglês.
Dentro das chaves do else if escrevemos res.status(400), porque também se trata de uma requisição incorreta realizada pela pessoa usuária. Depois fazemos um send passando uma mensagem dizendo "Houve um erro de validação de dados":
// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next) {
  if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."});
  } else if (erro instanceof mongoose.Error.ValidationError) {
        res(400).send({message: "Houve um erro de validação de dados"})
    } else {
        res.status(500).send({message: "Erro interno do servidor."});
    }
}COPIAR CÓDIGO
Pronto. Salvamos esse arquivo e vamos verificar se essa mensagem vai aparecer no Postman.
Pressionamos "Send" para a requisição com o objeto vazio novamente. No campo de retorno, surge:
{ 
    "message": "Houve um erro de validação de dados"
}COPIAR CÓDIGO
Mas essa mensagem ainda está muito genérica. Seria interessante dizer quais campos não estão sendo validados.
Erro de validação específico
Vamos voltar ao VSCode. Quando esse erro é uma instância de ValidationError, ele possuirá uma propriedade chamada errors. Podemos dar um console.log() nela, em erro.errors:
manipuladorDeErros.js
// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next) {
  if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."});
  } else if (erro instanceof mongoose.Error.ValidationError) {
        console.log(erro.errors);

// código omitidoCOPIAR CÓDIGO
Salvamos esse arquivo e abrimos o terminal integrado do VSCode.
De volta ao Postman, vamos dar "Send" no objeto vazio novamente. No terminal integrado do VSCode, surge um objeto com uma propriedade chamada "nome", cujo valor é um ValidatorError:
Retorno no terminal integrado
{
    nome: ValidatorError: Path `nome` is required
// omitido
}COPIAR CÓDIGO
O valor dessa propriedade é outro tipo de erro do mongoose. O que queremos fazer é pegar a frase que está aparecendo: "Path nome is required", que significa "O campo nome é obrigatório". Ela está em inglês, mas depois veremos como personalizá-la.
Ou seja, queremos pegar todos os possíveis erros que aparecerem nesse objeto que imprimimos e formatar a mensagem de erro de uma forma mais interessante para o Front-End.
Então vamos fazer isso!
Mensagens de erro de validação
Fechando o terminal, vamos trocar o console.log em erro.errors pelo seguinte: const mensagensErro recebe Object.values(). Esse é um método próprio do JavaScript para iterar sobre objetos.
Então, passaremos nele o parâmetro erro.errors - justamente as propriedades que vimos cujos valores são os erros: Object.values(erro.errors).
Esse método vai nos retornar um array com os valores de cada propriedade do objeto. Nesse array faremos um map(), em que podemos obter o erro que estamos iterando.
Então pegamos o erro em questão, erro, escrevemos a flecha da arrow function, =>, para reescrever aquele erro por erro.message: map(erro => erro.message).
Isso exige que saibamos algumas das propriedades que esses erros possuem internamente. Então, o que estamos fazendo nesse map() é reescrever cada uma daquelas propriedades do objeto apenas pela message.
Essa message é, simplesmente, aquela string que vimos no retorno do terminal. Por exemplo: "O campo nome é obrigatório". Então, esse map() vai nos retornar um array de strings, de mensagens de erro, e é isso que queremos mostrar para o Front-End.
Dessa forma, nesse array, aplicaremos o método .join() do JavaScript. Ele juntará cada um dos elementos do array com alguma string, que pode ser "; " (ponto e vírgula com espaço) para ficar redondo para o Front-End: .join("; ").
Teremos:
manipuladorDeErros.js
// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next) {
  if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."});
  } else if (erro instanceof mongoose.Error.ValidationError) {
        const mensagensErro = Object.values(erro.errors)
            .map(erro => erro.message)
            .join("; ")

// código omitidoCOPIAR CÓDIGO
Agora, vamos passar a constante mensagensErro para a mensagem que estamos retornando no status.send. Para isso, vamos apagar a frase de antes, "Houve um erro de validação de dados", e substituiremos por uma template string, dizendo "Os seguintes erros foram encontrados:".
Depois dos dois pontos, passamos uma interpolação ($ {}), com mensagensErro dentro das chaves. Ficando assim: Os seguintes erros foram encontrados: $ {mensagensErro}.
Depois do .join(), então, teremos:
// código omitido

        res(400).send({message: `Os seguintes erros foram encontrados: $ {mensagensErro}`});
    } else {
        res.status(500).send({message: "Erro interno do servidor."});
    }COPIAR CÓDIGO
Salvamos esse arquivo para ver se isso vai funcionar.
De volta ao Postman, vamos novamente enviar o objeto vazio. Receberemos:
Retorno do Postman
{ 
    "message": "Os seguintes erros foram encontrados: Path `nome` is required."
}COPIAR CÓDIGO
O código está funcionando! Mas havíamos combinado de personalizar as mensagens, pois elas estão em inglês. Para o Front-End é mais interessante ter uma mensagem personalizada, até para não expor o funcionamento do Back-End. No caso, como o MongoDB retorna essas mensagens para nós.
Mensagens de erro personalizadas
Voltando ao VSCode, personalizaremos essas mensagens no modelo do autor. Então, vamos abrir o arquivo Autor.js.
No campo de nome da propriedade que estamos passando no esquema, vamos dar um "Enter" em cada linha do objeto para visualizar melhor.
Em required, ao invés de ser simplesmente o valor true, vamos envolvê-lo em colchetes e transformar isso num array, cuja primeira posição é o true e a segunda será a mensagem de erro personalizada. Isso é um recurso que o próprio mongoose fornece na hora de construir os esquemas dos bancos de dados.
A mensagem será "O nome do(a) autor(a) é obrigatório". Então, nosso modelo de autor ficará assim:
Autor.js
const autorSchema = new mongoose.Schema(
  {
    id: {type: String},
    nome: {
      type: String,
      required: [true, "O nome do(a) autor(a) é obrigatório"]
    },
    nacionalidade: {type: String}
  },
  {
    versionKey: false
  }
);COPIAR CÓDIGO
Vamos salvar esse arquivo e testar.
No Postman, vamos mais uma vez dar "Send" no objeto vazio. Receberemos:
Retorno do Postman
{ 
    "message": "Os seguintes erros foram encontrados: O nome do(a) autor(a) é obrigatório."
}COPIAR CÓDIGO
Pronto, deu certo!
Agora, podemos aproveitar para aplicar as mensagens de erro personalizadas para os livros também.
No modelo do livro, no arquivo Livro.js, podemos colocar mensagens personalizadas para o título, autor e editora.
Repetiremos o processo do modelo de autor para os três objetos: dando "Enter" em cada linha, transformando o valor de required em um array cuja primeira posição é true e a segunda é a mensagem. Serão as seguintes:
•	Mensagem de título: "O título do livro é obrigatório"
•	Mensagem de autor: "O(a) autor(a) é obrigatório"
•	Mensagem de editora: "A editora é obrigatória"
Então, o esquema de livro ficará assim:
Livro.js
const livroSchema = new mongoose.Schema(
  {
    id: {type: String},
    titulo: {
      type: String,
      required: [true, "O título do livro é obrigatório"]
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "autores",
      required: [true, "O(a) autor(a) é obrigatório"]
    },
    editora: {
      type: String,
      required: [true, "A editora é obrigatória"]
    },
    numeroPaginas: {type: Number}
  }
);COPIAR CÓDIGO
Vamos salvar esse arquivo e testar.
No Postman, vamos mudar a URL de "/autores" para "/livros". No campo de código, vamos passar novamente um objeto vazio para ver se todas essas mensagens de erro aparecem.
POST http://localhost:3000/livros
Ao apertar "Send", recebemos:
Retorno do Postman
{
    "message" "Os seguintes erros foram encontrados: A editora é obrigatória; O(a) autor(a) é obrigatório; O título do livro é obrigatório"
}COPIAR CÓDIGO
Conclusões
Estamos conseguindo tratar esses erros de validação para qualquer rota da nossa aplicação. Perceba a vantagem de criar um middleware de tratamento de erros!
Fizemos apenas um if else de ValidationError e, agora, todo esse tratamento está sendo realizado de forma mais automatizada. Isso é algo muito interessante, que nos ajuda bastante!
Mas você percebe que o código do manipuladorDeErros está aumentando bastante? Seria interessante refatorá-lo de alguma forma, e é isso que faremos adiante.
Até lá!
Refatorando o manipulador de erros
Já conseguimos tratar alguns casos bem interessantes no manipuladorDeErros.js, como o erro de requisição incorreta e o erro de validação. Além de erros mais gerais, caso haja um problema no servidor, como o banco de dados fora do ar.
Porém, o código está aumentando e seria interessante refatorá-lo. Principalmente na parte de erro de validação onde temos um código específico para conseguir formatar a mensagem de erro levada ao front-end.
Para fazer essa refatoração, vamos nos aproveitar do recurso de orientação a objetos do JavaScript.
Criação de um erro base
Primeiro, vamos criar uma classe que vai ser um erro base que sempre vai ter uma propriedade chamada mensagem e outra chamada status. Isso vai nos ajudar a padronizar as mensagens de erro que mandamos ao front-end, além de reduzir o código do manipulador de erros.
Dentro da pasta "src", vamos criar uma pasta chamada "Erros" que conterá um novo arquivo chamado ErroBase.js.
No arquivo ErroBase.js, vamos escrever class ErroBase extends Error. Essa linha de código significa que a classe ErroBase vai herdar da classe Error, a qual é do JavaScript e possui propriedades nativas.
No final do arquivo, já vamos exportar ErroBase como export default.
ErroBase.js:
class ErroBase extends Error {

}

export default ErroBase;COPIAR CÓDIGO
Dentro da classe ErroBase, vamos criar um constructor(). Esse construtor recebe dois parâmetros: uma mensagem de erro e um status de erro.
Podemos colocar um padrão para esses parâmetros. Vamos colocar mensagem igual à "Erro interno do servidor" entre aspas duplas. E o valor padrão do status vai ser 500 que é o código de erro geral do servidor.
Dentro do construtor, vamos escrever super seguido de abre e fecha parênteses, porque é obrigatório quando fazemos uma classe que herda de outra.
Também digitamos this.message. Message é uma propriedade que vem da classe Error. Nesse caso, ela vai receber mensagem.
Por fim, escrevemos this.status. Status é uma propriedade que vamos criar para nossa classe. Nesse caso, ela recebe o status do parâmetro.
Com isso, aplicamos valores padrão, mas também podemos personalizar esses parâmetros no construtor quando quisermos.
class ErroBase extends Error {
  constructor(mensagem = "Erro interno do servidor", status = 500) {
    super();
    this.message = mensagem;
    this.status = status;
  }
}

export default ErroBase;COPIAR CÓDIGO
Também tem um método que queremos que todo erro base possua. Esse método vai se chamar enviarResposta() e serve para reutilizar o código onde usamos o send() para passar o status e a mensagem.
O método enviarResposta() vai receber um parâmetro chamado res, o objeto de resposta que geralmente utilizamos nos controladores.
Dentro do método, vamos escrever res.status() com o valor this.status entre os parênteses. Ou seja, vamos obter o status já armazenado na classe. Ao final desse código, vamos acrescentar .send().
No send(), vamos passar um objeto ({}) que vai ter uma propriedade chamada de mensagem com o valor this.message. Vamos acrescentar uma segunda propriedade chamada status com o valor this.status.
Por mais que essa resposta já envie o status de forma semântica pelo método status(), colocá-lo também no objeto de erro que enviamos ao front-end facilita o trabalho da equipe - uma vez que evita ter que ler cabeçalhos, por exemplo.
class ErroBase extends Error {

//…

  enviarResposta(res) {
    res.status(this.status).send({
      mensagem: this.message,
      status: this.status
    });
  }
}

export default ErroBase;COPIAR CÓDIGO
Refatoração de erro de servidor
Após salvar o arquivo, vamos aprender como utilizar esse ErroBase no "src > middlewares > manipuladorDeErros.js".
No último else da função manipuladorDeErros, vamos substituir a linha de res.status(500) por new ErroBase().
Com isso, fazemos a importação automática de ErroBase. Vamos até o início do arquivo conferir se o caminho da importação está com a extensão .js. O caminho deve ser ../erros/ErroBase.js.
Vamos voltar a linha de new ErroBase(). Nesse novo ErroBase que estamos criando, vamos utilizar o método .enviarResposta() e passar res como parâmetro.
Esse é o res que recebemos no parâmetro do manipuladorDeErros para fazer res.status().json que fizemos na classe.
manipuladorDeErros.js:
import mongoose from "mongoose";
import ErroBase from "../erros/ErroBase.js";

// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next) {
  if (erro instanceof mongoose.Error.CastError) {
        res.status(400).send({message: "Um ou mais dados fornecidos estão incorretos."});
  } else if (erro instanceof mongoose.Error.ValidationError) {
        const mensagensErro = Object.values(erro.errors)
            .map(erro => erro.message)
            .join("; ")

        res(400).send({message: `Os seguintes erros foram encontrados: $ {mensagensErro}`});
    } else {
        new ErroBase().enviarResposta(res);
    }
}COPIAR CÓDIGO
Para testar esse código que acabamos de escrever, vamos abrir o controlador de livros em "src > controllers > livrosController.js".
No método listarLivros(), vamos forçar um erro de servidor. Para isso, vamos escrever throw new Error() dentro do bloco try para forçar um erro interno de servidor.
livrosController.js:
class LivroController {

  static listarLivros = async (req, res, next) => {
    try {
      throw new Error();

      const livrosResultado = await livros.find()
        .populate("autor")
        .exec();

      res.status(200).json(livrosResultado);
    } catch (erro) {
      next(erro);
    }
  };

//…

}COPIAR CÓDIGO
Vamos salvar o arquivo e voltar ao Postman. Vamos fazer um GET na rota de /livros e enviar com o botão de "Send".
GET http://localhost:3000/livros
{
    "mensagem": "Erro interno do servidor",
    "status": 500
}COPIAR CÓDIGO
Como retorno aparece a mensagem de erro interno do servidor. Com isso, sabemos que a linha new ErroBase().enviarResposta() do manipuladorDeErros funciona.
Não se esqueça de apagar a linha throw new Error() do arquivo livrosController.js, pois não precisamos mais desse erro de servidor. Pode salvá-lo e fechá-lo.
Refatoração de erro de requisição
Agora, precisamos refatorar as partes dos erros mais específicos do arquivo manipuladorDeErros.js. No caso, são os erros de CastError que é o erro de requisição incorreta e o ValidationError que é o erro de validação.
Para isso, vamos usar mais recursos da orientação a objetos. Vamos criar novas classes para esses erros mais específicos.
Dentro da pasta "src > erros", vamos criar mais um arquivo chamado RequisicaoIncorreta.js. Esse vai ser o nome da nossa classe.
No arquivo, vamos escrever class RequisicaoIncorreta seguido de extends ErroBase. Desse modo, importamos automaticamente o arquivo ErroBase que criamos nessa mesma pasta. Lembre-se de adicionar a extensão ao caminho para que seja ./ErroBase.js.
Também vamos exportar RequisicaoIncorreta como export dafault no final do arquivo.
RequisicaoIncorreta.js:
import ErroBase from "./ErroBase.js";

class RequisicaoIncorreta extends ErroBase {
}

export default RequisicaoIncorreta;COPIAR CÓDIGO
Na classe RequisicaoIncorreta, vamos abrir o construct(). Dentro das chaves desse construtor, vamos chamar um super() que serve para chamar o construtor de ErroBase.
O primeiro parâmetro do super() vai ser a mensagem que podemos definir. A mensagem padrão para requisição incorreta será "Um ou mais dados fornecidos estão incorretos." - e a mesma frase que colocamos no manipulador.
O segundo parâmetro do super(), vai ser o status de erros 400. Depois, vamos salvar o arquivo.
import ErroBase from "./ErroBase.js";

class RequisicaoIncorreta extends ErroBase {
  constructor(mensagem = "Um ou mais dados fornecidos estão incorretos") {
    super(mensagem, 400);
  }
}

export default RequisicaoIncorreta;COPIAR CÓDIGO
Vamos voltar para manipuladorDeErros.js para remover a linha de res.status(400).send() do if da função.
No lugar, vamos colocar new RequisicaoIncorreta() e também um .enviarResposta() que possui o objeto res como parâmetro.
Note que fizemos o autoimport de RequsicaoIncorreta do caminho ../erros/RequisicaoIncorreta.js.
manipuladorDeErros.js:
import mongoose from "mongoose";
import ErroBase from "../erros/ErroBase.js";
import RequisicaoIncorreta from "../erros/RequisicaoIncorreta.js";

// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next) {
  if (erro instanceof mongoose.Error.CastError) {
    new RequisicaoIncorreta().enviarResposta(res);
  } 

//…

}COPIAR CÓDIGO
Assim, refatoramos o código. Perceba que o status ficou mais abstraído. O status de 400 e a frase padrão ficaram em um arquivo separado. Dessa forma, cada arquivo fica com sua própria responsabilidade.
Com isso, o manipuladorDeErros vai somente instanciar as novas classes criadas.
Refatoração de erro de validação
Vamos aproveitar para refatorar a parte de ValidationError ao criar uma nova classe dentro da pasta "src > erros". Nela, vamos criar um arquivo chamado ErroValidacao.js.
Dentro do arquivo, vamos criar uma classe de mesmo nome, ou seja, class ErroValidacao. Nesse caso, essa classe vai herdar da classe de RequisicaoIncorreta, porque o erro de validação tem o mesmo status da requisição incorreta, o 400. Realmente uma requisição incorreta foi feita quando um erro de validação acontece.
Note que a classe RequisicaoIncorreta foi importada automaticamente no início do arquivo. Certifique-se que o caminho tem a extensão .js.
Dentro da classe ErroValidacao, vamos digitar construct(). Dentro do construtor, vamos escrever o super() de requisição incorreta.
ErroValidacao.js:
import RequisicaoIncorreta from "./RequisicaoIncorreta.js";

class ErroValidacao extends RequisicaoIncorreta {
  constructor() {
    super();
  }
}COPIAR CÓDIGO
Como queremos personalizar a mensagem de requisição incorreta, vamos voltar no arquivo RequisicaoIncorreta para receber essa mensagem como parâmetro de seu construtor.
Para isso, escrevemos mensagem como parâmetro de constructor(). E vamos colocar o valor padrão da mensagem como a string que já utilizávamos.
Ou seja, vamos recortar com o atalho "Ctrl + X" a frase "Um ou mais dados fornecidos estão incorretos" de super() para colocar como valor padrão do parâmetro de mensagem.
Agora, passamos mensagem como primeiro parâmetro de super().
RequisicaoIncorreta.js:
class RequisicaoIncorreta extends ErroBase {
  constructor(mensagem = "Um ou mais dados fornecidos estão incorretos") {
    super(mensagem, 400);
  }
}COPIAR CÓDIGO
Feito isso, podemos voltar ao arquivo ErroValidacao.js. Dentro do construtor, vamos fazer a lógica de obter os erros de cada validação e passar como parâmetro de super().
Para isso, vamos recortar o trecho do código da const mensagensErro que está em else if do arquivo manipuladorDeErros.js:
    const mensagensErro = Object.values(erro.errors)
      .map(erro => erro.message)
      .join("; ");COPIAR CÓDIGO
Em ErroValidacao.js, vamos colar esse trecho no construtor.
ErroValidacao.js:
class ErroValidacao extends RequisicaoIncorreta {
  constructor() {
    const mensagensErro = Object.values(erro.errors)
      .map(erro => erro.message)
      .join("; ");

    super();
  }
}COPIAR CÓDIGO
A mensagem que vamos passar ao super() também será copiado do arquivo manipuladorDeErros.js. Assim, vamos recortar a template string dentro de else if:
`Os seguintes erros foram encontrados: ${mensagensErro}`COPIAR CÓDIGO
Aproveite e apague a linha res.status(400) de else if. Dessa maneira, else if do manipulador fica vazio.
Voltamos uma última vez em ErroValidacao.js e colamos a template string como parâmetro do super().
Por fim, repare que não temos mais acesso a erro.erros dentro do construtor de ErroValidacao. Por isso, precisamos receber erro como parâmetro do construtor.
Vamos aproveitar e exportar a classe ErroValidacao como export default ao final do arquivo.
ErroValidacao.js:
import RequisicaoIncorreta from "./RequisicaoIncorreta.js";

class ErroValidacao extends RequisicaoIncorreta {
  constructor(erro) {
    const mensagensErro = Object.values(erro.errors)
      .map(erro => erro.message)
      .join("; ");

    super(`Os seguintes erros foram encontrados: ${mensagensErro}`);
  }
}

export default ErroValidacao;COPIAR CÓDIGO
Devemos voltar ao arquivo manipuladoDeErros.js. Agora podemos utilizar essa classe ErroValidacao que acabamos de criar dentro do else if que ficou vazio.
No elseif do ValidationError, vamos escrever new ErroValidacao(), passando como parâmetro o erro porque tem a propriedade chamada Errors. Por fim, vamos chamar o método .enviarReposta(), passando o objeto res como parâmetro.
Note que já importamos automaticamente ErroValidacao no início do arquivo.
Verifique como ficou o arquivo completamente refatorado:
manipuladorDeErros.js:
import mongoose from "mongoose";
import ErroBase from "../erros/ErroBase.js";
import ErroValidacao from "../erros/ErroValidacao.js";
import RequisicaoIncorreta from "../erros/RequisicaoIncorreta.js";

// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next) {
  if (erro instanceof mongoose.Error.CastError) {
    new RequisicaoIncorreta().enviarResposta(res);
  } else if (erro instanceof mongoose.Error.ValidationError) {
    new ErroValidacao(erro).enviarResposta(res);
  } else {
    new ErroBase().enviarResposta(res);
  }
}

export default manipuladorDeErros;COPIAR CÓDIGO
Após salvar o arquivo, vamos testar no Postman se o erro de requisição e o erro de validação continuam a funcionar da mesma maneira.
Primeiro, vamos analisar o ValidationError. Para isso, vamos tentar fazer um POST de /livros com um objeto vazio na aba "Body".
POST http://localhost:3000/livros
Após apertar o "Send", a postagem não funcionou. Isso é o que queríamos.
{ 
    "message": "Os seguintes erros foram encontrados: A editora é obrigatória; O(a) auto(a) é obrigatório; O título do livro é obrigatório",
    "status": "400"
}COPIAR CÓDIGO
Agora, vamos testar o CastError com um livro específico. Para isso, vamos usar o GET em todos os livros e copiar o id do primeiro livro retornado, o "Java Essencial 2".
Vamos adicionar uma barra na URL do Postman e colar o id do livro. Mas, vamos alterar a URL para forçar o erro. Nesse caso, acrescentamos duas letras "a" ao final da URL.
http://localhost:3000/livros/63c947e7a42dc646e7913001aaCOPIAR CÓDIGO
Vamos enviar a requisição "GET" com essa URL modificada apertando o "Enter". O retorno é a mensagem de erro esperada.
{ 
    "message": "Um ou mais dados fornecidos estão incorretos",
    "status": "400"
}COPIAR CÓDIGO
Se passamos a URL correta do livro "Java Essencial 2", devemos ter o retorno do livro correto.
http://localhost:3000/livros/63c947e7a42dc646e7913001COPIAR CÓDIGO
É retornado o livro "Java Essencial 2" como queríamos.
{
    "_id": "63c947e7a42dc646e7913001",
    "titulo": "Java Essencial 2",
    "autor": {
        "_id": 63c959a03030abb06dd29ab",
        "nome": Jaqueline Magalhães",
    }
    "editora": "Casa do código",
    "numeroPaginas": 150,
    "__v": 0
}COPIAR CÓDIGO
Assim, sabemos que refatoramos o código com sucesso, pois a nossa API continua a funcionar da mesma forma que anteriormente. E agora cada erro tem seu próprio arquivo, com mensagem e status mais separados.
No próximo vídeo, vamos falar de um erro bem famoso: o 404. Pois, ainda não tratamos esse erro de "página não encontrada" da melhor forma na nossa aplicação.
Tratando página 404
O nosso tratamento de erro já está bem robusto. Então, conseguimos tratar casos mais específicos, como uma informação inválida na URL ou um erro de validação, e casos mais gerais, como um erro de servidor. Fazemos esse erro de servidor no manipulador de erros, um middleware de erros do Express que nós mesmos escrevemos.
Porém, tem um caso interessante que ainda não abordamos, a página não encontrada que é o famoso erro 404.
Visualização de página não encontrada
Vamos no Postman para visualizar esse erro. Com o método GET, vamos colocar a rota /livros, mas vamos acrescentar outra letra "S" no final.
GET http://localhost:3000/livross
Ao apertar "Enter" para enviar a requisição, o Postman nos retorna uma página HTML.
<!DOCTYPE html>
<html lang="en">

  <head>
    <meta charset="utf-8">
    <title>Error</title>
  </head>

  <body>
    <pre>Cannot GET /livross</pre>
  </body>

</html>COPIAR CÓDIGO
Geralmente, conseguimos fazer o erro cair no nosso erro base com a mensagem de "Erro interno do servidor" com status 500 - até mesmo em erros não tratados.
Dessa vez, o Postman retornou corretamente o status de 404. Contudo, a página veio em HTML. De alguma forma, não passou pelo nosso manipulador de erros que sempre retorna um JSON.
Vamos entender por que isso aconteceu?
Rotas no Express
No VSCode, vamos em "src > app.js" para entender como o Express trata as rotas.
Na linha 13 do arquivo app.js, temos a função routes que passa app como parâmetro.
app.js:
//…

const app = express();
app.use(express.json());
routes(app);

//…COPIAR CÓDIGO
Vamos até a declaração do routes em "src > routes > index.js". Nesse arquivo, temos a função routes e dentro dela a execução de app.use que recebe um express.json, um roteador chamado livros e outro chamado autores.
index.js:
// …

const routes = (app) => {
  app.route("/").get((req, res) => {
    res.status(200).send({titulo: "Curso de node"});
  });

  app.use(
    express.json(),
    livros,
    autores
  );
};

export default routes;COPIAR CÓDIGO
Vamos escolher um desses roteadores, por exemplo, o roteador de livros. Por isso, vamos abrir o arquivo "src > routes > livrosRoutes.js".
Nele, temos um roteador (router) onde registramos cada uma das rotas (como /livros e /livros/busca) com os métodos get(), post(), put() e delete().
livrosRoutes.js:
//…

const router = express.Router();

router
  .get("/livros", LivroController.listarLivros)
  .get("/livros/busca", LivroController.listarLivroPorEditora)
  .get("/livros/:id", LivroController.listarLivroPorId)
  .post("/livros", LivroController.cadastrarLivro)
  .put("/livros/:id", LivroController.atualizarLivro)
  .delete("/livros/:id", LivroController.excluirLivro);

export default router;COPIAR CÓDIGO
O que acontece é que cada uma dessas rotas registradas nesses roteadores no Express são verificadas de forma sequencial.
Assim, o Express verifica a URL passada e o verbo HTTP sequencialmente (ou seja, do primeiro ao último) sempre que fazemos uma requisição para a API, buscando correspondência a algumas das rotas e verbos já registrados.
Dessa forma, vai fazer a verificação com livrosRoutes.js e depois autoresRoutes.js.
Se não houver correspondência com nenhuma dessas rotas registradas, o Express vai retornar uma página 404 HTML por padrão.
Em outras palavras, o Express não lança um erro. É exatamente por isso que o nosso manipulador de erros não pega nenhum erro e temos um comportamento padrão de uma página 404 do Express.
Ou seja, essa página precisa ter um tratamento especial. Vamos fazer isso agora!
Tratamento da página 404
Em "src > app.js", vamos registrar mais um middleware depois da função routes.
Para isso, digitamos app.use() seguido do nome do middleware, o qual será manipulador404.
Note que esse código está exatamente depois de routes(app), porque queremos que o código desse middleware seja executado apenas se nenhuma das outras rotas tiveram correspondência com a URL solicitada.
app.js:
//…

const app = express();
app.use(express.json());
routes(app);

app.use(manipulador404);

//…COPIAR CÓDIGO
Agora precisamos criar esse middleware chamado manipulador404.
Em "src > middlewares", vamos criar o arquivo manipulador404.js com o atalho "Ctrl + N".
Dentro desse arquivo, vamos escrever function seguido de manipulador404. Esse é um middleware normal e não é um middleware de tratamento de erros. Por isso, recebe três parâmetros.
Nesse caso, vamos escrever dentro dos parênteses os parâmetros req, res e next. Em seguida, podemos abrir o corpo dessa função.
Por fim, já podemos exportar o manipulador404 com export default.
manipulador404.js:
function manipulador404(req, res, next) {}

export default manipulador404;COPIAR CÓDIGO
Agora, podemos voltar em app.js para importar o manipulador ao apertar "Ctrl + Espaço" em manipulador404. Vamos aceitar a sugestão do VSCode que vem de ./middlewares/manipulador404.js.
Repare se o manipulador404 já foi importado corretamente no começo do arquivo. Pode salvar o arquivo.
app.js:
import express from "express";
import db from "./config/dbConnect.js";
import manipulador404 from "./middlewares/manipulador404.js";
import manipuladorDeErros from "./middlewares/manipuladorDeErros.js";
import routes from "./routes/index.js";

//…COPIAR CÓDIGO
Depois, podemos voltar no arquivo manipulador404.js. O que você precisa saber é que o código que está dentro da função manipulador404 vai ser executado apenas se realmente não houver nenhuma correspondência nas outras rotas.
Dentro da função, vamos dar um res.status(404).send(). No método send(), vamos passar uma mensagem entre chaves com a frase "Página não encontrada" como string.
manipulador404.js:
function manipulador404(req, res, next) {
  res.status(404).send({mensagem: "Página não encontrada"})
}

export default manipulador404;COPIAR CÓDIGO
Após salvar o arquivo, voltamos no Postman e enviamos a requisição anterior com a rota /livross que é inexistente.
GET http://localhost:3000/livross
{
    "mensagem": "Página não encontrada"
}COPIAR CÓDIGO
O Postman retorna um JSON com a mensagem da página não encontrada. Com isso, sabemos que o código foi executado quando nenhuma das outras rotas foi correspondida.
Centralizando os tratamentos de erros
Para deixar esse tratamento de erros mais centralizado, vamos fazer o middleware manipulador404 encaminhar o erro para o middleware manipuladorDeErros. Afinal, nesse arquivo os tratamentos já estão padronizados e centralizados.
Primeiro, vamos criar uma classe para o erro 404, porque é o nosso padrão. Por exemplo, criamos uma classe para erro de validação e requisição incorreta.
Para criar a classe para a página 404, vamos criar um arquivo chamado NaoEncontrado.js dentro da pasta "src > erros".
Nele, vamos digitar a classe NaoEncontrado que vai herdar de ErroBase, por meio da palavra extends. Lembre-se que ErroBase é o erro que mantemos como base, uma classe que já tínhamos criado.
Note que já fizemos a importação de ErroBase automaticamente pelo VSCode. Só adicionamos a extensão .js ao final do caminho ./ErroBase.
Ao final do arquivo, vamos exportar a classe NaoEncontrado como export default.
NaoEncontrado.js:
import ErroBase from "./ErroBase.js";

class NaoEncontrado extends ErroBase{
}

export default NaoEncontrado;COPIAR CÓDIGO
Dentro da classe, vamos escrever constructor(). Entre as chaves de constructor, vamos chamar o super() do nosso ErroBase, o construtor da classe herdada.
Em super(), vamos passar a mensagem "Página não encontrada" entre aspas duplas para ser a mensagem do nosso erro base. O segundo parâmetro vai ser o status 404.
import ErroBase from "./ErroBase.js";

class NaoEncontrado extends ErroBase {
  constructor() {
    super("Página não encontrada", 404);
  }
}

export default NaoEncontrado;COPIAR CÓDIGO
Agora, podemos voltar no arquivo do middleware manipulador404. Vamos apagar a linha de res.status(404).send() dentro da função. Em seu lugar, escrevemos const do erro404 que recebe new NaoEncontrado seguido de abre e fecha parênteses.
Note que fizemos o auto import (importação automática) de NaoEncontrado de ../erros/NaoEncontrado. Vamos adicionar .js na extensão do caminho da importação.
Agora que temos o erro404, podemos encaminhá-lo para o nosso manipulador de erros ao escrever next() e passar 404 como parâmetro.
Lembre-se que quando executamos a função next() passando um erro como parâmetro, ela vai parar diretamente no nosso manipulador de erros. É isso que queremos fazer: encaminhar a responsabilidade para aquele middleware.
manipulador404.js:
import NaoEncontrado from "../erros/NaoEncontrado.js";

function manipulador404(req, res, next) {
  const erro404 = new NaoEncontrado();
  next(erro404);
}

export default manipulador404;COPIAR CÓDIGO
Após salvar o arquivo, vamos ir no Postman e enviar a requisição com a rota inexistente novamente.
GET http://localhost:3000/livross
{
    "mensagem": "Erro interno do servidor",
    "status": 500
}COPIAR CÓDIGO
Apareceu um erro interno do servidor com status 500. Vamos te explicar por que isso aconteceu.
No VSCode, vamos abrir o arquivo "src > middlewares > manipuladorDeErros.js". Nele, precisamos tratar esse erro em específico que é da classe NaoEncontrado.
Já que atualmente só estamos tratando alguns erros específicos. Se não for nenhum deles, vai ser considerado um erro genérico. Então, vamos adicionar o caso do erro NaoEncontrado.
Dentro da função manipuladorDeErros, vamos adicionar outro else if antes de else. Nesse else if(), vamos verificar se o erro é instanceof de NaoEncontrado.
Com isso, também fizemos uma importação automática da classe que criamos, NaoEncontrado.
Se realmente for uma instância de NaoEncontrado, vamos escrever simplesmente erro.enviarResposta(). Esse é um método disponível para qualquer erro que herda de ErroBase.
Vamos executar enviarResposta() passando o objeto res como parâmetro.
manipuladorDeErros.js:
//…
import NaoEncontrado from "../erros/NaoEncontrado.js";

// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next) {
  if (erro instanceof mongoose.Error.CastError) {

// …

  } else if (erro instanceof NaoEncontrado) {
    erro.enviarResposta(res);
  } else {
    new ErroBase().enviarResposta(res);
  }
}COPIAR CÓDIGO
Após salvar o arquivo, maximizamos o Postman novamente. Mais uma vez enviamos a rota /livross.
{
    "mensagem": "Página não encontrada",
    "status": 404
}COPIAR CÓDIGO
Já apareceu a mensagem de página não encontrada com status 404. Isso significa que o erro já funciona como esperado.
Atualizando controladores
Só tem mais uma coisa que queremos te mostrar em relação ao recurso do "não encontrado". Já usávamos o status 404 em uma das rotas da nossa aplicação, em "src > controllers > autoresController.js".
Note que já mandávamos em erro de 404 com a mensagem "Id do Autor não localizado" no método de listarAutorPorId.
autoresController.js:
class AutorController {

//…

  static listarAutorPorId = async (req, res) => {
    try {
      const id = req.params.id;

      const autorResultado = await autores.findById(id);

      if (autorResultado !== null) {
        res.status(200).send(autorResultado);
      } else {
        res.status(404).send({message: "Id do Autor não localizado."});
      }
    } catch (erro) {
      next(erro);
    }
  };

//…

}COPIAR CÓDIGO
Para deixar o arquivo mais coerente com o erro que criamos, vamos apagar o res.status(404).send() em else. Em seu lugar escrevemos next() e passamos como parâmetro new NaoEcontrado().
Com isso, importamos automaticamente no início do arquivo a classe NaoEncontrado de ../erros/NaoEncontrado.js.
Dentro dos parênteses de NaoEncontrado(), podemos até personalizar a mensagem de erro. Vamos passar a mensagem "Id do Autor não localizado" entre aspas duplas.
import NaoEncontrado from "../erros/NaoEncontrado.js";
import autores from "../models/Autor.js";

class AutorController {

//…

  static listarAutorPorId = async (req, res, next) => {
    try {
      const id = req.params.id;

      const autorResultado = await autores.findById(id);

      if (autorResultado !== null) {
        res.status(200).send(autorResultado);
      } else {
        next(new NaoEncontrado("Id do Autor não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };

//…

}COPIAR CÓDIGO
Por fim, vamos conferir se estamos preparados para receber essa mensagem lá na classe NaoEncontrado.
Ao abrir o arquivo NaoEncontrado.js percebemos que não estamos preparados para receber essa mensagem. Por isso, recebemos mensagem como parâmetro no construtor().
Depois, definimos o valor padrão dessa mensagem como igual à "Página não encontrada" no construtor().
Desse modo, podemos passar a mensagem como o primeiro parâmetro do super().
NaoEncontrado.js:
import ErroBase from "./ErroBase.js";

class NaoEncontrado extends ErroBase {
  constructor(mensagem = "Página não encontrada") {
    super(mensagem, 404);
  }
}

export default NaoEncontrado;COPIAR CÓDIGO
Após salvar o arquivo, vamos testar a rota de listarAutorPorId quando o id não é localizado.
Para isso, voltamos no Postman e fazemos um GET de todos os autores para copiar o id do autor Antônio Evaldo.
Agora, podemos adicionar no final da URL uma barra e esse id copiado. Só que no lugar do último 0, vamos colocar o número 1 para ser um id inexistente.
http://localhost:3000/autores/63ceeb2491ad5e9832ce3701COPIAR CÓDIGO
Ao dar "Enter", temos o retorno esperado.
{
    "mensagem": "Id do Autor não localizado.",
    "status": 404
}COPIAR CÓDIGO
Em suma, conseguimos criar esses erros no nosso código quando for necessário, como no caso de um autor não localizado. Ou seja:
O erro de 404 não precisa ser só em uma rota não encontrada.
Pode ser uma rota que corresponde com uma das rotas registradas na API, porém, se tiver um recurso não encontrado criamos esse erro NaoEncontrado.
Desafio
Contudo, existem outros métodos de autoresController.js que também precisamos fazer a tratativa de "id não localizado".
Por exemplo, note que também precisamos buscar um autor para ser atualizado no método atualizarAutor. Por isso, passamos um id. Se esse id não for localizado, vamos precisar mandar uma mensagem específica dizendo que o "id não foi localizado".
Precisaríamos fazer um if se o retorno do método findByIdAndUpdate() for nulo. Também vamos precisar fazer essas alterações no findByIdAndDelete() do excluirAutor.
Mas, vamos deixar essas alterações como tarefa de casa para você em uma atividade com melhores orientações.
No próximo vídeo, já teremos essas alterações implementadas no nosso código. Por isso, é importante que você faça essa atividade. Até lá.
Validações do Mongoose
No vídeo anterior, criamos a classe NaoEncontrado e a aplicamos no método de listarAutorPorId para mostrar erro quando o id do autor não é localizado.
Já aplicamos no código essa mesma alteração para outros métodos que dependem do id do autor, como atualizarAutor e excluirAutor em "src > controllers > autoresController.js". Além disso, deixamos uma atividade muito importante de ser feita, onde você faz as alterações desses métodos no seu próprio código para ficar similar ao nosso:
autoresController.js:
class AutorController {

//…

  static atualizarAutor = async (req, res, next) => {
    try {
      const id = req.params.id;

      const autorResultado = await autores.findByIdAndUpdate(id, {$set: req.body});

      if (autorResultado !== null) {
        res.status(200).send({message: "Autor atualizado com sucesso"});
      } else {
        next(new NaoEncontrado("Id do Autor não localizado."));
      }

    } catch (erro) {
      next(erro);
    }
  };

  static excluirAutor = async (req, res, next) => {
    try {
      const id = req.params.id;

      const autorResultado = await autores.findByIdAndDelete(id);


      if (autorResultado !== null) {
        res.status(200).send({message: "Autor removido com sucesso"});
      } else {
        next(new NaoEncontrado("Id do Autor não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };
}COPIAR CÓDIGO
Também aplicamos alterações nos métodos que precisavam pegar o id do livro, como listarLivroPorId, atualizarLivro e excluirLivro do arquivo livrosController.js que está na pasta "src > controllers". Assim, conferimos o resultado de cada livro e verificamos se é nulo. Caso seja, mandamos a classe NaoEncontrado como erro.
livrosController.js:
class LivroController {

// …

  static listarLivroPorId = async (req, res, next) => {
    try {
      const id = req.params.id;

      const livroResultado = await livros.findById(id)
        .populate("autor", "nome")
        .exec();

      if (livroResultado !== null) {
        res.status(200).send(livroResultado);
      } else {
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };

//…

  static atualizarLivro = async (req, res, next) => {
    try {
      const id = req.params.id;

      const livroResultado = await livros.findByIdAndUpdate(id, {$set: req.body});

      if (livroResultado !== null) {
        res.status(200).send({message: "Livro atualizado com sucesso"});
      } else {
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };

  static excluirLivro = async (req, res, next) => {
    try {
      const id = req.params.id;

      const livroResultado = await livros.findByIdAndDelete(id);

      if (livroResultado !== null) {
        res.status(200).send({message: "Livro removido com sucesso"});
      } else {
        next(new NaoEncontrado("Id do livro não localizado."));
      }
    } catch (erro) {
      next(erro);
    }
  };

//…
}COPIAR CÓDIGO
Com isso, estamos com a parte de tratamento de erros bem robusta na nossa aplicação. Isso vai nos ajudar no tópico de validação de dados que recebemos do front-end.
Validações de mongoose
Na verdade, já fazemos algumas validações no nosso projeto. Ao abrir o modelo de Livro.js da pasta "src > models", note que temos validações de campos obrigatórios por meio da propriedade chamada required para o campo de título, autor e editora.
Livro.js:
const livroSchema = new mongoose.Schema(
  {
    id: {type: String},
    titulo: {
      type: String,
      required: [true, "O título do livro é obrigatório"]
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "autores",
      required: [true, "O(a) autor(a) é obrigatório"]
    },
    editora: {
      type: String,
      required: [true, "A editora é obrigatória"]
    },
    numeroPaginas: {type: Number}
  }
);COPIAR CÓDIGO
Podemos fazer validações adicionais e mais específicas para não receber valores absurdos nesses campos.
Validando dados do tipo Number
Por exemplo, não fazemos nenhuma validação no campo de numeroPaginas, pois é um campo não obrigatório. Mas, podemos fazer uma validação de número mínimo e máximo de páginas para não receber milhões de páginas em um livro ou até números negativos. Afinal, esses valores que não fariam sentido para o banco de dados.
Vamos mostrar algumas validações que o próprio mongoose tem para dados do tipo número.
No campo de numeroPaginas, vamos dar um "Enter" em seu objeto para melhor visualização. Com isso, vamos adicionar uma propriedade chamada min dentro das chaves que delimitam o objeto.
Na propriedade min, podemos colocar o número mínimo de páginas que um livro possa ter no banco de dados. Por exemplo, o número 10.
Também podemos adicionar uma propriedade chamada max para indicar o número máximo que o campo pode ter. Vamos colocar o máximo de 5000 páginas.
Livro.js:
numeroPaginas: {
  type: Number
  min: 10,
  max: 5000
}COPIAR CÓDIGO
Podemos salvar esse arquivo e testar no Postman para saber se conseguimos cadastrar um livro que não segue esses parâmetros. Assim, saberemos se algum erro será retornado pelo Postman.
No Postman, vamos selecionar o verbo POST para a rota /livros.
POST http://localhost:3000/livros
Depois, vamos clicar na aba "Body" (corpo) para tentar cadastrar um novo livro.
Já temos o título "Lidando com erros", um id de autor e o nome de uma editora. Vamos mudar o número de páginas como 0.
{
    "titulo": "Lidando com erros",
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa do código",
    "numeroPaginas": 0
}COPIAR CÓDIGO
Vamos enviar a requisição, apertando o botão "Send" do lado direito da rota. Com isso, tivemos o retorno de um JSON com uma mensagem em inglês que diz que o campo de número de páginas tem valor menor que o mínimo permitido:
{
    "mensagem": "Os seguintes erros foram encontrados: Path ´numeroPaginas´ (0) is less than minimum allowed value (10).",
    "status": 400
}COPIAR CÓDIGO
Por isso, sabemos que a nossa validação de número mínimo realmente funcionou.
Agora, vamos saber se o validador de número máximo de páginas também funciona. Para isso, mudamos o valor de numeroPaginas de 0 para 5001 ainda na aba "Body" do Postman.
{
    "titulo": "Lidando com erros",
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa do código",
    "numeroPaginas": 5001
}COPIAR CÓDIGO
Vamos apertar o botão "Send" novamente e aparece novamente um erro em inglês, dizendo que o número de páginas está maior que o máximo permitido.
{
    "mensagem": "Os seguintes erros foram encontrados: Path ´numeroPaginas´ (500) is more than maximum allowed value (5000).",
    "status": 400
}COPIAR CÓDIGO
Só que essas mensagens de erro estão em inglês e queremos padronizar as mensagens em português. Vamos aprender como fazer essa personalização agora.
Personalizando mensagem de erro
Vamos voltar para o VS Code para personalizar a mensagem de erro do campo numeroPaginas do arquivo Livro.js, usando uma maneira semelhante a utilizada no atributo required.
Na propriedade min de numeroPaginas, vamos envolver seu valor entre colchetes. Como segundo item do array, colocamos a mensagem de erro entre aspas duplas. Nesse caso, colocamos "O número de páginas deve estar entre 10 e 5000".
Vamos fazer a mesma alteração para o validador de máximo de página. Fazemos um array na propriedade max. O primeiro item é 5000 e o segundo é a mesma frase de erro usada anteriormente.
numeroPaginas: {
  type: Number
  min: [10, "O número de páginas deve estar entre 10 e 5000."],
  max: [5000, "O número de páginas deve estar entre 10 e 5000."]
}COPIAR CÓDIGO
Vamos salvar o arquivo e voltar para o Postman. Ainda com o verbo POST na rota /livros, vamos forçar um erro ao retirar o campo título da aba "Body". Assim, poderemos ver a mensagem de validação de número vai sumir.
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa do código",
    "numeroPaginas": 5001
}COPIAR CÓDIGO
Após apertar o botão "Send", dois erros foram encontrados:
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; O número de páginas deve estar entre 10 e 5000.",
    "status": 400
}COPIAR CÓDIGO
A frase que personalizamos já apareceu.
E se colocamos um número válido, mas deixamos ainda sem o título? Colocamos 1000 para numeroPaginas e apertamos o botão "Send".
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa do código",
    "numeroPaginas": 1000
}COPIAR CÓDIGO
Com isso, a única mensagem de erro é sobre o título do livro ser obrigatório. Isto significa que o código funciona como esperado.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.",
    "status": 400
}COPIAR CÓDIGO
Validando dados do tipo String
Tem outra validação que queremos te mostrar ainda para esse modelo de Livro.js: a validação do dado do tipo string, como o nome da editora.
Podemos definir valores específicos que queremos que sejam guardados no banco de dados. Por exemplo, podemos querer que a editora seja apenas Casa do código ou Alura.
Para isso, depois do validador required no campo editora, vamos adicionar a propriedade enum - que vem de um termo técnico da programação para indicar valores específicos, o enumerador.
Em enum, vamos passar um array com os valores que queremos permitir para esse campo. Colocamos o valor Casa do código e outro valor chamado Alura. Ambos entre aspas duplas.
editora: {
  type: String,
  required: [true, "A editora é obrigatória"]
  enum: ["Casa do código", "Alura"]
}COPIAR CÓDIGO
Vamos salvar o arquivo. No Postman, vamos trocar o nome da editora no corpo da requisição na aba "Body" da rota /livros. Ou seja, substituímos "Casa do código" por "Casa" e apertamos o botão "Send".
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa",
    "numeroPaginas": 1000
}COPIAR CÓDIGO
Uma das mensagens retornadas está em inglês e sinaliza que "Casa" não é um enumerador válido para o caminho de editora.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; `Casa` is not a valid enum value for path `editora`.",
    "status": 400
}COPIAR CÓDIGO
Também vamos personalizar essa frase que está em inglês.
Personalizando mensagem de erro novamente
No VS Code, a sintaxe do validador enum para personalizar a mensagem de erro é um pouco diferente.
No campo editora, devemos envolver o array de valores permitidos no enum entre chaves, ou seja, criamos um objeto.
A primeira propriedade vai se chamar values que significa valores em inglês. O valor vai ser justamente o array de valores permitidos.
A segunda propriedade do enum vai ser message e será onde colocaremos nossa mensagem personalizada. Vamos colocar a frase "A editora fornecida não é um valor permitido" entre aspas duplas.
Depois, vamos salvar o arquivo.
editora: {
  type: String,
  required: [true, "A editora é obrigatória"],
  enum: {
    values: ["Casa do código", "Alura"],
    message: "A editora fornecida não é um valor permitido."
  }
},COPIAR CÓDIGO
Podemos maximizar a janela do Postman novamente e enviar a mesma requisição anterior com o botão "Send".
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa",
    "numeroPaginas": 1000
}COPIAR CÓDIGO
Agora, sim, a mensagem de erro da editora está em português.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; A editora fornecida não é um valor permitido.",
    "status": 400
}COPIAR CÓDIGO
Por último, vamos te mostrar como personalizar ainda mais essa mensagem de erro.
Por exemplo, podemos alterar a mensagem da propriedade enum no campo editora. Em vez de colocar "editora fornecida", podemos apagar "fornecida" e abrir e fechar chaves na própria string. Dentro das chaves, escrevemos VALUE em maiúsculo e sem espaços.
A palavra value significa valor e vai ser substituído pelo mongoose pelo valor fornecido pela pessoa usuária no campo editora.
Podemos fazer a mesma alteração em min e max do campo numeroPaginas.
No validador do min, vamos adicionar no final da frase o seguinte: "valor fornecido", dois-pontos, abre e fecha chaves. Dentro das chaves, escrevemos VALUE.
Vamos colocar o mesmo trecho no final da frase do validador max.
Verifique como ficou o código completo de Livros.js:
import mongoose from "mongoose";

const livroSchema = new mongoose.Schema(
  {
    id: {type: String},
    titulo: {
      type: String,
      required: [true, "O título do livro é obrigatório"]
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "autores",
      required: [true, "O(a) autor(a) é obrigatório"]
    },
    editora: {
      type: String,
      required: [true, "A editora é obrigatória"],
      enum: {
        values: ["Casa do código", "Alura"],
        message: "A editora {VALUE} não é um valor permitido."
      }
    },
    numeroPaginas: {
      type: Number
      min: [10, "O número de páginas deve estar entre 10 e 5000. Valor fornecido: {VALUE}"],
      max: [5000, "O número de páginas deve estar entre 10 e 5000. Valor fornecido: {VALUE}"]
    }
  }
);

const livros= mongoose.model("livros", livroSchema);

export default livros;COPIAR CÓDIGO
Por fim, vamos salvar o arquivo e voltar no Postman para testar o código.
Vamos novamente enviar a última requisição ao apertar o botão "Send".
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa",
    "numeroPaginas": 1000
}COPIAR CÓDIGO
Note que a mensagem de erro faz referência do valor fornecido no campo editora, "Casa". Com isso, sabemos que a sintaxe fornecida pelo mongoose do {VALUE} deu certo.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; A editora Casa não é um valor permitido.",
    "status": 400
}COPIAR CÓDIGO
Se tentamos fornecer um número de páginas não permitido, como um número negativo? Vamos colocar -5 e verificar o retorno.
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa",
    "numeroPaginas": -5
}COPIAR CÓDIGO
Após clicar em "Send", aparecem três erros. O último é sobre o número de páginas mínimo e máximo, mostrando o valor fornecido ao final.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; A editora Casa não é um valor permitido.; O número de páginas deve estar entre 10 e 5000. Valor fornecido: -5",
    "status": 400
}COPIAR CÓDIGO
Conhecemos alguns validadores nativos do mongoose. No próximo vídeo, vamos começar a aprender como fazemos validações de uma forma mais personalizada também no mongoose.
Validação personalizada
Já aprendemos a utilizar algumas validações nativas do mongoose, como os validadores min e max para campos do tipo número. Também aprendemos o enum para permitir valores específicos em campo do tipo string.
Mas, o que acontece se precisamos fazer uma validação mais complexa que o mongoose não consegue suprir com os validadores nativos?
Digamos que queremos validar um número de telefone ou CPF. O mongoose não tem esses validadores nativos. Assim, precisaríamos de uma lógica mais complexa e até chamar uma biblioteca externa do JavaScript para fazer essa validação.
Para isso, temos as validações personalizadas que o mongoose permite que façamos. Vamos fazer um exemplo simples para demonstrar a sintaxe, caso você precise em algum projeto futuro.
Validações personalizadas no mongoose
Em "src > models > Livros.js", vamos exemplificar as validações personalizados com o campo numeroPaginas que atualmente tem os validadores nativos min e max.
Como fazer as validações de mínimo e máximo de páginas em forma de validador personalizado?
Primeiro, vamos copiar a frase da mensagem de erro personalizada com "Ctrl + C".
"O número de páginas deve estar entre 10 e 5000. Valor fornecido: {VALUE}"COPIAR CÓDIGO
Em seguida, vamos apagar as linhas de min e max.
const livroSchema = new mongoose.Schema(
  {

//…

    numeroPaginas: {
      type: Number

    }
  }
);COPIAR CÓDIGO
Agora, podemos escrever um validador personalizado por meio de uma função chamada validate, seguida de dois-pontos e uma arrow function.
Na arrow function, podemos receber o valor fornecido como parâmetro. Vamos chamar esse parâmetro de valor.
Ressaltamos que a função deve se chamar validate. Assim, vai retornar um valor booleano, ou seja, um valor verdadeiro ou falso que indica se o valor vai ou não ser validado.
Queremos verificar se valor está entre 10 e 5000. Por isso, vamos escrever return dentro das chaves da arrow function. Em seguida, colocamos que o retorno deve ter valor maior ou igual (>=) à 10. Para adicionar outra comparação colocamos dois "E" comerciais (&&). Agora, escrevemos que valor é menor ou igual (<=) à 5000.
const livroSchema = new mongoose.Schema(
  {

//…

    numeroPaginas: {
      type: Number
      validate: (valor) => {
        return valor >= 10 && valor <= 5000;
      }
    }
  }
);COPIAR CÓDIGO
Essa expressão vai ser avaliada em verdadeiro ou falso e é exatamente o que vamos retornar. Se o valor estiver entre 10 e 5000, vamos retornar verdadeiro e o valor vai ser validado. Se o retorno for falso, o validador vai colocar um erro no Postman.
Inclusive, vamos verificar esse erro após salvar o arquivo.
No Postman, estamos na rota /livros e no método POST:
POST http://localhost:3000/livros
Vamos abrir o corpo da requisição na aba "Body" e já tem um exemplo com autor, editora e número de páginas como -5.
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa",
    "numeroPaginas": -5
}COPIAR CÓDIGO
Vamos enviar essa requisição com o botão "Send" e verificar o que acontece.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; A editora Casa não é um valor permitido.; Validator failed for path `numeroPaginas with `value `-5`",
    "status": 400
}COPIAR CÓDIGO
Aparecem 3 mensagens de erro. A última é sobre o número de páginas e aparece em inglês, pois é uma validação nativa do mongoose. Ela diz que o validador personalizado falhou para o valor -5.
Agora, vamos colocar um valor válido de número de páginas, isto é, entre 10 e 5000. Vamos colocar 20 no campo numeroPaginas no corpo da requisição e apertar "Send".
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa",
    "numeroPaginas": 20
}COPIAR CÓDIGO
Pronto. A frase em inglês não aparece mais.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; A editora Casa não é um valor permitido.,
    "status": 400
}COPIAR CÓDIGO
Após verificar que a validação funciona, podemos aprender como personalizar essa mensagem de erro para que fique em português.
Personalizando mensagem de erro
A sintaxe da mensagem de erro vai ser diferente.
O validate não vai ser mais uma função, mas, sim, um objeto. Para isso, vamos envolver toda a arrow function entre chaves.
Damos "Enter" depois de abre-chave e antes de fecha-chave por questões de visualização.
Agora, a primeira propriedade desse objeto vai se chamar validator. E o valor dessa propriedade vai ser a arrow function que já tínhamos escrito.
Atente-se que o nome da propriedade validator não pode ser mudado. Deve ter exatamente esse nome para funcionar o validador.
const livroSchema = new mongoose.Schema(
  {

//…

    numeroPaginas: {
      type: Number,
      validate: {
        validator: (valor) => {
          return valor >= 10 && valor <= 5000;
        }
      }
    }
  }
);COPIAR CÓDIGO
Após salvar o arquivo, vamos verificar no Postman se o validador ainda funciona.
Vamos enviar a requisição com o número de páginas igual à 0.
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa",
    "numeroPaginas": 0
}COPIAR CÓDIGO
Como esperado, temos o mesmo retorno de erro, porém, ainda em inglês.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; A editora Casa não é um valor permitido.; Validator failed for path `numeroPaginas with `value `0`",
    "status": 400
}COPIAR CÓDIGO
Agora que a propriedade validate é um objeto, podemos adicionar mais uma propriedade chamada message dentro de validate.
Em message, podemos colocar uma string com a mensagem de erro personalizada que copiamos no início da aula - inclusive com a sintaxe do VALUE em maiúsculo e entre chaves.
Vamos salvar o arquivo para testá-lo no Postman.
const livroSchema = new mongoose.Schema(
  {

//…

    numeroPaginas: {
      type: Number,
      validate: {
        validator: (valor) => {
          return valor >= 10 && valor <= 5000;
        },
        message: "O número de páginas deve estar entre 10 e 5000. Valor fornecido: {VALUE}"
      }
    }
  }
);COPIAR CÓDIGO
No Postman, vamos enviar a última requisição novamente com o botão "Send".
{
    "autor": "63ceeb2491ad5e9832ce3700",
    "editora": "Casa",
    "numeroPaginas": 0
}COPIAR CÓDIGO
Notamos que a validação funcionou ao ler a última mensagem de erro sobre o número de páginas, agora em português.
{
    "mensagem": "Os seguintes erros foram encontrados: O título do livro é obrigatório.; A editora Casa não é um valor permitido.; O número de páginas deve estar entre 10 e 5000. Valor fornecido: 0",
    "status": 400
}COPIAR CÓDIGO
Em suma, aprendemos a fazer uma validação personalizada no mongoose. Note que dentro da função chamada validator podemos implementar qualquer código JavaScript. Se necessário, poderíamos chamar uma biblioteca que valida número de CPF dentro da função e retornar um valor verdadeiro ou falso de acordo com essa validação.
Documentação sobre validação personalizada
Para relembrar o nome das propriedades e a ordem em que devem aparecer, você pode consultar a sintaxe da validação personalizada na documentação do mongoose em inglês na página "Validators > Custom Validators".
Note que temos a mesma sintaxe de um objeto validate com a função validator em um esquema. Vamos deixar uma atividade com o link dessa página da documentação para você poder consultar rapidamente, caso esqueça.
// Código de exemplo da validação personalizada na documentação mongoose

const userSchema = new Schema({
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  }
});COPIAR CÓDIGO
Já conhecemos como fazer validações personalizadas. No próximo vídeo, vamos mostrar um recurso interessante do mongoose que permite fazer validações globais.


