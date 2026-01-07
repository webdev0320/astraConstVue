import{a as I}from"./index-NIGUFBhG.js";import{M as O,Q as g,i as j,r as x,G as F,c as _,d,f as T,l as L,b as a,e as s,m as w,j as M,o as m,t as n,ak as H,v as i}from"./index-Bdxt105Z.js";import"./useConfirmDialog-Duj39xxw.js";import{V as E,b as q}from"./VCard-BpQaDQot.js";import{V as z}from"./VDataTable-K0w0sS1A.js";import{V as N}from"./VCardText-DSqTRKFr.js";import{V as p}from"./VRow-BACj5Bb9.js";import{V as l}from"./VCol-CW_KOqMe.js";import{V as Y}from"./VDivider-P3qP0VON.js";import{V as G}from"./VAlert-BlWWFAT3.js";import{V as K}from"./VSkeletonLoader-BziF02X7.js";import"./createSimpleFunctional-ChaDJ6gN.js";import"./VAvatar-BVNpeuPR.js";import"./index-DwDpqtSj.js";import"./VSelect-CvFuK1Qq.js";import"./VTextField-BXZPdbQH.js";import"./VField-BNtlM2rw.js";import"./VInput-HAOA5DjW.js";import"./forwardRefs-D3j0TLhE.js";import"./VList-Nc5Yw7gn.js";import"./ssrBoot-BTZ3QaKZ.js";import"./dialog-transition-BFArlCSA.js";import"./VMenu-DHrfjxMp.js";import"./VOverlay-CbapJr7-.js";import"./scopeId-B3gj_2Ff.js";import"./VSelectionControl-CmpOtO-f.js";import"./VChip-D2D1DJjT.js";import"./VTable-BxNLuhpO.js";/* empty css              */const U={class:"page-wrap"},Q={class:"topbar"},J={class:"right"},Z={key:2,class:"",id:"printArea"},W={class:"font-weight-bold"},X={class:"font-weight-bold"},tt={class:"font-weight-bold"},et={class:"font-weight-bold"},st={class:"font-weight-bold"},dt={class:"font-weight-bold"},at={class:"font-weight-bold"},ot={class:"font-weight-bold"},rt={class:"font-weight-bold"},it={class:"font-weight-bold"},lt={class:"font-weight-bold"},nt={class:"font-weight-bold"},ct={class:"font-weight-bold"},pt={class:"font-weight-bold"},mt={class:"font-weight-bold"},ft={key:3},A="/src/assets/images/logos/astra-logo.png",vt={__name:"show",setup(bt){const k="https://astracontsbackend.taxaccolega.co.uk/astraConst/public/api",R=j();M();const D=g(()=>R.params.id),b=x(!0),f=x(""),r=x(null),$=[{title:"S/N",key:"sn",width:"70px",align:"center"},{title:"Asset Name & Code",key:"asset"},{title:"DESCRIPTION",key:"description"},{title:"QTY",key:"qty",width:"80px",align:"center"},{title:"REMARKS",key:"remarks"}],C=t=>{const o=`; ${document.cookie}`.split(`; ${t}=`);return o.length===2?o.pop().split(";").shift():null},S=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Karachi"}),c=t=>{try{if(!t)return"—";const e=new Date(t);return isNaN(e)?"—":S.format(e)}catch{return"—"}},u=t=>{try{if(!t)return"—";const e=new Date(t);return isNaN(e)?"—":e.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Karachi"})}catch{return"—"}},y=t=>t?`#${t}`:"—",V=g(()=>{var t;return Array.isArray((t=r.value)==null?void 0:t.items)?r.value.items:[]});F(async()=>{var t,e;b.value=!0,f.value="",r.value=null;try{const o=C("accessToken");if(!o)throw new Error("Access token is missing. Please log in.");const h=decodeURIComponent(o),{data:v}=await I.get(`${k}/asset-transfers/${D.value}`,{headers:{Authorization:`Bearer ${h}`,Accept:"application/json"}});r.value=(v==null?void 0:v.data)??v??null}catch(o){console.error(o),f.value=((e=(t=o.response)==null?void 0:t.data)==null?void 0:e.message)||"Failed to load details."}finally{b.value=!1}});const P=g(()=>V.value.map(t=>({sn:"",brand:t==null?void 0:t.assetName,description:t==null?void 0:t.description,qty:t==null?void 0:t.qty,remarks:t==null?void 0:t.remarks,asset_id:t==null?void 0:t.asset_id,assetName:t==null?void 0:t.assetName,assetCode:t==null?void 0:t.assetCode}))),B=()=>{const t=r.value,e=window.open("","","width=1000,height=700");e.document.write(`
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
          }

          .grid-table td {
            padding: 3px 0;
          }

          .sign-row {
            margin-top: 50px;
          }

          .sign-col {
            width: 25%;
            text-align: center;
            font-weight: bold;
            height : 80px;
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

    .vh-mid-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.vh-mid-table td {
  vertical-align: top;
  border: 1px solid #000;
  padding: 10px;
}

.vh-left {
  width: 70%;
  text-align: center;
}

.vh-left img {
  width: 100%;
}

.vh-right {
  width: 55%;
}

.checks-title {
  font-weight: bold;
  margin: 10px 0 5px;
}

.checks-list {
  list-style: none;
  padding: 0;
  margin: 0 0 15px;
}

.checks-list li {
  margin: 4px 0;
  font-size: 14px;
}

.box {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 1px solid #000;
  text-align: center;
  line-height: 15px;
  margin-right: 8px;
}

    .vh-sign-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 30px;
}

.inner-sign-table {
  width: 100%;
  border: 1px solid #000;
  border-collapse: collapse;
  font-size: 14px;
}

.inner-sign-table th {
  text-align: center;
  font-weight: bold;
  background: #f0f0f0;
  padding: 6px;
  border: 1px solid #000;
}

.sig-cell {
  height: 60px; /* space for signature */
}

    .header-table{
      text-align:center !important;
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
              <img src="`+A+`" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>

         
         <!-- Header -->
      <table class="header-table">
        <tr>
          <td>ISSUE ${t.issue_no||""}</td>
          <td>REV ${t.revision_no||"0"}</td>
          <td class="center" style="text-align:center" colspan="2"><b>${t.transferredProjectName}</b></td>
          <td>DATE ${c(t.date)}</td>
        </tr>
        <tr>
          <td>${t.form_no}</td>
          <td>${c(t.revision_date)}</td>
          <td class="center" colspan="2"><b>ASSET TRANSFER FORM (ATF)</b></td>
          <td>TAG NO. ${t.tag_no}</td>
        </tr>
      </table>

      <!-- Sender -->
      <div class="section-title">TO BE FILLED BY THE SENDER</div>
      <table>
        <tr>
          <td>Transferred from<br><b>${t.transferredProjectName}</b></td>
          <td>Transferred to<br><b>${t.transferredToProjectName}</b></td>
        </tr>
        <tr>
          <td>Date of Transfer<br><b>${c(t.transfer_date)}</b></td>
          <td>Time<br><b>${u(t.transfer_time)}</b></td>
        </tr>
        <tr>
          <td>Prepared and Checked by<br><b>${t.preparedByName}</b></td>
          <td>Signature</td>
        </tr>
        <tr>
          <td>Driver Name<br><b>${t.driverName}</b></td>
          <td>Signature</td>
        </tr>
        <tr>
          <td>Contact details<br><b>${t.contact_details}</b></td>
          <td>Vehicle Plate No.<br><b>${t.vehicle_plate_no||""}</b></td>
        </tr>
      </table>

      <!-- Items -->
      <table class="grid items">
        <thead>
          <tr>
            <th>S/N</th>
            <th>BRAND / MODEL</th>
            <th>DESCRIPTION</th>
            <th>QTY</th>
            <th>REMARKS</th>
          </tr>
        </thead>
        <tbody>
          ${t.items.map((o,h)=>`
            <tr>
              <td class="center">${h+1}</td>
              <td>${o.assetCode||""}</td>
              <td>${o.assetName}</td>
              <td class="center">${o.qty}</td>
              <td>${o.remarks||""}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <!-- Approvals -->
      <div class="section-title">TO BE FILLED BY THE PLANT & MACHINERY</div>
      <table>
        <tr>
          <td style="width:4%">Date</td>
          <td style="width:15%"></td>
          <td style="width:5%">Approved</td>
          <td style="width:5%"></td>
          <td rowspan="2"> Remarks:</td>
          <td rowspan="2"> Manager</td>
        </tr>

        <tr>
          <td style="width:4%">Date</td>
          <td style="width:15%"></td>
          <td style="width:5%">Disapproved</td>
          <td style="width:5%"></td>
        </tr>

      </table>

      <div class="section-title">APPROVAL FROM THE PROJECT INCHARGE/DEPARTMENT HEAD</div>
      <table>
       <table>
        <tr>
          <td style="width:4%">Date</td>
          <td style="width:15%"></td>
          <td style="width:5%">Approved</td>
          <td style="width:5%"></td>
          <td rowspan="2"> Remarks:</td>
          <td rowspan="2">Project Manager</td>
        </tr>

        <tr>
          <td style="width:4%">Date</td>
          <td style="width:15%"></td>
          <td style="width:5%">Disapproved</td>
          <td style="width:5%"></td>
        </tr>

      </table>
      </table>

      <!-- Receiver -->
      <div class="section-title">TO BE FILLED BY THE RECEIVER</div>
      <table>
        <tr>
          <td>Received from</td>
          <td>${t.received_from}</td>
          <td>Received by</td>
          <td>${t.received_by}</td>
        </tr>
        <tr>
          <td>Date</td>
          <td>${c(t.received_date)}</td>
          <td>Time</td>
          <td>${u(t.received_time)}</td>
        </tr>
        <tr>
          <td>Inspected by</td>
          <td>${t.inspected_by}</td>
          <td>Signature</td>
          <td></td>
        </tr>
        <tr>
          <td>Equipment / Material Accepted</td>
          <td>${t.equipment_status,""}</td>
          <td>Equipment / Material Not Accepted</td>
          <td>${t.equipment_status,""}</td>
        </tr>
      </table>
      


        
         <div class="header">
            <div class="left-text">
              Arab Supply & Trading Co.<br>
              Construction Branch
            </div>

            <div class="logo">
              <img src="`+A+`" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>             

      </body>
    </html>
  `),e.document.close(),e.print()};return(t,e)=>(m(),_("div",U,[d("div",Q,[e[1]||(e[1]=d("div",{class:"left"},null,-1)),d("div",J,[a(w(H),{color:"secondary",onClick:B},{default:s(()=>[...e[0]||(e[0]=[n("Print",-1)])]),_:1})])]),f.value?(m(),T(w(G),{key:0,type:"error",class:"mb-4",variant:"tonal"},{default:s(()=>[n(i(f.value),1)]),_:1})):L("",!0),b.value?(m(),T(w(K),{key:1,type:"card, list-item-two-line, table",class:"mb-4"})):r.value?(m(),_("div",Z,[a(E,{class:"pa-4 mb-6",outlined:""},{default:s(()=>[a(N,null,{default:s(()=>[a(p,{dense:""},{default:s(()=>[a(l,{cols:"6",sm:"2"},{default:s(()=>[e[2]||(e[2]=d("div",{class:"text-caption"},"ISSUE",-1)),d("div",W,i(r.value.issue_no||"1"),1)]),_:1}),a(l,{cols:"6",sm:"2"},{default:s(()=>[e[3]||(e[3]=d("div",{class:"text-caption"},"REV",-1)),d("div",X,i(r.value.revision_no||"0"),1)]),_:1}),a(l,{cols:"12",sm:"4"},{default:s(()=>[e[4]||(e[4]=d("div",{class:"text-caption"},"PROJECT",-1)),d("div",tt,i(r.value.transferredProjectName||t.defaultProject),1)]),_:1}),a(l,{cols:"6",sm:"2"},{default:s(()=>[e[5]||(e[5]=d("div",{class:"text-caption"},"DATE",-1)),d("div",et,i(c(r.value.date)),1)]),_:1})]),_:1}),a(Y,{class:"my-3"}),a(p,{dense:""},{default:s(()=>[a(l,{cols:"6",sm:"2"},{default:s(()=>[d("div",st,i(r.value.form_no||"F-12-05"),1)]),_:1}),a(l,{cols:"6",sm:"2"},{default:s(()=>[d("div",dt,i(c(r.value.revision_date)),1)]),_:1}),a(l,{cols:"12",sm:"4"},{default:s(()=>[...e[6]||(e[6]=[d("div",{class:"font-weight-bold text-center"}," ASSET TRANSFER FORM (ATF) ",-1)])]),_:1}),a(l,{cols:"6",sm:"2"},{default:s(()=>[e[7]||(e[7]=d("div",{class:"text-caption font-weight-bold"},"TAG NO.",-1)),d("div",at,i(r.value.tag_no||"—"),1)]),_:1})]),_:1})]),_:1})]),_:1}),a(E,{class:"pa-4 mb-6",outlined:""},{default:s(()=>[a(q,{class:"text-subtitle-1 font-weight-bold"},{default:s(()=>[...e[8]||(e[8]=[n(" TO BE FILLED BY THE SENDER ",-1)])]),_:1}),a(N,null,{default:s(()=>[a(p,{dense:""},{default:s(()=>[a(l,{cols:"12",sm:"6"},{default:s(()=>[e[9]||(e[9]=d("div",{class:"text-caption"},"Transferred from",-1)),d("div",ot,i(r.value.transferredProjectName||y(r.value.transferred_from_project_id)),1)]),_:1}),a(l,{cols:"12",sm:"6"},{default:s(()=>[e[10]||(e[10]=d("div",{class:"text-caption"},"Transferred to",-1)),d("div",rt,i(r.value.transferredToProjectName||y(r.value.transferred_to_project_id)),1)]),_:1})]),_:1}),a(p,{dense:"",class:"mt-2"},{default:s(()=>[a(l,{cols:"12",sm:"6"},{default:s(()=>[e[11]||(e[11]=d("div",{class:"text-caption"},"Date of Transfer",-1)),d("div",it,i(c(r.value.transfer_date)),1)]),_:1}),a(l,{cols:"12",sm:"6"},{default:s(()=>[e[12]||(e[12]=d("div",{class:"text-caption"},"Time",-1)),d("div",lt,i(u(r.value.transfer_time)),1)]),_:1})]),_:1}),a(p,{dense:"",class:"mt-2"},{default:s(()=>[a(l,{cols:"12",sm:"6"},{default:s(()=>[e[13]||(e[13]=d("div",{class:"text-caption"},"Prepared and Checked by",-1)),d("div",nt,i(r.value.preparedByName||r.value.prepared_by||"—"),1)]),_:1}),a(l,{cols:"12",sm:"6"},{default:s(()=>[...e[14]||(e[14]=[d("div",{class:"text-caption"},"Signature",-1),d("div",{class:"font-weight-bold"}," ",-1)])]),_:1})]),_:1}),a(p,{dense:"",class:"mt-2"},{default:s(()=>[a(l,{cols:"12",sm:"6"},{default:s(()=>[e[15]||(e[15]=d("div",{class:"text-caption"},"Driver Name",-1)),d("div",ct,i(r.value.driverName||"—"),1)]),_:1}),a(l,{cols:"12",sm:"6"},{default:s(()=>[...e[16]||(e[16]=[d("div",{class:"text-caption"},"Signature",-1),d("div",{class:"font-weight-bold"}," ",-1)])]),_:1})]),_:1}),a(p,{dense:"",class:"mt-2"},{default:s(()=>[a(l,{cols:"12",sm:"6"},{default:s(()=>[e[17]||(e[17]=d("div",{class:"text-caption"},"Contact Details",-1)),d("div",pt,i(r.value.contact_details||"—"),1)]),_:1}),a(l,{cols:"12",sm:"6"},{default:s(()=>[e[18]||(e[18]=d("div",{class:"text-caption"},"Vehicle Plate No.",-1)),d("div",mt,i(r.value.vehicle_plate_no||"—"),1)]),_:1})]),_:1})]),_:1})]),_:1}),a(z,{headers:$,items:P.value,class:"mb-4",density:"compact","hide-default-footer":"","fixed-header":""},{"item.sn":s(({index:o})=>[n(i(o+1),1)]),"item.asset":s(({item:o})=>[n(i(o.assetName)+" "+i(o.assetCode?`(${o.assetCode})`:""),1)]),"item.description":s(({item:o})=>[n(i(o.description||o.remarks||""),1)]),"item.qty":s(({item:o})=>[n(i(o.qty??""),1)]),"item.remarks":s(({item:o})=>[n(i(o.remarks||""),1)]),_:1},8,["items"])])):(m(),_("p",ft,"No data found."))]))}},Gt=O(vt,[["__scopeId","data-v-560951fe"]]);export{Gt as default};
