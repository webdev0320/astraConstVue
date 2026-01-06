import{a as C}from"./index-NIGUFBhG.js";import{r as y,G as O,c as E,d as e,f as _,l as T,b as c,e as r,m,i as L,o as g,t as p,ak as H,v as n}from"./index-BJgTmWrC.js";import{V as w,b as M}from"./VCard-CwqmF1ag.js";import{V as R}from"./VAlert-CjZ-75rh.js";import{V as B}from"./VCardText-UyRzVgPW.js";import{V as A}from"./VDataTable-axCNbPz9.js";import"./createSimpleFunctional-DM2teK0s.js";import"./VAvatar-3blwbaY9.js";import"./index-D-JrKSlL.js";import"./VSelect-Czwxnd6D.js";import"./VTextField-Buc3nw0Z.js";import"./VField-rKX4Lknw.js";import"./VInput-d6B6xKJW.js";import"./forwardRefs-D3j0TLhE.js";import"./VList-BNn6AhvB.js";import"./ssrBoot-BYKgkoYv.js";import"./VDivider-Bf678oyo.js";import"./dialog-transition-CAgvymS8.js";import"./VMenu-DgCiqfbi.js";import"./VOverlay-0fpqgYMk.js";import"./scopeId-C4kKR5Lh.js";import"./VSelectionControl-D5q8QyiA.js";import"./VChip-1mnpEcCr.js";import"./VTable-CLRyoogh.js";const F={class:"pa-6"},U={class:"d-flex justify-space-between align-center w-100 mb-4"},j={class:"d-flex align-center gap-2",style:{"margin-left":"auto"}},G={class:"detail-grid mb-6"},Q={class:"kv"},W={class:"v"},Y={class:"kv"},K={class:"v"},J={class:"kv"},X={class:"v"},Z={class:"kv"},tt={class:"v"},et={class:"kv"},st={class:"v"},at={class:"kv"},ot={class:"v"},nt={class:"kv"},rt={class:"v"},it={class:"detail-grid mb-6"},dt={class:"kv"},lt={class:"v"},pt={class:"mt-4"},mt={key:2,class:"text-center py-4 text-medium-emphasis"},ut="/src/assets/images/logos/astra-logo.png",Pt={__name:"detail",setup(vt){const N="http://127.0.0.1:8000/api",V=L(),d=y(null),f=y(!0),k=y(""),x=y([]),h=y(""),D=[{title:"#",key:"index"},{title:"Asset Name",key:"asset"},{title:"Asset Type",key:"asset_type"},{title:"Quantity Requested",key:"quantity"},{title:"Remarks",key:"remarks"}],S=[{title:"#",key:"index"},{title:"Date",key:"date"},{title:"Given By User Name",key:"given_by_name"},{title:"Given By User Code",key:"given_by_code"},{title:"Quantity Given",key:"quantity_given"},{title:"Quantity Pending",key:"quantity_pending"}],q=a=>{const l=`; ${document.cookie}`.split(`; ${a}=`);return l.length===2?l.pop().split(";").shift():null},$=()=>{const a=q("accessToken");if(!a)throw new Error("Access token is missing. Please log in.");return{Authorization:`Bearer ${decodeURIComponent(a)}`}},s=a=>a==null||a===""?"—":a,I=async()=>{var a,t,l;f.value=!0;try{const i=V.params.id,u=await C.get(`${N}/asset-handovers/${i}`,{headers:$()});d.value=((a=u.data)==null?void 0:a.data)??u.data}catch(i){console.error(i),k.value=((l=(t=i.response)==null?void 0:t.data)==null?void 0:l.message)||"Failed to load handover details."}finally{f.value=!1}},P=async()=>{var a,t,l;h.value="";try{const u=((a=(await C.get(`${N}/getApprovals/AssetHandOver/${d.value.id}`,{headers:$()})).data)==null?void 0:a.data)??[];x.value=u.map(v=>{var o,b;return{id:v.id,status:v.status,name:((o=v.user)==null?void 0:o.name)??"—",user_code:((b=v.user)==null?void 0:b.user_code)??"—"}})}catch(i){console.error("Fetch approvals failed",i),h.value=((l=(t=i==null?void 0:i.response)==null?void 0:t.data)==null?void 0:l.message)||(i==null?void 0:i.message)||"Failed to load approvals."}},z=()=>{var l,i,u,v;const a=d.value,t=window.open("","","width=1000,height=700");t.document.write(`
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
              <img src="`+ut+`" />
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
              <td><strong>Employee Code:</strong> ${s((i=a.user)==null?void 0:i.user_code)}</td>
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
            ${a.items.map((o,b)=>`
                <tr>
                  <td>${b+1}</td>
                  <td>${s(o.asset_name)}</td>
                  <td>${s(o.asset_code)}</td>
                  <td>${s(o.quantity)}</td>
                  <td>${s(o.remarks)}</td>
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
              I, Mr. <strong>${s((v=a.user)==null?void 0:v.name)}</strong>   acknowledge that I have Received the above mentioned assets. I understand that this asset belongs to ASTRA CONSTRUCTION and is under my possession for carrying out my work. I hereby assure that I will take care of the assets of the company to the best possible extend and will handover/Transfer or Return back to the company before my vacation or end of contract clearance (termination/Resignation).

        </p>

        <p><strong>Employee Signature:</strong> ___________________________</p>

        <div class="footer">
          ISSUE 01 &nbsp;&nbsp;|&nbsp;&nbsp; REV 01 &nbsp;&nbsp;|&nbsp;&nbsp; F-12-08 &nbsp;&nbsp;|&nbsp;&nbsp; 16-08-2020
        </div>

      </body>
    </html>
  `),t.document.close(),t.print()};return O(async()=>{await I(),await P()}),(a,t)=>(g(),E("div",F,[e("div",U,[t[3]||(t[3]=e("h2",{class:"m-0"},"Asset Handover Detail",-1)),e("div",j,[c(m(H),{color:"secondary",onClick:z},{default:r(()=>[...t[1]||(t[1]=[p("Print",-1)])]),_:1}),c(m(H),{color:"primary",onClick:t[0]||(t[0]=l=>a.$router.push("/dashboards/assethandovers"))},{default:r(()=>[...t[2]||(t[2]=[p("Back to List",-1)])]),_:1})])]),f.value?(g(),_(m(w),{key:0,class:"pa-4"},{default:r(()=>[...t[4]||(t[4]=[e("p",null,"Loading details...",-1)])]),_:1})):k.value?(g(),_(m(R),{key:1,type:"error",class:"mb-4"},{default:r(()=>[p(n(k.value),1)]),_:1})):d.value?(g(),_(m(w),{key:2,id:"printArea",class:"pa-6"},{default:r(()=>[c(m(B),null,{default:r(()=>{var l,i,u,v;return[e("div",G,[e("div",Q,[t[5]||(t[5]=e("span",{class:"k"},"Handover ID",-1)),e("span",W,n(s(d.value.handover_id)),1)]),e("div",Y,[t[6]||(t[6]=e("span",{class:"k"},"Handover Date",-1)),e("span",K,n(s(d.value.handover_date)),1)]),e("div",J,[t[7]||(t[7]=e("span",{class:"k"},"Project Name",-1)),e("span",X,n(s(d.value.projectName)),1)]),e("div",Z,[t[8]||(t[8]=e("span",{class:"k"},"Asset Investment Request ID",-1)),e("span",tt,n(s(d.value.asset_investment_request_id)),1)]),e("div",et,[t[9]||(t[9]=e("span",{class:"k"},"Handover By",-1)),e("span",st,n(s((l=d.value.handover_by)==null?void 0:l.name))+" ("+n(s((i=d.value.handover_by)==null?void 0:i.user_code))+")",1)]),e("div",at,[t[10]||(t[10]=e("span",{class:"k"},"Handover To",-1)),e("span",ot,n(s((u=d.value.user)==null?void 0:u.name))+" ("+n(s((v=d.value.user)==null?void 0:v.user_code))+")",1)]),e("div",nt,[t[11]||(t[11]=e("span",{class:"k"},"Status",-1)),e("span",rt,n(s(d.value.status)),1)])]),e("div",it,[e("div",dt,[t[12]||(t[12]=e("span",{class:"k"},"Remarks",-1)),e("span",lt,n(s(d.value.remarks)),1)])]),e("div",null,[t[14]||(t[14]=e("h3",{class:"mb-2"},"Handover Items",-1)),c(m(A),{headers:D,items:d.value.items,"item-value":"id",density:"comfortable","fixed-header":"","items-per-page":5},{"item.asset":r(({item:o})=>[p(n(s(o.asset_code))+" - "+n(s(o.asset_name)),1)]),"item.quantity":r(({item:o})=>[p(n(s(o.quantity)),1)]),"item.remarks":r(({item:o})=>[p(n(s(o.remarks)),1)]),"no-data":r(()=>[...t[13]||(t[13]=[e("div",{class:"text-center py-4 textBlack"},"No items found.",-1)])]),_:1},8,["items"])]),e("div",pt,[t[16]||(t[16]=e("h3",{class:"mb-2"},"History",-1)),c(m(A),{headers:S,items:d.value.history,"item-value":"id",density:"comfortable","fixed-header":"","items-per-page":5},{"item.date":r(({item:o})=>[p(n(s(o.created_at)),1)]),"item.given_by_name":r(({item:o})=>[p(n(s(o.user.name)),1)]),"item.given_by_code":r(({item:o})=>[p(n(s(o.user.user_code)),1)]),"item.quantity_given":r(({item:o})=>[p(n(s(o.quantity_given)),1)]),"item.quantity_pending":r(({item:o})=>[p(n(s(o.quantity_pending)),1)]),"no-data":r(()=>[...t[15]||(t[15]=[e("div",{class:"text-center py-4 textBlack"},"No history found.",-1)])]),_:1},8,["items"])])]}),_:1})]),_:1})):T("",!0),c(m(w),{class:"pa-3 rounded-lg no-print mt-4 no-padd",elevation:"2"},{default:r(()=>[c(M,{class:"no-padd"},{default:r(()=>[...t[17]||(t[17]=[p("Approvals",-1)])]),_:1}),c(m(B),{class:"no-padd"},{default:r(()=>[h.value?(g(),_(m(R),{key:0,type:"error",class:"mb-4",variant:"tonal"},{default:r(()=>[p(n(h.value),1)]),_:1})):T("",!0),x.value.length?(g(),_(m(A),{key:1,headers:a.approvalHeaders,items:x.value,"items-per-page":5,class:"elev-1 no-padd"},null,8,["headers","items"])):(g(),E("div",mt," No approvals found. "))]),_:1})]),_:1})]))}};export{Pt as default};
