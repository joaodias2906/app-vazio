const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Configuração dos arquivos estáticos
app.use(express.static("./app/public"));

// Configuração do EJS
app.set("view engine", "ejs");
app.set("views", "./app/views");

// Configuração para receber dados dos formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importação das rotas
const rotas = require("./app/routes/router");
app.use("/", rotas);

// Porta configurada no arquivo .env
const porta = process.env.app_port || 3000;

// Inicialização do servidor
app.listen(porta, () => {
    console.log(`Servidor ouvindo na porta ${porta}`);
    console.log(`http://localhost:${porta}`);
});