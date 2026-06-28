# Ignite Fireworks Website — Setup Guide

## File Structure
```
fireworks-site/
├── index.html        ← Main store homepage
├── contact.html      ← Contact & feedback page
├── admin.html        ← Admin dashboard
├── style.css         ← Main styles (shared)
├── admin.css         ← Admin-specific styles
├── products.js       ← Product data + CONFIG (edit your Script URL here)
├── cart.js           ← Shopping cart logic
├── main.js           ← Homepage JS (products, order form, canvas)
├── admin.js          ← Admin dashboard JS
└── Code.gs           ← Google Apps Script backend (paste into Apps Script)
```

---

## Step 1: Google Sheets Setup

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it `Ignite Fireworks Data` (or anything you like).
3. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/**SPREADSHEET_ID**/edit`

---

## Step 2: Google Apps Script Setup

1. In your spreadsheet, go to **Extensions → Apps Script**.
2. Delete any default code and paste the entire contents of `Code.gs`.
3. Replace `"YOUR_SPREADSHEET_ID"` with your actual Spreadsheet ID.
4. Update `NOTIFICATION_EMAILS` with the emails that should receive alerts.
5. Click **Run → setupSheets** once to create the sheet tabs.
6. Deploy as a Web App:
   - Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the Web App URL.

---

## Step 3: Connect Your Website

1. Open `products.js` and replace the `SCRIPT_URL` value:
   ```js
   const CONFIG = {
     SCRIPT_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
     ...
   };
   ```

2. That's it! The frontend will now send orders and messages to your Google Sheets and trigger email notifications.

---

## Step 4: Admin Login

- The admin panel is at `admin.html` (linked in the nav as "Admin ⚙").
- Default credentials are set in `admin.js`:
  ```js
  const ADMIN_CREDENTIALS = {
    email: "admin@ignitefireworks.co.ke",
    password: "Ignite2025!"
  };
  ```
- **Change these before going live.**
- For production security, move authentication to Apps Script and validate server-side.

---

## Step 5: Add Your Product Images (Optional)

Products currently use emoji icons. To use real images:
1. Add an `images/` folder with your product photos.
2. In `products.js`, add an `image` field to each product:
   ```js
   { id: "p001", ..., image: "images/galaxy-burst.jpg" }
   ```
3. In `main.js`, replace:
   ```html
   <div class="prod-emoji">${p.emoji}</div>
   ```
   with:
   ```html
   <div class="prod-img">
     <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'" />
   </div>
   ```

---

## Customization Checklist

- [ ] Replace `SCRIPT_URL` in `products.js`
- [ ] Update `SPREADSHEET_ID` in `Code.gs`
- [ ] Update `NOTIFICATION_EMAILS` in `Code.gs`
- [ ] Change admin credentials in `admin.js`
- [ ] Update phone/email/address in `index.html` and `contact.html`
- [ ] Update product names, prices, and stock in `products.js`
- [ ] Add product images if available
- [ ] Run `setupSheets()` in Apps Script once

---

## Features

| Feature | Details |
|---|---|
| Product catalog | 12 products across 5 categories, with filter |
| Shopping cart | localStorage-backed, quantity controls |
| Order form | Submits to Sheets + email notifications |
| Contact/Feedback | Stored in Sheets + email to owners + auto-reply |
| Admin login | Email/password (session-based) |
| Stock management | Increase/decrease/mark out of stock |
| Order management | View all orders, update status, export CSV |
| Message inbox | View all customer messages |
| Statistics | Total orders, revenue, messages, products in stock |
| Responsive | Mobile-first, works on all screen sizes |
| Dark theme | Phantom gradient, blur/glass effects throughout |
