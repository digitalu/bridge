import { createExpressMiddleware, RoutesToSDK, onError } from '../Lib';
import { routes } from './routes';
import express from 'express';

const app = express();

app.use('', (req, res, next) => {
  console.log(req.path);
  next();
});

const errorHandler = onError(({ error, path }) => {
  if (error.name === 'Internal server error') console.log(error); // Send to bug reporting
  // else console.log('Other error', error, path);
});

app.use('', createExpressMiddleware(routes, errorHandler));

app.use('', (req, res) => res.send('Root not found'));

app.listen(8077, () => {
  console.log(`Server listening on port ${8077}, project: ${'YELLA'}, mode: ${'ENV'}`);
});

export type SDKTypes = RoutesToSDK<typeof routes>;

let t: SDKTypes['user']['create']['return'] = {} as any;

// if (typeof t === 'object' && 'error' in t) {
//   switch (t.error.name) {
//     case 'Body schema validation error':
//       break;

//     // case ''
//   }
// } else {
//   t;
// }

// if (typeof t === 'object' && 'error' in t) {
//   switch (t.error.name) {
//     case 'AH':
//     // t.error.
//   }
// }
