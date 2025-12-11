import { useEffect, useRef, useState } from "react";
import "./App.css";
import Dialogue from "../components/Dialogue";
import gsap from "gsap";

function App() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [allDocs, setAllDocs] = useState([]);

  const fileRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const clickFile = () => {
    fileRef.current.click();
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file);
    }
  };
  const onSubmit = async () => {
    if (!fileName) {
      alert("Please select a file first.");
      return;
    }
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
        setError(data.message);
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message);

      console.log(error);
    }
  };

  const getAllDocs = async () => {
    try {
      const res = await fetch("https://labs-2lmy.onrender.com/api/documents");
      const data = await res.json();
      if (data.status === 500) {
      }
      setAllDocs(data.resp);
    } catch (error) {
      console.log(error);
    }
  };

  const downlaodFile = async (id) => {
    try {
      window.open(
        `https://labs-2lmy.onrender.com/api/documents/${id}`,
        "_blank"
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(
        `https://labs-2lmy.onrender.com/api/documents/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setAllDocs(allDocs.filter((doc) => doc.id !== id));
        alert("File deleted");
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  useEffect(() => {
    getAllDocs();
  }, [success]);
  useEffect(() => {
    if (success === true || error != "") {
      gsap.fromTo(
        ".message",
        {
          autoAlpha: 0,
          y: 20,
          display: "none",
        },
        {
          duration: 1,
          display: "flex",
          autoAlpha: 1,
          y: 0,
          ease: "power3.out",
        }
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
  return (
    <>
      <div className="h-screen w-screen bg-[#f3f3f3] gap-5 items-center p-3 flex flex-col">
        <h1 className="font-bold text-4xl self-center mb-10">
          Patient Portal - Document Management
        </h1>
        <div className="bg-[#ffffff] w-[70%] p-3 flex flex-col gap-3 shadow-sm ">
          <h1 className="font-bold text-2xl">Upload New Document</h1>
          <div className="bg-blue-400/30 text-black flex-col  flex border border-black border-dashed gap-2 p-5 justify-center items-center">
            <div className="flex gap-1 justify-center items-center">
              <span>Drag & Drop the file here or </span>{" "}
              <input
                ref={fileRef}
                type="file"
                placeholder="Choose here"
                hidden
                onChange={handleFileChange}
                accept=".pdf"
                className="text-blue-400 text-underline"
              />
              <span
                onClick={clickFile}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Click to browse
              </span>
            </div>

            <span>{fileName.name}</span>
            <img src="/upload.png" alt="logo" height={20} width={20} />
          </div>
          <button
            onClick={onSubmit}
            className="w-full bg-blue-800 hover:text-white p-3 rounded-2xl text-zinc-400"
          >
            Submit
          </button>
        </div>
        <Dialogue success={success} />

        <div className="w-[70%] bg-white p-3 justify-center flex">
          <table className="w-full ">
            <tbody>
              <tr>
                <th className="text-left p-2 w-[50%]">Document Name</th>
                <th className="text-left p-2 w-[20%]">Date Uploaded</th>
                <th className="text-left p-2 w-[10%]">Size</th>
                <th className="text-left p-2 w-[10%]"> Action</th>
              </tr>
              {allDocs.map((data, index) => (
                <tr className="hover:bg-amber-200">
                  <td className="border-t border-dashed border-gray-400 turncate p-1">
                    {data.filename}
                  </td>
                  <td className="border-t border-dashed border-gray-400 p-1">
                    {data.created_at}
                  </td>
                  <td className="border-t border-dashed border-gray-400 p-1">
                    {data.filesize}
                  </td>
                  <td className="border-t border-dashed border-gray-400 p-1">
                    <button
                      onClick={() => downlaodFile(data.id)}
                      className="p-2 bg-green-600 rounded-xl"
                    >
                      <img
                        src="/download1.png"
                        alt="logo"
                        height={20}
                        width={20}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(data.id)}
                      className="p-2 bg-red-700 rounded-xl ml-2"
                    >
                      <img
                        src="/delete.png"
                        alt="logo"
                        height={20}
                        width={20}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {console.log(allDocs)}
      </div>
    </>
  );
}

export default App;
