
import { countModelPrice } from '@/service/events/pushBill';
import { sseResponse } from '@/service/utils/tools';
import { textAdaptGptResponse } from '@/utils/adapt';
import {client as WebSocketClient} from 'websocket';
import {FindKnowledgeBase,SyncWsRequest} from "./sync-ws"

function sendLastQuestion(userChatInput,res,params){
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
                        maxToken : 4000,
                        // quoteList: filterQuoteQA,
                        // completeMessages
                    },
                    finish : true
                })
            });
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    if(/^[\d]+字正在计算/.test(message.utf8Data)){
                        console.log('过滤：',message.utf8Data)
                        return
                    }
                    let answerAdd = message.utf8Data.substring(answer.length).replace(/�/g,'')
                    answer += answerAdd
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
                    console.log('params:',params)
                    connection.sendUTF(`{"prompt":"${params.prompt}","keyword":"${params.keyword}","temperature":${params.temperature||0.8},"top_p":${params.top_p||0.2},"max_length":${params.max_length||4096},"history":[]}`);
                }
            }
            sendMessage();
        });
        console.log("chatlaw-url:",global.feConfigs?.chatlaw?.url)
        client.connect(`${global.feConfigs?.chatlaw?.url}/ws`);
    })
}

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

      console.log(model)
    
    if(model=='chatlaw'){
        //本地模型
        return sendLastQuestion(userChatInput,res,{
            prompt : userChatInput,
            keyword : userChatInput,
            temperature : 0.8,
            top_p : 0.2,
            max_length : 4096,
        });
    }else if(model=='chatlaw-fastkb'){
        //本地快速知识库
        return FindKnowledgeBase({
            "prompt":userChatInput,
            "step":2
        },120).then(ks=>{
            console.log("快速知识库查询：",ks)
            if(ks.length == 0){
                return sendLastQuestion(userChatInput,res,{
                    prompt : userChatInput,
                    keyword : userChatInput,
                    temperature : 0.8,
                    top_p : 0.2,
                    max_length : 4096,
                });
            }else{
                return sendLastQuestion(userChatInput,res,{
                    prompt : `总结以下文段中与问题相关的信息。\\n${ks.map((item,index)=>`${index+1}.${item.content.replace(/\n/g,'')}\\n`)}问题：${userChatInput}`,
                    keyword : userChatInput,
                    temperature : 0.8,
                    top_p : 0.2,
                    max_length : 4096,
                });
            }
        })
    }else if(model=='chatlaw-kb'){
        //本地快速知识库
        return FindKnowledgeBase({
            "prompt":userChatInput,
            "step":5
        },120).then(ks=>{
            console.log("知识库查询：",ks)
            if(ks.length==0){
                return sendLastQuestion(userChatInput,res,{
                    prompt : userChatInput,
                    keyword : userChatInput,
                    temperature : 0.8,
                    top_p : 0.2,
                    max_length : 4096,
                });
            }else{
                return Promise.all(ks.map(item=>SyncWsRequest({
                    prompt : `总结以下文段中与问题相关的信息。\\n${item.content.replace(/\n/g,'')}\\n问题：${userChatInput}`,
                    keyword : userChatInput,
                    temperature : 0.8,
                    top_p : 0.2,
                    max_length : 9096,
                }))).then(kks=>{
                    console.log('kks:',kks)
                    return sendLastQuestion(userChatInput,res,{
                        prompt : `总结以下文段中与问题相关的信息。\\n${kks.map((item,index)=>`${index+1}.${item.content.replace(/\n/g,'')}\\n`)}问题：${userChatInput}`,
                        keyword : userChatInput,
                        temperature : 0.8,
                        top_p : 0.2,
                        max_length : 9096,
                    });
                })
            }
        })
    }
}