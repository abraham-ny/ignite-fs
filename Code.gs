// ============================================================
// IGNITE FIREWORKS — Google Apps Script Backend
// Paste this entire file into your Apps Script editor.
// Deploy as a Web App: Execute as "Me", Access "Anyone".
// ============================================================

// ---- CONFIG: Edit these values ----
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // from the sheet URL
const NOTIFICATION_EMAILS = [
  "owner@ignitefireworks.co.ke",
  "manager@ignitefireworks.co.ke"
]; // Emails that receive order & message alerts

// Sheet tab names (auto-created if missing)
const SHEET_ORDERS   = "Orders";
const SHEET_MESSAGES = "Messages";
const SHEET_STOCK    = "Stock";

// ============================================================
// ROUTER — called by all fetch requests
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "submitOrder")       return respond(handleOrder(data));
    if (action === "submitContact")     return respond(handleContact(data));
    if (action === "updateStock")       return respond(handleStockUpdate(data));
    if (action === "updateOrderStatus") return respond(handleStatusUpdate(data));

    return respond({ success: false, error: "Unknown action." });
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === "getAdminData") return respond(getAdminData());
    return respond({ success: false, error: "Unknown GET action." });
  } catch (err) {
    return respond({ success: false, error: err.toString() });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// HELPERS
// ============================================================
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function generateId(prefix) {
  return prefix + "-" + Date.now().toString(36).toUpperCase();
}

function formatDate(isoString) {
  if (!isoString) return new Date().toLocaleDateString("en-KE");
  try { return new Date(isoString).toLocaleDateString("en-KE"); }
  catch { return isoString; }
}

// ============================================================
// ORDERS
// ============================================================
function handleOrder(data) {
  const sheet = getSheet(SHEET_ORDERS);

  // Add header row if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Order ID","Date","Name","Email","Phone","Address",
      "Event Type","Event Date","Items","Total (KES)","Notes","Status"
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight("bold");
  }

  const orderId = generateId("ORD");
  const row = [
    orderId,
    formatDate(data.orderDate),
    data.name, data.email, data.phone, data.address,
    data.eventType || "", formatDate(data.eventDate),
    data.items,
    data.total,
    data.notes || "",
    "Pending"
  ];
  sheet.appendRow(row);

  // Send notification emails
  try {
    const itemsParsed = JSON.parse(data.items);
    const itemsList = itemsParsed.map(i => `• ${i.name} × ${i.qty} — KES ${i.lineTotal.toLocaleString()}`).join("\n");
    const subject = `🎆 New Order ${orderId} — ${data.name}`;
    const body = `
New order received on Ignite Fireworks.

Order ID : ${orderId}
Customer : ${data.name}
Email    : ${data.email}
Phone    : ${data.phone}
Address  : ${data.address}
Event    : ${data.eventType || "Not specified"} on ${data.eventDate || "TBD"}

ITEMS:
${itemsList}

TOTAL    : KES ${parseFloat(data.total).toLocaleString()}

Notes    : ${data.notes || "None"}

Log in to your admin panel to update the order status.
    `.trim();

    NOTIFICATION_EMAILS.forEach(email => {
      GmailApp.sendEmail(email, subject, body);
    });

    // Confirmation to customer
    GmailApp.sendEmail(data.email,
      `Your Ignite Fireworks order is confirmed — ${orderId}`,
      `Hi ${data.name},\n\nThank you for your order! Here's a summary:\n\n${itemsList}\n\nTotal: KES ${parseFloat(data.total).toLocaleString()}\n\nWe'll be in touch within 24 hours to confirm delivery details.\n\nBest regards,\nIgnite Fireworks Team`
    );
  } catch (emailErr) {
    console.error("Email error:", emailErr);
  }

  return { success: true, orderId };
}

// ============================================================
// CONTACT / FEEDBACK
// ============================================================
function handleContact(data) {
  const sheet = getSheet(SHEET_MESSAGES);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Message ID","Date","Name","Email","Phone","Subject","Message","Rating"]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold");
  }

  const msgId = generateId("MSG");
  sheet.appendRow([
    msgId,
    formatDate(data.date),
    data.name, data.email, data.phone || "",
    data.subject, data.message,
    data.rating || "0"
  ]);

  // Notify owners
  try {
    const subject = `✉️ New Message — ${data.subject} (from ${data.name})`;
    const body = `
New customer message received.

From    : ${data.name} <${data.email}>
Phone   : ${data.phone || "Not provided"}
Subject : ${data.subject}
Rating  : ${"★".repeat(parseInt(data.rating||0))} (${data.rating}/5)

MESSAGE:
${data.message}
    `.trim();

    NOTIFICATION_EMAILS.forEach(email => {
      GmailApp.sendEmail(email, subject, body);
    });

    // Auto-reply to sender
    GmailApp.sendEmail(data.email,
      "We received your message — Ignite Fireworks",
      `Hi ${data.name},\n\nThank you for reaching out to Ignite Fireworks. We've received your message regarding "${data.subject}" and will respond within 24 hours.\n\nBest regards,\nIgnite Fireworks Team\n📞 +254 700 000 000`
    );
  } catch (emailErr) {
    console.error("Email error:", emailErr);
  }

  return { success: true, msgId };
}

// ============================================================
// STOCK UPDATE
// ============================================================
function handleStockUpdate(data) {
  const sheet = getSheet(SHEET_STOCK);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Product ID","Stock Level","Last Updated"]);
    sheet.getRange(1,1,1,3).setFontWeight("bold");
  }

  // Find existing row
  const values = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.productId) {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[data.stock, new Date().toISOString()]]);
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([data.productId, data.stock, new Date().toISOString()]);
  }

  return { success: true };
}

// ============================================================
// ORDER STATUS UPDATE
// ============================================================
function handleStatusUpdate(data) {
  const sheet = getSheet(SHEET_ORDERS);
  const values = sheet.getDataRange().getValues();
  // Column 1 = Order ID (index 0), Column 12 = Status (index 11)
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.orderId) {
      sheet.getRange(i + 1, 12).setValue(data.status);
      return { success: true };
    }
  }
  return { success: false, error: "Order not found." };
}

// ============================================================
// GET ADMIN DATA (orders + messages)
// ============================================================
function getAdminData() {
  const ordersSheet = getSheet(SHEET_ORDERS);
  const messagesSheet = getSheet(SHEET_MESSAGES);

  function sheetToObjects(sheet) {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data[0];
    return data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h.toLowerCase().replace(/\s+/g,'_').replace(/[()]/g,'')] = row[i]; });
      return obj;
    });
  }

  const orders = sheetToObjects(ordersSheet).map(o => ({
    id: o.order_id, date: o.date, name: o.name, email: o.email,
    phone: o.phone, address: o.address, eventType: o.event_type,
    eventDate: o.event_date, items: o.items, total: o.total_kes,
    notes: o.notes, status: o.status
  }));

  const messages = sheetToObjects(messagesSheet).map(m => ({
    id: m.message_id, date: m.date, name: m.name, email: m.email,
    phone: m.phone, subject: m.subject, message: m.message, rating: m.rating
  }));

  return { success: true, orders, messages };
}

// ============================================================
// SETUP HELPER — run once to create all sheets
// ============================================================
function setupSheets() {
  getSheet(SHEET_ORDERS);
  getSheet(SHEET_MESSAGES);
  getSheet(SHEET_STOCK);
  Logger.log("✅ All sheets created/verified.");
}
