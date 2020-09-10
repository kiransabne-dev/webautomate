const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');

const databaseConfig = require('./config/databaseConfig');
// firefox = require('selenium-webdriver/firefox');

// var ffProfileFile = require('./ffprofile');
// var ffProfile = new firefox.Profile(ffProfileFile['ffprofile']);
// var ffOptions = new firefox.Options().setProfile(ffProfile);

//  browserHandle = new firefox.Driver(ffOptions);
const linkIncrementBy = 9;

(async function example() {
  // database connection
  const pgClient = await databaseConfig.pgPool.connect()
  // console.log("pgClient -> ", pgClient);

  let driver = await new Builder().forBrowser('firefox').withCapabilities(Capabilities.firefox().setAcceptInsecureCerts(true)).build();

 // let driver = await new Builder().withCapabilities(Capabilities.firefox().setAcceptInsecureCerts(true)).forBrowser('firefox').build();
  try {
    await driver.get('https://main.sci.gov.in/judgments');
    await driver.wait(until.elementLocated(By.xpath("/html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/ul[2]/li[7]")));
    //await driver.wait(t)
    await driver.wait(until.elementIsVisible(driver.findElement(By.xpath("/html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/ul[2]/li[7]"))));
    await driver.sleep(2500)
    await driver.findElement(By.xpath("/html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/ul[2]/li[7]")).click();
   
    
    await driver.sleep(40000)
    let value = await driver.findElement(By.xpath('//*[@id="ansCaptcha"]')).getAttribute("value")
    
    console.log("value -> ", value)
    if (value != "") {
      console.log("Captcha input box is filled ", value)
      await driver.findElement(By.xpath('//*[@id="v_getJCB"]')).click()
      //*[@id="v_getJCB"]
      // wait for table to load
      await driver.wait(until.elementLocated(By.xpath('//*[@id="dv_include"]')))
      //await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//*[@id="dv_include"]'))))
      
      // get upper bound of the table list 
      let upperBound = await driver.findElement(By.xpath('//*[@id="sp_nf"]')).getText();

      console.log("upperBound =>> ", upperBound);

      // loop to get data from table
      let linkFirstNumberStart = 2;
      let firstDiaryNumber = 1;
      let firstPetitionerNumeber = 3;
      let firstRespondentNumber = 4;
      for(let i = 0; i < upperBound; i++){
        console.log("currentBound -> ", i)

        let hreftext = await driver.findElement(By.xpath('/html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody/tr['+linkFirstNumberStart+']/td[3]/a[1]')).getAttribute("href")
        //hreftext.click()

        console.log("hreftext -> ", hreftext);

        // diaRy Number
        let diaryNumber = await driver.findElement(By.xpath('/html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody/tr['+firstDiaryNumber+']/td[3]')).getText();

        console.log("DiaryNumber -> ", diaryNumber)
        // petitioner name
        let petitionerName = await driver.findElement(By.xpath('/html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody/tr['+firstPetitionerNumeber+']/td[2]')).getText();

        console.log("PetitionerName -> ", petitionerName)
        // responsedent name
        let respondentName = await driver.findElement(By.xpath('/html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody/tr['+firstRespondentNumber+']/td[2]')).getText();
        console.log("respondentName -> ", respondentName)

        





        linkFirstNumberStart = linkFirstNumberStart + linkIncrementBy;
        firstDiaryNumber = firstDiaryNumber + linkIncrementBy;
        firstPetitionerNumeber = firstPetitionerNumeber + linkIncrementBy;
        firstRespondentNumber = firstRespondentNumber + linkIncrementBy;

        const text = 'insert into filesdb(dairyNumber, petitionerName, respondentName, hrefText, fileType) values ($1, $2, $3, $4, $5) returning id'
        let values = [diaryNumber, petitionerName, respondentName, hreftext, 'Const'];

        pgClient.query(text, values).then(function(res){
          console.log("res -> ", res.rows[0].id);
        }).catch(function(err){
          console.log("insert err -> ", err)
          return
        })
      }
      // getting first href link 
      

      // /html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody/tr[11]/td[3]/a[1]

      // /html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody/tr[20]/td[3]/a[1]

      await driver.sleep(600000)
    }
    // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    // await driver.wait(until.titleIs('webdriver - Google Search'));
  } finally {
    await driver.quit();
  }
})();
///html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody/tr[2]/td[3]/a[1]

// /html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody

// /html/body/div[2]/div[2]/div/div/div[1]/div/div/div/div/div/div/div/div/div/div/div/div[7]/div/div/div[2]/table/tbody/tr[2]/td[3]/a[2]