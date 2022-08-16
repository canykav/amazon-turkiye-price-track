const cheerio = require('cheerio');
const axios = require('axios').default;
const mongoose = require('mongoose');

const { amazon } = require('./models/amazon');

const mongoUri = "mongodb://localhost:27017/trackings";
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:103.0) Gecko/20100101 Firefox/103.0'
];
const mainLink = "https://www.amazon.com.tr/s?i=";
mongoose.connect(mongoUri);

(async () => {
    var categories = [
        // 'computers&bbn=17486328031&rh=n%3A12466439031%2Cn%3A12601896031%2Cn%3A17486328031%2Cn%3A12601984031&dc&fs=true', // Dahili SSD 
        // 'computers&bbn=12601951031&rh=n%3A12466439031%2Cn%3A12601896031%2Cn%3A17486328031%2Cn%3A12601951031%2Cp_89%3AASUS%7CAfox%7CGIGABYTE%7CMSI%7CPNY%7CSapphire%7CZOTAC&dc&fs=true', // Ekran Kartı
        // 'computers&bbn=12601955031&rh=n%3A12466439031%2Cn%3A12601896031%2Cn%3A17486328031%2Cn%3A12601955031%2Cp_89%3AAMD%7CAmd%7CIntel&dc&fs=true', // İşlemci (İntel ve AMD filtreli)
        // 'computers&bbn=12601894031&rh=n%3A12466439031%2Cn%3A12601894031%2Cn%3A12601919031&dc&fs=true', // Çevre Birimleri (Klavye - fare vs.)
        'computers&bbn=12466440031&rh=n%3A12466439031%2Cn%3A12601898031&dc&fs=true', // Dizüstü bilgisayar
        // 'grocery&rh=n%3A22380417031&fs=true', // Baklagiller ve Makarnalar
        // 'grocery&bbn=21680148031&rh=n%3A21680147031%2Cn%3A22380414031&dc&fs=true', // İçeçekler, Çay ve kahveler
        // 'grocery&bbn=21680148031&rh=n%3A21680147031%2Cn%3A22380418031&dc&fs=true', // Kahvaltılık Gevrekler ve Müsliler
        // 'grocery&bbn=21680148031&rh=n%3A21680147031%2Cn%3A22380405031&dc&fs=true', // Reçeller, Ballar ve Ezmeler
        // 'grocery&bbn=21680148031&rh=n%3A21680147031%2Cn%3A22380420031&dc&fs=true', // Soslar ve Salçalar
        // 'grocery&bbn=21680148031&rh=n%3A21680147031%2Cn%3A22380413031&dc&fs=true', // Tatlı ve Tuzlu Atıştırmalıklar
        // 'grocery&bbn=21680148031&rh=n%3A21680147031%2Cn%3A22380415031&dc&fs=true', // Yağlar, Sirkeler ve Salata Sosları
        // 'hpc&bbn=13525984031&rh=n%3A12466610031%2Cn%3A13525984031%2Cn%3A13526016031&dc&fs=true', // Diş Macunları
        // 'hpc&bbn=12466611031&rh=n%3A12466610031%2Cn%3A20991233031&dc&fs=true', // Deterjan, Ev Bakım ve Temizlik Ürünleri
        // 'hpc&bbn=12466611031&rh=n%3A12466610031%2Cn%3A13526006031&dc&fs=true', // Vitaminler, Mineraller ve Takviyeler
        // 'kitchen', 
    ];
    
    for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
    //     if(categories[categoryIndex+1]) {
    //         await Promise.all([trackCategory(categories[categoryIndex]),trackCategory(categories[categoryIndex+1]) ]);
    //     } else {
            await trackCategory(categories[categoryIndex]);
    //     }
    }

    process.exit();
})();

async function trackCategory(category) {
    let categoryUrl = mainLink + category;
    let categorysLastPage = await getLastPage(categoryUrl+'&page=2');

    for (let pageIndex = 1; pageIndex < categorysLastPage; pageIndex++) {
        await trackPage(categoryUrl, pageIndex);
    }

    return Promise.resolve();
}

async function trackPage(categoryUrl, pageIndex) {
    let products = await getProductsInPage(categoryUrl+'&page=' +pageIndex);

    if(products == null) {
        return;
    }

    let productArray = [];
    
    for (let i = 0; i < products.length; i++) {
        let price = getProductPrice(products[i]);

        if(price) {
            let url = getProductURL(products[i]);
            let code = getProductCode(url);
            let title = getProductTitle(products[i]);

            productArray.push({
                url: url,
                code : code,
                price : price,
                title : title,
                date : new Date().toISOString().slice(0,10)
            });    
        } 
    }

    amazon.insertMany(productArray).then(function(){
        console.log(categoryUrl + ' ' +pageIndex + " saved")  
    }).catch(function(error){
        console.log(error)
    }); 
}

/**
 * 
 * @param {string} categoryUrl 
 * @returns integer (page number)
 */
async function getLastPage(categoryUrl) {
    let categorysFirstPage = categoryUrl + "&page=2";

    let content = await axios.get(categorysFirstPage,{ 
        headers: { 'User-Agent': userAgents[Math.floor(Math.random() * 2)] }  
    }).catch(function (error) {
        console.log('Amazon redirected error page.');
        setTimeout(()=>{}, 1000);

        return null;   
    });

    if(content == null) {
        return null;
    }

    let $ = cheerio.load(content.data);
    let lastPage = $('#search .s-pagination-strip span.s-pagination-item.s-pagination-disabled').html();

    return lastPage;
}

/**
 * 
 * @param {string} currentPage 
 * @returns array including html content per item
 */
async function getProductsInPage(currentPage) {
    let content = await axios.get(currentPage,{ 
        headers: { 'User-Agent': userAgents[Math.floor(Math.random() * 2)] }  
    }).catch(function (error) {
        console.log('Amazon redirected error page.');
        setTimeout(()=>{}, 1000);

        return null;   
    });

    if(content == null) {
        return null;
    }

    let $ = cheerio.load(content.data);

    let productContents = [];
    $("[data-component-type='s-search-result']").each(function(){
        productContents.push($($(this).contents()[0]).html());
    });

    return productContents;
}

/**
 * 
 * @param {*} productContent HTML data
 * @returns float (price)
 */
function getProductPrice(productContent) {
    let $ = cheerio.load(productContent);
    let price = null;
    price = $('span.a-price span').html();

    if(price) {
        price = price.replace("TL", "").replace(".", "").replace(",", ".");
        price = price.replace('&nbsp;','').trim();        
    }

    return price;
}

function getProductTitle(productContent) {
    let $ = cheerio.load(productContent);
    let title = $('span.a-size-base-plus').html();

    return title;
}

function getProductURL(productContent) {
    let $ = cheerio.load(productContent);
    let url = 'https://amazon.com.tr'+$('h2.a-size-mini .a-link-normal').attr('href');

    return url;
}

function getProductCode(productURL) {
    return productURL.split("/")[5]
}