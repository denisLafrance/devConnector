const express = require('express');
const router = express.Router();


// @route     POST api/auth
// @desc      Register the user
// @access    Public
router.post('/', (req, res) => {
    console.log(req.body);
    
    res.send('Auth route')
})


module.exports = router;