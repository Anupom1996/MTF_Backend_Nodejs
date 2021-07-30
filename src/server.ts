import 'module-alias/register';
import app from './app';

const port = process.env.NODE_PORT || 4000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
