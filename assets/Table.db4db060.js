import{_ as g,d as _,b as s,e as l,l as n,k as d,g as f,y as c,z as h,f as y,h as m,A as v,F as w}from"./index.3926de36.js";const x={class:"scroll-container"},C=_({__name:"Dialog",props:{visible:{type:Boolean,default:!0},title:{type:String,default:"\u63D0\u793A"},width:{type:String,default:"50%"}},emits:["close"],setup(t,{emit:o}){const u=()=>{o("close")};return(r,a)=>{const e=s("el-dialog");return l(),n(e,{modelValue:t.visible,"onUpdate:modelValue":a[0]||(a[0]=i=>h(visible)?visible.value=i:null),title:t.title,width:t.width,"before-close":u},{default:d(()=>[f("div",x,[c(r.$slots,"default",{},void 0,!0)])]),_:3},8,["modelValue","title","width"])}}});var k=g(C,[["__scopeId","data-v-66b319a3"]]);const E=_({__name:"Table",props:{tableColumns:{type:Array,required:!0},tableData:{type:Array,default:()=>[]},tableWidth:{type:String,default:"auto"},tableHeight:{type:String,default:"calc(100% - 0)"},tableHeaderColor:{type:String,default:""}},setup(t){return(o,u)=>{const r=s("el-table-column"),a=s("el-table");return l(),n(a,{data:t.tableData,stripe:"",height:t.tableHeight,style:{width:"auto",margin:"0 20px","box-sizing":"border-box"},"header-row-style":{backgroundColor:"#EFEFEF",color:"#000",fontWeight:400},"header-cell-style":{backgroundColor:"#EFEFEF",color:"#000",fontWeight:400}},{default:d(()=>[(l(!0),y(w,null,m(t.tableColumns,(e,i)=>(l(),n(r,{key:i,prop:e.prop,label:e.label,type:e.type,width:e.width,align:e.align},v({_:2},[e.type==="slot"?{name:"default",fn:d(({row:p,$index:b})=>[c(o.$slots,e.slotName,{row:p,index:b})])}:void 0]),1032,["prop","label","type","width","align"]))),128))]),_:3},8,["data","height"])}}});export{E as _,k as a};
