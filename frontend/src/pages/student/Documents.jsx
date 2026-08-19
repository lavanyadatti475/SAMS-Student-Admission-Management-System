import { useState, useEffect } from "react";
import api from "../../api/api";

import {
  UploadCloud,
  FileText,
  GraduationCap,
  Trophy,
  Award,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const DOCUMENT_STRUCTURE = {
  Academic: {
    "Personal Documents": [
      "Passport Photo",
      "Aadhaar Card",
      "Signature",
    ],

    "Academic Certificates": [
      "SSC Memo",
      "Intermediate Memo",
      "Transfer Certificate",
      "Migration Certificate",
      "Study Certificate",
      "Bonafide Certificate",
    ],

    "Entrance Documents": [
      "EAMCET Rank Card",
      "JEE Rank Card",
      "Hall Ticket",
    ],
  },

  Scholarship: {
    "Scholarship Certificates": [
      "Income Certificate",
      "Caste Certificate",
      "EWS Certificate",
      "Residence Certificate",
      "Bank Passbook",
      "Aadhaar Linked Bank",
    ],
  },

  Achievement: {
    "Achievements": [
      "Sports Certificate",
      "Hackathon Winner",
      "Coding Contest",
      "Research Paper",
      "Project Expo",
      "Olympiad",
      "Innovation Award",
      "Best Student Award",
    ],
  },

  Participation: {
    "Participation Certificates": [
      "Workshop",
      "Seminar",
      "Conference",
      "Hackathon Participation",
      "Industrial Visit",
      "Internship",
      "Volunteer Activity",
      "Technical Fest",
      "Club Activity",
    ],
  },
};

export default function Documents() {

  const [selectedCategory, setSelectedCategory] =
    useState("Academic");

  const [files, setFiles] =
    useState({});

  const [documents, setDocuments] =
    useState([]);

  const [dashboard, setDashboard] =
    useState({});

  const [status, setStatus] =
    useState("");

  const [loading, setLoading] =
    useState(false);

   const [previewDocument, setPreviewDocument] =
   useState(null);
   const [search, setSearch] =
    useState("");

   const [filterCategory, setFilterCategory] = 
   useState("All");

   const [replaceDocument, setReplaceDocument] =
   useState(null);

   const [replaceFile, setReplaceFile] =
   useState(null);

  useEffect(() => {

  loadDocuments();

  loadDashboard();

}, []);

const loadDocuments = async () => {

  try {

    const res =
      await api.get("/documents/my-list");

    setDocuments(res.data.documents);

  } catch (err) {

    console.log(err);

  }

};

const loadDashboard = async () => {

  try {

    const res =
      await api.get("/documents/dashboard/me");

    setDashboard(res.data.dashboard);

  } catch (err) {

    console.log(err);

  }

};

const handleFileChange = (

  category,

  section,

  document,

  file

) => {

  setFiles((prev) => ({

    ...prev,

    [`${category}-${section}-${document}`]: file,

  }));

};

const handleUpload = async (

category,

subCategory,

documentName

) => {

try{

const key=

`${category}-${subCategory}-${documentName}`;

const file=files[key];

if(!file){

alert("Please choose a file.");

return;

}

const formData=new FormData();

formData.append("category",category);

formData.append("subCategory",subCategory);

formData.append("documentName",documentName);

formData.append("document",file);

setLoading(true);

await api.post(

"/documents/upload",

formData,

{

headers:{

"Content-Type":

"multipart/form-data"

}

}

);

setStatus(

`${documentName} uploaded successfully.`

);

loadDocuments();

loadDashboard();

}
catch(err){

console.log(err);

alert("Upload failed.");

}
finally{

setLoading(false);

}

};

const handlePreview = async (document) => {

setPreviewDocument(document);

};

const handleDelete = async (id) => {

try{

const confirmDelete =
window.confirm(

"Delete this document?"

);

if(!confirmDelete){

return;

}

await api.delete(

`/documents/${id}`

);

loadDocuments();

loadDashboard();

alert(

"Document deleted successfully."

);

}
catch(err){

console.log(err);

alert(

"Unable to delete document."

);

}

};

const handleReplace = async () => {

if(

!replaceDocument ||

!replaceFile

){

return;

}

try{

const formData=new FormData();

formData.append(

"document",

replaceFile

);

await api.put(

`/documents/${replaceDocument.id}/replace`,

formData,

{

headers:{

"Content-Type":

"multipart/form-data"

}

}

);

setReplaceDocument(null);

setReplaceFile(null);

loadDocuments();

loadDashboard();

alert(

"Document replaced successfully."

);

}
catch(err){

console.log(err);

alert(

"Unable to replace document."

);

}

};

const filteredDocuments = documents.filter((doc) => {

  const matchesSearch =

    doc.documentName
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesCategory =

    filterCategory === "All"

      ? true

      : doc.category === filterCategory;

  return matchesSearch && matchesCategory;

});

return (

  <div className="min-h-screen bg-slate-100 p-6">

  <div className="max-w-7xl mx-auto">

    <h1 className="text-4xl font-bold mb-2">

      Student Document Portal

    </h1>

    <p className="text-slate-500 mb-8">

      Upload and manage all your university documents.

    </p>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

      <div className="bg-white rounded-xl shadow p-5">

        <p className="text-slate-500">

          Uploaded

        </p>

        <h2 className="text-3xl font-bold mt-2">

          {dashboard.total || 0}

        </h2>

      </div>

      <div className="bg-yellow-100 rounded-xl shadow p-5">

        <p>

          Pending

        </p>

        <h2 className="text-3xl font-bold">

          {dashboard.pending || 0}

        </h2>

      </div>

      <div className="bg-green-100 rounded-xl shadow p-5">

        <p>

          Approved

        </p>

        <h2 className="text-3xl font-bold">

          {dashboard.approved || 0}

        </h2>

      </div>

      <div className="bg-red-100 rounded-xl shadow p-5">

        <p>

          Rejected

        </p>

        <h2 className="text-3xl font-bold">

          {dashboard.rejected || 0}

        </h2>

      </div>

    </div>

    <div className="mt-10">

      <h2 className="text-2xl font-semibold mb-5">

        Select Document Category

      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        {Object.keys(DOCUMENT_STRUCTURE).map((category) => (

          <button

            key={category}

            onClick={() => setSelectedCategory(category)}

            className={`

              rounded-xl

              p-6

              text-left

              transition

              shadow

              border-2

              ${selectedCategory === category

                ? "bg-blue-600 text-white border-blue-600"

                : "bg-white border-transparent"}

            `}

          >

            {category === "Academic" &&

              <GraduationCap size={34} />}

            {category === "Scholarship" &&

              <Award size={34} />}

            {category === "Achievement" &&

              <Trophy size={34} />}

            {category === "Participation" &&

              <FileText size={34} />}

            <h3 className="mt-4 text-xl font-semibold">

              {category}

            </h3>

          </button>

        ))}

      </div>

    </div>
    {selectedCategory === "Academic" && (

<div className="mt-10 bg-white rounded-2xl shadow-lg p-8">

<h2 className="text-3xl font-bold mb-8">

Academic Documents

</h2>

{

Object.entries(

DOCUMENT_STRUCTURE.Academic

).map(([section, docs])=>(

<div
key={section}
className="mb-10"
>

<h3 className="text-xl font-semibold text-blue-700 mb-5">

{section}

</h3>

<div className="grid md:grid-cols-2 gap-5">

{

docs.map((doc)=>(

<div
key={doc}
className="border rounded-xl p-5 bg-slate-50"
>

<h4 className="font-semibold mb-4">

{doc}

</h4>

<input

type="file"

accept=".pdf,.jpg,.jpeg,.png"

className="w-full"

onChange={(e)=>

handleFileChange(

"Academic",

section,

doc,

e.target.files[0]

)

}

/>

<button

className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"

onClick={()=>handleUpload(

"Academic",

section,

doc

)}

>

Upload

</button>

</div>

))

}

</div>

</div>

))

}

</div>

)}

{selectedCategory === "Scholarship" && (

<div className="mt-10 bg-white rounded-2xl shadow-lg p-8">

<h2 className="text-3xl font-bold mb-8">

Scholarship Documents

</h2>

{

Object.entries(

DOCUMENT_STRUCTURE.Scholarship

).map(([section, docs])=>(

<div
key={section}
className="mb-10"
>

<h3 className="text-xl font-semibold text-green-700 mb-5">

{section}

</h3>

<div className="grid md:grid-cols-2 gap-5">

{

docs.map((doc)=>(

<div
key={doc}
className="border rounded-xl p-5 bg-green-50"
>

<h4 className="font-semibold mb-4">

{doc}

</h4>

<input

type="file"

accept=".pdf,.jpg,.jpeg,.png"

className="w-full"

onChange={(e)=>

handleFileChange(

"Scholarship",

section,

doc,

e.target.files[0]

)

}

/>

<button

className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"

onClick={()=>handleUpload(

"Scholarship",

section,

doc

)}

>

Upload

</button>

</div>

))

}

</div>

</div>

))

}

</div>

)}

{selectedCategory === "Achievement" && (

<div className="mt-10 bg-white rounded-2xl shadow-lg p-8">

<h2 className="text-3xl font-bold mb-8">

Achievement Certificates

</h2>

{

Object.entries(

DOCUMENT_STRUCTURE.Achievement

).map(([section, docs])=>(

<div
key={section}
className="mb-10"
>

<h3 className="text-xl font-semibold text-yellow-700 mb-5">

{section}

</h3>

<div className="grid md:grid-cols-2 gap-5">

{

docs.map((doc)=>(

<div
key={doc}
className="border rounded-xl p-5 bg-yellow-50"
>

<h4 className="font-semibold mb-4">

{doc}

</h4>

<input

type="file"

accept=".pdf,.jpg,.jpeg,.png"

className="w-full"

onChange={(e)=>

handleFileChange(

"Achievement",

section,

doc,

e.target.files[0]

)

}

/>

<button

className="mt-4 bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700"

onClick={()=>handleUpload(

"Achievement",

section,

doc

)}

>

Upload

</button>

</div>

))

}

</div>

</div>

))

}

</div>

)}

{selectedCategory === "Participation" && (

<div className="mt-10 bg-white rounded-2xl shadow-lg p-8">

<h2 className="text-3xl font-bold mb-8">

Participation Certificates

</h2>

{

Object.entries(

DOCUMENT_STRUCTURE.Participation

).map(([section, docs])=>(

<div
key={section}
className="mb-10"
>

<h3 className="text-xl font-semibold text-purple-700 mb-5">

{section}

</h3>

<div className="grid md:grid-cols-2 gap-5">

{

docs.map((doc)=>(

<div
key={doc}
className="border rounded-xl p-5 bg-purple-50"
>

<h4 className="font-semibold mb-4">

{doc}

</h4>

<input

type="file"

accept=".pdf,.jpg,.jpeg,.png"

className="w-full"

onChange={(e)=>

handleFileChange(

"Participation",

section,

doc,

e.target.files[0]

)

}

/>

<button

className="mt-4 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700"

onClick={()=>handleUpload(

"Participation",

section,

doc

)}

>

Upload

</button>

</div>

))

}

</div>

</div>

))

}

</div>

)}

{/* ===========================================
            MY DOCUMENTS
=========================================== */}

<div className="mt-12 bg-white rounded-2xl shadow-lg p-8">

<h2 className="text-3xl font-bold mb-6">

My Uploaded Documents

</h2>
<div className="flex flex-col md:flex-row gap-4 mb-6">

<input

type="text"

placeholder="Search document..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

className="border rounded-lg px-4 py-2 w-full"

/>

<select

value={filterCategory}

onChange={(e)=>

setFilterCategory(e.target.value)

}

className="border rounded-lg px-4 py-2"

>

<option>All</option>

<option>Academic</option>

<option>Scholarship</option>

<option>Achievement</option>

<option>Participation</option>

</select>

</div>

<div className="overflow-x-auto">

<table className="w-full border-collapse">

<thead>

<tr className="bg-slate-100">

<th className="p-3 text-left">

Document

</th>

<th className="p-3 text-left">

Category

</th>

<th className="p-3 text-left">

Uploaded

</th>

<th className="p-3 text-left">

Status

</th>

<th className="p-3 text-center">

Actions

</th>

</tr>

</thead>

<tbody>

{

documents.length===0 ?

(

<tr>

<td

colSpan={5}

className="text-center p-10"

>

No Documents Uploaded

</td>

</tr>

)

:

filteredDocuments.map((doc) => (
<tr
key={doc.id}
className="border-b hover:bg-slate-50"
>

<td className="p-4">

{doc.documentName}

</td>

<td className="p-4">

{doc.category}

</td>

<td className="p-4">

{

new Date(

doc.uploadedAt

).toLocaleDateString()

}

</td>

<td className="p-4">

{

doc.verificationStatus==="Approved"

?

(

<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

Approved

</span>

)

:

doc.verificationStatus==="Rejected"

?

(

<span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">

Rejected

</span>

)

:

(

<span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">

Pending

</span>

)

}

</td>

<td className="p-4">

<div className="flex justify-center gap-3">

<button
onClick={() => handlePreview(doc)}
className="text-blue-600 hover:text-blue-800"
title="Preview"
>
<Eye size={20}/>
</button>

<a
href={doc.publicUrl}
target="_blank"
rel="noreferrer"
download
className="text-green-600 hover:text-green-800"
title="Download"
>
<FileText size={20}/>
</a>

<button
onClick={() => setReplaceDocument(doc)}
className="text-yellow-600 hover:text-yellow-800"
title="Replace"
>
<RefreshCw size={20}/>
</button>

<button
onClick={() => handleDelete(doc.id)}
className="text-red-600 hover:text-red-800"
title="Delete"
>
<Trash2 size={20}/>
</button>

</div>

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>

{

previewDocument && (

<div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

<div className="bg-white rounded-xl p-6 w-[900px]">

<div className="flex justify-between mb-4">

<h2 className="text-2xl font-bold">

Preview

</h2>

<button

onClick={()=>

setPreviewDocument(null)

}

>

✕

</button>

</div>

{

previewDocument.mimeType.includes("pdf")

?

(

<iframe

src={previewDocument.publicUrl}

className="w-full h-[600px]"

/>

)

:

(

<img

src={previewDocument.publicUrl}

className="w-full rounded-lg"

/>

)

}

</div>

</div>

)

}

{

replaceDocument && (

<div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

<div className="bg-white rounded-xl p-8 w-[500px]">

<h2 className="text-2xl font-bold mb-5">

Replace Document

</h2>

<input

type="file"

onChange={(e)=>

setReplaceFile(

e.target.files[0]

)

}

/>

<div className="mt-6 flex gap-4">

<button

className="bg-blue-600 text-white px-6 py-2 rounded-lg"

onClick={handleReplace}

>

Upload

</button>

<button

className="bg-slate-300 px-6 py-2 rounded-lg"

onClick={()=>{

setReplaceDocument(null);

}}

>

Cancel

</button>

</div>

</div>

</div>

)

}


  </div>

</div>


);

}