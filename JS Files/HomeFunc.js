/// <reference path="jquery-3.6.2.js"/>


/*General comment:
    All the place that calls the array "chooseCoinsSymbols" do it for the data of the graphs in the "Live-Report" page*/
    
$(()=>{   
    //Onload page---display coins and get the chosen coins from local-storage
    let chooseCoins=[] 
    let chooseCoinsSymbols=[] 
    if(getFromLocalStorage("chooseCoins"))
        chooseCoins=getFromLocalStorage("chooseCoins")
    if(getFromLocalStorage("chooseCoinsSymbols"))
        chooseCoinsSymbols=getFromLocalStorage("chooseCoinsSymbols")

    //Display progress-bar while loading the coins
    let html=`
        <div class="ring">Loading
            <span></span>
        </div>`       
    $("#home").html(html)

    getCoin() 
    
    function getAJAX(url){
        return new Promise((resolve, reject)=>{
            $.ajax({
                url,
                success: data => resolve(data),
                error: err => reject(err)        
            })
        })        
    }

    let coins=[]
    //Get coins from server
    async function getCoin(){
        try {
            coins= await getAJAX("https://api.coingecko.com/api/v3/coins/")            
            displayCoins(coins)
            //Set the past-choose-coins on status of "checked"
            checkedChooseCoins()
        } 
        catch (err) {
            alert(err.message)
        }              
    } 

    function displayCoins(coins){
        let cards=""
        //Create card from each coin
        for(let coin of coins){
            cards+=createCard(coin)                                                                    
        }
        $("#home").html(cards)
        //Get random background for each card
        $("#home").children(".card").each(function(){
            const cardRandomBackground=Math.floor(Math.random()*8)
            $(this).css("background-image", `url(images/card_${cardRandomBackground}.jpg)`)
        })             
    }

    function createCard(coin){
        let cardContent=`<div class="card" id="${coin.id}">
                            <div class="checkCard position-absolute top-0 end-0" id="${coin.id}">
                                <label class="switch switch200">
                                <input class="checkInput" type="checkbox" id="${coin.id}" data-coin-symbol="${coin.symbol}">
                                <span class="slider slider200"></span>        
                            </div>
                            <img src="${coin.image.small}"/>
                            <h4>${coin.symbol}</h4>
                            <span><strong>${coin.name}</strong></span>
                            <br>
                            <button id=${coin.id} class="moreInfoButton btn btn-outline-warning" data-bs-toggle="collapse" data-bs-target="#moreInfo_${coin.id}" aria-expanded="false" aria-controls="moreInfo_${coin.id}">More Info</button>
                            <br><br>
                            <div class="collapse" id="moreInfo_${coin.id}">                                
                                <div class="moreInfoArea">
                                    <div class="loader">
                                        <div class="face">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="face">
                                            <div class="circle"></div>
                                        </div>
                                    </div>                                                                                                   
                                </div>
                            </div>
                        </div>`  
        return cardContent                                
    } 

    function checkedChooseCoins(){        
        if(chooseCoins){
            //Set all the coins on false-status
            $("#home").children(".card").children(".checkCard").each(function(){                                    
                $(this).children(".switch").children("input").prop("checked",false)                                    
            })   
            //Set the chosen-coins on true-status
            for(const coinId of chooseCoins){ 
                $("#home").children(".card").children(".checkCard").each(function(){                    
                    if(this.id===coinId) { 
                        $(this).children(".switch").children("input").prop("checked",true)
                    }                    
                })                           
            }
            let coinsSymbols=[]
            $("#home").children(".card").children(".checkCard").children(".switch").children("input").each(function(){
                if($(this).is(":checked")){
                   const symbol=$(this).attr("data-coin-symbol")
                   coinsSymbols.push(symbol)
                   saveLocalStorage("chooseCoinsSymbols",coinsSymbols)
                }
            })
        }            
    }
    
    //Change the status-checked of the coins by event of "change"
    $("#home").on("change","input", function(){        
        if($(this).is(":checked")){
            //Choose only 5 coins
            if(chooseCoins.length<5){
                chooseCoins.push(this.id)
                const symbol=$(this).attr("data-coin-symbol")
                chooseCoinsSymbols.push(symbol)
                saveLocalStorage("chooseCoins",chooseCoins)
                saveLocalStorage("chooseCoinsSymbols",chooseCoinsSymbols)
            }
            else{                
                //Set the input on unchecked-status
                $(this).prop("checked", false)
                //Open modal for choose coins
                displayModalBody(this.id)
                $(".modal").modal("show")                                                
            }
        }            
        else{  
            //Delete the coin from array and localStorage when the user unchecked it          
            const indexName=chooseCoins.findIndex(id => id===this.id)
            chooseCoins.splice(indexName,1)
            const indexSymbol=chooseCoinsSymbols.findIndex(coinSymbol => coinSymbol===$(this).attr("data-coin-symbol"))
            chooseCoinsSymbols.splice(indexSymbol,1)
            saveLocalStorage("chooseCoins",chooseCoins)
            saveLocalStorage("chooseCoinsSymbols",chooseCoinsSymbols)
        }                
    })
    
    chooseOnlyFiveOnModal()    
    modalSaveButton() 

    //Open the more-info-area
    $("#home").on('shown.bs.collapse', ".collapse", function(){                
        const coin=this.id.split("_")[1]
        getMoreInfo(coin)
    })

    //Get the more-info from server/storage
    async function getMoreInfo(coin){
        //Get info from storage
        const info=getInfo(coin)
        if(info){
            const price=info.split(", ")
            const usd=price[0]
            const eur=price[1]
            const ils=price[2]
            displayMoreInfo(usd, eur, ils, coin)
        }
        else{
            //Get info from server
            try {
                const info= await getAJAX(`https://api.coingecko.com/api/v3/coins/${coin}`)
                const currentPrice=info.market_data.current_price
                const usd=currentPrice.usd 
                const eur=currentPrice.eur         
                const ils=currentPrice.ils            
                displayMoreInfo(usd, eur, ils, coin) 
                saveInfo(usd, eur, ils, coin)                      
            } 
            catch (error) {
                alert(err.message)
            }
        }
    }

    function displayMoreInfo(usd, eur, ils, coin){        
        const moreInfo=`<div>
                            <span class="priceSpan">
                                <img src="images/usd.png" class="priceSymbol"/>
                                <p>${usd}</p>
                            </span>
                            <span class="priceSpan">
                                <img src="images/eur.png" class="priceSymbol"/>
                                <p>${eur}</p>
                            </span>
                            <span class="priceSpan">
                                <img src="images/ils.png" class="priceSymbol"/>
                                <p>${ils}</p>
                            </span>                            
                        </div>`
        $("#home").children(".card").children(`#moreInfo_${coin}`).children(".moreInfoArea").html(moreInfo)
    }

    function saveInfo(usd, eur, ils, coin){
        const itemToSave=`${usd}, ${eur}, ${ils}`        
        localStorage.setItem(coin, JSON.stringify(itemToSave))
        setTimeout(()=>{
            //Delete info from storage after 2 minutes
            localStorage.setItem(coin, "")
        }, 2*60*1000)
    }

    function getInfo(coin){
        const info=localStorage.getItem(coin)           
        if(info)
            return JSON.parse(info)
        else{
            return false
        }
    }  

    function displayModalBody(falseCheckedCoin){
        let modalContent=   "<p>Atantion! you can choose only 5 coins!!</p>"
        //Display in modal the five chosen coins
        for(const coin of chooseCoins){
            const symbol=$("#home").children(`#${coin}`).children("img").attr("src")
            modalContent+=  `<div class="chooseCoinsList">
                                <div class="toggleButton">
                                    <label class="switch switch200">
                                    <input class="coin" type="checkbox" id="${coin}" checked>
                                    <span class="slider slider200"></span>        
                                </div>
                                <h6 class="text-center">${coin}</h6>
                                <img src="${symbol}">
                            </div>`            
        }
        //Display in modal the 6th coin
        const symbol=$("#home").children(`#${falseCheckedCoin}`).children("img").attr("src")
        modalContent+=  `<div class="chooseCoinsList">
                            <div class="toggleButton">
                                <label class="switch switch200">
                                <input class="coin" type="checkbox" id="${falseCheckedCoin}">
                                <span class="slider slider200"></span>        
                            </div>
                            <h6 class="text-center">${falseCheckedCoin}</h6>
                            <img src="${symbol}">
                        </div>`
        $(".modal-body").html(modalContent)        
    }

    function chooseOnlyFiveOnModal(){        
        $("#modalBody").on("change", "input", function(){
            let index=0
            $("#modalBody").children(".chooseCoinsList").children(".toggleButton").children(".switch").children(".coin").each(function(){
                if($(this).is(":checked")){
                    index++
                }           
            })
            if (index>5){
                console.log(this)
                $(this).prop("checked", false)
            }
        })               
    }

    function modalSaveButton(){
        $("#saveButton").on("click", ()=>{
            const fiveCoins=[]
            $("#modalBody").children(".chooseCoinsList").children(".toggleButton").children(".switch").children(".coin").each(function(){
                if($(this).is(":checked")){
                    fiveCoins.push(this.id)
                }
            })
            //Save the chosen coins on modal
            saveLocalStorage("chooseCoins", fiveCoins)
            chooseCoins=getFromLocalStorage("chooseCoins")
            chooseCoinsSymbols=getFromLocalStorage("chooseCoinsSymbols")
            //Checked the chosen coins on the main page
            checkedChooseCoins()
        })        
    }

    function saveLocalStorage(key,itemToSave){
        let json=JSON.stringify(itemToSave)
        localStorage.setItem(key, json)
    }

    function getFromLocalStorage(key){
        let json=localStorage.getItem(key)
        return JSON.parse(json)        
    }

    //Find coins with input-search
    $("input[type=text]").on("keyup",function(){
        const search=$(this).val().toLowerCase()
        if(search===""){
            displayCoins(coins)
        }
        else{
            const searchCoins=coins.filter(coin=>coin.name.toLowerCase().indexOf(search)>=0)
            displayCoins(searchCoins)
        }
    })

})