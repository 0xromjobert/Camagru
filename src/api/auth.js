const {signup, verifyEmailToken} = require('../controllers/signup');
const {login, verifyResetToken, resetPassword, askResetPassword} = require('../controllers/login');
const {signupValidationRules, loginValidationRules, resetPwdValidationRules, validate} = require('../middleware/authValidator.js');
const { authToken, verifyJWT } = require('../middleware/tokenJWT');
const express = require('express')
const path = require('path');

const router = express.Router();

//*************************************/ LOGIN / SIGNUP ENDPOINS ********************************************/

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

//***************************************RESET PASSWORD ENDPOINTS ***********************************************

/*
forget email submit form endpoint [POST]
apply the askResetPassword functoin without any auth check
*/
router.post('/reset-request', askResetPassword);

/*
this is where arrives from email link [GET]
- verifyResetToken -> failure -> message error from verified function
    -> success: get a new authToken with user info that is added to cookie, then return the page with new pwd form
*/
router.get('/reset-password/', async (req, res) => {
    try {
        const params = req.query;
        const verified = await verifyResetToken(params.token);
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
            return res.status(401).json({message:verified.message});

    }catch (error) {
        console.error('Error during password reset:', error);
        res.status(400).json({message: error.message});
    }
});

/*
this is where user send new pwd [POST]
- first check auth (from verifyResetlink, useer has a new cookiebased JWT if sucess)
- then apply the resetPassword function
*/
router.post('/reset-password', authToken, resetPwdValidationRules, validate, resetPassword); //missing validation rules

module.exports = router;