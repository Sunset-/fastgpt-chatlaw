import { GET, POST } from './request';
import type { SendCodeBody, AuthCodeBody } from './plugins.d';
import { getDate } from 'date-fns';
import crypto from 'crypto';

if(!global.authCodeCache){
  global.authCodeCache = new Map()
}

// export const sendCode = (data: SendCodeBody) => POST(global.systemPlugins.authCode?.sendUrl, data);
// export const authCode = (data: AuthCodeBody) => POST(global.systemPlugins.authCode?.authUrl, data);
// sunset modify 20230816
function RandomString(len = 10, type = "CapitalLetter") {
  // 默认全字符
  let chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  // 数字
  if (type == "Number") {
      chars = "1234567890";
  }
  // 字母
  if (type == "Letter") {
      chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  }
  // 大写字母
  if (type == "CapitalLetter") {
      chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
  // 小写字母
  if (type == "LowercaseLetter") {
      chars = "abcdefghijklmnopqrstuvwxyz";
  }
  const maxPos = chars.length;
  let str = "";
  for (let i = 0; i < len; i++) {
      str += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return str;
}

function two(d:number){
  return d<10?`0${d}`:`${d}`;
}

export const sendCode = (data: SendCodeBody) => {
  let code = RandomString(6,'Number')
  if (code[0] == '0') {
		code = "9" + code.substring(1)
	}
  let nonce = RandomString(32);
  let d = new Date()
  let dateStr = `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}Z`
  let digest = crypto.createHash('sha256').update(`${nonce}${dateStr}${global.feConfigs?.sms?.appSecret}`).digest('base64')

  return POST(global.feConfigs?.sms?.appAddress,{
    from : global.feConfigs?.sms?.codeChannel,
    to : data.username,
    templateId: global.feConfigs?.sms?.codeTemplate,
    extend: global.feConfigs?.sms?.extend,
    templateParas: JSON.stringify([code]),
  },{
    headers : {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": `WSSE realm="SDP",profile="UsernameToken",type="Appkey"`,
      "X-WSSE":        `UsernameToken Username="${global.feConfigs?.sms?.appId}",PasswordDigest="${digest}",Nonce="${nonce}",Created="${dateStr}"`,
    }
  }).then((res)=>{
    global.authCodeCache.set(data.username,code)
    return res
  })
};
export const authCode = (data: AuthCodeBody) => {
  return new Promise((resolve,reject)=>{
    if(global.authCodeCache.has(data.username) && global.authCodeCache.get(data.username)==data.code){
      global.authCodeCache.delete(data.username)
      resolve({})
    }else{
      reject(new Error('验证码错误'))
    }
  })
  // return POST(global.systemPlugins.authCode?.authUrl, data)
};

export const textCensor = (data: { text: string }) => {
  if (!global.systemPlugins.censor?.textUrl) return;
  return POST(global.systemPlugins.censor?.textUrl, data);
};

export const getWxPayQRUrl = (amount: number) =>
  POST<{
    code_url: string;
    orderId: string;
  }>(global.systemPlugins.pay?.getWxQRUrl, { amount });
export const getWxPayQRResult = (orderId: string) =>
  POST<{
    trade_state: string;
    trade_state_desc: string;
  }>(global.systemPlugins.pay?.getWxQRResult, { orderId });
