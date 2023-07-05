/// <reference path="jquery-3.6.2.js"/>

$(()=>{

    //Design the image-divs with random image per 15sec
    const innerImageArray=["images/InnerImage_2.jpg", "images/InnerImage_3.jpg","images/InnerImage_4.jpg",
                            "images/InnerImage_5.png","images/InnerImage_6.png"]
                            
    function changeBackgroundImage(item){
        const randomImage=Math.floor(Math.random()*5)
        const backgroundArray=[innerImageArray[randomImage],"images/yellow.jpg"]
        const randomBackground=Math.floor(Math.random()*2)            
        $(item).css("background-image", `url(${backgroundArray[randomBackground]})`)
    }
    
    $(".innerImage").each(function(){
        changeBackgroundImage(this)
    })        
    
    setInterval(()=>{
        $(".innerImage").each(function(){
        changeBackgroundImage(this)
        })
    },1000*15)

    //Set the links for SPA
    $("section").hide()    
    $("#home").show()

    $(".sectionButtons").on("click", function(){
        $("section").hide()
        const attribute=$(this).attr("data-section")
        $(`#${attribute}`).show()
        //Disabeld the search input on the "live-report" and the "about" sections.
        if(attribute!=="home"){
            $("input").prop("disabled", true)
        }
        else{
            $("input").prop("disabled", false) 
        }
    })
    
   
   



})