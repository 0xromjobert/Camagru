const {signup, verifyEmailToken} = require('../controllers/signup');
const {login, verifyResetToken, resetPassword, askResetPassword} = require('../controllers/login');
const {signupValidationRules, loginValidationRules, validate} = require('../middleware/authValidator.js');
const { authToken } = require('../middleware/tokenJWT');
const express = require('express')

router = express.Router();
// Define the routes for the signup endpoint
router.post('/signup', signupValidationRules, validate, signup);

//same but for login
router.post('/login', loginValidationRules, validate, login);

router.get('/verify', async (req, res) => {
    const params = req.query;
    console.log(params);
    const verified = await verifyEmailToken(params.token);
    if (verified) {
        return res.status(200).json({message: 'Email verified successfully'});
    }
    return res.status(400).json({message: 'Email verification failed'});
});

router.post('/reset-request', askResetPassword);

router.get('/reset-password/', (req, res) => {
    try {
        const params = req.query;
        const verified = verifyResetToken(params.token);
        if (verified) {
            return res.status(200).json({message: 'Password reset successful', token: params.token});
        }
    }catch (error) {
        console.error('Error during password reset:', error);
        res.status(400).json({message: error.message});
    }
});

router.post('/reset-password', authToken, resetPassword);

module.exports = router;