const express = require('express');
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors'); // Certifique-se de que a biblioteca cors está a ser importada

const app = express();

// --- INÍCIO DA CORREÇÃO DE CORS ---
const allowedOrigins = ['https://bybike.store', 'https://www.bybike.store'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// Use o middleware CORS com as opções corretas
app.use(cors(corsOptions));
// --- FIM DA CORREÇÃO DE CORS ---


app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

app.post('/api/process_payment', async (req, res) => {
    // ... o resto do seu código de pagamento permanece igual ...
    // ... ele já está correto ...
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

module.exports = app;