const sql = require("../db");
const path = require("path");
const fs = require("fs");

const docUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, path, size } = req.file;

    const result = await sql`
      INSERT INTO documents (filename, filepath, filesize)
      VALUES (${originalname}, ${path}, ${size})
      RETURNING *
    `;

    return res.status(201).json({
      message: "File uploaded successfully",
      document: result[0],
    });
  } catch (error) {
    console.error("Database Error:", error);
    if (req.file && req.file.path) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        console.log(`Rollback: Deleted orphaned file at ${req.file.path}`);
      }
    }
    return res.status(500).json({ message: "Server Error" });
  }
};

const getAll = async (req, res) => {
  try {
    const resp = await sql`
    Select * FROM documents
    `;
    if (!resp) {
      return res.status(404).json({ message: "Nothing found" });
    }
    return res.status(200).json({ resp });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      SELECT filename, filepath FROM documents WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }
    const doc = result[0];
    const absolutePath = path.join(process.cwd(), doc.filepath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File missing from storage" });
    }
    res.download(absolutePath, doc.filename, (err) => {
      if (err) {
        console.error("Download failed:", err);
      }
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      SELECT filepath FROM documents WHERE id = ${id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = result[0].filepath;
    const absolutePath = path.join(process.cwd(), filePath);

    try {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        console.log(`Physical file deleted: ${absolutePath}`);
      } else {
        console.warn(
          `File was missing from disk, cleaning up DB: ${absolutePath}`
        );
      }
    } catch (fsError) {
      console.error("Critical FS Error:", fsError);
      return res.status(500).json({
        message: "Could not delete file from storage. Database not modified.",
      });
    }

    await sql`
      DELETE FROM documents WHERE id = ${id}
    `;

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
module.exports = { docUpload, getAll, downloadFile, deleteFile };
