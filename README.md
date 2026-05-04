# 📚 Student Research Paper Search Engine

A full‑text search engine for academic research papers, implementing core Information Retrieval (IR) concepts – TF‑IDF weighting, inverted index, cosine similarity, boolean queries, and relevance feedback. Built with Node.js (Express) backend and React (Vite + Tailwind) frontend.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.x-38bdf8)](https://tailwindcss.com/)

---

## ✨ Features

### 📄 Document Management (Admin)
- Upload research papers (`.txt` or `.pdf`)
- Edit metadata (title, author) and replace files
- Delete documents – automatically removes from index
- View all documents in a sortable, searchable table

### 🔍 Search Capabilities
- **Standard keyword search** – ranked by cosine similarity
- **Boolean search** – supports `AND`, `OR`, `NOT`, and parentheses
- **Query suggestions** – autocomplete from indexed terms
- **Relevance feedback** – Rocchio algorithm to refine results
- **Pagination** – navigate through large result sets

### ⚙️ Backend (IR Core)
- Text preprocessing: tokenization, lowercasing, stopword removal, rule‑based stemming
- Inverted index with document frequency (df) and TF‑IDF weights
- Vector Space Model – cosine similarity ranking
- Automatic index update on document CRUD operations
- PDF text extraction (`pdf-parse`)
- JWT authentication for admin routes

### 🎨 Frontend (React + Tailwind)
- Professional, responsive UI with orange theme
- Search bar with debounced suggestions
- Result cards: title, author, relevance %, snippet, file type badge
- Modal for text documents, native browser PDF viewer
- Admin dashboard: stats cards, index rebuild, document library
- Drag‑and‑drop file upload

---

## 🛠️ Tech Stack

| Layer       | Technology                                 |
|-------------|--------------------------------------------|
| Backend     | Node.js, Express, JSON file storage        |
| Auth        | JWT, bcryptjs                              |
| File upload | Multer, pdf-parse                          |
| Frontend    | React 18, Vite, React Router, Axios        |
| Styling     | Tailwind CSS v4, Heroicons                 |
| Dev tools   | Nodemon, Postman                           |

---

## 📦 Installation

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn

### Clone the repository
```bash
git clone https://github.com/your-username/student-research-search.git
cd student-research-search
Backend setup
bash
cd backend
npm install
Create a .env file in the backend folder:

env
PORT=5000
JWT_SECRET=your_super_secret_key_change_this
Frontend setup
bash
cd ../frontend
npm install
🚀 Running the application
Start backend (from /backend)
bash
npm run dev
Server runs at http://localhost:5000

Start frontend (from /frontend)
bash
npm run dev
App runs at http://localhost:5173

The frontend proxies API requests to the backend automatically (see vite.config.js).

First‑time admin registration
Open the app in your browser

Go to /admin/login

Register the first admin account (endpoint POST /api/v1/auth/register – you can use Postman or the login page will guide you)

json
{ "username": "admin", "password": "admin123" }
Then log in with those credentials.

For production, disable the register endpoint after seeding your admin.

📖 How to use
Public user
Visit the home page (/)

Type a query (e.g., information retrieval)

Click a result to read the full paper (modal for text, new tab for PDF)

Toggle Boolean Search for precise queries: (machine AND learning) NOT deep

Use Improve results to apply relevance feedback

Admin
Log in at /admin/login

Documents – view, edit, delete papers

Upload Document – drag & drop .txt or .pdf files

Index Statistics – monitor index health and rebuild manually

📡 API Endpoints (selected)
Method	Endpoint	Description	Auth
POST	/api/v1/auth/login	Admin login	No
POST	/api/v1/auth/register	Create first admin	No
GET	/api/v1/auth/verify	Verify token	Yes
POST	/api/v1/documents	Upload a document	Yes
GET	/api/v1/documents	List all documents	Yes
GET	/api/v1/documents/:id	Get document metadata+text	Yes
PUT	/api/v1/documents/:id	Update document	Yes
DELETE	/api/v1/documents/:id	Delete document	Yes
GET	/api/v1/documents/file/:id	Serve original file (public)	No
POST	/api/v1/search	Keyword search (paginated)	No
POST	/api/v1/search/boolean	Boolean search	No
GET	/api/v1/search/suggest	Autocomplete suggestions	No
POST	/api/v1/search/feedback	Relevance feedback	No
GET	/api/v1/index/stats	Index statistics	Yes
POST	/api/v1/index/rebuild	Force index rebuild	Yes
Complete API documentation is available in the project proposal (Appendix).

🧪 Testing with Postman
Import the provided Postman collection (StudentResearchSearch.postman_collection.json) – includes all endpoints with environment variables.

Basic flow:

POST /auth/register (once)

POST /auth/login → copy token

Use token in Authorization: Bearer <token> for protected routes

Upload documents, search, test boolean queries

📂 Project Structure
text
student-research-search/
├── backend/
│   ├── data/                  # JSON storage (documents, users)
│   ├── uploads/documents/     # permanently stored files
│   ├── src/
│   │   ├── controllers/       # auth, document, search
│   │   ├── models/            # document, user models
│   │   ├── services/          # preprocessing, indexing, pdf
│   │   ├── middleware/        # auth, logger, error handler
│   │   ├── routes/            # API route definitions
│   │   ├── utils/             # stopwords, stemmer, hash
│   │   └── app.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/        # SearchBar, Results, DocumentViewer, etc.
│   │   ├── pages/             # SearchPage, AdminLogin, AdminDashboard
│   │   ├── context/           # AuthContext
│   │   ├── services/          # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── index.html
└── README.md
🧠 How it works (IR in a nutshell)
Preprocessing – tokenisation, lowercasing, stopword removal, stemming.

Indexing – builds an inverted map: term → list of documents with TF‑IDF weights.

Query – same preprocessing → query vector.

Ranking – cosine similarity between query and each document vector.

Result – sorted by relevance, paginated, displayed with snippets.

Additional features (boolean search, relevance feedback) are layered on top of this core VSM.

🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

📄 License
MIT © 2026 – Student Research Search Engine

🙏 Acknowledgements
Introduction to Information Retrieval – C. Manning, P. Raghavan, H. Schütze

Porter stemming algorithm inspiration

PDF text extraction via pdf-parse

Icons by Heroicons
