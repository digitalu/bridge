import { createExpressMiddleware, handler, httpError, apply, onError } from '../FutureIsComing';
import z from 'zod';
import express from 'express';

const app = express();

class User {
  signin = handler({
    resolve: () => 'Signed in',
  });
}

const routes = {
  hello: handler({
    body: z.object({ name: z.string() }),
    resolve: ({ body }) => `hey ${body.name}`,
  }),
  user: {
    signin: handler({
      resolve: () => 'Signed in',
    }),
  },
};

const errorHandler = onError(({ error, path }) => {
  if (error.name === 'Internal server error') console.log(error); // Send to bug reporting
  // else console.log('Other error', error, path);
});

app.use('', createExpressMiddleware(routes, errorHandler));

app.use('', (req, res) => res.send('Root not found'));

app.listen(8077, () => {
  console.log(`Server listening on port ${8077}, project: ${'YELLA'}, mode: ${'ENV'}`);
});
