import {
  createExpressMiddleware,
  handler,
  httpError,
  apply,
  onError,
  StatusCode,
} from '../package';
import z from 'zod';
import express from 'express';

const app = express();

app.use('', (req, res, next) => {
  console.log(req.path);

  next();
});

// const authMiddleware = handler({
//   headers: z.object({ token: z.string() }),
//   resolve: ({ headers: { token } }) => {
//     if (token === 'bridge') return { user: { firstName: 'Nabil', lastName: 'El Ouahabi' } };
//     else return httpError(StatusCode.UNAUTHORIZED, 'Wrong token');
//   },
// });

// class Friend {
//   hey = handler({ resolve: () => 'hey' });
// }

// const subRoute = {
//   hey: handler({ resolve: () => 'hey' }),
// };

// class User {
//   friend = new Friend();

//   friend2 = subRoute;

//   public getMe = handler({
//     middlewares: apply(authMiddleware), // or [authMiddleware] as const --> Equivalent
//     resolve: ({ mid }) => mid,
//   });
// }

// const helloHandler = handler({
//   body: z.object({ name: z.string() }),
//   query: z.object({ name: z.string() }),
//   resolve: ({ body, query }) => `hey ${body.name} ${query.name}`,
// });

// const routes = {
//   documentation: {
//     url: 'https://stripe.com',
//   },
//   // hello: helloHandler,
//   // user: new User(),
//   // admin: {
//   //   documentation: {},
//   //   signin: handler({ resolve: () => 'Signed in' }),
//   // },
//   hello: handler({ resolve: () => 'Hello' }),
// };

// const errorHandler = onError(({ error, path }) => {
//   if (error.name === 'Internal server error') console.log(path, error); // Send to bug reporting
//   else console.log(error.name);
// });

// app.use('', createExpressMiddleware(routes, { errorHandler }));

console.log(handler);

app.use('', (req, res) => res.send('Root not found'));

app.listen(8077, () => {
  console.log(`Server listening on port ${8077}, project: ${'YELLA'}, mode: ${'ENV'}`);
});
