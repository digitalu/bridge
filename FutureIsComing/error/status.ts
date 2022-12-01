// export const errorStatus = {
//   'Bad Request': 400,
//   Unauthorized: 401,
//   Forbidden: 403,
//   'Not Found': 404,
//   'Method Not Allowed': 405,
//   'Not Acceptable': 406,
//   'Proxy Authentication Required': 407,
//   'Request Timeout': 408,
//   Conflict: 409,
//   Gone: 410,
//   'Length Required': 411,
//   'Precondition Failed': 412,
//   'Request Entity Too Large': 413,
//   'Request-URI Too Long': 414,
//   'Unsupported Media Type': 415,
//   'Requested Range Not Satisfiable': 416,
//   'Expectation Failed': 417,
//   'Unprocessable entity': 422,
//   'Internal Server Error': 500,
//   'Not Implemented': 501,
//   'Bad Gateway': 502,
//   'Service Unavailable': 503,
//   'Gateway Timeout': 504,
//   'HTTP Version Not Supported': 505,
// } as const;

export enum StatusCode {
  /** When bla bla */
  BAD_REQUEST = 400,
  UNPROCESSABLE_ENTITY = 422,
}

const errorStatus = [400, 401, 403, 404, 405, 407, 408, 409, 422] as const;

export type ErrorStatus = typeof errorStatus[number];
