const axios = require('axios');
const Helpers = require('../models/helpers.js');
require('dotenv').config();

function subtractMinutes(date, minutes) {
    date.setMinutes(date.getMinutes() - minutes);
    return date;
};

async function imageLoop() {

    const timeDiff = subtractMinutes(new Date(), 10);
    const modifyTime = new Date(timeDiff).toISOString();

    let data = JSON.stringify({
        "Type": 1060,
        "Filters": [
          {
            "PropertyName": "RecordInfo.ModifiedDate",
            "Operator": 4,
            "FilterValueArray": modifyTime
          }
        ],
        "PageNumber": 1,
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
                for (let i = 0; i < result.length; i++){
            
                    let productId = await Helpers.productIdOfItem(result[i].ItemRef.Id);
                    
                    if (productId != ''){
                        await Helpers.importImageToShopify(productId, result[i]);
                    }
                }
            }else{
                console.log('There is no image uploaded in OT within 10 mins');
            }
        }

    }catch(error){
        console.log('',error);
    }
}

imageLoop();