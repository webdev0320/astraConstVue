import{a as H}from"./index-NIGUFBhG.js";import{r as f,G as V,c,d as t,f as x,l as k,b as w,e as v,m as g,i as P,o as i,t as A,al as N,v as n,F as $,h as C}from"./index-DYNE-ExV.js";import{V as E}from"./VCard-6ovseWO7.js";import{V as q}from"./VAlert-AoAPAwWS.js";import{V as z}from"./VCardText-D8GnP8gM.js";import"./createSimpleFunctional-0AytW5LU.js";import"./VAvatar-CJxIedyZ.js";import"./index-Bo5HBsbv.js";const L={class:"pa-6"},M={class:"d-flex justify-space-between align-center w-100 mb-4"},O={class:"d-flex align-center gap-2",style:{"margin-left":"auto"}},F={class:"detail-grid mb-6"},U={class:"kv"},j={class:"v"},G={class:"kv"},Q={class:"v"},W={class:"kv"},Y={class:"v"},K={class:"kv"},J={class:"v"},X={class:"kv"},Z={class:"v"},tt={class:"kv"},et={class:"v"},st={class:"kv"},at={class:"v"},nt={class:"handover-table"},ot={key:0},rt={class:"handover-table"},lt={key:0},dt="/src/assets/images/logos/astra-logo.png",_t={__name:"detail",setup(it){const R="http://127.0.0.1:8000/api",T=P(),o=f(null),b=f(!0),_=f(""),S=a=>{const l=`; ${document.cookie}`.split(`; ${a}=`);return l.length===2?l.pop().split(";").shift():null},B=()=>{const a=S("accessToken");if(!a)throw new Error("Access token is missing. Please log in.");return{Authorization:`Bearer ${decodeURIComponent(a)}`}},s=a=>a==null||a===""?"—":a,D=async()=>{var a,e,l;b.value=!0;try{const d=T.params.id,u=await H.get(`${R}/asset-handovers/${d}`,{headers:B()});o.value=((a=u.data)==null?void 0:a.data)??u.data}catch(d){console.error(d),_.value=((l=(e=d.response)==null?void 0:e.data)==null?void 0:l.message)||"Failed to load handover details."}finally{b.value=!1}},I=()=>{var l,d,u,h;const a=o.value,e=window.open("","","width=1000,height=700");e.document.write(`
    <html>
      <head>
        <title>Asset Handover Form</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }

          .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border: 1px solid #000;
              padding: 10px 20px;
              margin-bottom: 20px;
            }

          .header img {
            height: 70px;
          }

          .title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 14px;
          }

          table th, table td {
            border: 1px solid #000;
            padding: 6px;
          }

          .grid-table td {
            padding: 3px 0;
          }

          .sign-row {
            margin-top: 50px;
          }

          .sign-col {
            width: 50%;
            text-align: center;
            font-weight: bold;
          }

          .footer {
            margin-top: 30px;
            font-size: 12px;
          }

        .left-text, .right-text {
            width: 30%;
            font-size: 14px;
            font-weight: bold;
            line-height: 18px;
            text-align: center;
          }

          .logo img {
            height: 70px;
          }

          .grid-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
              margin-bottom: 15px;
            }

            .grid-table td {
              border: 1px solid #000 !important;
              padding: 6px 10px;
              width: 50%;
              vertical-align: top;
            }
        </style>
      </head>

      <body>

        <!-- Logo & Header -->
         <div class="header">
            <div class="left-text">
              Arab Supply & Trading Co.<br>
              Construction Branch
            </div>

            <div class="logo">
              <img src="`+dt+`" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>


        <div class="title">ASSET HANDOVER FORM</div>

        <!-- Employee Info -->
         <table class="grid-table">
            <tr>
              <td><strong>Name of Employee:</strong> ${s((l=a.user)==null?void 0:l.name)}</td>
              <td><strong>Asset Transfer No.:</strong> ${s(a.handover_id)}</td>
            </tr>

            <tr>
              <td><strong>Employee Code:</strong> ${s((d=a.user)==null?void 0:d.user_code)}</td>
              <td><strong>Handover Date:</strong> ${s(a.handover_date)}</td>
            </tr>

            <tr>
              <td><strong>Department:</strong> —</td>
              <td><strong>Handover By:</strong> ${s((u=a.handover_by)==null?void 0:u.name)}</td>
            </tr>
          </table>

        <p>Dear Sir / Madam,<br>
        Please find below the assets handed over to you. Please sign also the attached picture.</p>

        <!-- Table -->
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Particulars</th>
              <th>Asset Code</th>
              <th>Qty</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${a.items.map((p,m)=>`
                <tr>
                  <td>${m+1}</td>
                  <td>${s(p.asset_name)}</td>
                  <td>${s(p.asset_code)}</td>
                  <td>${s(p.quantity)}</td>
                  <td>${s(p.remarks)}</td>
                </tr>
              `).join("")}
          </tbody>
        </table>

        <!-- Signatures -->
        <table class="sign-row">
          <tr>
            <td class="sign-col">Authorized Signatory<br>(Person Requesting)</td>
            <td class="sign-col">Authorized Signatory<br>(Approver)</td>
          </tr>
        </table>

        <p><strong>ACKNOWLEDGEMENT AND DECLARATION BY EMPLOYEE:</strong></p>
        <p>
              I, Mr. <strong>${s((h=a.user)==null?void 0:h.name)}</strong>   acknowledge that I have Received the above mentioned assets. I understand that this asset belongs to ASTRA CONSTRUCTION and is under my possession for carrying out my work. I hereby assure that I will take care of the assets of the company to the best possible extend and will handover/Transfer or Return back to the company before my vacation or end of contract clearance (termination/Resignation).

        </p>

        <p><strong>Employee Signature:</strong> ___________________________</p>

        <div class="footer">
          ISSUE 01 &nbsp;&nbsp;|&nbsp;&nbsp; REV 01 &nbsp;&nbsp;|&nbsp;&nbsp; F-12-08 &nbsp;&nbsp;|&nbsp;&nbsp; 16-08-2020
        </div>

      </body>
    </html>
  `),e.document.close(),e.print()};return V(D),(a,e)=>(i(),c("div",L,[t("div",M,[e[3]||(e[3]=t("h2",{class:"m-0"},"Asset Handover Detail",-1)),t("div",O,[w(g(N),{color:"secondary",onClick:I},{default:v(()=>[...e[1]||(e[1]=[A("Print",-1)])]),_:1}),w(g(N),{color:"primary",onClick:e[0]||(e[0]=l=>a.$router.push("/dashboards/assethandovers"))},{default:v(()=>[...e[2]||(e[2]=[A("Back to List",-1)])]),_:1})])]),b.value?(i(),x(g(E),{key:0,class:"pa-4"},{default:v(()=>[...e[4]||(e[4]=[t("p",null,"Loading details...",-1)])]),_:1})):_.value?(i(),x(g(q),{key:1,type:"error",class:"mb-4"},{default:v(()=>[A(n(_.value),1)]),_:1})):o.value?(i(),x(g(E),{key:2,id:"printArea",class:"pa-6"},{default:v(()=>[w(g(z),null,{default:v(()=>{var l,d,u,h,p,m;return[t("div",F,[t("div",U,[e[5]||(e[5]=t("span",{class:"k"},"Handover ID",-1)),t("span",j,n(s(o.value.handover_id)),1)]),t("div",G,[e[6]||(e[6]=t("span",{class:"k"},"Handover Date",-1)),t("span",Q,n(s(o.value.handover_date)),1)]),t("div",W,[e[7]||(e[7]=t("span",{class:"k"},"Project Name",-1)),t("span",Y,n(s(o.value.projectName)),1)]),t("div",K,[e[8]||(e[8]=t("span",{class:"k"},"Asset Investment Request ID",-1)),t("span",J,n(s(o.value.asset_investment_request_id)),1)]),t("div",X,[e[9]||(e[9]=t("span",{class:"k"},"Handover By",-1)),t("span",Z,n(s((l=o.value.handover_by)==null?void 0:l.name))+" ("+n(s((d=o.value.handover_by)==null?void 0:d.user_code))+")",1)]),t("div",tt,[e[10]||(e[10]=t("span",{class:"k"},"Handover To",-1)),t("span",et,n(s((u=o.value.user)==null?void 0:u.name))+" ("+n(s((h=o.value.user)==null?void 0:h.user_code))+")",1)]),t("div",st,[e[11]||(e[11]=t("span",{class:"k"},"Status",-1)),t("span",at,n(s(o.value.status)),1)])]),t("div",null,[e[14]||(e[14]=t("h3",{class:"mb-2"},"Handover Items",-1)),t("table",nt,[e[13]||(e[13]=t("thead",null,[t("tr",null,[t("th",null,"#"),t("th",null,"Asset Name"),t("th",null,"Asset Type"),t("th",null,"Quantity Requested"),t("th",null,"Remarks")])],-1)),t("tbody",null,[(i(!0),c($,null,C(o.value.items,(r,y)=>(i(),c("tr",{key:r.id},[t("td",null,n(y+1),1),t("td",null,n(s(r.asset_code))+" - "+n(s(r.asset_name)),1),t("td",null,n(s(r.asset_type)),1),t("td",null,n(s(r.quantity)),1),t("td",null,n(s(r.remarks)),1)]))),128)),(p=o.value.items)!=null&&p.length?k("",!0):(i(),c("tr",ot,[...e[12]||(e[12]=[t("td",{colspan:"7",class:"text-center"},"No items found",-1)])]))])])]),t("div",null,[e[17]||(e[17]=t("h3",{class:"mb-2"},"History",-1)),t("table",rt,[e[16]||(e[16]=t("thead",null,[t("tr",null,[t("th",null,"#"),t("th",null,"Date"),t("th",null,"Given By User Name"),t("th",null,"Given By User Code"),t("th",null,"Quantity Given"),t("th",null,"Quantity Pending")])],-1)),t("tbody",null,[(i(!0),c($,null,C(o.value.history,(r,y)=>(i(),c("tr",{key:r.id},[t("td",null,n(y+1),1),t("td",null,n(s(r.created_at)),1),t("td",null,n(s(r.user.name)),1),t("td",null,n(s(r.user.user_code)),1),t("td",null,n(s(r.quantity_given)),1),t("td",null,n(s(r.quantity_pending)),1)]))),128)),(m=o.value.history)!=null&&m.length?k("",!0):(i(),c("tr",lt,[...e[15]||(e[15]=[t("td",{colspan:"7",class:"text-center"},"No items found",-1)])]))])])])]}),_:1})]),_:1})):k("",!0)]))}};export{_t as default};
