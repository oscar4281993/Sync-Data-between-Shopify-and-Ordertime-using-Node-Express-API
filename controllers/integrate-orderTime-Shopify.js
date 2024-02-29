const axios = require('axios');
const getRawBody = require('raw-body');
const crypto = require('crypto');
const HttpError = require('../models/http-error');
const Helpers = require('../models/helpers.js');
require('dotenv').config();

const getWebhookData = async function(req,res,next){

    const authheader = req.headers.authorization;

    if (!authheader) {
        let err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err)
    }

    const auth = new Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    if (user !== process.env.ORDERTIME_USER && pass !== process.env.ORDERTIME_PASS) {
        let err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
    } else {

        const body = await getRawBody(req);
        const result = JSON.parse(body);
        console.log(result);

        const ActionType = result.ActionType;
        const RecordType = result.RecordType;
        const UniqueId = result.UniqueId;

        if(RecordType == 100){
            switch(ActionType){
                case 1:
                    await postProduct(UniqueId);
                    break;
                case 2:
                    await updateProduct(UniqueId);
                    break;
                case 3:
                    await deleteProduct(UniqueId);
                    break;
                default:
            }
        }

        if(RecordType == 4 && ActionType == 4){
            await postOrderStatusToSH(UniqueId);
        }
        
    }
    res.status(200).send("Success");
}

