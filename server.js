
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

// Connect to MongoDB
async function mongoDbConnection() {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/hagosContactForm",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      6000
    );
  }
  mongoDbConnection().then(() => {
    console.log("MongoDB successfully connected.");
  }),
    (err) => {
      console.log("Could not connected to database : " + err);
    };

// Define a schema and model for the form data
const formSchema = new mongoose.Schema({
    fname: String,
    email: String,
    phone: String,
    msg: String
});

const Form = mongoose.model('Form', formSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/send-email', async (req, res) => {
    const { fname, email, phone, msg } = req.body;

    console.log('Form data received:', { fname, email, phone, msg });

    // Save form data to MongoDB
    const formData = new Form({ fname, email, phone, msg });
    try {
        await formData.save();
        console.log('Form data saved to MongoDB');
    } catch (error) {
        console.error('Error saving form data to MongoDB:', error);
        res.status(500).json({ error: 'Failed to save form data' });
        return;
    }

    // Configure Nodemailer transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: 'mailservices@arkitin.com', 
            pass: 'gmkb hgkq kccs fwiq' 
        }
    });

    // Email options
    let mailOptions = {
        from: email, 
        to: 'contact@hagosenergy.com', 
        subject: `New Message from ${fname}`,
        text: `Name: ${fname}\nEmail: ${email}\nPhone Number: ${phone}\n\nMessage: ${msg}`,
        replyTo: email 
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred while sending email:', error);
            res.status(500).json({ error: 'Failed to send email', details: error.message });
            return;
        }
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent and data saved successfully!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});