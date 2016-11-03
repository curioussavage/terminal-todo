import { syncDb } from './db';

syncDb((r) => {
  console.log(r)
});
