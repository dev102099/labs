Patient Portal - Design Document

1. Tech Stack Choices
   Q1. Frontend Framework: React
   Choice: React (with Vite and Tailwind CSS).

Reasoning: React provides a component-based architecture that makes managing the UI state (e.g., file list updates after upload/delete) efficient and predictable. Tailwind CSS was used to rapidly build a clean, responsive interface without writing custom CSS files. Vite offers superior development performance compared to CRA.

Q2. Backend Framework: Express.js (Node.js)
Choice: Express.js.

Reasoning: Express is lightweight, unopinionated, and has excellent middleware support. Specifically, the Multer middleware is the industry standard for handling multipart/form-data (file uploads) in Node.js, making it the ideal choice for this specific problem statement.

Q3. Database: PostgreSQL (via Supabase)
Choice: PostgreSQL (accessed via postgres.js client).

Reasoning: The assignment required a relational database (SQLite or PostgreSQL). I chose PostgreSQL because it is a robust, production-grade database that handles concurrent connections better than SQLite. Using Supabase provides a managed instance that is easy to connect to, while postgres.js offers a high-performance, schema-less client for writing raw SQL queries.

Q4. Scaling for 1,000 Users
If scaling to 1,000 concurrent users, the current local file storage strategy becomes the bottleneck.

Storage Migration: Move from local uploads/ folder to Object Storage (e.g., AWS S3 or Google Cloud Storage). This decouples storage from the application server, allowing the backend to scale horizontally across multiple instances.

Database: 1,000 users is easily handled by PostgreSQL, but we would implement connection pooling (already available in Supabase Transaction Mode) to manage open connections efficiently.

CDN: Serve the downloaded files via a Content Delivery Network (CloudFront) to reduce load on the main server.

2. Architecture Overview
   The application follows a Client-Server architecture with the "File-First, Database-Second" consistency model.

High-Level Flow:

Frontend: Handles user interaction and sends multipart/form-data requests.

Backend (Middleware): Intercepts requests to save the raw file to the Local Disk immediately.

Backend (Controller): If storage is successful, it saves the file metadata (path, name, size) to the Database.

Database: Stores only the reference pointers, keeping queries fast.

3. API Specification
1. Upload Document
   URL: /api/documents/upload

Method: POST

Description: Uploads a PDF file to local storage and saves metadata to DB.

Request Body: FormData key file (Binary PDF).

Response:

JSON

{
"message": "File uploaded successfully",
"document": {
"id": 1,
"filename": "report.pdf",
"filepath": "uploads/17024-report.pdf",
"filesize": 10240,
"created_at": "2024-05-20T10:00:00Z"
}
} 2. List Documents
URL: /api/documents

Method: GET

Description: Retrieves a list of all uploaded file metadata.

Response:

JSON

[
{
"id": 1,
"filename": "report.pdf",
"filesize": 10240,
"created_at": "2024-05-20T10:00:00Z"
},
...
] 3. Download Document
URL: /api/documents/:id

Method: GET

Description: Streams the actual file from disk to the client. Sets Content-Disposition to force download.

Response: Binary Stream (application/pdf).

4. Delete Document
   URL: /api/documents/:id

Method: DELETE

Description: Removes the file from disk and the record from the database.

Response:

JSON

{ "message": "Document deleted successfully" } 4. Data Flow Description
Q5. Step-by-Step Processes
A. Upload Flow:

User selects a PDF and clicks "Upload".

Browser wraps file in FormData and sends a POST request.

Middleware Layer (Multer): Intercepts the stream.

Generates a unique filename (Timestamp + Original Name).

Writes the binary data to the uploads/ folder on the server disk.

Controller Layer:

Receives the file path from Multer.

Executes an INSERT SQL query to save filename, filepath, and size to PostgreSQL.

Failure Handling: If the DB insert fails, the controller executes a "Rollback" and deletes the uploaded file to prevent orphaned files.

B. Download Flow:

User clicks "Download" on a file with ID 5.

Server receives GET /documents/5.

Database Lookup: Server queries DB for ID 5 to get the filepath (e.g., uploads/123-test.pdf).

File System Check: Server verifies the file actually exists at that path.

Stream: Server uses res.download() to stream the file bytes back to the browser with headers set to trigger a "Save As" dialog.

5. Assumptions
   Q6. Assumptions Made
   Single User Environment: As per requirements, no authentication/login system is implemented. All users see all files .

File Type Restriction: Only PDF files are allowed. The backend strictly filters application/pdf MIME types.

Local Storage: Files are stored on the same machine running the server. This assumes the server has write permissions to the filesystem.

Self-Healing Delete: I assumed that if a file is manually deleted from the disk but remains in the DB ("Ghost Record"), the application should allow the user to "delete" it again to clean up the database record without throwing a system error.

File Size: A soft limit of 5MB is assumed for uploads to prevent denial of service (DoS) attacks on the storage.
