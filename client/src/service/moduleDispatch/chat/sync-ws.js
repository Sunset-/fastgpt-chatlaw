
import {client as WebSocketClient} from 'websocket';
import axios from 'axios';

export const FindKnowledgeBase = function(params,score){
    console.log("知识库查询参数",params)
    console.log("chatlaw-url:",global.feConfigs?.chatlaw?.url)
    return axios
    .post(`${global.feConfigs?.chatlaw?.url}/api/find`,params, {
      headers: {
        'Content-Type':'application/json'
      },
    })
    .then(res=>{
        return res.data.filter(item=>item.score<=score)
    })
    .catch((err) => {
      console.log(err);
      return Promise.reject(err?.response?.data?.error?.message || '知识库查询异常');
    });
}


export const SyncWsRequest = function(params){
    return new Promise((resolve,reject)=>{
        var client = new WebSocketClient();
        client.on('connectFailed', function(error) {
            console.error('调用本地模型异常：connectFailed,', error.toString())
            reject('模型未启动')
        });
        var answer ='';
        client.on('connect', function(connection) {
            console.log('WebSocket Client Connected');
            connection.on('error', function(error) {
                console.error('调用本地模型异常：Connection Error,', error.toString())
                reject('模型未启动')
            });
            connection.on('close', function() {
                console.log('知识库查询2结果：',answer)
                resolve({
                    content : answer
                })
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    answer = message.utf8Data
                }
            });
            
            function sendMessage() {
                var msg = `{"prompt":"${params.prompt}","keyword":"${params.keyword}","temperature":${params.temperature||0.8},"top_p":${params.top_p||0.2},"max_length":${params.max_length||4096},"history":[]}`;
                console.log('知识库查询2：',msg)
                if (connection.connected) {
                    connection.sendUTF(msg);
                }
            }
            sendMessage();
        });
        console.log("chatlaw-url:",global.feConfigs?.chatlaw?.url)
        client.connect(`${global.feConfigs?.chatlaw?.url}/ws`);
    });
}