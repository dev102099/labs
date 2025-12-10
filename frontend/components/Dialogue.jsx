import React from "react";

function Dialogue({ success }) {
  const onError = "bg-red-600/60 border-2 text-red-700 border-red-600";
  const onSuccess = "bg-green-400/50 text-green-500 border border-green-500";
  const classN = success ? onSuccess : onError;
  return (
    <div className={`p-3 message rounded-xl hidden ${classN}`}>
      {success ? "File saved successfully!" : "Server error. Try again!"}
    </div>
  );
}

export default Dialogue;
