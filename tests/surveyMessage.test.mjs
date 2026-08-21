import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

globalThis.chrome={
    runtime:{id:'test-extension-id'},
    storage:{
        local:{
            get(_keys,callback){
                callback({pythonCE:true});
            }
        }
    }
};

const source=await readFile(new URL('../modules/surveyMessage.js',import.meta.url),'utf8');
const sourceUrl='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const {earthEngineStudioMessage,initialize}=await import(sourceUrl);

function mockDocument(){
    const message={innerHTML:'Existing message',style:{}};
    let consoleQueries=0;

    return {
        message,
        get consoleQueries(){
            return consoleQueries;
        },
        document:{
            head:{appendChild(){}},
            documentElement:{appendChild(){}},
            createElement(){
                return {};
            },
            querySelector(selector){
                assert.equal(selector,'ee-console');
                consoleQueries++;
                return {
                    shadowRoot:{
                        querySelector(innerSelector){
                            assert.equal(innerSelector,'.intro-message');
                            return message;
                        }
                    }
                };
            }
        }
    };
}

test('Studio message fails silently when availability cannot be fetched',async()=>{
    const page=mockDocument();
    globalThis.document=page.document;
    globalThis.fetch=async()=>{
        throw new Error('network unavailable');
    };

    await earthEngineStudioMessage();

    assert.equal(page.consoleQueries,0);
    assert.equal(page.message.innerHTML,'Existing message');
});

test('Studio message fails silently for a non-OK availability response',async()=>{
    const page=mockDocument();
    globalThis.document=page.document;
    globalThis.fetch=async()=>({ok:false});

    await earthEngineStudioMessage();

    assert.equal(page.consoleQueries,0);
    assert.equal(page.message.innerHTML,'Existing message');
});

test('Studio message fails silently when availability is not valid JSON',async()=>{
    const page=mockDocument();
    globalThis.document=page.document;
    globalThis.fetch=async()=>({
        ok:true,
        async json(){
            throw new SyntaxError('invalid JSON');
        }
    });

    await earthEngineStudioMessage();

    assert.equal(page.consoleQueries,0);
    assert.equal(page.message.innerHTML,'Existing message');
});

test('Studio message stays hidden before general availability',async()=>{
    const page=mockDocument();
    globalThis.document=page.document;
    globalThis.fetch=async()=>({
        ok:true,
        async json(){
            return {phase:'preview'};
        }
    });

    await earthEngineStudioMessage();

    assert.equal(page.consoleQueries,0);
    assert.equal(page.message.innerHTML,'Existing message');
});

test('general availability renders the Studio takeover message',async()=>{
    const page=mockDocument();
    globalThis.document=page.document;
    globalThis.fetch=async()=>({
        ok:true,
        async json(){
            return {phase:'general-availability'};
        }
    });

    await earthEngineStudioMessage();

    assert.equal(page.consoleQueries,1);
    assert.match(page.message.innerHTML,/Try Earth Engine Studio/);
    assert.match(page.message.innerHTML,/earthengine-studio-logo\.json/);
    assert.match(page.message.innerHTML,/http:\/\/www\.earthengine\.studio\//);
});

test('Studio message is registered after every existing console message',()=>{
    const listeners=[];
    globalThis.window={
        addEventListener(eventName,listener){
            assert.equal(eventName,'load');
            listeners.push(listener.name);
        }
    };

    initialize();

    assert.deepEqual(listeners,[
        'pythonMessage',
        'surveyMessage',
        'v2Message',
        'earthEngineStudioMessage'
    ]);
});
