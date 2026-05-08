import express from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export function createApp() {
    const app = express();
    app.use(compression());
    app.use(cors());
    app.use(morgan('dev'));
    app.use(express.json({ limit: '10mb' }));
    const dataFile = path.join(config.dataDir, 'budget.json');
    // Ensure data dir exists
    if (!fs.existsSync(config.dataDir)) {
        fs.mkdirSync(config.dataDir, { recursive: true });
    }
    app.get('/api/health', (_req, res) => {
        res.json({ ok: true });
    });
    app.get('/api/state', (_req, res) => {
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            res.type('json').send(data);
        }
        else {
            res.json({});
        }
    });
    app.put('/api/state', (req, res) => {
        fs.writeFileSync(dataFile, JSON.stringify(req.body), 'utf8');
        res.json({ ok: true });
    });
    // Serve client in production
    if (process.env['NODE_ENV'] === 'production') {
        const clientDist = path.join(__dirname, '../../../client/dist');
        app.use(express.static(clientDist));
        app.get('*', (_req, res) => {
            res.sendFile(path.join(clientDist, 'index.html'));
        });
    }
    return app;
}
//# sourceMappingURL=app.js.map