const postProduct = async (UniqueId) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/partitem?id=' + UniqueId,
        headers: Helpers.headerOTInfo
    };
   
    try{

        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
            
            let otResonse = res.data;
            let published = otResonse.CustomFields[96].Value;
            let actived = otResonse.IsActive;
            
            if(published == false || actived == false){
                console.log('item is not published');
                return;
            }

            let inventory = await Helpers.getInventoryOfItem(res.data);
            
            let shData = JSON.stringify({
                product:{
                    title: otResonse.Name,
                    body_html: otResonse.Description,
                    vendor: otResonse.PrefVendorRef? otResonse.PrefVendorRef.Name: '',
                    product_type: UniqueId,
                    created_at: otResonse.RecordInfo.CreatedDate,
                    tags: otResonse.CustomFields[8].Value,
                    status: otResonse.IsActive == true ? "active": "draft",
                    variants: [
                        {
                            price: otResonse.Price,
                            sku: otResonse.UPC,
                            compare_at_price: otResonse.StdCost,
                            weight: otResonse.Weight,
                            weight_unit: 'kg',
                            inventory_quantity: inventory
                        }
                    ],
                    metafields: [
                        {
                            key: 'uom',
                            value: otResonse.UomSetRef ? otResonse.UomSetRef.Name: null,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'category',
                            value: otResonse.CustomFields[7].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'assembly_style',
                            value: otResonse.CustomFields[34].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'base_style',
                            value: otResonse.CustomFields[74].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'blade_length',
                            value: otResonse.CustomFields[83].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'blade_material',
                            value: otResonse.CustomFields[84].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'bottom_diameter',
                            value: otResonse.CustomFields[36].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'bottom_length',
                            value: otResonse.CustomFields[44].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'bottom_width',
                            value: otResonse.CustomFields[47].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'capacity',
                            value: otResonse.CustomFields[38].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'casters',
                            value: otResonse.CustomFields[87].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'cbm',
                            value: otResonse.CustomFields[19].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'chemical_form',
                            value: otResonse.CustomFields[80].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'class',
                            value: otResonse.ClassRef ? otResonse.ClassRef.Name: null,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'coating',
                            value: otResonse.CustomFields[76].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'color',
                            value: otResonse.CustomFields[4].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'construction',
                            value: otResonse.CustomFields[72].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'container_size',
                            value: otResonse.CustomFields[69].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'depth',
                            value: otResonse.CustomFields[60].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'description_header',
                            value: otResonse.CustomFields[91].Value ? otResonse.CustomFields[91].Value.replace(/"/g, "&quot;") : '',
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'description_long_1',
                            value: otResonse.CustomFields[89].Value ? otResonse.CustomFields[89].Value.replace(/"/g, "&quot;") : '',
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'description_long_2',
                            value: otResonse.CustomFields[90].Value ? otResonse.CustomFields[90].Value.replace(/"/g, "&quot;") : '',
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'design',
                            value: otResonse.CustomFields[42].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'diameter',
                            value: otResonse.CustomFields[66].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'dilution_ratio',
                            value: otResonse.CustomFields[81].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'edge_style',
                            value: otResonse.CustomFields[45].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'features',
                            value: otResonse.CustomFields[39].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'flush_liquid_fill',
                            value: otResonse.CustomFields[67].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'flute_type',
                            value: otResonse.CustomFields[73].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'foil_weight',
                            value: otResonse.CustomFields[70].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'folded_length',
                            value: otResonse.CustomFields[56].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'folded_width',
                            value: otResonse.CustomFields[58].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'gauge',
                            value: otResonse.CustomFields[61].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'group',
                            value: otResonse.ItemGroupRef ? otResonse.ItemGroupRef.Name : null,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'gsm',
                            value: otResonse.CustomFields[86].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'gusset_style',
                            value: otResonse.CustomFields[75].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'gusset_width',
                            value: otResonse.CustomFields[54].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'handle',
                            value: otResonse.CustomFields[53].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'handle_material',
                            value: otResonse.CustomFields[85].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'height',
                            value: otResonse.CustomFields[32].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'interior_diameter',
                            value: otResonse.CustomFields[43].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'kosher_certification',
                            value: otResonse.CustomFields[78].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'length',
                            value: otResonse.CustomFields[30].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'lid_type',
                            value: otResonse.CustomFields[50].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'manufacturer',
                            value: otResonse.ManufacturerRef ? otResonse.ManufacturerRef.Name: "",
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'manufacturer_part_no',
                            value: otResonse.ManufacturerPartNo,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'material',
                            value: otResonse.CustomFields[6].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'maximum_temperature',
                            value: otResonse.CustomFields[77].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'maximum_yield',
                            value: otResonse.CustomFields[82].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'number_of_compartments',
                            value: otResonse.CustomFields[40].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'number_of_shelves',
                            value: otResonse.CustomFields[88].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'pallet_qty',
                            value: otResonse.CustomFields[0].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'pan_type',
                            value: otResonse.CustomFields[62].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'pattern',
                            value: otResonse.CustomFields[65].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'ply',
                            value: otResonse.CustomFields[55].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'powdered_or_powder_free',
                            value: otResonse.CustomFields[68].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'practical_fill_capacity',
                            value: otResonse.CustomFields[63].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'scent',
                            value: otResonse.CustomFields[79].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'shape',
                            value: otResonse.CustomFields[35].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'size',
                            value: otResonse.CustomFields[52].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'special_order',
                            value: otResonse.IsSpecialOrder,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'style',
                            value: otResonse.CustomFields[33].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'thickness',
                            value: otResonse.CustomFields[51].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'tier_1_price',
                            value: otResonse.CustomFields[27].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'tier_1_quantity',
                            value: otResonse.CustomFields[24].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'tier_2_price',
                            value: otResonse.CustomFields[28].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'tier_2_quantity',
                            value: otResonse.CustomFields[25].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'tier_3_price',
                            value: otResonse.CustomFields[29].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'tier_3_quantity',
                            value: otResonse.CustomFields[26].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'top_diameter',
                            value: otResonse.CustomFields[37].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'top_length',
                            value: otResonse.CustomFields[46].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'top_width',
                            value: otResonse.CustomFields[48].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'type',
                            value: otResonse.Type,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'unfolded_length',
                            value: otResonse.CustomFields[57].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'unfolded_width',
                            value: otResonse.CustomFields[59].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'usage',
                            value: otResonse.CustomFields[49].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'volume',
                            value: otResonse.Volume,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'weight',
                            value: otResonse.CustomFields[41].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'width',
                            value: otResonse.CustomFields[31].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'window',
                            value: otResonse.CustomFields[71].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'wrapped',
                            value: otResonse.CustomFields[64].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'burn_time',
                            value: otResonse.CustomFields[92].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'fuel_material',
                            value: otResonse.CustomFields[93].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        },
                        {
                            key: 'fuel_type',
                            value: otResonse.CustomFields[94].Value,
                            type: 'single_line_text_field',
                            namespace: 'custom'
                        }
                    ]
                }
            });
            
            await insertProduct(shData, UniqueId);
        } 

    }catch(error){
        console.log(error);
    }
};

const insertProduct = async (shData, UniqueId) => {

    console.log(shData);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products.json`,
        headers: Helpers.headerSHInfo,
        data: shData,
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            console.log(`Product is posted: title is ==`, res.data.product.title);
            await Helpers.importproductIdToOT(res.data , UniqueId);
            let categoriesArray = await Helpers.getCategories(UniqueId);

            if (categoriesArray.length > 0){
                for (let i = 0; i < categoriesArray.length; i++){
                    let customCollections = await Helpers.getCurrentCustomCollections();
                    for (let j = 0; j< customCollections.length; j++){
                        if (customCollections[j].title == categoriesArray[i].CategoryRef.Name){
                            await Helpers.connectCollection(res.data.product.id, customCollections[j].id);
                            break;
                        }
                       
                        if(customCollections[j].title != categoriesArray[i].CategoryRef.Name && j == customCollections.length -1){
                            await Helpers.createCustomCollection(res.data.product.id, categoriesArray[i].CategoryRef.Name);
                        }
                    }
                }
            }
        }

    }catch(error){
        console.log(`Failed to post product == `, error);
    }
}

const updateProduct = async (UniqueId) => {
    
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/partitem?id=' + UniqueId,
        headers: Helpers.headerOTInfo
    };
   
    try{

        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){

            let otResonse = res.data;
            let productId = otResonse.CustomFields[95].Value;
            let published = otResonse.CustomFields[96].Value;
            let actived = otResonse.IsActive;
            
            if(published == false || actived == false){
                console.log('item is not published');
                return;
            }

            console.log('productId ==', productId);
            let inventory = await Helpers.getInventoryOfItem(otResonse);

            let metaFields =  [
                {
                    key: 'uom',
                    value: otResonse.UomSetRef ? otResonse.UomSetRef.Name: null,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'category',
                    value: otResonse.CustomFields[7].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'assembly_style',
                    value: otResonse.CustomFields[34].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'base_style',
                    value: otResonse.CustomFields[74].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'blade_length',
                    value: otResonse.CustomFields[83].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'blade_material',
                    value: otResonse.CustomFields[84].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'bottom_diameter',
                    value: otResonse.CustomFields[36].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'bottom_length',
                    value: otResonse.CustomFields[44].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'bottom_width',
                    value: otResonse.CustomFields[47].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'capacity',
                    value: otResonse.CustomFields[38].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'casters',
                    value: otResonse.CustomFields[87].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'cbm',
                    value: otResonse.CustomFields[19].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'chemical_form',
                    value: otResonse.CustomFields[80].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'class',
                    value: otResonse.ClassRef ? otResonse.ClassRef.Name: null,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'coating',
                    value: otResonse.CustomFields[76].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'color',
                    value: otResonse.CustomFields[4].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'construction',
                    value: otResonse.CustomFields[72].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'container_size',
                    value: otResonse.CustomFields[69].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'depth',
                    value: otResonse.CustomFields[60].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'description_header',
                    value: otResonse.CustomFields[91].Value ? otResonse.CustomFields[91].Value.replace(/"/g, "&quot;") : '',
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'description_long_1',
                    value: otResonse.CustomFields[89].Value ? otResonse.CustomFields[89].Value.replace(/"/g, "&quot;") : '',
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'description_long_2',
                    value: otResonse.CustomFields[90].Value ? otResonse.CustomFields[90].Value.replace(/"/g, "&quot;") : '',
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'design',
                    value: otResonse.CustomFields[42].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'diameter',
                    value: otResonse.CustomFields[66].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'dilution_ratio',
                    value: otResonse.CustomFields[81].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'edge_style',
                    value: otResonse.CustomFields[45].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'features',
                    value: otResonse.CustomFields[39].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'flush_liquid_fill',
                    value: otResonse.CustomFields[67].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'flute_type',
                    value: otResonse.CustomFields[73].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'foil_weight',
                    value: otResonse.CustomFields[70].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'folded_length',
                    value: otResonse.CustomFields[56].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'folded_width',
                    value: otResonse.CustomFields[58].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'gauge',
                    value: otResonse.CustomFields[61].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'group',
                    value: otResonse.ItemGroupRef ? otResonse.ItemGroupRef.Name : null,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'gsm',
                    value: otResonse.CustomFields[86].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'gusset_style',
                    value: otResonse.CustomFields[75].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'gusset_width',
                    value: otResonse.CustomFields[54].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'handle',
                    value: otResonse.CustomFields[53].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'handle_material',
                    value: otResonse.CustomFields[85].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'height',
                    value: otResonse.CustomFields[32].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'interior_diameter',
                    value: otResonse.CustomFields[43].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'kosher_certification',
                    value: otResonse.CustomFields[78].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'length',
                    value: otResonse.CustomFields[30].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'lid_type',
                    value: otResonse.CustomFields[50].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'manufacturer',
                    value: otResonse.ManufacturerRef ? otResonse.ManufacturerRef.Name: "",
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'manufacturer_part_no',
                    value: otResonse.ManufacturerPartNo,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'material',
                    value: otResonse.CustomFields[6].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'maximum_temperature',
                    value: otResonse.CustomFields[77].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'maximum_yield',
                    value: otResonse.CustomFields[82].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'number_of_compartments',
                    value: otResonse.CustomFields[40].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'number_of_shelves',
                    value: otResonse.CustomFields[88].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'pallet_qty',
                    value: otResonse.CustomFields[0].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'pan_type',
                    value: otResonse.CustomFields[62].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'pattern',
                    value: otResonse.CustomFields[65].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'ply',
                    value: otResonse.CustomFields[55].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'powdered_or_powder_free',
                    value: otResonse.CustomFields[68].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'practical_fill_capacity',
                    value: otResonse.CustomFields[63].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'scent',
                    value: otResonse.CustomFields[79].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'shape',
                    value: otResonse.CustomFields[35].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'size',
                    value: otResonse.CustomFields[52].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'special_order',
                    value: otResonse.IsSpecialOrder,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'style',
                    value: otResonse.CustomFields[33].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'thickness',
                    value: otResonse.CustomFields[51].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_1_price',
                    value: otResonse.CustomFields[27].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_1_quantity',
                    value: otResonse.CustomFields[24].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_2_price',
                    value: otResonse.CustomFields[28].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_2_quantity',
                    value: otResonse.CustomFields[25].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_3_price',
                    value: otResonse.CustomFields[29].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_3_quantity',
                    value: otResonse.CustomFields[26].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'top_diameter',
                    value: otResonse.CustomFields[37].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'top_length',
                    value: otResonse.CustomFields[46].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'top_width',
                    value: otResonse.CustomFields[48].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'type',
                    value: otResonse.Type,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'unfolded_length',
                    value: otResonse.CustomFields[57].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'unfolded_width',
                    value: otResonse.CustomFields[59].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'usage',
                    value: otResonse.CustomFields[49].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'volume',
                    value: otResonse.Volume,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'weight',
                    value: otResonse.CustomFields[41].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'width',
                    value: otResonse.CustomFields[31].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'window',
                    value: otResonse.CustomFields[71].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'wrapped',
                    value: otResonse.CustomFields[64].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'burn_time',
                    value: otResonse.CustomFields[92].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'fuel_material',
                    value: otResonse.CustomFields[93].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'fuel_type',
                    value: otResonse.CustomFields[94].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                }
            ];

            let metaData = await Helpers.getMetafieldData(productId);
            if(metaData){
                let filteredFields = metaFields , updateFields = [];

                for ( let i = 0; i < metaData.length; i++){
                    filteredFields = filteredFields.filter((item) => item.key != metaData[i].key);
                    metaFields.filter(async (item) => {
                        if (item.key == metaData[i].key){
                            if (item.value != null && item.value != 'undefined'){
                                updateFields.push({id: metaData[i].id, value: item.value});
                            }else{
                                await Helpers.clearmetaFields(productId ,metaData[i].id);
                            }
                        }
                    });
                }
                
                console.log('updateFields == ', updateFields);
    
                let Data = JSON.stringify({
                    product:{
                        title: otResonse.Name,
                        body_html: otResonse.Description,
                        tags: otResonse.CustomFields[8].Value,
                        status: otResonse.IsActive == true ? "active": "draft",
                        variants: [
                            {
                                price: otResonse.Price,
                                compare_at_price: otResonse.StdCost,
                                weight: otResonse.Weight,
                                inventory_quantity: inventory
                            }
                        ],
                        metafields: filteredFields.concat(updateFields)
                    }
                });
                
                await upProduct(Data, productId, UniqueId);
            }
        } 

    }catch(error){
        console.log(error);
    }
}

const upProduct = async (Data, productId, UniqueId) => {

    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products/${productId}.json`,
        headers: Helpers.headerSHInfo,
        data: Data,
    };

    try{

        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            console.log(`Product is updated in `, productId);

            let categoriesArray = await Helpers.getCategories(UniqueId);
            let currentCollects = await Helpers.getCollectsOfProduct(productId);
            for (let a = 0; a < currentCollects.length; a++){
                await Helpers.deleteCollect(currentCollects[a].id);
            }

            if (categoriesArray.length > 0){
                for (let i = 0; i < categoriesArray.length; i++){
                    let customCollections = await Helpers.getCurrentCustomCollections();
                    for (let j = 0; j < customCollections.length; j++){
                        if (customCollections[j].title == categoriesArray[i].CategoryRef.Name.trim()){
                            await Helpers.connectCollection(productId, customCollections[j].id);
                            break;
                        }
                        if(customCollections[j].title != categoriesArray[i].CategoryRef.Name.trim() && j == customCollections.length -1){
                            await Helpers.createCustomCollection(productId, categoriesArray[i].CategoryRef.Name.trim());
                        }
                    }
                }
            }
        }

    }catch(error){
        console.log(`Failed to update product == `, error);
    }
}

