import express from "express";
import routes from "./routes";

const app = express();
app.use(express.json());

app.use(routes);

export function startServer() {
    const PORT = 3000;
    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });

    return server;
}

if (require.main === module) {
    startServer();
}

export default app;