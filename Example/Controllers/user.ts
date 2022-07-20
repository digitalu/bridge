import { Controller, httpError, handler, apply } from '../../Lib';
import { z } from 'zod';

const mid1 = handler({
  // method: 'POST',
  // body: z.object({ name: z.string() }),
  resolve: (p) => {
    // console.log('hhh');
    return { yoo: 'jj' };
  },
});

const mid2 = handler({
  // middlewares: apply(mid1),
  // body: z.object({ sasa: z.string() }),
  resolve: (p) => {
    // console.log('What', p.mid);
    console.log('AH');
    return httpError('Bad Gateway', 'HHH');
    return { ahouai: 'jj' };
  },
});

const auth = handler({
  middlewares: apply(mid1),
  headers: z.object({ token: z.string().min(10) }),
  // body: z.object({ shaady: z.string() }),
  resolve: (p) => {
    console.log(p.mid, 'here');
    if (p.headers.token !== 'jhsjdhsjdhjsdh') return httpError('Unauthorized', 'Wrong token');
    return { sah: 'kk' };
  },
});

export class User extends Controller {
  create = this.handler({
    method: 'PATCH',
    description: 'Yo salut tu vas bien ?',
    query: z.object({ dzds: z.string() }),
    file: apply('d'),
    // middlewares: apply(mid2, auth),
    resolve: (p) => {
      // p.files.salut.
      // const data = mid1.resolve({})
      return p.file.d;
      if (p.query) return { STT: 'ouiou' } as const;

      return ',,' as const;
    },
  });

  update = this.handler({
    query: z.object({ dzds: z.string() }),
    body: z.object({ dzds: z.string() }),
    headers: z.object({
      Ahoui: z.object({
        tsbbb: z.number().min(100).max(89),
      }),
    }),
    resolve: () => 'ok',
  });
}
