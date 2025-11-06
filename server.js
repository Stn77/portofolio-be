// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // gmail, outlook, yahoo, dll
    auth: {
        user: process.env.EMAIL_USER, // Email Anda
        pass: process.env.EMAIL_PASSWORD // App Password
    }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Transporter verification error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Endpoint untuk mengirim email
app.post('/api/send-email', async (req, res) => {
    try {
        const { nama, waktu_pengiriman, email_pengirim, perihal, pesan } = req.body;

        // Validasi input
        if (!nama || !email_pengirim || !perihal || !pesan) {
            return res.status(400).json({
                success: false,
                message: 'Semua field harus diisi'
            });
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email_pengirim)) {
            return res.status(400).json({
                success: false,
                message: 'Format email tidak valid'
            });
        }

        // Email options
        const mailOptions = {
            from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER, // Email tujuan
            replyTo: email_pengirim,
            subject: `Pesan Baru dari Portfolio - ${perihal}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #2C3E50; border-bottom: 3px solid #E6C34F; padding-bottom: 10px;">Pesan Baru dari Portfolio</h2>
                        
                        <div style="margin: 20px 0;">
                            <p style="margin: 10px 0;"><strong style="color: #2C3E50;">Nama:</strong> ${nama}</p>
                            <p style="margin: 10px 0;"><strong style="color: #2C3E50;">Email:</strong> ${email_pengirim}</p>
                            <p style="margin: 10px 0;"><strong style="color: #2C3E50;">Waktu:</strong> ${waktu_pengiriman}</p>
                            <p style="margin: 10px 0;"><strong style="color: #2C3E50;">Perihal:</strong> ${perihal}</p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #E6C34F; margin: 20px 0;">
                            <p style="margin: 0; color: #333; line-height: 1.6;"><strong style="color: #2C3E50;">Pesan:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #555; line-height: 1.6;">${pesan.replace(/\n/g, '<br>')}</p>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        
                        <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                            -- Portofolio Website Stone7 --
                        </p>
                    </div>
                </div>
            `,
            text: `
${nama}
${waktu_pengiriman}
${email_pengirim}
${perihal}
${pesan}
-- Portofolio Website --
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Email berhasil dikirim',
            data: {
                messageId: info.messageId
            }
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengirim email',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});