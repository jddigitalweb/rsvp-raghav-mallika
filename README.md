# Raghav & Mallika — Premium Wedding RSVP

## Included
- Mobile-first luxury wedding invitation
- Uploaded couple photo as hero background
- Countdown to 12 November 2026, 12:00 PM IST
- RSVP Yes / No
- Guest name + phone
- Arrival + departure
- Coming from
- Transport
- Mayra Lunch / Sangeet / Haldi / Reception attendance
- Google Sheets backend

## Connect Google Sheets

1. Create a Google Sheet.
2. Extensions → Apps Script.
3. Paste `Code.gs`.
4. Save.
5. Deploy → New deployment → Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Copy the Web App URL.
9. Open `config.js` and replace the placeholder URL.
10. Upload the entire folder to your website host.

## Publish
The simplest options are Netlify, Vercel, or GitHub Pages. Upload all files/folders together.

## Sheet output
The script creates a sheet named `RSVP Responses` with:
Timestamp | RSVP | Name | Phone | Date of Arrival | Date of Departure | Coming From | Mode of Transport | Mayra Lunch | Sangeet | Haldi | Reception

## Important
Keep `assets/couple.jpg` in the same folder structure. Do not rename it unless you also update `styles.css`.
