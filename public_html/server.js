// Forçando um novo deploy em 28/08/2025 de novo
const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
// ... resto do código ...
const cors = require('cors');

const app = express();

// --- INÍCIO DA CORREÇÃO ---

// Lista de domínios permitidos
const allowedOrigins = ['https://bybike.store', 'https://www.bybike.store'];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite pedidos se o domínio estiver na lista ou se não houver domínio (ex: Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// Habilita o CORS com as opções corretas
app.use(cors(corsOptions));
// --- FIM DA CORREÇÃO ---


app.use(express.json());

// A sua chave secreta será lida a partir das "Environment Variables" da Vercel
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// O endpoint com logs de depuração adicionados
app.post('/api/process_payment', async (req, res) => {
    console.log("LOG 1: Endpoint /api/process_payment atingido.");

    try {
        console.log("LOG 2: Dentro do bloco try.");

        // Verificação crucial da variável de ambiente
        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            console.error("ERRO CRÍTICO: A variável de ambiente MP_ACCESS_TOKEN não foi encontrada!");
            return res.status(500).json({
                status: 'error',
                message: 'Erro de configuração do servidor: a chave de acesso está em falta.',
            });
        }
        console.log("LOG 3: Access Token encontrado.");

        const client = new MercadoPagoConfig({ accessToken });
        const payment = new Payment(client);
        
        console.log("LOG 4: Cliente do Mercado Pago inicializado. Prestes a chamar payment.create().");
        console.log("LOG 5: Corpo da requisição recebido:", JSON.stringify(req.body));

        const result = await payment.create({ body: req.body });

        console.log("LOG 6: Chamada a payment.create() concluída com sucesso.");

        res.status(201).json({
            status: result.status,
            message: result.status_detail,
            id: result.id,
        });

    } catch (error) {
        console.error("ERRO CRÍTICO: O bloco catch foi ativado.");
        
        // Tenta logar o erro de várias formas para garantir visibilidade
        console.error("ERRO CRÍTICO [Mensagem]:", error.message);
        console.error("ERRO CRÍTICO [Causa]:", JSON.stringify(error.cause, null, 2));
        console.error("ERRO CRÍTICO [Objeto Completo]:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

        const errorMessage = error.cause?.[0]?.description || error.message || 'Ocorreu um erro desconhecido ao processar o pagamento.';
        
        res.status(500).json({
            status: 'error',
            message: errorMessage,
        });
    }
});

// Exporte a aplicação para a Vercel
module.exports = app;
