'use strict';
(function(){
 const CJK=/[\u3400-\u9fff]/, escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const keys=Object.keys(BI_DICTIONARY).filter(k=>CJK.test(k)).sort((a,b)=>b.length-a.length);
 const tokens=new RegExp(keys.map(escape).join('|'),'g');
 let mode='bi';try{mode=localStorage.getItem('caio-language-v1')||'bi'}catch{}if(!['bi','zh','en'].includes(mode))mode='bi';
 function resolve(raw){const s=String(raw).trim();if(!s)return null;let heading=s.match(/^STAGE (\d+) \/ LESSON (\d+)$/);if(heading)return {zh:'第 '+heading[1]+' 阶段 / 第 '+heading[2]+' 课',en:s};heading=s.match(/^CONCEPT (\d+)$/);if(heading)return {zh:'概念 '+heading[1],en:s};if(BI_REVERSE[s])return {zh:BI_REVERSE[s],en:s};if(BI_DICTIONARY[s])return {zh:s,en:BI_DICTIONARY[s]};heading=s.match(/^第 (\S+) 题，(.+)$/);if(heading){const r=resolve(heading[2]);return {zh:s,en:'Question '+heading[1]+', '+(r?r.en:heading[2])}}heading=s.match(/^(.+)，第 (\d+) 页，包括第 (\S+) 题$/);if(heading){const r=resolve(heading[1]);return {zh:s,en:(r?r.en:heading[1])+', page '+heading[2]+', including question '+heading[3]}}if(!CJK.test(s))return null;
  let en=s.replace(tokens,k=>BI_DICTIONARY[k]);
  if(/^第 \d+ 周$/.test(s))en='Week '+s.match(/\d+/)[0];
  if(/^第 \d+ 步$/.test(s))en='Step '+s.match(/\d+/)[0];
  if(/^第\d+个$/.test(s))en='No. '+s.match(/\d+/)[0];
  en=en.replace(/Lesson (\d+) lesson/g,'Lesson $1').replace(/，/g,', ').replace(/。/g,'. ').replace(/；/g,'; ').replace(/：/g,': ').replace(/、/g,', ').replace(/（/g,' (').replace(/）/g,')');if(en===s)return null;return {zh:s,en};
 }
 function text(raw){let r=resolve(raw);return !r?raw:mode==='en'?r.en:mode==='zh'?r.zh:r.zh+' / '+r.en}
 const plain=new Map(),attrs=new Map();
 function scan(){observer.disconnect();
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){const parent=node.parentElement;if(!parent||parent.closest('[data-bi],[data-no-translate],script,style,pre,code,textarea'))continue;const pair=resolve(node.nodeValue);if(!pair||pair.zh===pair.en)continue;
   if(parent.closest('svg,option')){if(!plain.has(node))plain.set(node,node.nodeValue);node.nodeValue=text(plain.get(node));continue}
   const wrap=document.createElement('span');wrap.setAttribute('data-bi','');wrap.className='bi-pair';
   for(const lang of ['zh','en']){const part=document.createElement('span');part.className='bi-'+lang;part.lang=lang==='zh'?'zh-CN':'en';part.textContent=pair[lang];wrap.appendChild(part)}
   const raw=node.nodeValue;const before=raw.match(/^\s*/)[0],after=raw.match(/\s*$/)[0];if(before)wrap.prepend(document.createTextNode(before));if(after)wrap.appendChild(document.createTextNode(after));node.replaceWith(wrap);
  }
  for(const el of document.querySelectorAll('[placeholder],[title],[aria-label],[alt]')){if(el.closest('[data-no-translate]'))continue;let originals=attrs.get(el)||{};for(const key of ['placeholder','title','aria-label','alt']){if(!el.hasAttribute(key))continue;if(!(key in originals))originals[key]=el.getAttribute(key);el.setAttribute(key,text(originals[key]))}attrs.set(el,originals)}
  for(const [node,raw]of plain){if(!node.isConnected)plain.delete(node);else node.nodeValue=text(raw)}
  for(const [el]of attrs)if(!el.isConnected)attrs.delete(el);
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 }
 let queued=false;const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;scan()})}});
 function setLanguage(value){mode=['bi','zh','en'].includes(value)?value:'bi';document.documentElement.dataset.language=mode;document.documentElement.lang=mode==='en'?'en':'zh-CN';document.title=document.querySelector('.guide')?'USAAIO 2026 · Bilingual Topic Guide':text(document.querySelector('.learn-layout')?'CAIO 学习中心 · 从基础到实战':'CAIO 2025 · 刷题练习');try{localStorage.setItem('caio-language-v1',mode)}catch{}const select=document.getElementById('languageSelect');if(select)select.value=mode;scan()}
 window.BI={resolve,text,setLanguage,scan,get mode(){return mode}};
 document.getElementById('languageSelect').addEventListener('change',e=>setLanguage(e.target.value));setLanguage(mode);
})();
