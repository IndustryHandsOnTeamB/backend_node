const express = require('express')
const app = express()
const port = 8080

const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
//데이터를 분석해서 가져온다.
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
var chromeCapabilities = Capabilities.chrome();
var chromeOptions = {
    'args': ['--headless', '--no-sandbox', "--disable-dev-shm-usage"]
};
chromeCapabilities.set('chromeOptions', chromeOptions);
const chromeDriver = require('selenium-webdriver/chrome');
const path = require('chromeDriver').path;
const service = new chromeDriver.ServiceBuilder(path).build();
chromeDriver.setDefaultService(service);


app.get('/', (req, res) => res.status(200).json({
    "result":""
}))


app.post('/api/crawling/interest', async (req, res) =>{
    //직업 흥미검사
    const URL = req.body.url;
    let result = {};
    let driver = await new Builder().withCapabilities(chromeCapabilities).forBrowser('chrome').build()
    
    try {
        await driver.manage().setTimeouts( { implicit: 6000 } );
        await driver.get(URL);
        let categoryArray = [];
        let categories = await driver.findElements(By.css('.tit_bar'));
        let jobs = await driver.findElements(By.css('.list_category'));
        for(let e of categories){
            const category = await e.getText();
            result[category] = [];
            await categoryArray.push(category);
        }
        for(let i = 0 ; i<categoryArray.length ; i++){
            const categoryName = categoryArray[i];
            const jobUl = await jobs[i].findElements(By.css(".link_txt"));
            for(let jobLi of jobUl){
                const jobName = await jobLi.getText()
                result[categoryName].push(jobName);
            }
        }
    } finally {
        await driver.quit();
    }
    console.log(result);
    return res.status(200).json({
        result:result
    });
})
app.post('/api/crawling/engineering', async (req, res) =>{
    //이공계적합도 검사
    const URL = req.body.url;
    let result = {};
    
    let driver = await new Builder().withCapabilities(chromeCapabilities).forBrowser('chrome').build()
    try {
        await driver.manage().setTimeouts( { implicit: 6000 } );
        await driver.get(URL);
        let categoryArray = [];
        let categories = await driver.findElements(By.css('.list_desc'));
        for(let e of categories){
            const dt = await (await e.findElement(By.css('dt'))).getText();
            const dd = await (await e.findElement(By.css('dd'))).getText();
            result[dt] = dd;
        }
    } finally {
        await driver.quit();
    }
    console.log(result);
    return res.status(200).json({
        result:result
    });
})
app.post('/api/crawling/value', async (req, res) =>{
    //직업가치관 검사
    const URL = req.body.url;
    let result = {};
    
    let driver = await new Builder().withCapabilities(chromeCapabilities).forBrowser('chrome').build()
    try {
        await driver.manage().setTimeouts( { implicit: 6000 } );
        await driver.get(URL);
        let values = [];
        let categories = await driver.findElements(By.css('.emph_b'));
        for(let i = 2 ; i<categories.length ; i++){
            const value = await categories[i].getText();
            values.push(value);
        }
        result["value"] = values;

        let jobs = {};
        let groups = await driver.findElements(By.css('.tbl_result'));
        let tr = await groups[2].findElements(By.css("tbody tr"));
        for(let i = 0 ; i<tr.length ; i++){
            let tds = await tr[i].findElements(By.css('td'));
            const field = await tds[0].getText();
            jobs[field] = [];
            const links = await tds[1].findElements(By.css('.link_job'));
            for(let j =0 ; j<links.length ; j++){
                const link = await links[j].getText();
                jobs[field].push(link);
            }
        }
        result["jobs"] = jobs;
    } finally {
        await driver.quit();
    }
    console.log(result);
    return res.status(200).json({
        result:result
    });
})
app.post('/api/crawling/vocation', async (req, res) =>{
    //직업적성검사
    const URL = req.body.url;
    let result = {};
    
    let driver = await new Builder().withCapabilities(chromeCapabilities).forBrowser('chrome').build()
    try {
        await driver.manage().setTimeouts( { implicit: 10000 } );
        await driver.get(URL);
        let tables = await driver.findElements(By.css('.aptitude-tbl-list'));
        let trs = await tables[2].findElements(By.css('tbody'));
        for(let i = 0 ; i<3 ; i++){
            const th = await (await trs[i].findElement(By.css('.line-top th'))).getText();
            result[th] = [];
            const jobs = await trs[i].findElements(By.css('.link_job'));
            for(let j = 0 ; j<jobs.length ; j++){
                const job = await jobs[j].getText();
                result[th].push(job);
            }
        }
    } finally {
        await driver.quit();
    }
    console.log(result);
    return res.status(200).json({
        result:result
    });
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
