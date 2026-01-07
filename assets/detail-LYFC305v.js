import{a as B}from"./index-NIGUFBhG.js";import{r as g,G as H,c as r,d as s,f as m,l as S,b as c,e as v,m as p,i as W,o as i,t as b,ak as N,v as e,F as x,h as A,by as q}from"./index-Bdxt105Z.js";import{V as P}from"./VCol-CW_KOqMe.js";import{V as G}from"./VDivider-P3qP0VON.js";import{V as U}from"./VTable-BxNLuhpO.js";import{V as w}from"./VCard-BpQaDQot.js";import{V as Y}from"./VAlert-BlWWFAT3.js";import{V as z}from"./VCardText-DSqTRKFr.js";import{V as R}from"./VAvatar-BVNpeuPR.js";/* empty css              */import"./createSimpleFunctional-ChaDJ6gN.js";import"./index-DwDpqtSj.js";const Q={class:"pa-6"},j={class:"d-flex justify-space-between align-center w-100 mb-4"},J={class:"d-flex align-center gap-2",style:{"margin-left":"auto"}},K={class:"detail-grid"},O={class:"grid-left"},X={class:"kv"},Z={class:"v"},ss={class:"kv"},ts={class:"v"},as={class:"kv"},es={class:"v"},ns={class:"kv"},ls={class:"v"},os={class:"kv"},is={class:"v"},rs={class:"kv"},ds={class:"v"},us={class:"kv"},vs={class:"v"},cs={class:"kv"},ps={class:"v"},_s={class:"kv"},gs={class:"v"},ms={class:"kv"},hs={class:"v"},ys={class:"kv"},fs={class:"v"},ks={class:"kv"},bs={class:"v"},xs={class:"kv"},As={class:"v"},ws={class:"kv"},Cs={class:"v"},Vs={class:"kv"},Ds={class:"v"},Bs={class:"grid-right"},Ss={class:"kv"},Ns={class:"v"},Ps={class:"kv"},Rs={class:"v"},Ts={class:"kv"},Ls={class:"v"},$s={class:"kv"},Es={class:"v"},Is={class:"kv"},Ms={class:"v"},Fs={class:"kv"},Hs={class:"v"},Ws={class:"kv"},qs={class:"v"},Gs={class:"kv"},Us={class:"v"},Ys={class:"kv"},zs={class:"v"},Qs={class:"kv"},js={class:"v"},Js={class:"kv"},Ks={class:"v"},Os={class:"kv"},Xs={class:"v"},Zs={class:"kv"},st={class:"v"},tt={key:0,class:"mt-6"},at={class:"schedule-table"},et={key:2,class:"text-muted"},nt={class:"mt-6"},lt={key:0},ot=["href"],it={key:1},rt={key:1,class:"media-grid imageSection"},dt=["href"],ut={key:2},wt={__name:"detail",setup(vt){const C="https://astracontsbackend.taxaccolega.co.uk/astraConst/public/api",T=W(),a=g(null),y=g(!0),f=g(""),L=o=>{const n=`; ${document.cookie}`.split(`; ${o}=`);return n.length===2?n.pop().split(";").shift():null},V=()=>{const o=L("accessToken");if(!o)throw new Error("Access token is missing. Please log in.");return{Authorization:`Bearer ${decodeURIComponent(o)}`}},l=o=>o==null||o===""?"—":o,$=o=>o===!0?"Yes":o===!1?"No":"—",E=async()=>{var o,t,n;y.value=!0;try{const u=T.params.id,_=await B.get(`${C}/assets/${u}`,{headers:V()}),d=((o=_.data)==null?void 0:o.data)??_.data;a.value={...d,media:Array.isArray(d==null?void 0:d.images)?d.images:d!=null&&d.images?[d.images]:[]},F(u)}catch(u){console.error(u),f.value=((n=(t=u.response)==null?void 0:t.data)==null?void 0:n.message)||"Failed to load asset details."}finally{y.value=!1}},I=()=>{const o=document.getElementById("printArea").innerHTML,t=window.open("","","width=1000,height=700");t.document.write(`
    <html>
      <head>
        <title>Print Asset Detail</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
          }

          h2, h4 {
            margin: 10px 0;
          }

          h2 {
            text-align: center;
            margin-bottom: 20px;
          }

          /* Grid layout */
          .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 24px;
            width: 100%;
          }

          .kv {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 6px;
            align-items: start;
            margin-bottom: 4px;
          }

          .v {
            text-align: left;
            word-break: break-word;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            text-align: center;
          }

          th {
            background: #f3f3f3;
            font-weight: 600;
          }

          /* Hide buttons only */
          .v-btn, .hide-on-print {
            display: none !important;
          }

          /* Show images and QR */
          img {
            max-width: 150px;
            height: auto;
            display: inline-block;
          }

          .media-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            margin-top: 10px;
          }

          .media-item {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h2>Asset Detail</h2>
        ${o}
      </body>
    </html>
  `),t.document.close(),t.focus(),t.print(),t.close()},h=g([]),k=g(!1),M=o=>o?new Date(o).toLocaleDateString("en-GB",{year:"numeric",month:"short",day:"numeric"}):"—",F=async o=>{var t;if(console.log(o),!!o)try{k.value=!0;const n=await B.get(`${C}/asset-custodians`,{params:{id:o},headers:V()});h.value=Array.isArray((t=n.data)==null?void 0:t.data)?n.data.data:[]}catch(n){console.error("Failed to load custodians",n),h.value=[]}finally{k.value=!1}};return H(()=>{E()}),(o,t)=>(i(),r("div",Q,[s("div",j,[t[3]||(t[3]=s("h2",{class:"m-0"},"Asset Detail",-1)),s("div",J,[c(p(N),{color:"secondary",onClick:I},{default:v(()=>[...t[1]||(t[1]=[b("Print",-1)])]),_:1}),c(p(N),{color:"primary",onClick:t[0]||(t[0]=n=>o.$router.push("/dashboards/assets"))},{default:v(()=>[...t[2]||(t[2]=[b("Back to List",-1)])]),_:1})])]),y.value?(i(),m(p(w),{key:0,class:"pa-4"},{default:v(()=>[...t[4]||(t[4]=[s("p",null,"Loading asset details...",-1)])]),_:1})):f.value?(i(),m(p(Y),{key:1,type:"error",class:"mb-4"},{default:v(()=>[b(e(f.value),1)]),_:1})):a.value?(i(),m(p(w),{key:2,id:"printArea"},{default:v(()=>[c(p(z),null,{default:v(()=>[s("div",K,[s("div",O,[s("div",X,[t[5]||(t[5]=s("span",{class:"v"},[s("strong",null,"ID")],-1)),s("span",Z,e(l(a.value.id)),1)]),s("div",ss,[t[6]||(t[6]=s("span",{class:"v"},[s("strong",null,"Title")],-1)),s("span",ts,e(l(a.value.title)),1)]),s("div",as,[t[7]||(t[7]=s("span",{class:"v"},[s("strong",null,"Code")],-1)),s("span",es,e(l(a.value.code)),1)]),s("div",ns,[t[8]||(t[8]=s("span",{class:"v"},[s("strong",null,"Category")],-1)),s("span",ls,e(l(a.value.category_name)),1)]),s("div",os,[t[9]||(t[9]=s("span",{class:"v"},[s("strong",null,"Sub Category")],-1)),s("span",is,e(l(a.value.sub_category)),1)]),s("div",rs,[t[10]||(t[10]=s("span",{class:"v"},[s("strong",null,"Type")],-1)),s("span",ds,e(l(a.value.type)),1)]),s("div",us,[t[11]||(t[11]=s("span",{class:"v"},[s("strong",null,"Asset Type")],-1)),s("span",vs,e(l(a.value.asset_type)),1)]),s("div",cs,[t[12]||(t[12]=s("span",{class:"v"},[s("strong",null,"Brand")],-1)),s("span",ps,e(l(a.value.brand)),1)]),s("div",_s,[t[13]||(t[13]=s("span",{class:"v"},[s("strong",null,"Model")],-1)),s("span",gs,e(l(a.value.model)),1)]),s("div",ms,[t[14]||(t[14]=s("span",{class:"v"},[s("strong",null,"Serial #")],-1)),s("span",hs,e(l(a.value.serial_number)),1)]),s("div",ys,[t[15]||(t[15]=s("span",{class:"v"},[s("strong",null,"Plate #")],-1)),s("span",fs,e(l(a.value.plate_number)),1)]),s("div",ks,[t[16]||(t[16]=s("span",{class:"v"},[s("strong",null,"Manufacturing Year")],-1)),s("span",bs,e(l(a.value.manufacturing_year)),1)]),s("div",xs,[t[17]||(t[17]=s("span",{class:"v"},[s("strong",null,"Production Date")],-1)),s("span",As,e(l(a.value.production_date)),1)]),s("div",ws,[t[18]||(t[18]=s("span",{class:"v"},[s("strong",null,"Location")],-1)),s("span",Cs,e(l(a.value.location)),1)]),s("div",Vs,[t[19]||(t[19]=s("span",{class:"v"},[s("strong",null,"Description")],-1)),s("span",Ds,e(l(a.value.description)),1)])]),s("div",Bs,[s("div",Ss,[t[20]||(t[20]=s("span",{class:"v"},[s("strong",null,"Purchase Date")],-1)),s("span",Ns,e(l(a.value.purchase_date)),1)]),s("div",Ps,[t[21]||(t[21]=s("span",{class:"v"},[s("strong",null,"Price")],-1)),s("span",Rs,e(l(a.value.price)),1)]),s("div",Ts,[t[22]||(t[22]=s("span",{class:"v"},[s("strong",null,"Purchase Cost")],-1)),s("span",Ls,e(l(a.value.purchase_cost)),1)]),s("div",$s,[t[23]||(t[23]=s("span",{class:"v"},[s("strong",null,"Replacement Cost")],-1)),s("span",Es,e(l(a.value.replacement_cost)),1)]),s("div",Is,[t[24]||(t[24]=s("span",{class:"v"},[s("strong",null,"Book Value")],-1)),s("span",Ms,e(l(a.value.book_value)),1)]),s("div",Fs,[t[25]||(t[25]=s("span",{class:"v"},[s("strong",null,"Useful Life")],-1)),s("span",Hs,e(l(a.value.useful_life)),1)]),s("div",Ws,[t[26]||(t[26]=s("span",{class:"v"},[s("strong",null,"Is Related to IT?")],-1)),s("span",qs,e($(a.value.is_related_to_it)),1)]),s("div",Gs,[t[27]||(t[27]=s("span",{class:"v"},[s("strong",null,"Insurance Start")],-1)),s("span",Us,e(l(a.value.insurance_start_date)),1)]),s("div",Ys,[t[28]||(t[28]=s("span",{class:"v"},[s("strong",null,"Insurance End")],-1)),s("span",zs,e(l(a.value.insurance_end_date)),1)]),s("div",Qs,[t[29]||(t[29]=s("span",{class:"v"},[s("strong",null,"Warranty Start")],-1)),s("span",js,e(l(a.value.warranty_start_date)),1)]),s("div",Js,[t[30]||(t[30]=s("span",{class:"v"},[s("strong",null,"Warranty End")],-1)),s("span",Ks,e(l(a.value.warranty_end_date)),1)]),s("div",Os,[t[31]||(t[31]=s("span",{class:"v"},[s("strong",null,"Extended Warranty")],-1)),s("span",Xs,e(l(a.value.extended_warranty)),1)]),s("div",Zs,[t[32]||(t[32]=s("span",{class:"v"},[s("strong",null,"Created At")],-1)),s("span",st,e(l(a.value.created_at)),1)])])]),Array.isArray(a.value.schedule)&&a.value.schedule.length?(i(),r("div",tt,[t[34]||(t[34]=s("h4",null,"Depreciation Schedule",-1)),s("table",at,[t[33]||(t[33]=s("thead",null,[s("tr",null,[s("th",null,"Year"),s("th",null,"Depreciation"),s("th",null,"Remaining Value"),s("th",null,"Remaining %")])],-1)),s("tbody",null,[(i(!0),r(x,null,A(a.value.schedule,(n,u)=>(i(),r("tr",{key:u},[s("td",null,e(n.year),1),s("td",null,"SAR "+e(l(n.depreciation)),1),s("td",null,"SAR "+e(l(n.remaining_value)),1),s("td",null,e(l(n.percent_remaining))+"%",1)]))),128))])])])):S("",!0),c(P,{cols:"12",class:"mt-6"},{default:v(()=>[t[35]||(t[35]=s("h4",{class:"section-title"},"Custodians",-1)),c(G,{class:"my-3"})]),_:1}),c(P,{cols:"12"},{default:v(()=>[k.value?(i(),m(p(w),{key:0,class:"p-4 text-center"},{default:v(()=>[c(q,{indeterminate:"",color:"primary"}),t[36]||(t[36]=s("p",null,"Loading custodians...",-1))]),_:1})):h.value.length?(i(),m(U,{key:1},{default:v(()=>[t[37]||(t[37]=s("thead",null,[s("tr",null,[s("th",null,"#"),s("th",null,"Employee"),s("th",null,"Asset Code"),s("th",null,"Asset Name"),s("th",null,"Handover Date")])],-1)),s("tbody",null,[(i(!0),r(x,null,A(h.value,(n,u)=>{var _,d,D;return i(),r("tr",{key:n.id},[s("td",null,e(u+1),1),s("td",null,e(((_=n.user)==null?void 0:_.name)||"N/A"),1),s("td",null,e(((d=n.asset)==null?void 0:d.code)||"N/A"),1),s("td",null,e(((D=n.asset)==null?void 0:D.name)||"N/A"),1),s("td",null,e(M(n.handover_date)),1)])}),128))])]),_:1})):(i(),r("div",et,"No custodians found for this asset."))]),_:1}),s("div",nt,[t[38]||(t[38]=s("h4",null,"QR Code",-1)),a.value.qr_code?(i(),r("div",lt,[s("a",{href:a.value.qr_code,target:"_blank",rel:"noopener"},[c(p(R),{src:a.value.qr_code,width:"140"},null,8,["src"])],8,ot)])):(i(),r("div",it,"—"))]),t[39]||(t[39]=s("h4",{class:"mt-4 imageSection"},"Images",-1)),Array.isArray(a.value.media)&&a.value.media.length?(i(),r("div",rt,[(i(!0),r(x,null,A(a.value.media,(n,u)=>(i(),r("div",{key:u,class:"media-item"},[s("a",{href:(n==null?void 0:n.url)||n,target:"_blank",rel:"noopener"},[c(p(R),{src:(n==null?void 0:n.url)||n,alt:"Asset media",width:"140"},null,8,["src"])],8,dt)]))),128))])):(i(),r("div",ut,"—"))]),_:1})]),_:1})):S("",!0)]))}};export{wt as default};
