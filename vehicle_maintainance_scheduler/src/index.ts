import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import express from 'express';
import schedulerRoutes from './routes/scheduler.route';
import { loggerMiddleware } from './middleware/logger.middleware';

const app = express();

app.use(express.json());


app.use(loggerMiddleware);

app.use('/api', schedulerRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    process.stdout.write(`Server running on port ${PORT}\n`);
});
