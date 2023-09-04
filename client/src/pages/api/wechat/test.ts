import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      jsonRes(res, {
        data: {
          hahaha : 123
        }
      });
    } catch (err) {
      jsonRes(res, {
        code: 500,
        error: err
      });
    }
  }
  