import{r as t}from"./index.49c99800.js";function r(e){var j;if(((j=e.result)==null?void 0:j.resultCode)==="000000")return e.data;throw new Error("\u9519\u8BEF")}const s=e=>t.get("/bjgzpz/query/page/bjgzpz",{params:e}).then(j=>r(j)),x=e=>t.post("/bjgzpz/insertOrUpdate",e).then(j=>r(j)),u=e=>t.get("/bjjl/queryBjjlCzqkTjxx",{params:e}).then(j=>r(j)),a=e=>t.get("/bjjl/queryBjjlDjzbTjxx",{params:e}).then(j=>r(j)),l=e=>t.get("/bjjl/queryBjjlLxzbTjxx",{params:e}).then(j=>r(j)),q=e=>t.get("/bjjl/queryBjlxMrTjxx",{params:e}).then(j=>r(j)),o=e=>t.get("/bjjl/queryBjjlSdTjxx",{params:e}).then(j=>r(j)),g=e=>t.get("/bjjl/query/page/bjjl",{params:e}).then(j=>r(j)),b=e=>t.get("/jcdw/queryJcdwTbInfo",{params:e}).then(j=>r(j));export{u as a,a as b,l as c,q as d,o as e,g as f,s as g,x as i,b as q};