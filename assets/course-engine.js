'use strict';
const CourseMath = {
  sigmoid:z=>1/(1+Math.exp(-z)),
  entropy:(p,n)=>{let total=p+n;if(!total)return 0;return [p,n].filter(x=>x>0).reduce((s,x)=>s-(x/total)*Math.log2(x/total),0)},
  gini:(p,n)=>p+n?1-(p/(p+n))**2-(n/(p+n))**2:0,
  regression:(w,b)=>{const x=[1,2,3],y=[3,6,8],pred=x.map(v=>w*v+b),sq=pred.map((v,i)=>(v-y[i])**2);return {x,y,pred,sq,mse:sq.reduce((a,b)=>a+b,0)/3}},
  gradient:(alpha,steps=10)=>{let w=3,rows=[{step:0,w,loss:w*w}];for(let i=1;i<=steps;i++){w=w-alpha*2*w;rows.push({step:i,w,loss:w*w})}return rows},
  binary:target=>{let a=[2,5,8,12,15,21],left=0,right=5,rows=[];while(left<=right){let mid=Math.floor((left+right)/2);rows.push({left,right,mid,value:a[mid],action:a[mid]<target?'left = '+(mid+1):'right = '+(mid-1)});if(a[mid]<target)left=mid+1;else right=mid-1}return {a,rows,left,right}},
  knn:scaled=>{const X=[[8,900],[18,520],[12,100],[4,490]],P=[10,500],labels=['A','B','A','B'];let rows=X.map((x,i)=>({name:'ABCD'[i],label:labels[i],x:x.map((v,j)=>scaled?v/[20,2000][j]:v),d:x.reduce((s,v,j)=>s+((v-P[j])/(scaled?[20,2000][j]:1))**2,0)})).sort((a,b)=>a.d-b.d||a.name.localeCompare(b.name));let a=rows.slice(0,3).filter(r=>r.label==='A').length;return {rows,result:a>=2?'A':'B'}},
  kmeans:centers=>{let x=[1,2,3,10,12,13],labels=x.map(v=>Math.abs(v-centers[0])<=Math.abs(v-centers[1])?0:1);return {x,labels,next:centers.map((c,k)=>{let group=x.filter((v,i)=>labels[i]===k);return group.length?group.reduce((a,b)=>a+b,0)/group.length:c})}},
  metrics:threshold=>{let probabilities=[.92,.81,.73,.65,.55,.43,.31,.12],y=[1,0,1,1,0,1,0,0],pred=probabilities.map(p=>p>=threshold?1:0);let tp=0,fp=0,fn=0,tn=0;pred.forEach((v,i)=>{if(v&&y[i])tp++;else if(v)fp++;else if(y[i])fn++;else tn++});return{probabilities,y,pred,tp,fp,fn,tn,precision:tp+fp?tp/(tp+fp):null,recall:tp+fn?tp/(tp+fn):null,f1:2*tp+fp+fn?2*tp/(2*tp+fp+fn):null}}
};
