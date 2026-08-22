import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(` Barber Ecosystem API running on port ${PORT}`);
});
