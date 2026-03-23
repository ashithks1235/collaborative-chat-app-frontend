import{r as a,j as e}from"./react-vendor-CaKvqIf1.js";import{a as h,u as m,d as p}from"./note.api-CGE_lyTN.js";import{z as u}from"./index-BAsYsNRD.js";import{L as b,I as f,K as v}from"./icons-vendor-CtxtN0q8.js";import{b as w,a as N}from"./router-vendor-CbcZ9v3Y.js";import"./socket-vendor-CG1tBJBN.js";import"./motion-vendor-GJMNNaud.js";import"./calendar-vendor-fpNEwGek.js";function B(){const{id:s}=w(),r=N(),[n,l]=a.useState(null),[i,o]=a.useState(!1),[d,c]=a.useState("");a.useEffect(()=>{h(s).then(t=>{l(t),c(t.content)})},[s]);const g=async()=>{const t=await m(s,{content:d});l(t),o(!1),u.success("Note updated")},x=async()=>{await p(s),u.success("Note deleted"),r("/")};return n?e.jsxs("div",{className:"max-w-4xl mx-auto p-6 relative",children:[e.jsxs("div",{className:"bg-white dark:bg-gray-800 shadow rounded-xl p-6 transition-colors space-y-6",children:[e.jsx("button",{onClick:()=>r(-1),className:"text-sm text-gray-500 dark:text-gray-400 hover:underline",children:"← Back"}),i?e.jsx("textarea",{value:d,onChange:t=>c(t.target.value),className:`w-full h-[500px] p-4 rounded-lg
                     bg-white dark:bg-gray-900 
                     text-gray-800 dark:text-gray-100 
                     focus:outline-none focus:ring-2 focus:ring-blue-500`}):e.jsx("div",{className:`min-h-[400px] p-4 rounded-lg bg-white dark:bg-gray-900 
                        text-gray-800 dark:text-gray-100 whitespace-pre-line`,children:n.content})]}),i?e.jsxs("div",{className:"absolute bottom-7 right-7 flex gap-4",children:[e.jsx("button",{onClick:g,className:`bg-blue-500 hover:bg-blue-600 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110`,children:e.jsx(v,{size:20})}),e.jsx("button",{onClick:()=>o(!1),className:`bg-gray-400 hover:bg-gray-500 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110`,children:"✕"})]}):e.jsxs("div",{className:"absolute bottom-7 right-7 flex gap-4",children:[e.jsx("button",{onClick:()=>o(!0),className:`bg-yellow-500 hover:bg-yellow-600 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110`,children:e.jsx(b,{size:20})}),e.jsx("button",{onClick:x,className:`bg-red-500 hover:bg-red-600 
                    text-white p-4 rounded-full shadow-lg 
                    transition transform hover:scale-110`,children:e.jsx(f,{size:20})})]})]}):null}export{B as default};
