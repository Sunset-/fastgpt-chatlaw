import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { connectToDatabase, App } from '@/service/mongo';
import { authUser } from '@/service/utils/auth';
import { AppListItemType } from '@/types/app';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // 凭证校验
    var { userId } = await authUser({ req, authToken: true });

    //sunset modify 20230821  
    //所有用户均使用管理员创建的应用列表
    userId = '64dc39aafc0bdb42a3511257'

    await connectToDatabase();

    // 根据 userId 获取模型信息
    const myApps = await App.find(
      {
        userId
      },
      '_id avatar name intro'
    ).sort({
      updateTime: -1
    });

    jsonRes<AppListItemType[]>(res, {
      data: myApps
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