const deleteProduct = async (UniqueId) => {
    
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/products.json?product_type=${UniqueId}`,
        headers: Helpers.headerSHInfo
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            let product = res.data.products;
            await Helpers.deProduct(product[0].id);
        }
    }catch(error){
        console.log(`Failed to update product == `, error);
    }
}

//shopify order to OrderTime
const postOrderToOT = async function(req,res){

    const body = await getRawBody(req);

    const hmac = req.get('X-Shopify-Hmac-Sha256');
    const hash = crypto.createHmac('sha256', process.env.SECRET_KEY).update(body, 'utf8', 'hex').digest('base64');
    
    if (hash !== hmac) {
        throw new HttpError('Danger! Not from Shopify!', 403);
    }

    const result = JSON.parse(body);
    // console.log(result);
    let customerName = '';
    let customerId = {id: ''};
    
    if(result.customer){
        customerName = result.customer.first_name + ' ' + result.customer.last_name;
        customerId = await getCustomerOrCreate(customerName, result);
    };
    
    let Line_Items = await getLineItems(result.line_items);

    let otData = JSON.stringify({ 
        CustomerRef: {
            Id: customerId.id,
            Name: customerName
        },
        ShipToRef: {
            Id: 1,
            Name: 'Primary'
        },
        Date: result.created_at,
        PromiseDate: result.created_at,   
        ShipAddress: {
            Addr1: result.shipping_address.address1,
            Addr2: result.shipping_address.address2,
            Addr3: "",
            Addr4: "",
            City: result.shipping_address.city,
            State: result.shipping_address.province,
            Zip: result.shipping_address.zip,
            Country: result.shipping_address.country,
            Contact: result.shipping_address.name,
            AltContact: result.shipping_address.company,
            Phone: result.shipping_address.phone,
            AltPhone: "",
            Fax: "",
            Email: result.email,
            Website: "",
            UpdateCustomerRecord: false
        }, 
        ShippingInstructions: result.note,
        CustomerPO: result.po_number,
        LineItems: Line_Items.length > 0 ? Line_Items: [],
        ShipAmount: result.shipping_lines.price,
        DiscountAmount: result.current_total_discounts,
        AdditionalFeeAmount: '',
        ShipMethodRef: {
            Id: '',
            Name: ''
        },
        ShipSalesTaxCodeRef:{
            Id: '',
            Name: ''
        },
        StatusRef: {
            Id: 117,
            Name: "Send to Printer"
        },
        CustomFields: [
            {
                Name: "SOCust3",
                Value: false,
                Caption: "Priority"
            },
            {
                Name: "SOCust6",
                Value: result.id,
                Caption: "SH order ID"
            }
        ]
    });

    console.log('otData ==', otData);
    
    await insertOrderToOT(otData);

    res.status(200).send("Success");
}

const getCustomerOrCreate = async (name, result) => {

    let data = JSON.stringify({
        "Type": 120,
        "Filters": [
          {
            "PropertyName": "CompanyName",
            "Operator": 1,
            "FilterValueArray": name
          }
        ],
        "PageNumber": 1,
        "NumberOfRecords": 20
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
            if (res.data.length > 0)
            {
                return {status: true, id: res.data[0].Id};
            }
            else{
                return await createCustomer(result);
            }
        }
        
    }catch(error){
        console.log(error);
    }
}

const createCustomer = async (result) => {

    let data = JSON.stringify({
        Name: result.customer.first_name + ' ' + result.customer.last_name,
        IsActive: true,
        CompanyName: result.customer.first_name + ' ' + result.customer.last_name,
        PrimaryContact: {
            Salutation:"Mr." ,
            FirstName: result.customer.first_name,
            MiddleName:" " ,
            LastName: result.customer.last_name
        },
        BillAddress: {           
            Name: result.billing_address.name,
            Addr1: result.billing_address.address1,
            Addr2: result.billing_address.address2,
            Addr3: "",
            Addr4:"" ,
            City: result.billing_address.city,
            State: result.billing_address.province,
            Zip: result.billing_address.zip,
            Email: result.email,    
        },
        PrimaryShipAddress: {           
            Name: result.shipping_address.name,
            Addr1: result.shipping_address.address1,
            Addr2: result.shipping_address.address2,
            Addr3: "",       
            City: result.shipping_address.city,
            State: result.shipping_address.province,
            Zip: result.shipping_address.zip,      
            Email: result.email    
        },
        SalesTaxCodeRef: {
            Id: 3,
            Name: "Non"
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/customer',
        headers: Helpers.headerOTInfo,
        data : data
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            return {status: false, id: res.data.Id}
        }
    }catch(error){
        console.log(error);
    } 
}

const getLineItems = async (result) => {
    
    let lineItemArray = [];
    let itemData = {};

    for (let i = 0; i < result.length; i++){
        
        let itemId = await IdOfOTItem(result[i].name);
        
        if (itemId != 0){
            itemData = {
                $type: "AOLib7.SalesOrderLineItem, AOLib7",           
                ItemRef: {
                    Id: itemId,
                    Name: result[i].name
                },
                Description: `Product Id: ${result[i].product_id}, Sku: ${result[i].sku}`,
                Price: result[i].price - (result[i].discount_allocations.length > 0 ? result[i].discount_allocations[0].amount / result[i].quantity : 0),
                // SalesTaxCodeRef: {
                //     Id: 12,
                //     Name: "Non"
                // },         
                Quantity: result[i].quantity,          
                CustomFields: [
                    {
                        Name: "SOICust20",
                        Value: result[i].id,
                        Caption: "Line Item ID"
                    }
                ]
            };
        }

        lineItemArray.push(itemData);
    }

    return lineItemArray;
}

const IdOfOTItem = async (name) => {

    let data = JSON.stringify({
        "Type": 101,
        "Filters": [
          {
            "PropertyName": "Name",
            "Operator": 1,
            "FilterValueArray": name
          }
        ],
        "PageNumber": 1,
        "NumberOfRecords": 20
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
            if (res.data.length > 0)
            {
                return res.data[0].Id;
            }else{
                return 0;
            }
        }
    }catch(error){
        console.log(error);
    }
}

const insertOrderToOT = async (data) => {

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.ORDERTIME_ENDPOINT_URL + '/salesorder',
        headers: Helpers.headerOTInfo,
        data : data
    };

    try{
        const res = await axios.request(config);
        if (res.status == 200 || res.status == 201){
            console.log('New Sale Order Imported to OT');
        }
    }catch(error){
        console.log(error);
    }
};

//order fulfilment sync with shopify
const postOrderStatusToSH = async (UniqueId) => {

    let shipdoc = await Helpers.getShipdoc(UniqueId);
    let shOrderID = 0;

    if (shipdoc){
        let salesOrder = await Helpers.getSalesOrder(shipdoc.SONo);
        shOrderID = salesOrder.CustomFields[5].Value;
        console.log('Shopify Order ID = ', shOrderID);
        let fulfillment_orders = await Helpers.getFulFillmentOrder(shOrderID);
        let fulfillment_order_id = fulfillment_orders.id;
        let packages = await Helpers.getPackages(UniqueId);
        let solineItems = salesOrder.LineItems;
        let fulfilLineItems = fulfillment_orders.line_items;

        for (let i = 0; i < packages.length; i++){
            let tracking_number = packages[i].TrackingNo;
            let orderPackageIDs = [];
            let packageDetails = packages[i].Details;
            for (let j = 0; j < packageDetails.length; j++){
                for(let k = 0; k < solineItems.length; k++){
                    if(packageDetails[j].ItemRef.Id == solineItems[k].ItemRef.Id){
                        orderPackageIDs.push(solineItems[k].CustomFields[19].Value);
                    }
                }
            }
            let order_line_items = [];
            for (let a = 0; a < fulfilLineItems.length; a++){
                if(orderPackageIDs.includes(`${fulfilLineItems[a].line_item_id}`)){
                    order_line_items.push({
                        id: fulfilLineItems[a].id,
                        quantity: fulfilLineItems[a].quantity
                    });
                }
            }
            console.log('order_line_items = ', order_line_items);
            await syncFulfillment(fulfillment_order_id, tracking_number, order_line_items);
        }
    }
}

const syncFulfillment = async (fulfillment_order_id, tracking_number, order_line_items) => {

    let data = JSON.stringify({
        fulfillment: {
          line_items_by_fulfillment_order: [
            {
              fulfillment_order_id: fulfillment_order_id,
              fulfillment_order_line_items: order_line_items
            }
          ],
          tracking_info: {
            number: tracking_number
          }
        }
      });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${process.env.SHOPIFY_LINK}/admin/api/${process.env.API_VERSION}/fulfillments.json`,
        headers: Helpers.headerSHInfo,
        data: data
    };

    try{
        const res = await axios.request(config);
        if(res.status == 200 || res.status == 201){
            console.log('Order Fulfilment Status changed~!');
        }
    }catch(error){
        console.log(error);
    }
}

exports.getWebhookData = getWebhookData;
exports.postOrderToOT = postOrderToOT;