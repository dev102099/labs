import { useEffect, useRef, useState } from "react";
import "./App.css";
import Dialogue from "../components/Dialogue";
import gsap from "gsap";

function App() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [allDocs, setAllDocs] = useState([]);

  const fileRef = useRef(null);
  const [fileName, setFileName] = useState(null);

  const clickFile = () => fileRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setFileName(file);
  };

  const onSubmit = async () => {
    if (!fileName) {
      alert("Please select a file first.");
      return;
    }

    setError("");
    setSuccess(false);

    const form = new FormData();
    form.append("file", fileName);

    try {
      const res = await fetch(
        "https://labs-2lmy.onrender.com/api/documents/upload",
        {
          method: "POST",
          body: form,
        }
      );

      const data = await res.json();

      if (!data.document) {
        setError(data.message || "Upload failed");
        return;
      }

      setSuccess(true);
      setFileName(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const getAllDocs = async () => {
    try {
      const res = await fetch("https://labs-2lmy.onrender.com/api/documents");
      const data = await res.json();
      setAllDocs(data.resp || []);
    } catch (err) {
      console.error(err);
    }
  };

  const downlaodFile = (id) => {
    window.open(`https://labs-2lmy.onrender.com/api/documents/${id}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(
        `https://labs-2lmy.onrender.com/api/documents/${id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setAllDocs((prev) => prev.filter((doc) => doc.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAllDocs();
  }, [success]);

  useEffect(() => {
    if (success === true || error != "") {
      gsap.fromTo(
        ".message",
        { autoAlpha: 0, y: 20, display: "none" },
        { duration: 1, display: "flex", autoAlpha: 1, y: 0, ease: "power3.out" }
      );
      gsap.to(".message", {
        duration: 0.8,
        autoAlpha: 0,
        y: -20,
        display: "none",
        ease: "power3.in",
        delay: 5,
      });
    }
  }, [success, error]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 p-3 flex flex-col items-center gap-6">
      <h1 className="font-bold text-2xl md:text-4xl text-center">
        Patient Portal – Document Management
      </h1>

      {/* Upload Section */}
      <div className="bg-white w-full md:w-[70%] p-4 rounded-xl shadow">
        <h2 className="font-bold text-xl mb-3">Upload New Document</h2>

        <div className="border-2 border-dashed border-gray-500 bg-blue-300/80 rounded-lg p-4 text-center flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".pdf"
            onChange={handleFileChange}
          />

          <p className="">
            Drag & drop file or{" "}
            <span
              onClick={clickFile}
              className="text-blue-600 cursor-pointer underline"
            >
              browse
            </span>
          </p>

          {fileName && <p className="text-sm break-all">{fileName.name}</p>}

          <img src="/upload.png" alt="upload" className="mx-auto w-6" />
        </div>

        <button
          onClick={onSubmit}
          className="mt-4 w-full bg-blue-700 text-gray-400 cursor-pointer hover:text-white p-3 rounded-xl"
        >
          Submit
        </button>
      </div>

      <Dialogue success={success} />

      {/* Desktop Table */}
      <div className="hidden md:block w-full md:w-[70%] bg-white rounded-xl shadow p-3">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Document Name</th>
              <th className="p-2">Date</th>
              <th className="p-2">Size</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {allDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-100">
                <td className="p-2 break-all">{doc.filename}</td>
                <td className="p-2">{doc.created_at}</td>
                <td className="p-2">{formatFileSize(doc.filesize)}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => downlaodFile(doc.id)}
                    className="bg-green-600 p-2 rounded"
                  >
                    <img src="/download1.png" width={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="bg-red-700 p-2 rounded"
                  >
                    <img src="/delete.png" width={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden w-full flex flex-col gap-3">
        {allDocs.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl p-4 shadow">
            <p className="font-semibold break-all">{doc.filename}</p>
            <p className="text-sm text-gray-600 mt-1">
              Uploaded: {doc.created_at}
            </p>
            <p className="text-sm mt-1">Size: {formatFileSize(doc.filesize)}</p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => downlaodFile(doc.id)}
                className="flex-1 bg-green-600 p-2 rounded-xl flex justify-center"
              >
                <img src="/download1.png" width={20} />
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="flex-1 bg-red-700 p-2 rounded-xl flex justify-center"
              >
                <img src="/delete.png" width={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
