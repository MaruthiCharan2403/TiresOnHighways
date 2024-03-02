const express = require('express');
const router = express.Router();
const multer = require('multer');
const TollData = require('../models/TollDataSch');
const auth = require('../middleware/tollAuth');
const cors = require('cors');
const axios = require('axios');
const blobUtil = require('blob-util');
const cookieparser = require('cookie-parser')
router.use(cookieparser());
const twilio = require('twilio');

// ^ CORS 
router.use(cors({
    origin: 'https://tiresonhighways.vercel.app',
    credentials: true,
}));

// & Multer config for TollUpload
const TollUp = multer.memoryStorage();
const Tollupload = multer({ storage: TollUp, limits: { fieldSize: 25 * 1024 * 1024 } })

//! TollUpload Route
router.post('/tollupload',auth,Tollupload.any(), async (req, res) => {
    let msg = '';
    console.log("TollUpload Route");
    const { vehicleNumber, userMobileNumber, date, tollPlaza } = req.body;
    const tollBlobArray = [];
    const files = req.files;
    const b64Array = [];
    for (let i = 0; i < files.length; i++) {
        b64Array.push(files[i].buffer.toString('base64'));
    }
    for (let i = 0; i < files.length; i++) {
        const tollImageBuffer = files[i].buffer;
        const tollBlob = blobUtil.createBlob([tollImageBuffer], { type: 'image/jpeg/jpg/png' });
        tollBlobArray.push(tollBlob);
    }
    const tollFlaskRequestData = new FormData();
    tollBlobArray.forEach((tollBlob) => {
        tollFlaskRequestData.append('image', tollBlob, 'TolluploadImage.jpg');
    });
    const tollFlaskResponse = [];
    try {
        console.log("Sending file to flask api. . . ");
        const tollResponse_flask = await axios.post('https://tohflask.onrender.com/classify', tollFlaskRequestData)
        for (let i = 0; i < files.length; i++) {
            tollFlaskResponse.push(tollResponse_flask.data[i]);
        }
        if (tollFlaskResponse["error"]) {
            console.log("Bad response from flask api");
            return res.status(500).send('Bad response from flask api');
        }
        try {
            const tollData = new TollData({
                date: date,
                vehicleNumber: vehicleNumber,
                userMobileNumber: userMobileNumber,
                userTyre64: b64Array,
                tyreStatus: tollFlaskResponse,
                tollPlaza: tollPlaza,
            });
            for(let i=0;i<tollFlaskResponse.length;i++){
                msg = msg + `Tire${i+1} is ${tollFlaskResponse[i].class}\n`;
            }
            console.log(msg);
            
            await tollData.save();
            console.log('Data saved to MongoDB');
            res.send("Data saved to MongoDB");
        } catch (err) {
            console.error('Error saving data to MongoDB:', err);
            res.status(500).send('Error saving data to MongoDB');
        }
    } catch (error) {
        console.error("Error sending file to flask_api :", error);
        res.status(500).send('Error sending file to flask_api');
    }
    const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`; // Your Account SID from www.twilio.com/console
        const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;   // Your Auth Token from www.twilio.com/console
        const client = twilio(accountSid, authToken);
        try {
        const responseSMS = await client.messages
            .create({
                from: '+13344543086',
                to: '+91' + userMobileNumber,
                body: `Your vehicle  ${vehicleNumber} has crossed ${tollPlaza} on ${date}\n${msg}`,
            })
        console.log(responseSMS.sid);
            
    } catch (err) {
        console.log('SMS NOT SENT');
    }
    return;
});

module.exports = router;