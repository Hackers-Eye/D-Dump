🔍 Cybersecurity OSINT Phone Intelligence Platform

This project is a cybersecurity-focused OSINT (Open-Source Intelligence) web platform designed for phone number intelligence and basic identity correlation. It enables security researchers, SOC analysts, and students to query structured datasets to identify publicly available associations such as names, cities, and email addresses linked to a given number.

Built using Flask, the application provides a secure web interface with user authentication, per-user rate limiting, and comprehensive query logging to ensure accountability and controlled usage. All searches are recorded with timestamps and user attribution, making the platform suitable for audit-ready investigations and controlled research environments.

A protected admin dashboard allows authorized administrators to monitor users, review lookup activity, manage limits, and analyze platform usage. Admin credentials and application secrets are configurable using environment variables, supporting secure deployment across local labs, VPS servers, and internal networks without hard-coding sensitive credentials.

The platform supports exporting search results and logs to PDF and Excel formats, enabling structured reporting and investigation documentation. The backend is modular and can be extended with additional datasets or OSINT enrichment modules in future releases.

⚙️ User Setup & Required Changes (Important)

Before running the application, users should complete the following steps:

1. Configure Admin Credentials (Mandatory)

Set environment variables to avoid using default credentials:

Linux / macOS

export OSINT_ADMIN_USER=your_admin
export OSINT_ADMIN_PASS=StrongPassword123
export OSINT_SECRET=RandomSecretKey


Windows PowerShell

setx OSINT_ADMIN_USER "your_admin"
setx OSINT_ADMIN_PASS "StrongPassword123"
setx OSINT_SECRET "RandomSecretKey"

2. Update Dataset Files

Modify the following JSON files with your own authorized datasets:

data.json → searchable public records

users.json → registered users and quotas

logs.json → auto-generated search logs

⚠ Only include data you are legally allowed to store and analyze.

3. Install Dependencies
pip install -r requirements.txt

4. Run the Application
python app.py


Access:

User panel: http://localhost:5000

Admin panel: http://localhost:5000/admin

⚠ Legal & Ethical Use Notice

This tool is intended only for educational purposes, ethical hacking practice, fraud analysis, and authorized security research. Usage against real individuals without legal permission may violate privacy and cybersecurity laws. Users are fully responsible for compliance with applicable regulations.

✔ Key Features

Phone number OSINT lookup

Public identity correlation (name, city, email)

Secure authentication system

Per-user rate limits and quotas

Full activity and query logging

Admin monitoring dashboard

PDF and Excel report export

Environment-based credential security

Modular dataset structure for extension
