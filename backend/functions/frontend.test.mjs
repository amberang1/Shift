import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
test('AI conversation retains scene on follow-up and resets the ego context on recast',async()=>{
 const requests=[],elements=new Map(),p={id:'one',name:'Suki'},other={id:'two',name:'Hugo'};
 const reply={perspective:'I would try a shorter trip.',line:'Could I join for the weekend?',action:'Check the weekend cost.',question:''};
 const sandbox={URL,AbortController,setTimeout,clearTimeout,console,window:{ALTER_AI:{endpoint:'https://example.com/advice'}},location:{hash:'#home'},situationsPage(){},render(){},active:()=>p,get:id=>id===p.id?p:other,name:x=>x.name,esc:x=>String(x??'').replace(/</g,'&lt;'),state:{savedLines:[]},catalog:[p,other],page:()=>{},go:r=>sandbox.location.hash='#'+r,area:()=>'',keepLine(){},document:{querySelector:s=>{if(!elements.has(s))elements.set(s,{addEventListener(){}});return elements.get(s)},querySelectorAll:()=>[]},fetch:async(url,options)=>{requests.push(JSON.parse(options.body));return{ok:true,json:async()=>reply}}};
 vm.createContext(sandbox);vm.runInContext(readFileSync(new URL('../../ai.js',import.meta.url),'utf8'),sandbox);
 vm.runInContext("startAI('A trip is too expensive.','one')",sandbox);await new Promise(r=>setTimeout(r,0));
 vm.runInContext("aiSession.turns.push({role:'user',text:'I only have two days off.'});requestAI()",sandbox);await new Promise(r=>setTimeout(r,0));
 assert.equal(requests[1].situation,'A trip is too expensive.');assert.equal(requests[1].history.length,2);assert.equal(requests[1].history[1].text,'I only have two days off.');
 vm.runInContext("startAI(aiSession.situation,'two')",sandbox);await new Promise(r=>setTimeout(r,0));assert.equal(requests[2].characterId,'two');assert.equal(requests[2].history.length,0);assert.equal(requests[2].situation,requests[0].situation);
});
