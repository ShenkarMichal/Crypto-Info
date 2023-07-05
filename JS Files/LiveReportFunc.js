/// <reference path="jquery-3.6.2.js"/>

$(()=>{  

    let chooseCoinsSymbols=[] 
    let intervalFunc //This variable will contain the SetInterval-function
    
    //Get the data from storage only when the user entered this page    
    $(".sectionButtons").on("click", function(){         
        const attribute=$(this).attr("data-section")
        if(attribute==="liveReport"){ 
            //Display progress-bar while loading the graph
            let html=`
                <div class="ring">Loading
                    <span></span>
                </div>`       
            $("#chartContainer").html(html)
            getSymbolsFromLocalStorage() 
            intervalFunc=setInterval(displayGraghPer2Sec,2*1000)                

            //Get the choisen coins from local storage
            function getSymbolsFromLocalStorage(){
                let json=localStorage.getItem("chooseCoinsSymbols")
                if(json){
                    chooseCoinsSymbols=JSON.parse(json)                    
                }
            }

            //Set the color of the graphs
            function getRandomYellowColor(num){
                const yellow=["rgb(255, 192, 1)","#696969", "#FFFF33", "#666600", "#A9A9A9"]
                switch (num){
                    case 1:return yellow[0]
                    case 2:return yellow[1]
                    case 3:return yellow[2]
                    case 4:return yellow[3]
                    case 5:return yellow[4]
                }
            }

            //Set the data-format for each choisen-coin
            const data=[]
            let index=0
            for(let coin of chooseCoinsSymbols){
                index++	
                console.log(index)
                let color=getRandomYellowColor(index)
                console.log(color)	

                const coinObjectData={
                    type: "splineArea",
                    showInLegend: true,
                    color:color,
                    name: coin,
                    yValueFormatString: "#,##0",
                    xValueFormatString: "HH:MM:SS",
                    dataPoints:[]
                }
                data.push(coinObjectData)
            }

            //Set the whole canvas format
            var options = {
                animationEnabled: false,
                theme:"dark1",
                title:{
                    text: "Live Report",
                    fontFamily:'Alegreya Sans',
                    fontWeight: "bold"
                },
                axisY :{
                    includeZero: false,
                    prefix: "$",
                    lineThickness: 0
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    fontSize: 20,
                    fontFamily:'Alegreya Sans'
                },
                data:{}	
            };
                        
            function getAjax(url){
                return new Promise((resolve, reject)=>{
                    $.ajax({
                        url,
                        success: data => resolve(data),
                        error: err => reject(err)        
                    })
                })        
            }

            //Get the data from server
            async function getValueFromServer(){
                //Set the url by the choisen coins
                let url="https://min-api.cryptocompare.com/data/pricemulti?fsyms="
                for(let coin of chooseCoinsSymbols){
                    url+=coin.toLocaleUpperCase() + ","
                }
                url+="&tsyms=USD"
                try {
                    const value= await getAjax(url)
                    pushDataPoints(value)		
                } 
                catch (error) {
                    alert(error.messege)	
                }
            }

            //Set the points of the graph
            function pushDataPoints(value){
                for(let item of data){
                    for(let prop in value){
                        let coin=prop.toLocaleLowerCase()
                        if(coin===item.name){
                            item.dataPoints.push({ x: new Date, y: value[prop].USD })
                        }
                    }
                }
                options.data=data	
            }

            //Update the gragh per 2sec
            function displayGraghPer2Sec(){
                getValueFromServer()
                $("#chartContainer").CanvasJSChart(options);
            }
        } 
        else{
            //Stop the interval-function when the user get-out from this page
            clearInterval(intervalFunc)
        }
    })       
})