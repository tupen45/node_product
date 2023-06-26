const express = require('express');
const router=express.Router();
const bodyParser = require('body-parser');








router.post('/payment',(req,res)=>{



     const{amount,email}=req.body;
    
    const totalAmount=JSON.stringify(amount);
    /* import checksum generation utility */


var params = {};
params['MID'] = "CvQTci17551989827545",
params['WEBSITE'] = "WEBSTAGING",
params['CHANNEL_ID'] = "WEB",
params['INDUSTRY_TYPE_ID'] = "Retail",
params['ORDER_ID'] = "1hdyFJ",
params['CUST_ID'] = "1hygjdh",
params['TXN_AMOUNT'] = totalAmount,
params['CALLBACK_URL'] = 'http://localhost:3000/api10/callback',
params['EMAIL'] =email,
params['MOBILE_NO'] = '7679426795'

/* initialize an array */


/**
* Generate checksum by parameters we have
* Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
*/
var paytmChecksum = PaytmChecksum.generateSignature(params, "89a_Z5btWrvm&sCg");
paytmChecksum.then(function(checksum){
    let paytmParams={
        ...params,
        "CHECKSUMHASH":checksum
    }
        res.json(paytmParams)


}).catch(function(error){
	console.log(error);
});
 

})
