const axios = require('axios');
const Helpers = require('../models/helpers.js');
require('dotenv').config();

let idx = 0;

async function inventorySync(req, res,next) {

    for (let i = 0; i< 1000; i++){

        let data = JSON.stringify({
            "Type": 101,
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
                    await inventoryImport(result, 0);
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

async function inventoryImport(result, j){

    idx++;
    // console.log(idx);
    if(result[j].Id != ''){
        Helpers.sleep(600);
        await postInventoryOfItem(result[j]);
    }
    j++;
    if (j < result.length){
        await inventoryImport(result,j);
    }
}

const postInventoryOfItem = async (itemObject) => {

    let data = JSON.stringify({
        "Type": 1111,
        "Filters" : [
            {
                "PropertyName": "ItemRef.Id",
                "Operator": 1,
                "FilterValueArray": itemObject.Id
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
        if ( res.status == 200 || res.status == 201){
            let result = res.data;
            let inventoryStatus = result[0].Available;
            if (itemObject.CustomFields[95].Value != null && inventoryStatus != null){
                await updateInventoryToShopify(itemObject, itemObject.CustomFields[95].Value, inventoryStatus);
            }else{
                console.log('inventory is empty =', inventoryStatus);
            }
        }
        
    }catch(error){
        console.log(error);
    }
}

const updateInventoryToShopify = async (itemObject, productId, inventoryStatus) => {

    let shData = JSON.stringify({
        product:{
            variants: [
                {
                    price: itemObject.Price,
                    compare_at_price: itemObject.StdCost,
                    weight: itemObject.Weight,
                    inventory_quantity : parseInt(inventoryStatus)
                }
            ]
        }
    });

    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${productId}.json`,
        headers: Helpers.headerSHInfo,
        data : shData
    };

    try{

        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
            console.log('Added an inventory in ', itemObject.Id, 'count=', inventoryStatus);
        }

    }catch(error){
        console.log(error);
    }
    
}

inventorySync();