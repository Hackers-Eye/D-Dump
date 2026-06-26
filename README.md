# D-Dump — Smart OSINT Lookup Tool

> Cybersecurity-focused OSINT tool for phone number intelligence, built with Flask to search structured datasets for linked identities such as name, city, and email.

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-Web%20App-black?style=flat-square&logo=flask)
![Platform](https://img.shields.io/badge/Platform-Termux%20%7C%20Linux-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## What is D-Dump?

**D-Dump** is a lightweight, self-hosted OSINT (Open Source Intelligence) web application that lets you search your own structured datasets (JSON, CSV, XLSX) to find linked identities — name, phone, email, city, and more — through a clean browser-based interface.

It is designed to run locally on **Termux (Android)**, Linux, or any Python-capable system, with no external API dependencies.

---

## Features

- **Multi-format data search** — JSON, CSV, and XLSX datasets all supported
- **User authentication** — Login system with hashed passwords (Werkzeug)
- **Search rate limiting** — Free users get a configurable search quota
- **Admin panel** — View users, logs, and manually increase search limits
- **PDF export** — Download search results as a formatted PDF report
- **Search logging** — Every query is timestamped and stored
- **Upgrade system** — Users can request limit increases via the web UI
- **Termux-compatible** — Runs on Android without root

---

## Screenshots

> _Add screenshots of your login, home, and admin pages here._

---

## Installation

### Requirements

- Python 3.8+
- pip

### 1. Clone the repository

```bash
git clone https://github.com/Hackers-Eye/D-Dump.git
cd D-Dump
```

### 2. Install dependencies

```bash
pip install flask reportlab werkzeug openpyxl
```

> On Termux, use:
> ```bash
> pip install flask reportlab werkzeug openpyxl --break-system-packages
> ```

### 3. Run the app

```bash
python app.py
```

Open your browser and go to: `http://0.0.0.0:8000`

---

## Configuration

All settings can be controlled via environment variables:

| Variable           | Default     | Description                        |
|--------------------|-------------|------------------------------------|
| `OSINT_SECRET`     | `change_this_secret` | Flask session secret key   |
| `OSINT_ADMIN_USER` | `admin`     | Admin panel username               |
| `OSINT_ADMIN_PASS` | `admin123`  | Admin panel password               |
| `OSINT_FREE_LIMIT` | `2`         | Free search quota per user         |
| `OSINT_IP`         | `0.0.0.0`   | Host IP to bind                    |
| `OSINT_PORT`       | `8000`      | Port to run on                     |

Example:

```bash
export OSINT_ADMIN_USER="myadmin"
export OSINT_ADMIN_PASS="securepass"
export OSINT_FREE_LIMIT=10
python app.py
```

---

## Adding Your Data

D-Dump reads data from two locations:

### `data.json` (primary file)

Place a JSON file in the root directory named `data.json`. It should be a list of objects:

```json
[
  {"name": "John Doe", "phone": "9876543210", "email": "john@example.com", "city": "Delhi"},
  {"name": "Alice Kumar", "phone": "9998887777", "email": "alice@domain.com", "city": "Mumbai"}
]
```

### `data/` folder (multiple files)

Drop any number of files into the `data/` directory. Supported formats:

| Format | Notes                                      |
|--------|--------------------------------------------|
| `.json` | List of objects or `{"data": [...]}` shape |
| `.csv`  | Must have a header row                     |
| `.xlsx` | First row treated as header                |

D-Dump automatically reads and searches all files in this folder on every query.

---

## How Search Works

Search matches against these fields (case-insensitive):

`name`, `email`, `phone`, `mobile`, `address`, `city`, `fname`, `circle`, `id`, `alt`

If the query matches any of these fields — or any value in the record as a fallback — the result is included. Duplicate records are automatically de-duplicated.

---

## Routes

| Route              | Method     | Description                          |
|--------------------|------------|--------------------------------------|
| `/`                | GET        | Login page                           |
| `/login`           | POST       | Authenticate / register user         |
| `/home`            | GET, POST  | Search interface                     |
| `/download_pdf`    | GET        | Download results as PDF (`?q=query`) |
| `/upgrade`         | GET        | View upgrade options                 |
| `/request_upgrade` | POST       | Submit upgrade request               |
| `/admin`           | GET, POST  | Admin panel (login + dashboard)      |
| `/admin/login`     | POST       | Admin authentication                 |
| `/admin/logout`    | GET        | Admin logout                         |
| `/logout`          | GET        | User logout                          |

---

## Admin Panel

Access at: `http://0.0.0.0:8000/admin`

Default credentials:
```
Username: admin
Password: admin123
```

> **Change these before deploying!** Use the `OSINT_ADMIN_USER` and `OSINT_ADMIN_PASS` environment variables.

From the admin panel you can:
- View all registered users and their search counts / limits
- View the last 200 search logs with timestamps
- Manually add search quota to any user

---

## File Structure

```
D-Dump/
├── app.py              # Main application
├── data.json           # Primary dataset (auto-created with sample data)
├── users.json          # User accounts (auto-created)
├── logs.json           # Search logs (auto-created)
├── data/               # Additional datasets (JSON, CSV, XLSX)
├── templates/          # Jinja2 HTML templates
│   ├── login.html
│   ├── home.html
│   ├── admin.html
│   └── upgrade.html
└── static/
    └── style.css       # Stylesheet
```

---

## Termux Usage

```bash
# Install dependencies
pkg install python
pip install flask reportlab werkzeug openpyxl --break-system-packages

# Clone and run
git clone https://github.com/Hackers-Eye/D-Dump.git
cd D-Dump
python app.py
```

Open `http://localhost:8000` in your mobile browser.

---

## Troubleshooting

### `OSError: [Errno 5] I/O error` on Termux

This is caused by emoji characters in print statements conflicting with Termux's terminal encoding. Make sure you are using the latest version of `app.py` which uses a safe `log()` wrapper with no emoji.

### No results found despite data existing

- Check that your data files are valid JSON / CSV / XLSX
- Ensure JSON files contain a list of objects (or `{"data": [...]}`)
- Verify the fields match common names: `name`, `phone`, `email`, `city`, etc.
- Check the terminal output for any load errors

### Search limit reached

Log in to the admin panel at `/admin` and increase the user's limit from the dashboard.

---

## Legal Disclaimer

> **D-Dump is intended for authorized, ethical, and legal use only.**
>
> This tool is designed for cybersecurity researchers, OSINT analysts, and professionals working with data they own or are authorized to search. Do not use it to search, collect, or process data without the consent of the individuals involved. The author is not responsible for misuse of this tool. Always comply with the laws and regulations of your country.

---

## Author

**Krish Ghosh** — [Hackers-Eye](https://github.com/Hackers-Eye)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
