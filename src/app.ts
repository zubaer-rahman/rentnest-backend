import express, { Application, json, Request, Response, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PaymentController } from './modules/payment/payment.controller';
import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  }),
);

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), PaymentController.stripeWebhook);

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.send('RentNest API is running.');
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
