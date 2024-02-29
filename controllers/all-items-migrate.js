const axios = require('axios');
const Helpers = require('../models/helpers.js');
require('dotenv').config();

let idx=0;

async function postProduct() {
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
                let otRes = res.data;
                console.log('otRes Length = ',otRes.length);

                await insertProductFunc(otRes,0);
                
                if(otRes.length < 1000){
                    break;
                }
            }

        }catch(error){
            console.log(error);
        }
    }
};

async function insertProductFunc(otRes,j){
    let shData = JSON.stringify({
        product:{
            title: otRes[j].Name,
            body_html: `${otRes[j].Description}`,
            vendor: otRes[j].PrefVendorRef? otRes[j].PrefVendorRef.Name: '',
            product_type: otRes[j].Id,
            created_at: otRes[j].RecordInfo.CreatedDate,
            tags: otRes[j].CustomFields[8].Value,
            status: otRes[j].IsActive == true ? "active": "draft",
            variants: [
                {
                    price: otRes[j].Price,
                    sku: otRes[j].UPC,
                    compare_at_price: otRes[j].StdCost,
                    weight: otRes[j].Weight,
                    weight_unit: 'kg',
                    inventory_quantity: otRes[j].MaxQty
                }
            ],
            metafields: [
                {
                    key: 'uom',
                    value: otRes[j].UomSetRef ? otRes[j].UomSetRef.Name: null,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'category',
                    value: otRes[j].CustomFields[7].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'assembly_style',
                    value: otRes[j].CustomFields[34].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'base_style',
                    value: otRes[j].CustomFields[74].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'blade_length',
                    value: otRes[j].CustomFields[83].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'blade_material',
                    value: otRes[j].CustomFields[84].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'bottom_diameter',
                    value: otRes[j].CustomFields[36].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'bottom_length',
                    value: otRes[j].CustomFields[44].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'bottom_width',
                    value: otRes[j].CustomFields[47].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'capacity',
                    value: otRes[j].CustomFields[38].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'casters',
                    value: otRes[j].CustomFields[87].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'cbm',
                    value: otRes[j].CustomFields[19].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'chemical_form',
                    value: otRes[j].CustomFields[80].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'class',
                    value: otRes[j].ClassRef ? otRes[j].ClassRef.Name: null,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'coating',
                    value: otRes[j].CustomFields[76].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'color',
                    value: otRes[j].CustomFields[4].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'construction',
                    value: otRes[j].CustomFields[72].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'container_size',
                    value: otRes[j].CustomFields[69].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'depth',
                    value: otRes[j].CustomFields[60].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'description_header',
                    value: otRes[j].CustomFields[91].Value ? otRes[j].CustomFields[91].Value.replace(/"/g, "&quot;"): '',
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'description_long_1',
                    value: otRes[j].CustomFields[89].Value ? otRes[j].CustomFields[89].Value.replace(/"/g, "&quot;") : '',
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'description_long_2',
                    value: otRes[j].CustomFields[90].Value ? otRes[j].CustomFields[90].Value.replace(/"/g, "&quot;") : '',
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'design',
                    value: otRes[j].CustomFields[42].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'diameter',
                    value: otRes[j].CustomFields[66].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'dilution_ratio',
                    value: otRes[j].CustomFields[81].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'edge_style',
                    value: otRes[j].CustomFields[45].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'features',
                    value: otRes[j].CustomFields[39].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'flush_liquid_fill',
                    value: otRes[j].CustomFields[67].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'flute_type',
                    value: otRes[j].CustomFields[73].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'foil_weight',
                    value: otRes[j].CustomFields[70].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'folded_length',
                    value: otRes[j].CustomFields[56].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'folded_width',
                    value: otRes[j].CustomFields[58].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'gauge',
                    value: otRes[j].CustomFields[61].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'group',
                    value: otRes[j].ItemGroupRef ? otRes[j].ItemGroupRef.Name : null,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'gsm',
                    value: otRes[j].CustomFields[86].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'gusset_style',
                    value: otRes[j].CustomFields[75].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'gusset_width',
                    value: otRes[j].CustomFields[54].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'handle',
                    value: otRes[j].CustomFields[53].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'handle_material',
                    value: otRes[j].CustomFields[85].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'height',
                    value: otRes[j].CustomFields[32].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'interior_diameter',
                    value: otRes[j].CustomFields[43].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'kosher_certification',
                    value: otRes[j].CustomFields[78].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'length',
                    value: otRes[j].CustomFields[30].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'lid_type',
                    value: otRes[j].CustomFields[50].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'manufacturer',
                    value: otRes[j].ManufacturerRef ? otRes[j].ManufacturerRef.Name: "",
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'manufacturer_part_no',
                    value: otRes[j].ManufacturerPartNo,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'material',
                    value: otRes[j].CustomFields[6].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'maximum_temperature',
                    value: otRes[j].CustomFields[77].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'maximum_yield',
                    value: otRes[j].CustomFields[82].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'number_of_compartments',
                    value: otRes[j].CustomFields[40].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'number_of_shelves',
                    value: otRes[j].CustomFields[88].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'pallet_qty',
                    value: otRes[j].CustomFields[0].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'pan_type',
                    value: otRes[j].CustomFields[62].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'pattern',
                    value: otRes[j].CustomFields[65].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'ply',
                    value: otRes[j].CustomFields[55].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'powdered_or_powder_free',
                    value: otRes[j].CustomFields[68].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'practical_fill_capacity',
                    value: otRes[j].CustomFields[63].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'scent',
                    value: otRes[j].CustomFields[79].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'shape',
                    value: otRes[j].CustomFields[35].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'size',
                    value: otRes[j].CustomFields[52].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'special_order',
                    value: otRes[j].IsSpecialOrder,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'style',
                    value: otRes[j].CustomFields[33].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'thickness',
                    value: otRes[j].CustomFields[51].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_1_price',
                    value: otRes[j].CustomFields[27].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_1_quantity',
                    value: otRes[j].CustomFields[24].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_2_price',
                    value: otRes[j].CustomFields[28].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_2_quantity',
                    value: otRes[j].CustomFields[25].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_3_price',
                    value: otRes[j].CustomFields[29].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'tier_3_quantity',
                    value: otRes[j].CustomFields[26].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'top_diameter',
                    value: otRes[j].CustomFields[37].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'top_length',
                    value: otRes[j].CustomFields[46].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'top_width',
                    value: otRes[j].CustomFields[48].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'type',
                    value: otRes[j].Type,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'unfolded_length',
                    value: otRes[j].CustomFields[57].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'unfolded_width',
                    value: otRes[j].CustomFields[59].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'usage',
                    value: otRes[j].CustomFields[49].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'volume',
                    value: otRes[j].Volume,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'weight',
                    value: otRes[j].CustomFields[41].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'width',
                    value: otRes[j].CustomFields[31].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'window',
                    value: otRes[j].CustomFields[71].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'wrapped',
                    value: otRes[j].CustomFields[64].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'burn_time',
                    value: otRes[j].CustomFields[92].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'fuel_material',
                    value: otRes[j].CustomFields[93].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                },
                {
                    key: 'fuel_type',
                    value: otRes[j].CustomFields[94].Value,
                    type: 'single_line_text_field',
                    namespace: 'custom'
                }
            ]
        }
    });
    Helpers.sleep(1000);
    idx++;
    console.log(idx);

    await insertProduct(shData, otRes[j].Id);
    j++;
    if(j < otRes.length){
        await insertProductFunc(otRes,j);
    }
}
const insertProduct = async (shData, itemId) => {

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
            await Helpers.importproductIdToOT(res.data , itemId);

            let categoriesArray = await Helpers.getCategories(itemId);

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

postProduct();