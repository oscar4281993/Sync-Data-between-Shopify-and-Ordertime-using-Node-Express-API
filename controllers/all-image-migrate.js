const axios = require('axios');
const Helpers = require('../models/helpers.js');
require('dotenv').config();

let idx = 0;

async function imageLoop() {

    for (let i = 0; i< 1000; i++){

        let data = JSON.stringify({
            "Type": 1060,
            "PageNumber": i+1,
            "NumberOfRecords": 1000
        });
        
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.ORDERTIME_ENDPOINT_URL + '/list',
            headers: Helpers.headerOTInfo,
            data : data
        };

        try{
            
            const res = await axios.request(config);
            if (res.status == 200 || res.status == 201){
                let result = res.data;
                console.log('Length = ',result.length);
        
                if(result.length > 0){
                    await importallImages(result, 0);
                }
                if(result.length < 1000){
                    break;
                }
            }

        }catch(error){
            console.log('',error);
        }
    }
}

async function importallImages(result, j){
    idx++;
    console.log(idx);
    if(result[j].AwsTempPath != ''){
        Helpers.sleep(800);
        let productId = await Helpers.productIdOfItem(result[j].ItemRef.Id);
        console.log('productId = ', productId)
        if (productId != '' && productId != null){
            await Helpers.importImageToShopify(productId, result[j]);
        }
    }
    j++;
    if (j < result.length){
        await importallImages(result,j);
    }
}

imageLoop();