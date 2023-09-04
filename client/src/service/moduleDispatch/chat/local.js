
import { countModelPrice } from '@/service/events/pushBill';
import { sseResponse } from '@/service/utils/tools';
import { textAdaptGptResponse } from '@/utils/adapt';
import {client as WebSocketClient} from 'websocket';

export  const dispatchChatCompletionLocal = function (props){

    let {
        res,
        model,
        temperature = 0,
        maxToken = 4000,
        stream = false,
        detail = false,
        history = [],
        quoteQA = [],
        userChatInput,
        systemPrompt = '',
        limitPrompt = '',
        userOpenaiAccount
      } = props;

    return new Promise((resolve,reject)=>{
        // reject('模型测试中')
        // return
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
                resolve({
                    answerText : answer,
                    responseData : {
                        moduleName: 'AI Chat',
                        price: 0,
                        // model: modelConstantsData.name,
                        // tokens: totalTokens,
                        question: userChatInput,
                        answer: answer,
                        maxToken,
                        // quoteList: filterQuoteQA,
                        // completeMessages
                    },
                    finish : true
                })
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    if(/^[\d]+字正在计算[\s][\d]+[\s]?tokens[\s]?$/.test(message.utf8Data)){
                        console.log('过滤：',message.utf8Data)
                        return
                    }
                    let answerAdd = message.utf8Data.substring(answer.length)
                    answer = message.utf8Data
                    sseResponse({
                        res,
                        event: 'answer',
                        data: textAdaptGptResponse({
                          text: answerAdd
                        })
                      });
                }
            });
            
            function sendMessage() {
                if (connection.connected) {
                    console.log('send:',userChatInput)
                    connection.sendUTF(`{"prompt":"${userChatInput}","keyword":"${userChatInput}","temperature":0.8,"top_p":0.8,"max_length":4096,"history":[]}`);
                }
            }
            sendMessage();
        });
        client.connect('wss://geek400.chat/ws');
    })
}