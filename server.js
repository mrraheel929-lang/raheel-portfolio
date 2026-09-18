require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;
const dataDirectory = path.join(__dirname, 'data');
const messagesFile = path.join(dataDirectory, 'messages.json');

app.use(express.json({ limit: '20kb' }));
// Contact messages are private server data and must never be publicly served.
app.use('/data', (req, res) => res.sendStatus(404));
app.use(express.static(__dirname));

const clean = (value) => String(value || '').trim();
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post('/api/contact', async (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email);
  const message = clean(req.body.message);
  if (name.length < 2 || !validEmail(email) || message.length < 10) {
    return res.status(400).json({ error: 'Please provide a name, valid email, and a message of at least 10 characters.' });
  }
  const contact = { name, email, message, receivedAt: new Date().toISOString() };
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.CONTACT_TO) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await transporter.sendMail({ from: process.env.SMTP_USER, replyTo: email, to: process.env.CONTACT_TO, subject: `Portfolio message from ${name}`, text: `From: ${name} <${email}>\n\n${message}` });
    } else {
      await fs.mkdir(dataDirectory, { recursive: true });
      let messages = [];
      try { messages = JSON.parse(await fs.readFile(messagesFile, 'utf8')); } catch { /* First saved message. */ }
      messages.push(contact);
      await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
    }
    return res.status(201).json({ message: 'Thanks - your message has been received.' });
  } catch (error) {
    console.error('Contact submission failed:', error);
    return res.status(500).json({ error: 'The message could not be delivered right now.' });
  }
});

app.listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));
