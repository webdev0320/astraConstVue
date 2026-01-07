import{r as v,G as F,c as b,d as p,f as c,l as H,b as n,e,m as Q,ak as A,i as z,j as U,o as u,t as o,by as L,v as i}from"./index-Cx1sMUiL.js";import{a as R}from"./index-NIGUFBhG.js";import{V as $,b as _}from"./VCard-BjOHkO90.js";import{V as x}from"./VDataTable-CTW8pleM.js";import{V as M}from"./VRow-BatXCbsJ.js";import{V as g}from"./VCol-BHOJiuDm.js";import"./createSimpleFunctional-CwK9BYph.js";import"./VAvatar-CyfJGP9R.js";import"./index-FhaAhzeH.js";import"./VCardText-CoNtnIDa.js";import"./VSelect-GF0633DE.js";import"./VTextField-DNqNV4rp.js";import"./VField-BA0s84pH.js";import"./VInput-BWwy_a6_.js";import"./forwardRefs-D3j0TLhE.js";import"./VList-DmhvTnKp.js";import"./ssrBoot-CRt6cYSD.js";import"./VDivider-MNrZiEF6.js";import"./dialog-transition-C9Aw_7hh.js";import"./VMenu-C9mjvfUd.js";import"./VOverlay-BJEtBIPj.js";import"./scopeId--RhANQfF.js";import"./VSelectionControl-DODAKy7w.js";import"./VChip-BizzS1k9.js";import"./VTable-CuaU6eq1.js";/* empty css              */const G={class:"d-flex justify-between align-center mb-4"},Y={key:3},W={key:5},J={key:7},D="/src/assets/images/logos/astra-logo.png",wt={__name:"details",setup(K){const h="https://astracontsbackend.taxaccolega.co.uk/astraConst/public/api",N=z(),S=U(),k=v(!0),d=v(null),f=v([]),q=v(""),T=s=>{const a=`; ${document.cookie}`.split(`; ${s}=`);if(a.length===2)return a.pop().split(";").shift()},w=()=>{const s=T("accessToken");if(!s)throw new Error("Access token is missing.");return{Authorization:`Bearer ${decodeURIComponent(s)}`,Accept:"application/json"}},B=async()=>{try{const s=N.params.id,t=await R.get(`${h}/rental-required/${s}`,{headers:w()});d.value=t.data.data}catch(s){console.error(s),alert("Error fetching details")}finally{k.value=!1}},P=async()=>{var s,t,a;q.value="";try{const r=((s=(await R.get(`${h}/getApprovals/RentalEquipment/${d.value.id}`,{headers:w()})).data)==null?void 0:s.data)??[];f.value=r.map(y=>{var C,E;return{id:y.id,status:y.status,name:((C=y.user)==null?void 0:C.name)??"—",user_code:((E=y.user)==null?void 0:E.user_code)??"—"}})}catch(l){console.error("Fetch approvals failed",l),q.value=((a=(t=l==null?void 0:l.response)==null?void 0:t.data)==null?void 0:a.message)||(l==null?void 0:l.message)||"Failed to load approvals."}},V=[{title:"#",key:"id"},{title:"Name",key:"name"},{title:"User Code",key:"user_code"},{title:"Status",key:"status"}],I=[{title:"Category",key:"asset_category_name"},{title:"Sub Category",key:"asset_sub_category_name"},{title:"Asset",key:"asset_name"},{title:"Qty at Site",key:"quantity"},{title:"Activity",key:"activity"},{title:"Start Date",key:"start_date"},{title:"End Date",key:"end_date"}],j=[{title:"Category",key:"asset_category_name"},{title:"Sub Category",key:"asset_sub_category_name"},{title:"Asset",key:"asset_name"},{title:"Quantity",key:"quantity_at_site"},{title:"Activity",key:"activity"},{title:"Start Date",key:"start_date"},{title:"End Date",key:"end_date"},{title:"Requested # Days",key:"requested_no_days"},{title:"SPO #",key:"spo_number"}],m=s=>s==null||s===""?"-":s,O=()=>{const s=d.value,t=window.open("","","width=1000,height=700");t.document.write(`
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
              <img src="`+D+`" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>

        <!-- Employee Info -->
         <table class="grid-table">
            <thead>
            <tr>
              <td colspan="6" style="text-align:center"><h3>Equipment Rental Request Form</h3></td>
            </tr>              
            <tr>
              <td>Project Name</td>
              <td colspan="4" style="text-align:center"><strong>Project Name</td>
              <td>Name</td>
            </tr>

            <tr>
              <td colspan="6" style="text-align:center"><h4>To Be Filled By Requesting Department</h4></td>
            </tr>

            <tr>
              <td colspan="6" style="text-align:center"><h3>LIST OF EQUIPMENT REQUIRED</h3></td>
            </tr>


             <tr>
              <td>Equipment Type</td>
              <td>Activity</td>
              <td>QTY</td>
              <td>Date of Need</td>
              <td>End Date</td>
              <td></td>
            </tr>
            </thead>
             <tbody>
            ${s.asset_requests.map((a,l)=>`
                <tr>
                  <td>${a.asset_name}</td>
                  <td>${a.activity}</td>
                  <td>${a.quantity}</td>
                  <td>${a.start_date??"-"}</td>
                  <td>${a.end_date}</td>
                <td></td>
                </tr>
              `).join("")}
          </tbody>

              </table>
            <table class="grid-table">
            <thead>
            <tr>
              <td colspan="6" style="text-align:center"><h3>LIST OF EQUIPMENT ALREADY WORKING ON THE PROJECT</h4></td>
            </tr>

             <tr>
              <td>Equipment Type</td>
              <td>Activity</td>
              <td>QTY at Site</td>
              <td>Start Date as per SPO</td>
              <td>End Date as Per SPO</td>
              <td>SPO Number</td>
            </tr>  
            </thead> 
            <tbody>
            ${s.rental_equipments.map((a,l)=>`
                <tr>
                  <td>${a.asset_name}</td>
                  <td>${a.activity}</td>
                  <td>${a.quantity_at_site}</td>
                  <td>${a.start_date??"-"}</td>
                  <td>${a.end_date??"-"}</td>
                  <td>${a.spo_number??"-"}</td>

                </tr>
              `).join("")}
          </tbody>           

          </table>

        <!-- Signatures -->
        <table class="sign-row">
          <tr>
            <td class="sign-col">Prepared By</td>
            <td class="sign-col"></td>
            <td class="sign-col">Approved By</td>
            <td class="sign-col"></td>
          </tr>
        </table>

        <table class="sign-row">
          <tr>
            <td class="sign-col">Checked By <br> (Cost Controller)</td>
            <td class="sign-col"></td>
            <td class="sign-col">Approved By <br> (General Manager)</td>
            <td class="sign-col"></td>
          </tr>
        </table> 

         <div class="header">
            <div class="left-text">
              Arab Supply & Trading Co.<br>
              Construction Branch
            </div>

            <div class="logo">
              <img src="`+D+`" />
            </div>

            <div class="right-text">
              الشركة العربية للتوريد والتجارة<br>
              فرع الإنشاءات
            </div>
          </div>             

      </body>
    </html>
  `),t.document.close(),t.print()};return F(async()=>{await B(),await P()}),(s,t)=>{var a,l;return u(),b("div",null,[p("div",G,[n(A,{variant:"text",onClick:t[0]||(t[0]=r=>Q(S).back())},{default:e(()=>[...t[1]||(t[1]=[o("← Back",-1)])]),_:1}),t[2]||(t[2]=p("h3",null,"Rental Required Details",-1))]),k.value?(u(),c($,{key:0,class:"pa-6"},{default:e(()=>[n(L,{indeterminate:""})]),_:1})):d.value?(u(),c($,{key:1,class:"pa-4"},{default:e(()=>[n(A,{variant:"tonal",color:"primary",onClick:O},{default:e(()=>[...t[3]||(t[3]=[o("Print",-1)])]),_:1}),t[9]||(t[9]=p("h4",{class:"mb-3"},"Request Information",-1)),n(M,null,{default:e(()=>[n(g,{cols:"12",md:"4"},{default:e(()=>[t[4]||(t[4]=p("strong",null,"ID:",-1)),o(" "+i(d.value.id),1)]),_:1}),n(g,{cols:"12",md:"4"},{default:e(()=>[t[5]||(t[5]=p("strong",null,"Rental Req ID:",-1)),o(" "+i(d.value.rental_equipment_id),1)]),_:1}),n(g,{cols:"12",md:"4"},{default:e(()=>[t[6]||(t[6]=p("strong",null,"Project:",-1)),o(" "+i(d.value.project_name),1)]),_:1}),n(g,{cols:"12",md:"4"},{default:e(()=>[t[7]||(t[7]=p("strong",null,"Date:",-1)),o(" "+i(d.value.date),1)]),_:1}),n(g,{cols:"12",md:"4"},{default:e(()=>[t[8]||(t[8]=p("strong",null,"Created At:",-1)),o(" "+i(d.value.created_at),1)]),_:1})]),_:1})]),_:1})):H("",!0),n(_,{class:"no-padd"},{default:e(()=>[...t[10]||(t[10]=[o("Assets Requests",-1)])]),_:1}),d.value&&((a=d.value.asset_requests)!=null&&a.length)?(u(),c(x,{key:2,headers:I,items:d.value.asset_requests,"item-value":"id",density:"comfortable","fixed-header":"","items-per-page":5},{"item.start_date":e(({item:r})=>[o(i(m(r.start_date)),1)]),"item.end_date":e(({item:r})=>[o(i(m(r.end_date)),1)]),"no-data":e(()=>[...t[11]||(t[11]=[p("div",{class:"text-center py-4"},"No asset requests found.",-1)])]),_:1},8,["items"])):(u(),b("p",Y,"No asset requests")),n(_,{class:"no-padd"},{default:e(()=>[...t[12]||(t[12]=[o("Rental Equipments",-1)])]),_:1}),d.value&&((l=d.value.rental_equipments)!=null&&l.length)?(u(),c(x,{key:4,headers:j,items:d.value.rental_equipments,"item-value":"id",density:"comfortable","fixed-header":"","items-per-page":5},{"item.start_date":e(({item:r})=>[o(i(m(r.start_date)),1)]),"item.end_date":e(({item:r})=>[o(i(m(r.end_date)),1)]),"item.spo_number":e(({item:r})=>[o(i(m(r.spo_number)),1)]),"no-data":e(()=>[...t[13]||(t[13]=[p("div",{class:"text-center py-4"},"No rental equipments found.",-1)])]),_:1},8,["items"])):(u(),b("p",W,"No rental equipments")),n(_,{class:"no-padd"},{default:e(()=>[...t[14]||(t[14]=[o("Approvals",-1)])]),_:1}),f.value.length?(u(),c(x,{key:6,headers:V,items:f.value,"item-value":"id",density:"comfortable","fixed-header":"","items-per-page":5},{"item.id":e(({item:r})=>[o(i(r.id),1)]),"item.name":e(({item:r})=>[o(i(r.name),1)]),"item.user_code":e(({item:r})=>[o(i(r.user_code),1)]),"item.status":e(({item:r})=>[o(i(r.status),1)]),_:1},8,["items"])):(u(),b("p",J,"No approvals found."))])}}};export{wt as default};
