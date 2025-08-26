const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors'); // Importe o pacote cors

const app = express();

// Habilita o CORS para permitir pedidos do seu domínio na Hostinger
app.use(cors({
  origin: 'https://bybike.store' // Coloque aqui o URL do seu site
}));

app.use(express.json());

// A sua chave secreta será lida a partir das "Environment Variables" da Vercel
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// O endpoint continua o mesmo
app.post('/api/process_payment', async (req, res) => {
    try {
        const payment = new Payment(client);
        const result = await payment.create({ body: req.body });

        res.status(201).json({
            status: result.status,
            message: result.status_detail,
            id: result.id,
        });

    } catch (error) {
        console.error(error);
        const errorMessage = error.cause?.[0]?.description || 'Ocorreu um erro ao processar o pagamento.';
        res.status(500).json({
            status: 'error',
            message: errorMessage,
        });
    }
});

// Exporte a aplicação para a Vercel
module.exports = app;