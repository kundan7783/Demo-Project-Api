const express = require('express');
const jwt = require("jsonwebtoken");
const { client, service } = require('../twilioConfig');
const admin = require("../firebase");
const myDB = require("../db");
const router = express.Router();

function generateTokens(id , auth_type) {
    const accessToken = jwt.sign(
        { id, auth_type },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "2m" }
    );

    const refreshToken = jwt.sign(
        { id, auth_type },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "5m" }
    );

    return { accessToken, refreshToken };
}

const TESTING_NUMBER = "7783065335";
const TESTING_OTP = "123456";

router.post('/send-otp',async(req,res,next)=>{
   try{
        let { phone } = req.body;

        /// Tesing Purpose Start 👇

        if (!phone) {
            return res.json({ message: "Phone is required" });
        }
        return res.json({
            message: "OTP Sent Successfully (Testing Mode)",
            status: "pending"
        });

        /// Tesing Purpose End 👆



        // const result = await client.verify.v2
        //     .services(service)
        //     .verifications
        //     .create({ to: `+91${phone}`, channel: "sms" });

        // res.json({
        //     message: "OTP Sent Successfully",
        //     status: result.status
        // });

   }catch(error){
     next(error);
   }
});

router.post('/verify-otp',async(req,res,next)=>{
  try{
    const { phone, otp_code } = req.body;
    if (!phone) return res.json({ message: "Phone is required" });
    if (!otp_code) return res.json({ message: "Otp is required" });
    
    /// Only Testing Ke liye Starting 👇👇
    if (otp_code !== TESTING_OTP) {
      return res.status(400).json({
        message: "Invalid OTP (Testing Mode)"
      });
    }

    const [authRow] = await myDB.query(
      "SELECT * FROM auth WHERE phone = ?",
      [phone]
    );
    let authId;

    if (authRow.length > 0) {
      authId = authRow[0].id;
    } else {
      const [result] = await myDB.query(
        `INSERT INTO auth (auth_type, phone, is_verified)
         VALUES ('phone', ?, true)`,
        [phone]
      );
      authId = result.insertId;
    }

    const { accessToken, refreshToken } = generateTokens(authId, "phone");

    return res.json({
      message: "OTP Verified Successfully (Testing Mode)",
      accessToken,
      refreshToken,
      status: "approved"
    });

    /// Only Testing Ke liye Ending 👆👆


    // const result = await client.verify.v2
    //         .services(service)
    //         .verificationChecks
    //         .create({ to: `+91${phone}`, code: otp_code });

    //     if (result.status !== "approved") {
    //         return res.json({ message: "Invalid OTP", status: result.status });
    //     }
    //     const [authRow] = await myDB.query(
    //         "SELECT * FROM auth WHERE phone = ?",
    //         [phone]
    //     );
    //     let authId;
    //     if(authRow.length > 0){
    //         authId = authRow[0].id;
    //     }else{
    //         const [result] = await myDB.query(
    //             `INSERT INTO auth (auth_type, phone, is_verified)
    //              VALUES ('phone', ?, true)`,
    //             [phone]
    //         );
    //         authId = result.insertId;
    //     }

    //     const { accessToken, refreshToken } = generateTokens(authId, "phone");

    //     res.json({
    //         message: "OTP Verified Successfully",
    //         accessToken,
    //         refreshToken,
    //         status: result.status
    //     });


  }catch(error){
     next(error);
  }
});

router.post('/google-login', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({ message: "Firebase token required" });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    const googleId = decoded.uid;
    const name = decoded.name;
    const email = decoded.email;

    const [authRow] = await myDB.query(
      "SELECT * FROM auth WHERE google_id = ?",
      [googleId]
    );

    let authId;

    if (authRow.length > 0) {
      // Existing user
      authId = authRow[0].id;
    } else {
      // New user
      const [userResult] = await myDB.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email]
      );

      const userId = userResult.insertId;

      const [authResult] = await myDB.query(
        `INSERT INTO auth (user_id, auth_type, google_id, is_verified)
         VALUES (?, 'google', ?, 1)`,
        [userId, googleId]
      );

      authId = authResult.insertId;
    }

    // ✅ JWT generate (IMPORTANT)
    const { accessToken, refreshToken } = generateTokens(authId, "google");

    return res.json({
      message: "Google login successful",
      accessToken,
      refreshToken,
    });

  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (error, decoded) => {

            if (error) {
                return res.status(403).json({
                    success: false,
                    message: "Expired or invalid refresh token!"
                });
            }

            
            const { id, auth_type } = decoded;
            const tokens = generateTokens(id, auth_type);


            return res.json({
                message: "Token refreshed successfully",
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });

            
        });

    } catch (error) {
        next(error);
    }
});



module.exports = router;