import express from 'express';
import Routes from './routes';

const app = express();

app.use(express.json({ limit: '200mb' }));

const port = process.env.port || '5000';

Routes(app);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

export default app;
