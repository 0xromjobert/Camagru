const {signup, verifyEmailToken} = require('../controllers/signup');
const {login, verifyResetToken, resetPassword, askResetPassword} = require('../controllers/login');
const {signupValidationRules, loginValidationRules, validate} = require('../middleware/authValidator.js');
const { authToken, verifyJWT } = require('../middleware/tokenJWT');
const express = require('express')
const path = require('path');

const router = express.Router();
// Define the routes for the signup endpoint
router.post('/signup', signupValidationRules, validate, signup);

//same but for login
router.post('/login', loginValidationRules, validate, login);

router.get('/logout', authToken, (req, res) => {
    res.clearCookie('authToken', { path: '/' }); // Clear the cookie
    res.redirect('/auth/login'); // Redirect to login page
});

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

router.get('/reset-password/', async (req, res) => {
    try {
        const params = req.query;
        const verified = await verifyResetToken(params.token);
        console.log('in GET /reset-pwd we have payload after verif',verified.status, verified.token, verified.message);
        if (verified.status){
            payload_token = verifyJWT(verified.token);
            console.log('success in the verif REset token, the token payload is', payload_token);
            res.cookie('authToken',verified.token,{
                httpOnly: true,
                sameSite:'Strict',
                secure: false,
            });           
            res.sendFile(path.join(__dirname, '../views/resetPage.html'));
        }
        else
            return res.status(401).json({message:'Couldnot Verify your Reset Link'});

    }catch (error) {
        console.error('Error during password reset:', error);
        res.status(400).json({message: error.message});
    }
});

router.post('/reset-password', authToken, resetPassword); //missing validation rules

module.exports = router;