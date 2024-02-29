const axios = require('axios');
require('dotenv').config();

const headerOTInfo = { 
    'apiKey': process.env.ORDERTIME_API, 
    'email': process.env.ORDERTIME_USER, 
    'password': process.env.ORDERTIME_PASS, 
    'Content-Type': 'application/json'
};

const headerSHInfo = {
    'X-Shopify-Access-Token': process.env.API_ACCESS_TOKEN,
    'Content-Type': 'application/json',
};

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

const connectCollection = async (productId, collectionId) => {

    let data = JSON.stringify({
        collect:{
            product_id: productId,
            collection_id: collectionId
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/collects.json`,
        headers: headerSHInfo,
        data: data,
    };

    try{
        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
           console.log('Connected Collection in  ', productId);
        }
    }catch(error){
        console.log(error);
    }
}

const createCustomCollection = async (productId, collectionTitle) => {

    let data = JSON.stringify({
        custom_collection:{
            title: collectionTitle,
            collects:[
                {
                    product_id: productId
                }
            ]
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/custom_collections.json`,
        headers: headerSHInfo,
        data: data,
    };

    try{
        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
           console.log('created CustomCollection in ', productId);
        }
    }catch(error){
        console.log(error);
    }
}

const clearmetaFields = async (productId, metaId) => {
    
    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${productId}/metafields/${metaId}.json`,
        headers: headerSHInfo
    };

    try{
        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
            console.log('metafield = ', metaId, ' removed');
        }
    }catch(error){
        console.log(error);
    }
}

const checkOfImageExisting = async (productId, imageName) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${productId}.json`,
        headers: headerSHInfo
    };

    try{

        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
            let imageArray = res.data.product.images;

            for (let i=0; i<imageArray.length; i++){
                let imgName = imageArray[i].src.split("?")[0].split("/")[10];
                if (imgName == imageName){
                    console.log('same image already exist!');
                    return true;
                    break;
                }
            }
            return false;
        }
        
    }catch(error){
        console.log(error);
    }
}

const deleteCollect = async (collectId) => {

    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/collects/${collectId}.json`,
        headers: headerSHInfo,
    };
    try{
        await axios.request(config);
    }catch(error){
        console.log(error);
    }
}

const deProduct = async (productId) => {

    let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${productId}.json`,
        headers: headerSHInfo
    };

    try{

        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
            console.log('Successfully removed product = ', productId);
        }

    }catch(error){
        console.log(error);
    }
}

const importproductIdToOT = async (productData , itemID) => {

    let data = JSON.stringify({
        "Id": itemID,
        "Name": productData.product.title,
        "CustomFields": [
            {
                "Name": "ItemCust96",
                "Value": productData.product.id
            }
        ]
    });
      
    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/partitem?id=' + itemID,
        headers: headerOTInfo,
        data : data
    };

    try{
        await axios.request(config);
    }catch(error){
        console.log('Failed to import product ID to OT == ', error);
    }
}

const importImageToShopify = async (productId, result) => {

    let stringUrl = result.AwsTempPath;
    let imageName = stringUrl.split("?")[0].split("/")[6];

    const statusOfExist = await checkOfImageExisting(productId, imageName);
    
    if (statusOfExist == false){
        let data = JSON.stringify({
            "image": {
            
                "src": result.AwsTempPath
            }
        });
          
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${productId}/images.json`,
            headers: headerSHInfo,
            data : data
        };
    
        try{
    
            const res = await axios.request(config);
            if(res.status == 200 || res.status == 201){
                console.log('Successfully added an image');
            }
    
        }catch(error){
            console.log(error);
        }
    }
    
}

const getInventoryOfItem = async (itemObject) => {

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
        headers: headerOTInfo,
        data : data
    };

    try{

        const res = await axios.request(config);
        if ( res.status == 200 || res.status == 201){
            let result = res.data;
            return result[0].Available;
        }
        
    }catch(error){
        console.log(error);
    }
}

const getCategories = async (itemId) => {

    let data = JSON.stringify({
        "Type": 3091,
        "Filters" : [
            {
                "PropertyName": "ItemRef.Id",
                "Operator": 1,
                "FilterValueArray": itemId
            }
        ],
        "PageNumber": 1,
        "NumberOfRecords": 20
    });
    
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/list',
        headers: headerOTInfo,
        data : data
    };

    try{

        const res = await axios.request(config);
        if ( res.status == 200 || res.status == 201){
            return res.data;
        }
        
    }catch(error){
        console.log(error);
    }
}

const getCurrentCustomCollections = async () => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/custom_collections.json`,
        headers: headerSHInfo
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            return res.data.custom_collections;
        }
    }catch(error){
        console.log('error = ', error);
    }
}

const getMetafieldData = async (productId) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${productId}/metafields.json`,
        headers: headerSHInfo
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            return res.data.metafields;
        }
    }catch(error){
        console.log(error);
    }
}

const getCollectsOfProduct = async (productId) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/collects.json?product_id=${productId}`,
        headers: headerSHInfo,
    };
    try{
        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
            return res.data.collects;
        }
    }catch(error){
        console.log(error);
    }
}

const getShipdoc = async (shipDocId) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/shipdoc?docNo=' + shipDocId,
        headers: headerOTInfo
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            return res.data;
        }
    }catch(error){
        console.log(error);
    }
}

const getPackages = async (shipDocId) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/package?docNo=' + shipDocId,
        headers: headerOTInfo
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            return res.data;
        }
    }catch(error){
        console.log(error);
    }
}

const getSalesOrder = async (salesOrderID) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/salesorder?docNo=' + salesOrderID,
        headers: headerOTInfo
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            return res.data;
        }
    }catch(error){
        console.log(error);
    }
}

const getFulFillmentOrder = async (orderId) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/orders/${orderId}/fulfillment_orders.json`,
        headers: headerSHInfo
    };

    try{
        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
            return res.data.fulfillment_orders[0];
        }
    }catch(error){
        console.log(error);
    }
}

const productIdOfItem = async (itemID) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/partitem?id=' + itemID,
        headers: headerOTInfo
    };

    try{
        const res = await axios.request(config);
        if ( res.status == 200 || res.status == 201){
            return res.data.CustomFields[95].Value;
        }
        
    }catch(error){
        console.log(error);
    }
}

module.exports = {
    headerOTInfo, 
    headerSHInfo,
    sleep,
    connectCollection,
    createCustomCollection,
    clearmetaFields,
    deleteCollect,
    deProduct,
    importproductIdToOT,
    importImageToShopify,
    getInventoryOfItem,
    getCategories,
    getCurrentCustomCollections,
    getMetafieldData,
    getCollectsOfProduct,
    getShipdoc,
    getPackages,
    getSalesOrder,
    getFulFillmentOrder,
    productIdOfItem
};