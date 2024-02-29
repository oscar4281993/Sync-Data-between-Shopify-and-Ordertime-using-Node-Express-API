const axios = require('axios');
const Helpers = require('../models/helpers.js');
require('dotenv').config();

async function relatedItemsSync () {

    for (let i = 0; i< 1000; i++){

        let data = JSON.stringify({
            "Type": 230,
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

            if(res.status == 200 && res.data){
                for (let j = 0; j < res.data.length; j++){
                    let primaryID = res.data[j].PrimaryItemRef.Id;
                    let relatedID = res.data[j].RelatedItemRef.Id;
    
                    let primaryProductID = await getProductIDfromItem(primaryID);
                    let relatedProductID = await getProductIDfromItem(relatedID);
    
                    if(primaryProductID  && relatedProductID ){
                        await clearRelatedIDinSH(primaryProductID);
                    }
                }
                console.log('all id cleared!');
    
                for (let j = 0; j < res.data.length; j++){
                    let primaryID = res.data[j].PrimaryItemRef.Id;
                    let relatedID = res.data[j].RelatedItemRef.Id;
    
                    let primaryProductID = await getProductIDfromItem(primaryID);
                    let relatedProductID = await getProductIDfromItem(relatedID);

                    console.log('primaryID,relatedID = ',primaryProductID, ', ',relatedProductID);
    
                    if(primaryProductID && relatedProductID){
                        await putRelatedIDtoSH(primaryProductID, relatedProductID);
                    }
                }
                console.log('all id recreated!');
            }

            if(res.data.length < 1000){
                break;
            }

        }catch(error){
            console.log(error);
        }
    }
}

const getProductIDfromItem = async (itemID) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/partitem?id=' + itemID,
        headers: Helpers.headerOTInfo
    };

    try{

        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            return res.data.CustomFields[95].Value;
        }

    }catch(error){
        console.log('Failed to get product ID = ',error);
    }
}

const putRelatedIDtoSH = async (primaryID, relatedID) => {

    const metafieldData = await Helpers.getMetafieldData(primaryID);
    let metafields = [];

    if (metafieldData){
        metafields = [
            {
                id: metafieldData.id,
                value: metafieldData.value == '' ? relatedID : metafieldData.value + ', ' + relatedID,
            }
        ]
    }else{
        metafields = [
            {
                key: "related_items_ids",
                value: relatedID,
                type: "single_line_text_field",
                namespace: "custom"
            }
        ]
    };

    let data = JSON.stringify({
        product:{
            metafields: metafields
        }
    });

    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${primaryID}.json`,
        headers: Helpers.headerSHInfo,
        data : data
    };

    try{

        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            console.log('Successfully added IDs in = ', res.data.product.title);
        }

    }catch(error){
        console.log(error);
    }
}

const clearRelatedIDinSH = async (primaryID) => {

    const metafieldData = await Helpers.getMetafieldData(primaryID);
    
    if (metafieldData){
        console.log('metafieldData.id = ', metafieldData.id, ' removed');
    
        let config = {
            method: 'delete',
            maxBodyLength: Infinity,
            url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${primaryID}/metafields/${metafieldData.id}.json`,
            headers: Helpers.headerSHInfo
        };
    
        try{

            await axios.request(config);

        }catch(error){
            console.log(error);
        }
    }
}

relatedItemsSync();