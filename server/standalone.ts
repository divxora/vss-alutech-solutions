import { app } from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`  VSS Alutech Solutions B2B Backend API Server`);
  console.log(`  Running on: http://${HOST}:${PORT}`);
  console.log(`  Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`  Admin Default: vssalutechsolutions@gmail.com`);
  console.log(`=======================================================`);
});
